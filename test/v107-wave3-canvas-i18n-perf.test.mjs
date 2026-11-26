import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ROOT = path.resolve(import.meta.dirname, '..');

function makeEventBus() {
  const map = new Map();
  return {
    add(type, fn) {
      if (!map.has(type)) map.set(type, new Set());
      map.get(type).add(fn);
    },
    remove(type, fn) {
      map.get(type)?.delete(fn);
    },
    dispatch(type, ev = {}) {
      for (const fn of [...(map.get(type) || [])]) fn(ev);
    },
    count(type) {
      return (map.get(type) || new Set()).size;
    },
  };
}

function makeFakeClock(initialNow = 1000) {
  let now = initialNow;
  let seq = 1;
  const timers = new Map();
  const intervals = new Map();
  const rafs = new Map();
  return {
    get now() { return now; },
    set now(v) { now = v; },
    timers,
    intervals,
    rafs,
    performance: { now: () => now },
    setTimeout(fn, ms = 0) {
      const id = seq++;
      const delay = Math.max(0, Number(ms) || 0);
      timers.set(id, { fn, ms: delay, due: now + delay });
      return id;
    },
    clearTimeout(id) {
      timers.delete(id);
    },
    setInterval(fn, ms = 0) {
      const id = seq++;
      const period = Math.max(1, Number(ms) || 1);
      intervals.set(id, { fn, ms: period, due: now + period });
      return id;
    },
    clearInterval(id) {
      intervals.delete(id);
    },
    requestAnimationFrame(fn) {
      const id = seq++;
      rafs.set(id, fn);
      return id;
    },
    cancelAnimationFrame(id) {
      rafs.delete(id);
    },
    flushRafs(stepMs = 16) {
      now += stepMs;
      const list = [...rafs.entries()];
      rafs.clear();
      for (const [, fn] of list) fn(now);
      return list.length;
    },
    advanceTimers(deltaMs) {
      const target = now + deltaMs;
      while (true) {
        let next = null;
        for (const [id, t] of timers.entries()) {
          if (t.due <= target && (!next || t.due < next.due)) next = { kind: 'timeout', id, due: t.due, t };
        }
        for (const [id, iv] of intervals.entries()) {
          if (iv.due <= target && (!next || iv.due < next.due)) next = { kind: 'interval', id, due: iv.due, iv };
        }
        if (!next) break;
        now = next.due;
        if (next.kind === 'timeout') {
          timers.delete(next.id);
          next.t.fn();
        } else {
          next.iv.due += next.iv.ms;
          next.iv.fn();
        }
      }
      now = target;
    },
  };
}

function makeMascotDomMock(clock, opts = {}) {
  const attrsMap = new Map();
  const winBus = makeEventBus();
  const docBus = makeEventBus();

  const makeEl = (tag) => {
    const elAttrs = new Map();
    const classes = new Set();
    const kids = [];
    const el = {
      nodeType: 1,
      tagName: tag.toUpperCase(),
      className: '',
      dataset: {},
      children: kids,
      childNodes: kids,
      parentNode: null,
      parentElement: null,
      width: tag === 'canvas' ? 64 : undefined,
      height: tag === 'canvas' ? 64 : undefined,
      style: {
        setProperty(k, v) { this[k] = String(v); },
        removeProperty(k) { delete this[k]; },
      },
      classList: {
        add: (...cs) => cs.forEach((c) => classes.add(c)),
        remove: (...cs) => cs.forEach((c) => classes.delete(c)),
        contains: (c) => classes.has(c),
        toggle: (c, f) => {
          const on = f === undefined ? !classes.has(c) : Boolean(f);
          if (on) classes.add(c);
          else classes.delete(c);
          return on;
        },
      },
      get firstChild() { return kids[0] || null; },
      setAttribute(k, v) { elAttrs.set(k, String(v)); },
      getAttribute(k) { return elAttrs.has(k) ? elAttrs.get(k) : null; },
      hasAttribute(k) { return elAttrs.has(k); },
      removeAttribute(k) { elAttrs.delete(k); },
      appendChild(c) { c.parentNode = el; c.parentElement = el; kids.push(c); return c; },
      removeChild(c) { const i = kids.indexOf(c); if (i >= 0) kids.splice(i, 1); c.parentNode = null; return c; },
      remove() { if (el.parentNode) el.parentNode.removeChild(el); },
      addEventListener() {},
      removeEventListener() {},
      getBoundingClientRect: () => ({ left: 0, top: 0, right: 720, bottom: 72, width: 720, height: 72 }),
      getContext(type) {
        if (type !== '2d') return null;
        return {
          imageSmoothingEnabled: false,
          fillStyle: '',
          globalAlpha: 1,
          setTransform() {},
          clearRect() {},
          fillRect() {},
          save() {},
          restore() {},
          translate() {},
          rotate() {},
          scale() {},
          drawImage() {},
        };
      },
    };
    return el;
  };

  const docEl = {
    getAttribute: (k) => (attrsMap.has(k) ? attrsMap.get(k) : null),
    setAttribute: (k, v) => attrsMap.set(k, String(v)),
    removeAttribute: (k) => attrsMap.delete(k),
    hasAttribute: (k) => attrsMap.has(k),
  };

  const win = {
    devicePixelRatio: 1,
    addEventListener: (t, fn) => winBus.add(t, fn),
    removeEventListener: (t, fn) => winBus.remove(t, fn),
    matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }),
  };

  const doc = {
    hidden: false,
    defaultView: win,
    documentElement: docEl,
    createElement: (tag) => makeEl(tag),
    addEventListener: (t, fn) => docBus.add(t, fn),
    removeEventListener: (t, fn) => docBus.remove(t, fn),
  };

  const hostEl = makeEl('div');
  hostEl.ownerDocument = doc;
  hostEl.clientWidth = 720;
  if ('isConnected' in opts) hostEl.isConnected = opts.isConnected;

  const src = fs.readFileSync(path.join(ROOT, 'dual-mascot-rig.js'), 'utf8');
  const sb = {
    window: win,
    document: doc,
    performance: clock.performance,
    setTimeout: clock.setTimeout,
    clearTimeout: clock.clearTimeout,
    setInterval: clock.setInterval,
    clearInterval: clock.clearInterval,
    requestAnimationFrame: clock.requestAnimationFrame,
    cancelAnimationFrame: clock.cancelAnimationFrame,
    Math, Number, String, Boolean, Array, Object, Map, Set, Date, JSON,
  };
  sb.globalThis = sb;
  vm.runInNewContext(src, sb);
  return { rig: sb.__agDualMascotRig, hostEl, doc, win, winBus, docBus };
}

