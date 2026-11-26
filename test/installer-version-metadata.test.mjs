import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { buildInstaller, buildVersionInfoSource, windowsVersionParts } from '../scripts/build-installer.mjs';

const ROOT_DIR = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const cdp = createRequire(import.meta.url)(path.join(ROOT_DIR, 'src', 'cdp.js'));

test('windowsVersionParts maps semver to 4 numeric fields clamped to 0..65535', () => {
  assert.deepEqual(windowsVersionParts('1.0.8-beta.5'), [1, 0, 8, 5]);
  assert.deepEqual(windowsVersionParts('2.3.4'), [2, 3, 4, 0]);
  assert.deepEqual(windowsVersionParts('1.0.8-beta.5+sha.2026'), [1, 0, 8, 5]);
  assert.deepEqual(windowsVersionParts('70000.1.2'), [65535, 1, 2, 0]);
  assert.deepEqual(windowsVersionParts(''), [0, 0, 0, 0]);
  assert.deepEqual(windowsVersionParts('not-a-version'), [0, 0, 0, 0]);
});

test('buildVersionInfoSource emits assembly attributes that fill the Win32 VS_VERSIONINFO resource', () => {
  const src = buildVersionInfoSource({
    version: '1.0.8-beta.5',
    title: 'Obsidian Prism Installer',
    description: 'desc "quoted" \\ backslash',
  });
  assert.ok(src.includes('[assembly: AssemblyTitle("Obsidian Prism Installer")]'));
  assert.ok(src.includes('[assembly: AssemblyProduct("Obsidian Prism")]'));
  assert.ok(src.includes('[assembly: AssemblyCompany("EEMEEMMEEx")]'));
  assert.ok(src.includes('[assembly: AssemblyFileVersion("1.0.8.5")]'));
  assert.ok(src.includes('[assembly: AssemblyInformationalVersion("1.0.8-beta.5")]'));
  assert.ok(src.includes('desc \\"quoted\\" \\\\ backslash'), 'quotes and backslashes must be escaped');
});

test(
  'built installer.exe carries product name, company and version metadata instead of 0.0.0.0',
  { skip: process.platform !== 'win32' ? 'Windows-only: requires .NET Framework csc.exe' : false },
  () => {
    const workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ag-prism-vermeta-'));
    const exePath = path.join(workDir, 'installer.exe');
    try {
      const res = buildInstaller({ outputPath: exePath });
      assert.equal(res.version, cdp.PLUGIN_VERSION);
      assert.equal(res.signing.signed, false);
      assert.equal(res.signing.reason, 'no-certificate');

      const buf = fs.readFileSync(exePath);
      const utf16 = (s) => Buffer.from(s, 'utf16le');
      assert.ok(buf.includes(utf16('Obsidian Prism Installer')), 'FileDescription resource string missing');
      assert.ok(buf.includes(utf16('Obsidian Prism')), 'ProductName resource string missing');
      assert.ok(buf.includes(utf16('EEMEEMMEEx')), 'CompanyName resource string missing');
      assert.ok(buf.includes(utf16(cdp.PLUGIN_VERSION)), 'ProductVersion resource string missing');
      assert.ok(
        buf.includes(utf16(windowsVersionParts(cdp.PLUGIN_VERSION).join('.'))),
        'FileVersion resource string missing'
      );
    } finally {
      fs.rmSync(workDir, { recursive: true, force: true });
    }
  }
);

test('signExecutable is a no-op without a certificate so unsigned builds keep working', async () => {
  const { signExecutable } = await import('../scripts/build-installer.mjs');
  const saved = process.env.PRISM_SIGN_CERT;
  delete process.env.PRISM_SIGN_CERT;
  try {
    assert.deepEqual(signExecutable('does-not-matter.exe', {}), { signed: false, reason: 'no-certificate' });
  } finally {
    if (saved !== undefined) process.env.PRISM_SIGN_CERT = saved;
  }
});

test('signExecutable fails loudly when the configured certificate file is missing', async () => {
  const { signExecutable } = await import('../scripts/build-installer.mjs');
  assert.throws(
    () => signExecutable('does-not-matter.exe', { certPath: path.join(os.tmpdir(), 'missing-cert.pfx') }),
    /Signing certificate not found/
  );
});
