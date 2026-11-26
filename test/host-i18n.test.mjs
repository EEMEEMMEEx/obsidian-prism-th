import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ROOT = path.resolve(import.meta.dirname, '..');
const cdp = require(path.join(ROOT, 'cdp.js'));
const i18nCore = require(path.join(ROOT, 'i18n-core.js'));

test('host-i18n removal: vendor/host-i18n directory and assets are completely removed', () => {
  const hostI18nDir = path.join(ROOT, 'vendor', 'host-i18n');
  assert.equal(fs.existsSync(hostI18nDir), false, 'vendor/host-i18n directory must be removed');
  for (const file of [
    'host-i18n-runtime.js',
    'reverse-patterns.js',
    'zh-CN.json',
    'swarm-i18n-runtime.js',
    'swarm-zh-CN.json',
  ]) {
    assert.equal(
      fs.existsSync(path.join(hostI18nDir, file)),
      false,
      `vendor/host-i18n/${file} must not exist`
    );
  }
});

test('host-i18n disabled contract: shouldEnableHostI18n() always returns false and buildHostI18nExpression() always returns ""', () => {
  const cases = [
    [null, null],
    [{}, null],
    [{ hostLocalization: 'auto', language: 'th' }, 'th-TH'],
    [{ hostLocalization: 'auto', language: 'en' }, 'en-US'],
    [{ hostLocalization: 'auto', language: 'zh-CN' }, 'zh-CN'],
    [{ hostLocalization: 'on', language: 'th' }, 'th-TH'],
    [{ hostLocalization: 'on', language: 'en' }, 'en-US'],
    [{ hostLocalization: 'on', language: 'zh-CN' }, 'zh-CN'],
    [{ hostLocalization: 'off', language: 'th' }, 'th-TH'],
    [{ hostLocalization: 'off', language: 'en' }, 'en-US'],
    [{ hostLocalization: 'off', language: 'zh-CN' }, 'zh-CN'],
  ];

  for (const [cfg, hint] of cases) {
    assert.equal(
      cdp.shouldEnableHostI18n(cfg, hint),
      false,
      `shouldEnableHostI18n(${JSON.stringify(cfg)}, ${JSON.stringify(hint)}) must return false`
    );
    assert.equal(
      cdp.buildHostI18nExpression(cfg, hint),
      '',
      `buildHostI18nExpression(${JSON.stringify(cfg)}, ${JSON.stringify(hint)}) must return ""`
    );
  }

  assert.equal(cdp.shouldEnableSwarmI18n({ hostLocalization: 'on', language: 'th' }, 'th-TH'), false);
  assert.equal(cdp.buildSwarmI18nExpression({ hostLocalization: 'on', language: 'th' }, 'th-TH'), '');
  assert.equal(i18nCore.createDomTranslator(), null, 'i18n-core createDomTranslator() must remain disabled (null)');
});

test('host-i18n cleanup & Channel 1 budget: HOST_I18N_REMOVE_EXPRESSION cleans legacy globals and Channel 1 stays lean', () => {
  let destroyed = 0;
  const removedAttrs = [];
  const win = {
    __agPrismHostI18n: {
      destroy() {
        destroyed += 1;
      },
    },
    __agPrismHostI18nFactory: { mountHostI18n() {} },
    __agPrismHostI18nReversePatterns: [],
  };
  const doc = {
    documentElement: {
      removeAttribute(attr) {
        removedAttrs.push(attr);
      },
    },
  };
  const ctx = vm.createContext({ window: win, globalThis: win, document: doc });
  const res = vm.runInContext(cdp.HOST_I18N_REMOVE_EXPRESSION, ctx);
  assert.equal(res.ok, true);
  assert.equal(res.status, 'off');
  assert.equal(destroyed, 1, 'HOST_I18N_REMOVE_EXPRESSION must destroy legacy __agPrismHostI18n');
  assert.ok(removedAttrs.includes('data-ag-prism-host-i18n'));
  assert.equal(win.__agPrismHostI18n, undefined);
  assert.equal(win.__agPrismHostI18nFactory, undefined);
  assert.equal(win.__agPrismHostI18nReversePatterns, undefined);

  const bundle = cdp.buildInjectExpression({ ...cdp.DEFAULT_CONFIG, language: 'th' });
  const bytes = Buffer.byteLength(bundle, 'utf8');
  assert.ok(bytes < 550 * 1024, `Channel 1 main bundle must stay under 550 KiB without host-i18n dict (got ${bytes} B)`);
});