test('Wave 3 P1-1a & P2-3 dual-mascot-rig: detached host pauses heartbeat/theater, syncPowerState wakes cleanly, undefined isConnected stays active, and evalChromaColorAt LUT matches math 100%', () => {
  // 1. Mock hostEl WITHOUT isConnected (undefined) must stay active and never false-pause
  const clockUndef = makeFakeClock(1000);
  const envUndef = makeMascotDomMock(clockUndef);
  assert.equal(envUndef.hostEl.isConnected, undefined);
  const stUndef = envUndef.rig.mountDualMascotStage(envUndef.hostEl, { miniPileEnabled: false, reducedMotion: false });
  assert.equal(stUndef.getLayoutSnapshot().perf.timerPaused, false, 'Mock hostEl with isConnected===undefined must not pause');
  assert.equal(stUndef.getLayoutSnapshot().perf.timerIntervalMs, envUndef.rig.TICK);
  assert.equal(clockUndef.intervals.size, 1);
  assert.ok(clockUndef.timers.size >= 1, 'Theater timer should be armed when isConnected is undefined');
  stUndef.dispose();
  assert.equal(clockUndef.intervals.size, 0);
  assert.equal(clockUndef.timers.size, 0);

  // 2. Real DOM hostEl with isConnected=true -> false pauses heartbeat & theater; true + syncPowerState() restores both
  const clock = makeFakeClock(2000);
  const env = makeMascotDomMock(clock, { isConnected: true });
  const stage = env.rig.mountDualMascotStage(env.hostEl, { miniPileEnabled: false, reducedMotion: false });
  assert.equal(stage.getLayoutSnapshot().perf.timerPaused, false);
  assert.equal(clock.intervals.size, 1);
  assert.ok(clock.timers.size >= 1);

  // Detach hostEl and call syncPowerState() -> immediate 0-timer sleep
  env.hostEl.isConnected = false;
  stage.syncPowerState();
  assert.equal(stage.getLayoutSnapshot().perf.timerIntervalMs, 0);
  assert.equal(stage.getLayoutSnapshot().perf.timerPaused, true);
  assert.equal(clock.intervals.size, 0, 'Detached hostEl must clear heartbeat interval');
  assert.equal(clock.timers.size, 0, 'Detached hostEl must clear theater timer');

  const tickBeforeSleep = stage.getLayoutSnapshot().actors[0].tick;
  clock.advanceTimers(10000);
  assert.equal(stage.getLayoutSnapshot().actors[0].tick, tickBeforeSleep, '0 ticks while detached');

  // Reattach hostEl and call syncPowerState() -> instant wake of heartbeat + theater
  env.hostEl.isConnected = true;
  stage.syncPowerState();
  assert.equal(stage.getLayoutSnapshot().perf.timerIntervalMs, env.rig.TICK);
  assert.equal(stage.getLayoutSnapshot().perf.timerPaused, false);
  assert.equal(clock.intervals.size, 1, 'Reattached hostEl must restart heartbeat interval');
  assert.ok(clock.timers.size >= 1, 'Reattached hostEl must reschedule theater timer');

  // Also verify onHeartbeat self-pauses if hostEl becomes detached without syncPowerState()
  env.hostEl.isConnected = false;
  clock.advanceTimers(env.rig.TICK * 2);
  assert.equal(stage.getLayoutSnapshot().perf.timerIntervalMs, 0);
  assert.equal(clock.intervals.size, 0, 'onHeartbeat must self-pause when hostEl.isConnected === false');
  assert.equal(clock.timers.size, 0);
  stage.dispose();

  // 3. P2-3 evalChromaColorAt LUT equivalence across all 12 discrete phases, accumulated float phases, grid coords, and arbitrary phases
  const CHROMA_STOPS = [
    [0x42, 0x85, 0xf4],
    [0x9b, 0x72, 0xcb],
    [0xea, 0x43, 0x35],
    [0xfb, 0xbc, 0x04],
    [0x5c, 0xc6, 0xfc],
  ];
  function refEvalChroma(gx, gy, phase = 0, isShadow = false) {
    const raw = ((gx + gy) * 0.068 - phase) % 1;
    const u = (raw < 0 ? raw + 1 : raw) * CHROMA_STOPS.length;
    const i0 = Math.floor(u) % CHROMA_STOPS.length;
    const i1 = (i0 + 1) % CHROMA_STOPS.length;
    const t = u - Math.floor(u);
    const s = t * t * (3 - 2 * t);
    const c0 = CHROMA_STOPS[i0];
    const c1 = CHROMA_STOPS[i1];
    let r = c0[0] + (c1[0] - c0[0]) * s;
    let g = c0[1] + (c1[1] - c0[1]) * s;
    let b = c0[2] + (c1[2] - c0[2]) * s;
    if (isShadow) {
      r = r * 0.68 + 18 * 0.14;
      g = g * 0.68 + 22 * 0.14;
      b = b * 0.72 + 40 * 0.14;
    }
    const hex = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
    return `#${hex(r)}${hex(g)}${hex(b)}`;
  }

  for (let k = 0; k < 12; k++) {
    const phase = k / 12;
    for (let gx = 0; gx <= 18; gx++) {
      for (let gy = 0; gy <= 18; gy++) {
        for (const isShadow of [false, true]) {
          const expected = refEvalChroma(gx, gy, phase, isShadow);
          const actual1 = env.rig.evalChromaColorAt(gx, gy, phase, isShadow);
          const actual2 = env.rig.evalChromaColorAt(gx, gy, phase, isShadow);
          assert.equal(actual1, expected, `Cold LUT mismatch at (${gx},${gy},k=${k},s=${isShadow})`);
          assert.equal(actual2, expected, `Warm LUT mismatch at (${gx},${gy},k=${k},s=${isShadow})`);
        }
      }
    }
  }
  // Accumulated float drift check (simulating 120 chroma steps of +1/12 % 1)
  let accPhase = 0;
  for (let step = 0; step < 120; step++) {
    const expected = refEvalChroma(7, 9, (step % 12) / 12, step % 2 === 1);
    assert.equal(env.rig.evalChromaColorAt(7, 9, accPhase, step % 2 === 1), expected);
    accPhase = (accPhase + 1 / 12) % 1;
  }
  // Arbitrary non-12-bucket phases remain 100% mathematically exact
  for (const p of [0.1, 0.137, 0.37, 0.73, -0.22]) {
    assert.equal(env.rig.evalChromaColorAt(5, 8, p, false), refEvalChroma(5, 8, p, false));
    assert.equal(env.rig.evalChromaColorAt(5, 8, p, true), refEvalChroma(5, 8, p, true));
  }
});

