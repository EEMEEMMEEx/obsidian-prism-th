#!/usr/bin/env node
// Build standalone Windows installer.exe for Obsidian Prism (obsidian-prism).
// Zero external npm dependencies: uses built-in Node zlib + Windows .NET Framework csc.exe.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  ROOT_DIR,
  cdp,
  VALIDATORS,
  createManifest,
  resolveActiveConfigFile,
  collectOptionalOmniTopEntries,
  collectNativePluginEntries,
  buildMultiResIco,
  buildZip,
} from './build-common.mjs';

const __filename = fileURLToPath(import.meta.url);

function findCsc() {
  const winDir = process.env.WINDIR || 'C:\\Windows';
  const candidates = [
    path.join(winDir, 'Microsoft.NET', 'Framework64', 'v4.0.30319', 'csc.exe'),
    path.join(winDir, 'Microsoft.NET', 'Framework', 'v4.0.30319', 'csc.exe'),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error('csc.exe (.NET Framework 4.x) not found');
}

// 1.0.8-beta.4 -> [1, 0, 8, 4]; tail of the semver line not used as a field.
function windowsVersionParts(version) {
  const m = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.\-+]+))?$/.exec(String(version || '').trim());
  if (!m) return [0, 0, 0, 0];
  const pre = /(\d+)/.exec(m[4] || '');
  const clamp = (n) => Math.max(0, Math.min(65535, Number(n) || 0));
  return [clamp(m[1]), clamp(m[2]), clamp(m[3]), clamp(pre ? pre[1] : 0)];
}

function csString(value) {
  return '"' + String(value ?? '').replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
}

// Assembly attributes feed the Win32 VS_VERSIONINFO resource csc embeds, so Explorer
// "Details" and SmartScreen reputation metadata show real product/version values.
function buildVersionInfoSource({ version, title, description }) {
  const numeric = windowsVersionParts(version).join('.');
  return [
    'using System.Reflection;',
    `[assembly: AssemblyTitle(${csString(title)})]`,
    `[assembly: AssemblyDescription(${csString(description)})]`,
    '[assembly: AssemblyCompany("Obsidian Prism Contributors")]',
    '[assembly: AssemblyProduct("Obsidian Prism")]',
    '[assembly: AssemblyCopyright("GPL-3.0-only")]',
    `[assembly: AssemblyVersion(${csString(numeric)})]`,
    `[assembly: AssemblyFileVersion(${csString(numeric)})]`,
    `[assembly: AssemblyInformationalVersion(${csString(version)})]`,
    '',
  ].join('\n');
}

function findSignTool() {
  const explicit = process.env.PRISM_SIGNTOOL;
  if (explicit && fs.existsSync(explicit)) return explicit;
  const kitsBin = path.join(
    process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)',
    'Windows Kits',
    '10',
    'bin'
  );
  if (!fs.existsSync(kitsBin)) return null;
  const versions = fs.readdirSync(kitsBin).sort().reverse();
  for (const v of versions) {
    for (const arch of ['x64', 'x86', 'arm64']) {
      const candidate = path.join(kitsBin, v, arch, 'signtool.exe');
      if (fs.existsSync(candidate)) return candidate;
    }
  }
  return null;
}

// Authenticode signing only runs when a certificate is supplied, so unsigned local
// builds keep working. Signing reduces SmartScreen friction; it cannot remove it
// without reputation or an EV certificate.
function signExecutable(filePath, signOptions = {}) {
  const certPath = signOptions.certPath || process.env.PRISM_SIGN_CERT;
  if (!certPath) return { signed: false, reason: 'no-certificate' };
  if (!fs.existsSync(certPath)) {
    throw new Error(`Signing certificate not found: ${certPath}`);
  }
  const signtool = findSignTool();
  if (!signtool) return { signed: false, reason: 'signtool-not-found' };
  const password = signOptions.password || process.env.PRISM_SIGN_PASSWORD;
  const timestampUrl =
    signOptions.timestampUrl || process.env.PRISM_SIGN_TIMESTAMP_URL || 'http://timestamp.digicert.com';
  const args = ['sign', '/fd', 'SHA256', '/f', certPath, '/tr', timestampUrl, '/td', 'SHA256'];
  if (password) args.push('/p', password);
  args.push(filePath);
  execFileSync(signtool, args, { stdio: 'inherit' });
  return { signed: true, reason: 'signed' };
}

