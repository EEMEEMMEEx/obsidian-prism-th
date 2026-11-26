import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ROOT = path.resolve(import.meta.dirname, '..');
const cdp = require(path.join(ROOT, 'src/cdp.js'));

test('swarm-board-i18n removal: vendor/host-i18n swarm assets are removed and shouldEnableSwarmI18n/buildSwarmI18nExpression are disabled', () => {
  const hostI18nDir = path.join(ROOT, 'vendor', 'host-i18n');
  assert.equal(fs.existsSync(hostI18nDir), false, 'vendor/host-i18n directory must be removed');
  assert.equal(fs.existsSync(path.join(hostI18nDir, 'swarm-i18n-runtime.js')), false);
  assert.equal(fs.existsSync(path.join(hostI18nDir, 'swarm-zh-CN.json')), false);

  const cases = [
    [null, null],
    [{}, null],
    [{ hostLocalization: 'auto', language: 'th' }, 'th-TH'],
    [{ hostLocalization: 'auto', language: 'en' }, 'en-US'],
    [{ hostLocalization: 'on', language: 'th' }, 'th-TH'],
    [{ hostLocalization: 'on', language: 'en' }, 'en-US'],
    [{ hostLocalization: 'on', language: 'zh-CN' }, 'zh-CN'],
    [{ hostLocalization: 'off', language: 'zh-CN' }, 'zh-CN'],
  ];

  for (const [cfg, hint] of cases) {
    assert.equal(cdp.shouldEnableSwarmI18n(cfg, hint), false);
    assert.equal(cdp.buildSwarmI18nExpression(cfg, hint), '');
    assert.equal(cdp.shouldEnableHostI18n(cfg, hint), false);
    assert.equal(cdp.buildHostI18nExpression(cfg, hint), '');
  }

  // SWARM_I18N_REMOVE_EXPRESSION cleans legacy globals safely
  let destroyed = 0;
  const removedAttrs = [];
  const win = {
    __agPrismSwarmI18n: { destroy() { destroyed += 1; } },
    __agPrismSwarmI18nFactory: { mountSwarmI18n() {} },
  };
  const doc = {
    documentElement: {
      removeAttribute(a) { removedAttrs.push(a); },
    },
  };
  const ctx = vm.createContext({ window: win, globalThis: win, document: doc });
  const res = vm.runInContext(cdp.SWARM_I18N_REMOVE_EXPRESSION, ctx);
  assert.equal(res.ok, true);
  assert.equal(res.status, 'off');
  assert.equal(destroyed, 1);
  assert.ok(removedAttrs.includes('data-ag-prism-swarm-i18n'));
  assert.equal(win.__agPrismSwarmI18n, undefined);
  assert.equal(win.__agPrismSwarmI18nFactory, undefined);
});

test('swarm-board-i18n 4: CdpSession flattened child session multiplexing', async () => {
  const sentFrames = [];
  const wsListeners = new Map();
  const fakeWs = {
    addEventListener(ev, fn) {
      if (!wsListeners.has(ev)) wsListeners.set(ev, []);
      wsListeners.get(ev).push(fn);
    },
    send(raw) {
      const msg = JSON.parse(raw);
      sentFrames.push(msg);
      queueMicrotask(() => {
        for (const fn of wsListeners.get('message') || []) {
          fn({ data: JSON.stringify({ id: msg.id, result: { ok: true, echoMethod: msg.method, echoSessionId: msg.sessionId || null } }) });
        }
      });
    },
    close() {
      for (const fn of wsListeners.get('close') || []) fn({});
    },
    emitEvent(payload) {
      for (const fn of wsListeners.get('message') || []) fn({ data: JSON.stringify(payload) });
    },
  };

  const parent = new cdp.CdpSession(fakeWs);
  const child = parent.createChildSession('sess-swarm-1', 'target-swarm-1');
  let childEventHits = 0;
  let parentEventHits = 0;
  parent.on('Page.loadEventFired', () => { parentEventHits += 1; });
  child.on('Page.loadEventFired', () => { childEventHits += 1; });

  const cRes = await child.send('Page.enable', {});
  assert.equal(cRes.echoSessionId, 'sess-swarm-1');
  fakeWs.emitEvent({ method: 'Page.loadEventFired', params: {}, sessionId: 'sess-swarm-1' });
  assert.equal(childEventHits, 1);
  assert.equal(parentEventHits, 0);
  fakeWs.emitEvent({ method: 'Page.loadEventFired', params: {} });
  assert.equal(parentEventHits, 1);
  assert.equal(childEventHits, 1);

  child.close();
  assert.equal(child.closed, true);
  assert.equal(parent.sessionListeners.has('sess-swarm-1'), false);
  assert.ok(sentFrames.some((f) => f.method === 'Target.detachFromTarget' && f.params?.sessionId === 'sess-swarm-1'));
  parent.close();
});