test('Wave 3 P1-1b & P2-1 home-ripple-host: parkRipple reclaims VRAM while keeping parked=true + lossless reattach at full DPR, and 300Hz throttle aligns via setTimeout with clean cancel', () => {
  const src = fs.readFileSync(path.join(ROOT, 'home-ripple-host.js'), 'utf8');
  const clock = makeFakeClock(1000);
  const docBus = makeEventBus();
  const winBus = makeEventBus();
  let homeMounted = true;

  const makeEl = (tag) => {
    const attrs = new Map();
    const bus = makeEventBus();
    return {
      tagName: tag.toUpperCase(),
      className: '',
      width: tag === 'canvas' ? 300 : undefined,
      height: tag === 'canvas' ? 150 : undefined,
      style: {},
      isConnected: true,
      children: [],
      get firstChild() { return this.children[0] || null; },
      setAttribute: (k, v) => attrs.set(k, String(v)),
      getAttribute: (k) => (attrs.has(k) ? attrs.get(k) : null),
      hasAttribute: (k) => attrs.has(k),
      removeAttribute: (k) => attrs.delete(k),
      appendChild(c) { this.children.push(c); c.isConnected = true; return c; },
      insertBefore(c) { this.children.unshift(c); c.isConnected = true; return c; },
      remove() { this.isConnected = false; },
      querySelector: () => null,
      addEventListener: (t, fn) => bus.add(t, fn),
      removeEventListener: (t, fn) => bus.remove(t, fn),
      getBoundingClientRect: () => ({ left: 0, top: 0, width: home.clientWidth, height: home.clientHeight }),
    };
  };

  const home = makeEl('div');
  home.clientWidth = 800;
  home.clientHeight = 480;
  const html = makeEl('html');
  html.setAttribute('data-ag-cs-ambient', '1');

  const fakeDoc = {
    hidden: false,
    documentElement: html,
    createElement: (tag) => makeEl(tag),
    querySelector: (sel) => (sel === '.agy-home' && homeMounted ? home : null),
    addEventListener: (t, fn) => docBus.add(t, fn),
    removeEventListener: (t, fn) => docBus.remove(t, fn),
  };

  const sb = {
    document: fakeDoc,
    devicePixelRatio: 2,
    performance: clock.performance,
    requestAnimationFrame: clock.requestAnimationFrame,
    cancelAnimationFrame: clock.cancelAnimationFrame,
    setTimeout: clock.setTimeout,
    clearTimeout: clock.clearTimeout,
    getComputedStyle: () => ({ getPropertyValue: () => '' }),
    ResizeObserver: class { observe() {} disconnect() {} },
    addEventListener: (t, fn) => winBus.add(t, fn),
    removeEventListener: (t, fn) => winBus.remove(t, fn),
    Float32Array, Math, Number, String, Boolean, Array, Object, Map, Set,
  };
  sb.window = sb;
  sb.globalThis = sb;
  vm.runInNewContext(src, sb);

  let fieldDraws = 0;
  let fieldDisposes = 0;
  let glowReleases = 0;
  let glowDraws = 0;
  const rippleCore = {
    RIPPLE: { cellWidth: 16, cellHeight: 24 },
    parseCssColorToRgb: () => null,
    createWaveField: () => ({ height: new Float32Array(1), active: () => false, disturb() {}, skimmer() {}, advance() {} }),
    createGlyphField(cv) {
      return {
        mode: 'webgl2',
        busy: () => true,
        needsDraw: () => true,
        setCalmZones() {},
        invalidate() {},
        draw() {
          if (cv.width <= 0 || cv.height <= 0) throw new Error('draw at 0x0');
          fieldDraws += 1;
        },
        dispose() { fieldDisposes += 1; },
      };
    },
    mountBrandHorizonGlow(cv) {
      return {
        mode: 'webgl2',
        resize(w, h, dpr) { cv.width = Math.max(1, Math.round(w * dpr)); cv.height = Math.max(1, Math.round(h * dpr)); },
        releaseBackingStore() { glowReleases += 1; cv.width = 0; cv.height = 0; },
        invalidate() {},
        clear() {},
        draw() {
          if (cv.width <= 0 || cv.height <= 0) throw new Error('glow draw at 0x0');
          glowDraws += 1;
        },
        dispose() {},
      };
    },
  };

  const ctl = sb.__agPrismHomeRippleHost.createHomeRippleController({
    rippleCore,
    isDestroyed: () => false,
    isAllowed: () => true,
    isDarkTheme: () => true,
    motionReduced: () => false,
    getMinFrameGapMs: () => 0,
    getAmbientIntensity: () => 1,
    getAccentTone: () => 'follow',
    setAttrIfChanged: (el, k, v) => el.setAttribute(k, v),
  });

  ctl.sync();
  const m = ctl.getMount();
  // Full 2x DPR on main ASCII canvas (800*2=1600, 480*2=960)
  assert.equal(m.canvas.width, 1600);
  assert.equal(m.canvas.height, 960);
  assert.equal(m.glowCanvas.width, 480);
  assert.equal(m.glowCanvas.height, 288);

  // First drawFrame paints frame 1 and schedules next rAF
  clock.flushRafs(16);
  assert.equal(fieldDraws, 1);
  assert.equal(clock.rafs.size, 1);

  // P2-1: Simulate 300Hz VSync arriving 3.3ms later (< minGap=33ms):
  // Must NOT re-arm rAF immediately; must schedule setTimeout for remaining ~30ms!
  clock.flushRafs(3.3);
  assert.equal(fieldDraws, 1, 'Throttled frame must skip render');
  assert.equal(clock.rafs.size, 0, '300Hz throttled frame must NOT spin rAF');
  assert.equal(clock.timers.size, 1, '300Hz throttled frame must align via setTimeout');
  const [{ ms: alignMs }] = [...clock.timers.values()];
  assert.ok(alignMs >= 28 && alignMs <= 32, `Expected aligned timer ~30ms, got ${alignMs}`);

  // When aligned timer expires, it wakes rAF and draws frame 2 cleanly
  clock.advanceTimers(alignMs);
  assert.equal(clock.rafs.size, 1);
  clock.flushRafs(4);
  assert.equal(fieldDraws, 2);

  // Trigger another 300Hz throttled timer, then navigate away from home (parkRipple) -> releases VRAM & cancels timer!
  clock.flushRafs(3.3);
  assert.equal(clock.timers.size, 1);
  const disposesBeforePark = fieldDisposes;
  homeMounted = false;
  ctl.sync();
  assert.equal(m.parked, true, 'parkRipple must keep parked=true after reclaim()');
  assert.equal(m.sleeping, true);
  assert.equal(m.canvas.width, 0, 'parkRipple must shrink main canvas to 0x0');
  assert.equal(m.canvas.height, 0);
  assert.equal(m.glowCanvas.width, 0, 'parkRipple must shrink glowCanvas to 0x0');
  assert.equal(m.glowCanvas.height, 0);
  assert.equal(glowReleases, 1);
  assert.equal(clock.timers.size, 0, 'parkRipple must clear throttle alignment timer');
  assert.equal(clock.rafs.size, 0);

  // Navigate back to home -> lossless in-place restore at full 2x DPR without disposing field!
  homeMounted = true;
  ctl.sync();
  assert.equal(m.parked, false);
  assert.equal(m.canvas.width, 1600, 'Reattach must restore main ASCII canvas at full 2x DPR');
  assert.equal(m.canvas.height, 960);
  assert.equal(m.glowCanvas.width, 480);
  assert.equal(m.glowCanvas.height, 288);
  assert.equal(fieldDisposes, disposesBeforePark, 'Reattach with unchanged size must restore in-place');
  const drawsBeforeResume = fieldDraws;
  clock.flushRafs(40);
  assert.equal(fieldDraws, drawsBeforeResume + 1);
  assert.ok(glowDraws >= 2);

  // Ensure unmount also cleans pending throttle timer
  clock.flushRafs(3.3);
  assert.equal(clock.timers.size, 1);
  ctl.unmount();
  assert.equal(clock.timers.size, 0);
  assert.equal(clock.rafs.size, 0);
});