function buildInstaller({ outputPath = path.join(ROOT_DIR, 'installer.exe'), configPath, signOptions = {} } = {}) {
  const csc = findCsc();
  const stageDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ag-prism-build-'));

  try {
    const icoPath = path.join(stageDir, 'app.ico');
    fs.writeFileSync(icoPath, buildMultiResIco());

    const manifest = createManifest();
    const manifestJson = JSON.stringify(manifest, null, 2) + '\n';
    fs.writeFileSync(path.join(stageDir, 'manifest.json'), manifestJson, 'utf8');

    const watcherOut = path.join(stageDir, 'obsidian-prism-watcher.exe');
    const commonMiniJson = path.join(ROOT_DIR, 'installer', 'common', 'MiniJson.cs');
    const commonCdpClient = path.join(ROOT_DIR, 'installer', 'common', 'CdpClient.cs');
    const watcherMain = path.join(ROOT_DIR, 'installer', 'watcher', 'Program.cs');

    const pluginVersion = cdp.PLUGIN_VERSION;
    const watcherVersionInfo = path.join(stageDir, 'WatcherVersionInfo.cs');
    fs.writeFileSync(
      watcherVersionInfo,
      buildVersionInfoSource({
        version: pluginVersion,
        title: 'Obsidian Prism Watcher',
        description: 'Obsidian Prism background watcher for Antigravity',
      }),
      'utf8'
    );
    const setupVersionInfo = path.join(stageDir, 'SetupVersionInfo.cs');
    fs.writeFileSync(
      setupVersionInfo,
      buildVersionInfoSource({
        version: pluginVersion,
        title: 'Obsidian Prism Installer',
        description: 'Obsidian Prism installer (Optical UI & Motion Suite for Antigravity)',
      }),
      'utf8'
    );

    execFileSync(csc, [
      '/nologo',
      '/utf8output',
      '/codepage:65001',
      '/target:winexe',
      '/optimize+',
      `/win32icon:${icoPath}`,
      `/out:${watcherOut}`,
      '/r:System.dll',
      '/r:System.Core.dll',
      '/r:System.Net.Http.dll',
      commonMiniJson,
      commonCdpClient,
      watcherMain,
      watcherVersionInfo,
    ], { stdio: 'inherit' });

    const activeConfigFile = resolveActiveConfigFile(configPath);
    const optionalOmniTopEntries = collectOptionalOmniTopEntries();

    const payloadFiles = [
      { name: 'obsidian-prism-watcher.exe', data: fs.readFileSync(watcherOut) },
      { name: 'manifest.json', data: Buffer.from(manifestJson, 'utf8') },
      { name: 'style.css', data: Buffer.from(cdp.readCss(), 'utf8') },
      { name: 'config.json', data: fs.readFileSync(activeConfigFile) },
      { name: 'config.example.json', data: fs.readFileSync(path.join(ROOT_DIR, 'config.example.json')) },
      ...manifest.parts.map((part) => ({
        name: part,
        data: Buffer.from(cdp.prepareRuntimePart(part, fs.readFileSync(path.join(ROOT_DIR, part), 'utf8')), 'utf8'),
      })),
      ...optionalOmniTopEntries,
      ...collectNativePluginEntries(activeConfigFile),
    ];

    const payloadZip = path.join(stageDir, 'payload.zip');
    fs.writeFileSync(payloadZip, buildZip(payloadFiles));

    const setupManifest = path.join(ROOT_DIR, 'installer', 'setup', 'app.manifest');
    const setupMain = path.join(ROOT_DIR, 'installer', 'setup', 'Program.cs');
    const tempOut = path.join(stageDir, 'installer.exe');

    execFileSync(csc, [
      '/nologo',
      '/utf8output',
      '/codepage:65001',
      '/target:winexe',
      '/optimize+',
      `/win32icon:${icoPath}`,
      `/win32manifest:${setupManifest}`,
      `/resource:${payloadZip},AGY_PAYLOAD.zip`,
      `/out:${tempOut}`,
      '/r:System.dll',
      '/r:System.Core.dll',
      '/r:System.Drawing.dll',
      '/r:System.IO.Compression.dll',
      '/r:System.IO.Compression.FileSystem.dll',
      '/r:System.Net.Http.dll',
      '/r:System.Windows.Forms.dll',
      commonMiniJson,
      commonCdpClient,
      setupMain,
      setupVersionInfo,
    ], { stdio: 'inherit' });

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.copyFileSync(tempOut, outputPath);
    const stat = fs.statSync(outputPath);
    let signing;
    try {
      signing = signExecutable(outputPath, signOptions);
    } catch (err) {
      fs.rmSync(outputPath, { force: true });
      throw err;
    }
    return {
      outputPath,
      sizeBytes: stat.size,
      watcherSizeBytes: fs.statSync(watcherOut).size,
      payloadZipBytes: fs.statSync(payloadZip).size,
      fileCount: payloadFiles.length,
      version: pluginVersion,
      signing,
    };
  } finally {
    fs.rmSync(stageDir, { recursive: true, force: true });
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  const args = process.argv.slice(2);
  let outputPath = path.join(ROOT_DIR, 'installer.exe');
  const signOptions = {};
  for (let i = 0; i < args.length; i++) {
    if ((args[i] === '--out' || args[i] === '-o') && i + 1 < args.length) {
      outputPath = path.resolve(args[++i]);
    } else if (args[i] === '--sign-cert' && i + 1 < args.length) {
      signOptions.certPath = path.resolve(args[++i]);
    } else if (args[i] === '--sign-password' && i + 1 < args.length) {
      signOptions.password = args[++i];
    } else if (args[i] === '--sign-timestamp' && i + 1 < args.length) {
      signOptions.timestampUrl = args[++i];
    }
  }
  const res = buildInstaller({ outputPath, signOptions });
  console.log(
    `[✓] Built ${res.outputPath} (${(res.sizeBytes / 1024).toFixed(1)} KB; ` +
    `payload ${(res.payloadZipBytes / 1024).toFixed(1)} KB, ${res.fileCount} files; ` +
    `v${res.version}, signing ${res.signing.signed ? 'applied' : `skipped (${res.signing.reason})`})`
  );
}

export {
  VALIDATORS,
  buildInstaller,
  buildZip,
  buildMultiResIco,
  buildVersionInfoSource,
  windowsVersionParts,
  signExecutable,
};