test('swarm-board-i18n 5: install-plugin verifyLiveWindowAttach redacts query secrets and mascot cleanup clears __agPrismMascotArt', async () => {
  const installPluginTool = require(path.join(ROOT, 'tools', 'install-plugin.cjs'));
  const mockTargetCdp = {
    readPort: () => 11370,
    redactSensitiveUrl: cdp.redactSensitiveUrl,
    listPages: async () => [
      {
        id: 'win-1',
        title: 'Antigravity — https://127.0.0.1:4808/?token=SECRET_TITLE_TOK&auth=SECRET_AUTH&key=SECRET_KEY&conversationId=c9',
        url: 'https://127.0.0.1:4808/?token=SECRET_URL_TOK&conversationId=c9',
        webSocketDebuggerUrl: 'ws://127.0.0.1:11370/devtools/page/win-1',
      },
    ],
    CdpSession: {
      connect: async () => ({
        evaluate: async () => ({
          hasPrism: true,
          hasRepoBridge: true,
          hasSidebarBridge: false,
          version: cdp.PLUGIN_VERSION,
          hasStyle: true,
        }),
        close() {},
      }),
    },
  };

  const res = await installPluginTool.verifyLiveWindowAttach(mockTargetCdp, 11370);
  assert.equal(res.attachedPages.length, 1);
  const t = res.attachedPages[0].title;
  assert.equal(t.includes('SECRET_TITLE_TOK'), false);
  assert.equal(t.includes('SECRET_AUTH'), false);
  assert.equal(t.includes('SECRET_KEY'), false);
  assert.ok(t.includes('token=<REDACTED>'));
  assert.ok(t.includes('auth=<REDACTED>'));
  assert.ok(t.includes('key=<REDACTED>'));
  assert.ok(t.includes('conversationId=c9'));

  // Fallback redaction when targetCdp lacks redactSensitiveUrl
  const resFallback = await installPluginTool.verifyLiveWindowAttach(
    { ...mockTargetCdp, redactSensitiveUrl: undefined },
    11370
  );
  assert.equal(resFallback.attachedPages[0].title.includes('SECRET_TITLE_TOK'), false);
  assert.ok(resFallback.attachedPages[0].title.includes('token=<REDACTED>'));

  // MASCOT_REMOVE_EXPRESSION & REMOVE_EXPRESSION clear __agPrismMascotArt
  const mkCtx = () => {
    const winObj = {
      __agDualMascotRig: { active: true },
      __agPrismMascotArt: { draw: () => {} },
    };
    const docObj = {
      documentElement: {
        getAttribute: () => null,
        removeAttribute() {},
        style: { removeProperty() {} },
        classList: { remove() {} },
      },
      body: {
        getAttribute: () => null,
        removeAttribute() {},
        classList: { remove() {} },
      },
      querySelectorAll: () => [],
      querySelector: () => null,
      getElementById: () => null,
    };
    const ctx = vm.createContext({ window: winObj, document: docObj, globalThis: winObj });
    return { ctx, winObj };
  };

  const m1 = mkCtx();
  vm.runInContext(cdp.MASCOT_REMOVE_EXPRESSION, m1.ctx);
  assert.equal(m1.winObj.__agDualMascotRig, undefined);
  assert.equal(m1.winObj.__agPrismMascotArt, undefined);

  const m2 = mkCtx();
  vm.runInContext(cdp.REMOVE_EXPRESSION, m2.ctx);
  assert.equal(m2.winObj.__agDualMascotRig, undefined);
  assert.equal(m2.winObj.__agPrismMascotArt, undefined);
});