test('Wave 3 P1-1c & P2-4 conv-aura: park() releases VRAM & sync() restores cleanly, and computeConvAuraOptics / invokeConvGlowDraw reuse static buffers without stale spectrum leak', () => {
  const src = fs.readFileSync(path.join(ROOT, 'conv-aura.js'), 'utf8');
  const clock = makeFakeClock(1000);
  const docBus = makeEventBus();
  const winBus = makeEventBus();
  let onHome = false;

  const makeEl = (tag, testId = '') => {
    const attrs = new Map();
    if (testId) attrs.set('data-testid', testId);
    const kids = [];
    return {
      nodeType: 1,
      tagName: tag.toUpperCase(),
      className: '',
      width: tag === 'canvas' ? 300 : undefined,
      height: tag === 'canvas' ? 150 : undefined,
      hidden: false,
      isConnected: true,
      parentElement: null,
      clientWidth: 900,
      clientHeight: 600,
      style: { setProperty(k, v) { this[k] = v; } },
      get firstChild() { return kids[0] || null; },
      setAttribute: (k, v) => attrs.set(k, String(v)),
      getAttribute: (k) => (attrs.has(k) ? attrs.get(k) : null),
      hasAttribute: (k) => attrs.has(k),
      removeAttribute: (k) => attrs.delete(k),
      insertBefore(c) { c.parentElement = this; c.isConnected = true; kids.unshift(c); return c; },
      appendChild(c) { c.parentElement = this; c.isConnected = true; kids.push(c); return c; },
      remove() { this.isConnected = false; },
      closest: () => null,
      matches: (sel) => Boolean(testId && sel.includes(`"${testId}"`)),
      querySelectorAll: () => [],
    };
  };

  const seat = makeEl('div');
  const convView = makeEl('div', 'conversation-view');
  seat.appendChild(convView);
  const stopBtn = makeEl('button', 'stop-button');
  const homeMarker = makeEl('div');

  const fakeDoc = {
    hidden: false,
    documentElement: makeEl('html'),
    hasFocus: () => true,
    createElement: (tag) => makeEl(tag),
    querySelector: (sel) => (sel === '.agy-home' && onHome ? homeMarker : null),
    querySelectorAll(sel) {
      if (sel.includes('conversation-view')) return onHome ? [] : [convView];
      if (sel.includes('stop-button')) return [stopBtn];
      return [];
    },
    addEventListener: (t, fn) => docBus.add(t, fn),
    removeEventListener: (t, fn) => docBus.remove(t, fn),
  };

  const sb = {
    document: fakeDoc,
    devicePixelRatio: 2,
    performance: clock.performance,
    requestAnimationFrame: clock.requestAnimationFrame,
    cancelAnimationFrame: clock.cancelAnimationFrame,
    setTimeout: clock.setTimeout,
    clearTimeout: clock.clearTimeout,
    ResizeObserver: class { observe() {} disconnect() {} },
    addEventListener: (t, fn) => winBus.add(t, fn),
    removeEventListener: (t, fn) => winBus.remove(t, fn),
    WeakSet, Set, Map, Array, Object, Math, Number, String, Boolean,
  };
  sb.window = sb;
  sb.globalThis = sb;
  vm.runInNewContext(src, sb);

  // P2-4a: computeConvAuraOptics isolates default callers (out={}) and reuses caller-supplied out buffer with zero GC
  const api = sb.__agPrismConvAura;
  const isoA = api.computeConvAuraOptics('running', 1000, 1200, true, true);
  const isoB = api.computeConvAuraOptics('idle', 1000, 1400, true, false);
  assert.notEqual(isoA, isoB, 'default computeConvAuraOptics call must not mutate previous caller snapshot');
  assert.equal(isoA.semantic, 'none');
  assert.equal(isoB.frameMs, 110);
  const sharedBuf = {};
  const oRun = api.computeConvAuraOptics('running', 1000, 1200, true, true, sharedBuf);
  assert.equal(oRun, sharedBuf);
  assert.equal(oRun.semantic, 'none');
  const oIdle = api.computeConvAuraOptics('idle', 1000, 1400, true, false, sharedBuf);
  assert.equal(oIdle, sharedBuf, 'computeConvAuraOptics must reuse explicit out buffer object');
  assert.equal(oIdle.frameMs, 110);
  const oDec = api.computeConvAuraOptics('awaiting-decision', 1000, 1300, false, false, sharedBuf);
  assert.equal(oDec, sharedBuf);
  assert.equal(oDec.semantic, 'awaiting-decision');

  // P2-4b: invokeConvGlowDraw reuses extra buffer across running frames & clears spectrum when undefined
  let glowReleases = 0;
  let glowResizes = 0;
  const seenExtraRefs = new Set();
  const seenSpectra = [];
  let spectrumVal = 'warm';

  const mockRippleCore = {
    resolveHorizonDpr: (raw, scale) => Math.min(raw, 2) * scale,
    mountBrandHorizonGlow(cv) {
      return {
        mode: 'webgl2',
        resize(w, h, dpr) {
          glowResizes += 1;
          cv.width = Math.max(1, Math.round(w * dpr));
          cv.height = Math.max(1, Math.round(h * dpr));
        },
        releaseBackingStore() {
          glowReleases += 1;
          cv.width = 0;
          cv.height = 0;
        },
        invalidate() {},
        clear() {},
        draw(_now, _dark, _str, extra) {
          if (cv.width <= 0 || cv.height <= 0) throw new Error('conv-aura draw at 0x0');
          seenExtraRefs.add(extra);
          seenSpectra.push(extra.spectrum);
        },
        drawStaticSnapshot(_now, _dark, _str, extra) {
          if (cv.width <= 0 || cv.height <= 0) throw new Error('conv-aura snap at 0x0');
          seenExtraRefs.add(extra);
          seenSpectra.push(extra.spectrum);
        },
        dispose() {},
      };
    },
  };

  const ctl = api.createConvAuraController({
    isDestroyed: () => false,
    isHomeRippleEnabled: () => true,
    isMotionStandardOrUltra: () => true,
    isDarkTheme: () => true,
    getMinFrameGapMs: () => 0,
    getAmbientIntensity: () => 1,
    getSpectrumMode: () => spectrumVal,
    isWindowFocused: () => true,
    rippleCore: mockRippleCore,
    setAttrIfChanged: (el, k, v) => el.setAttribute(k, v),
    runGuardedMut: (fn) => fn(),
  });

  ctl.sync();
  const inst = ctl.getInstance();
  assert.ok(inst.canvas.width > 0 && inst.canvas.height > 0);

  // Run 5 running frames, switching spectrum from 'warm' -> undefined mid-way
  for (let i = 0; i < 5; i++) {
    if (i === 2) spectrumVal = undefined;
    clock.advanceTimers(40);
    clock.flushRafs(16);
  }
  assert.equal(seenExtraRefs.size, 1, 'invokeConvGlowDraw must reuse single static extra buffer across frames');
  assert.equal(seenSpectra[0], 'warm');
  assert.equal(seenSpectra[seenSpectra.length - 1], undefined, 'Static extra buffer must clear stale spectrum when undefined');

  // P1-1c: Switch to home page -> park() releases glowCanvas VRAM and keeps parked=true
  onHome = true;
  ctl.sync();
  assert.equal(inst.parked, true, 'park() must preserve parked=true after releaseBacking()');
  assert.equal(inst.sleeping, true);
  assert.equal(inst.backingReleased, true);
  assert.equal(inst.canvas.width, 0);
  assert.equal(inst.canvas.height, 0);
  assert.equal(glowReleases, 1);
  assert.equal(clock.timers.size, 0);
  assert.equal(clock.rafs.size, 0);

  // Switch back to conversation page -> sync() rebuilds backing store & paints immediately
  const resizesBeforeReturn = glowResizes;
  const drawsBeforeReturn = inst.drawCount;
  onHome = false;
  ctl.sync();
  assert.equal(inst.parked, false);
  assert.equal(inst.backingReleased, false);
  assert.ok(inst.canvas.width > 0 && inst.canvas.height > 0, 'Returning to conversation must restore glowCanvas backing store');
  assert.ok(glowResizes > resizesBeforeReturn);
  assert.equal(inst.drawCount, drawsBeforeReturn + 1, 'Returning to conversation must immediately paint first frame');

  ctl.unmount();
});

test('Wave 3 P1-1d prism-rim-canvas: origin-centered radial gradient cache + translate equivalence, window.blur clear & 1800ms VRAM reclaim, and teardown listener cleanup', () => {
  const src = fs.readFileSync(path.join(ROOT, 'prism-rim-canvas.js'), 'utf8');
  const clock = makeFakeClock(5000);
  const docBus = makeEventBus();
  const rootBus = makeEventBus();
  const winBus = makeEventBus();

  let gradCreates = 0;
  const gradArgs = [];
  const drawOps = [];
  let clearCalls = 0;

  const makeCanvas = () => {
    const attrs = new Map();
    const cv = {
      width: 300,
      height: 150,
      className: '',
      isConnected: true,
      parentElement: null,
      nextElementSibling: null,
      classList: { contains: (c) => cv.className.split(/\s+/).includes(c) },
      setAttribute: (k, v) => attrs.set(k, String(v)),
      getAttribute: (k) => (attrs.has(k) ? attrs.get(k) : null),
      remove() { this.isConnected = false; },
      getContext(type) {
        if (type !== '2d') return null;
        let tx = 0;
        let ty = 0;
        let savedStack = [];
        return {
          globalAlpha: 1,
          lineWidth: 1,
          strokeStyle: null,
          save() { savedStack.push({ tx, ty, a: this.globalAlpha }); },
          translate(x, y) { tx += x; ty += y; },
          restore() { const s = savedStack.pop(); if (s) { tx = s.tx; ty = s.ty; this.globalAlpha = s.a; } },
          clearRect(_x, _y, w, h) {
            if (cv.width <= 0 || cv.height <= 0 || w <= 0 || h <= 0) throw new Error('clearRect at 0x0');
            clearCalls += 1;
          },
          beginPath() {},
          roundRect(x, y, w, h, r) {
            drawOps.push({ worldX: tx + x, worldY: ty + y, tx, ty, x, y, w, h, r });
          },
          stroke() {
            if (cv.width <= 0 || cv.height <= 0) throw new Error('stroke at 0x0');
          },
          createRadialGradient(x0, y0, r0, x1, y1, r1) {
            gradCreates += 1;
            gradArgs.push([x0, y0, r0, x1, y1, r1]);
            const stops = [];
            return { stops, addColorStop(p, c) { stops.push([p, c]); } };
          },
        };
      },
    };
    return cv;
  };

  const makeBox = (rect) => {
    const attrs = new Map([['data-ag-cs-prism-box', '1']]);
    const kids = [];
    const box = {
      isConnected: true,
      style: { setProperty() {} },
      get firstElementChild() { return kids[0] || null; },
      setAttribute: (k, v) => attrs.set(k, String(v)),
      getAttribute: (k) => (attrs.has(k) ? attrs.get(k) : null),
      hasAttribute: (k) => attrs.has(k),
      removeAttribute: (k) => attrs.delete(k),
      appendChild(c) { c.parentElement = box; c.isConnected = true; kids.push(c); return c; },
      querySelector: (s) => (s === '.ag-cs-prism-rim-cv' ? kids[0] || null : null),
      getBoundingClientRect: () => rect,
    };
    return box;
  };

  const box1 = makeBox({ left: 100, top: 100, right: 400, bottom: 180, width: 300, height: 80 });
  let dark = true;
  let accent = 'follow';
  const html = {
    getAttribute: (k) => (k === 'data-ag-cs-motion' ? 'standard' : k === 'data-ag-cs-ambient' ? '1' : k === 'data-ag-cs-accent' ? accent : null),
    addEventListener: (t, fn) => rootBus.add(t, fn),
    removeEventListener: (t, fn) => rootBus.remove(t, fn),
  };

  const fakeDoc = {
    hidden: false,
    documentElement: html,
    createElement: () => makeCanvas(),
    getElementById: () => null,
    querySelectorAll(sel) {
      if (sel.includes('data-ag-cs-prism-box')) return [box1];
      if (sel.includes('.ag-cs-prism-rim-cv')) return box1.firstElementChild ? [box1.firstElementChild] : [];
      if (sel.includes('data-ag-cs-prism-cv')) return box1.hasAttribute('data-ag-cs-prism-cv') ? [box1] : [];
      return [];
    },
    addEventListener: (t, fn) => docBus.add(t, fn),
    removeEventListener: (t, fn) => docBus.remove(t, fn),
  };

  const sb = {
    document: fakeDoc,
    devicePixelRatio: 1,
    performance: clock.performance,
    requestAnimationFrame: clock.requestAnimationFrame,
    cancelAnimationFrame: clock.cancelAnimationFrame,
    setTimeout: clock.setTimeout,
    clearTimeout: clock.clearTimeout,
    getComputedStyle: () => ({ borderTopLeftRadius: '10px' }),
    addEventListener: (t, fn) => winBus.add(t, fn),
    removeEventListener: (t, fn) => winBus.remove(t, fn),
    Set, Map, Array, Math, Number, String, Boolean,
  };
  sb.window = sb;
  sb.globalThis = sb;
  vm.runInNewContext(src, sb);

  const ctl = sb.__agPrismRimCanvas.createPrismRimCanvasController({
    isDestroyed: () => false,
    isDarkTheme: () => dark,
    motionReduced: () => false,
    getMinFrameGapMs: () => 0,
    getAmbientIntensity: () => 1,
    getAccentTone: () => accent,
    canMountRealCanvas: () => true,
    setAttrIfChanged: (el, k, v) => el.setAttribute(k, v),
    runGuardedMut: (fn) => fn(),
  });

  assert.equal(winBus.count('blur'), 1, 'Controller must register window.blur listener');

  // Move pointer across 8 distinct points inside box1 -> gradient created ONLY ONCE at origin (0,0)
  for (let i = 0; i < 8; i++) {
    ctl.onPointerMove({ clientX: 140 + i * 20, clientY: 130 + i * 4 });
    clock.flushRafs(20);
  }
  assert.equal(gradCreates, 1, 'Repeated pointer moves must reuse cached origin-centered radial gradient');
  assert.deepEqual(gradArgs[0], [0, 0, 0, 0, 0, 240], 'Cached radial gradient must be centered at (0,0)');
  assert.equal(drawOps.length, 8);
  // Every translated roundRect maps back to exact world inset (strokeInset=1.0)
  for (const op of drawOps) {
    assert.ok(Math.abs(op.worldX - 1.0) < 1e-6, `Expected worldX=1.0, got ${op.worldX}`);
    assert.ok(Math.abs(op.worldY - 1.0) < 1e-6, `Expected worldY=1.0, got ${op.worldY}`);
  }

  // Theme / tone change invalidates gradient cache key cleanly
  dark = false;
  ctl.onPointerMove({ clientX: 250, clientY: 140 });
  clock.flushRafs(20);
  assert.equal(gradCreates, 2, 'Dark->Light toggle must rebuild cached radial gradient');

  accent = 'iris';
  ctl.onPointerMove({ clientX: 260, clientY: 140 });
  clock.flushRafs(20);
  assert.equal(gradCreates, 3, 'Tone change must rebuild cached radial gradient');

  // window.blur cancels pending rAF, clears canvas immediately, and arms 1800ms VRAM shrink
  const cv1 = box1.firstElementChild;
  assert.equal(cv1.width, 302);
  ctl.onPointerMove({ clientX: 270, clientY: 140 });
  assert.equal(clock.rafs.size, 1);
  const clearsBeforeBlur = clearCalls;

  winBus.dispatch('blur');
  assert.equal(clock.rafs.size, 0, 'window.blur must cancel pending rim rAF');
  assert.ok(clearCalls > clearsBeforeBlur, 'window.blur must clear active rim canvases');
  assert.equal(clock.timers.size, 1, 'window.blur must arm 1800ms idle shrink timer');

  clock.advanceTimers(1850);
  assert.equal(cv1.width, 0, 'Rim canvas must shrink to 0x0 1800ms after window.blur');
  assert.equal(cv1.height, 0);

  // Teardown unbinds window.blur cleanly with 0 leaks
  ctl.teardown();
  assert.equal(winBus.count('blur'), 0, 'teardown() must remove window.blur listener');
  assert.equal(docBus.count('visibilitychange'), 0);
  assert.equal(rootBus.count('pointerleave'), 0);
});

test('Wave 3 P2-2 vendor/effort-slider/upstream-client: paintDither caches gradient after sweep, stepClaudeCanvas caches getContext("2d") and pauses on data-ag-cs-win-blur="1"', () => {
  const src = fs.readFileSync(path.join(ROOT, 'vendor', 'effort-slider', 'upstream-client.js'), 'utf8');
  const clock = makeFakeClock(1000);
  const rootAttrs = new Map();

  let getContextCalls = 0;
  let gradCalls = 0;
  let fillRectCalls = 0;

  const makeMockCtx = () => ({
    globalAlpha: 1,
    fillStyle: '',
    clearRect() {},
    fillRect() { fillRectCalls += 1; },
    beginPath() {},
    moveTo() {},
    quadraticCurveTo() {},
    lineTo() {},
    closePath() {},
    fill() {},
    createLinearGradient() {
      gradCalls += 1;
      return { addColorStop() {} };
    },
  });

  const makeEl = (tag) => {
    const attrs = new Map();
    const classes = new Set();
    const kids = [];
    const ctx = tag === 'canvas' ? makeMockCtx() : null;
    const el = {
      nodeType: 1,
      tagName: tag.toUpperCase(),
      className: '',
      dataset: {},
      classList: {
        add: (...cs) => cs.forEach((c) => classes.add(c)),
        remove: (...cs) => cs.forEach((c) => classes.delete(c)),
        contains: (c) => classes.has(c),
        toggle: (c, f) => {
          const on = f === undefined ? !classes.has(c) : Boolean(f);
          if (on) classes.add(c);
          else classes.delete(c);
          return on;
        },
      },
      children: kids,
      childNodes: kids,
      parentNode: null,
      width: tag === 'canvas' ? 280 : undefined,
      height: tag === 'canvas' ? 28 : undefined,
      style: {
        display: '',
        setProperty(k, v) { this[k] = String(v); },
        removeProperty(k) { delete this[k]; },
      },
      setAttribute: (k, v) => attrs.set(k, String(v)),
      getAttribute: (k) => (attrs.has(k) ? attrs.get(k) : null),
      hasAttribute: (k) => attrs.has(k),
      removeAttribute: (k) => attrs.delete(k),
      appendChild(c) { c.parentNode = el; kids.push(c); return c; },
      removeChild(c) { const i = kids.indexOf(c); if (i >= 0) kids.splice(i, 1); c.parentNode = null; return c; },
      addEventListener() {},
      removeEventListener() {},
      getBoundingClientRect: () => ({ left: 0, top: 0, width: 280, height: 28 }),
      getContext(type) {
        if (type !== '2d') return null;
        getContextCalls += 1;
        return ctx;
      },
    };
    return el;
  };

  const docEl = {
    getAttribute: (k) => (rootAttrs.has(k) ? rootAttrs.get(k) : null),
    setAttribute: (k, v) => rootAttrs.set(k, String(v)),
    removeAttribute: (k) => rootAttrs.delete(k),
    hasAttribute: (k) => rootAttrs.has(k),
  };

  const doc = {
    hidden: false,
    documentElement: docEl,
    head: makeEl('head'),
    body: makeEl('body'),
    getElementById: () => null,
    createElement: (t) => makeEl(t),
    querySelector: () => null,
    querySelectorAll: () => [],
  };

  const win = {
    document: doc,
    performance: clock.performance,
    requestAnimationFrame: clock.requestAnimationFrame,
    cancelAnimationFrame: clock.cancelAnimationFrame,
    setTimeout: clock.setTimeout,
    clearTimeout: clock.clearTimeout,
    getComputedStyle: () => ({ backgroundColor: 'rgb(18, 18, 22)', color: 'rgb(240, 240, 245)' }),
    addEventListener() {},
    removeEventListener() {},
    matchMedia: () => ({ matches: false }),
  };

  win.__agCodexEffortSliderDisableAutoBoot = true;
  const sb = {
    window: win,
    document: doc,
    __agCodexEffortSliderDisableAutoBoot: true,
    performance: clock.performance,
    requestAnimationFrame: clock.requestAnimationFrame,
    cancelAnimationFrame: clock.cancelAnimationFrame,
    setTimeout: clock.setTimeout,
    clearTimeout: clock.clearTimeout,
    Date: { now: () => clock.now },
    Math, Number, String, Boolean, Array, Object, Map, Set, WeakMap, WeakSet, JSON,
  };
  sb.globalThis = sb;
  vm.runInNewContext(src, sb);

  const api = sb.AntigravityCodexEffortSlider;
  assert.ok(api && typeof api.paintDither === 'function');

  // 1. paintDither gradient cache: during sweep (progress < 1) builds gradient each frame; once progress >= 1 caches by `${w}|${dark}`
  const ctxA = makeMockCtx();
  const ctxB = makeMockCtx();
  gradCalls = 0;
  api.paintDither(ctxA, 220, 28, true, 0.3, 0.1, 1);
  api.paintDither(ctxA, 220, 28, true, 0.6, 0.2, 1);
  assert.equal(gradCalls, 2, 'During intro sweep (progress < 1), gradient updates per frame');

  // Sweep complete (progress >= 1): 15 frames at same (w, dark) -> only 1 gradient created!
  for (let i = 0; i < 15; i++) {
    api.paintDither(ctxA, 220, 28, true, 1, 0.5 + i * 0.05, 1);
  }
  assert.equal(gradCalls, 3, 'Post-sweep frames with same (w, dark) must hit cached LinearGradient');

  // Changing dark or width or ctx invalidates cleanly
  api.paintDither(ctxA, 220, 28, false, 1, 1.5, 1);
  assert.equal(gradCalls, 4, 'Changing dark flag must rebuild cached LinearGradient');
  api.paintDither(ctxA, 260, 28, false, 1, 1.6, 1);
  assert.equal(gradCalls, 5, 'Changing width must rebuild cached LinearGradient');
  api.paintDither(ctxB, 260, 28, false, 1, 1.7, 1);
  assert.equal(gradCalls, 6, 'Distinct canvas context must keep independent gradient cache');

  // 2. stepClaudeCanvas caches getContext('2d') and halts on data-ag-cs-win-blur="1"
  getContextCalls = 0;
  fillRectCalls = 0;
  const container = makeEl('div');
  const seat = {
    effortLevels: ['low', 'medium', 'high'],
    currentEffort: 'high',
    locked: false,
    baseName: 'Claude Opus 4.6',
    theme: 'claude',
    isClaude: true,
    subscribe: () => () => {},
  };

  const mounted = api.mountCodexEffortSlider({ container, seat, document: doc, window: win });
  assert.ok(clock.rafs.size >= 1, 'Claude high effort must start canvas rAF');

  for (let i = 0; i < 6; i++) {
    clock.flushRafs(20);
  }
  assert.equal(getContextCalls, 1, 'stepClaudeCanvas must cache getContext("2d") instead of querying every frame');
  assert.ok(fillRectCalls >= 6, 'Claude dither canvas must render across active frames');

  // Set data-ag-cs-win-blur="1" -> next rAF stops loop immediately with zero redraws
  const fillsBeforeBlur = fillRectCalls;
  rootAttrs.set('data-ag-cs-win-blur', '1');
  clock.flushRafs(20);
  assert.equal(fillRectCalls, fillsBeforeBlur, 'stepClaudeCanvas must skip painting on data-ag-cs-win-blur="1"');
  assert.equal(clock.rafs.size, 0, 'stepClaudeCanvas must halt rAF loop on data-ag-cs-win-blur="1"');

  mounted.unmount();
});

test('Wave 3 P1-3d host-i18n removed: vendor/host-i18n is absent and Channel 4 host-i18n is disabled (0 overhead)', () => {
  const cdp = require(path.join(ROOT, 'cdp.js'));
  assert.equal(fs.existsSync(path.join(ROOT, 'vendor', 'host-i18n')), false);
  assert.equal(cdp.shouldEnableHostI18n({ hostLocalization: 'on', language: 'th' }), false);
  assert.equal(cdp.buildHostI18nExpression({ hostLocalization: 'on', language: 'th' }), '');
  assert.equal(cdp.shouldEnableSwarmI18n({ hostLocalization: 'on', language: 'th' }), false);
  assert.equal(cdp.buildSwarmI18nExpression({ hostLocalization: 'on', language: 'th' }), '');
});
