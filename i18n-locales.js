(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.__agCsLocales = factory();
})(typeof globalThis !== 'undefined' ? globalThis : window, function () {
  const LANG_IDS = ['th', 'en'];

  const LANG_INDEX = {
    th: 0,
    en: 1,
  };

  function resolveLangId(lang) {
    if (Object.prototype.hasOwnProperty.call(LANG_INDEX, lang)) return lang;
    const core = typeof globalThis !== 'undefined' ? globalThis.__agCsI18nCore : null;
    if (core && typeof core.normalizeLanguage === 'function') {
      return core.normalizeLanguage(lang, 'th');
    }
    if (typeof lang !== 'string') return 'th';
    const clean = lang.trim().toLowerCase().replace(/_/g, '-').split(/[.@]/)[0];
    if (!clean) return 'th';
    if (clean === 'en' || clean.startsWith('en-') || clean === 'english') return 'en';
    if (clean === 'th' || clean.startsWith('th-') || clean === 'thai') return 'th';
    return 'th';
  }

  function pick(lang, arr) {
    const idx = Object.prototype.hasOwnProperty.call(LANG_INDEX, lang) ? LANG_INDEX[lang] : 0;
    return arr[idx] !== undefined ? arr[idx] : arr[0];
  }

  // Unified 2-language table for Obsidian Prism UI [th, en]
  const UI_TABLE = {
    // ── Brand Header & Collapsible Banner ────────────────────────────────────
    sectionTitle: ['Obsidian Prism', 'Obsidian Prism'],
    sectionSubtitle: [
      'ชุดปรับแต่งอินเทอร์เฟซและเครื่องมือเสริมสำหรับ Antigravity',
      'Clean UI & Productivity Suite for Antigravity',
    ],
    foldExpandHint: [
      'คลิกเพื่อขยายการตั้งค่าหน้าตาและฟีเจอร์',
      'Click to expand appearance & feature settings',
    ],
    foldCollapseHint: [
      'คลิกเพื่อพับแผงตั้งค่า',
      'Click to collapse settings panel',
    ],

    // ── About, Repo Sync & Open-Source Credits ───────────────────────────────
    aboutGroupTitle: [
      'เกี่ยวกับ การอัปเดต และเครดิตโอเพนซอร์ส',
      'About, Updates & Open-Source Credits',
    ],
    aboutRepoSyncTitle: [
      'สถานะและการซิงก์ Git Repository',
      'Git Repository Status & Sync',
    ],
    aboutRepoSyncBtn: ['ตรวจสอบ / ซิงก์อัปเดต Git', 'Check / Sync Git Updates'],
    aboutRepoChecking: ['กำลังตรวจสอบสถานะ Git repository…', 'Checking Git repository status…'],
    aboutRepoUpToDate: ['รีโพซิทอรีเป็นเวอร์ชันล่าสุดแล้ว', 'Repository is already up to date'],
    aboutRepoUpdated: ['ดึงคอมมิตล่าสุดและรีโหลด UI แล้ว', 'Pulled latest commits & hot-reloaded UI'],
    aboutRepoNoRemote: ['Git repository ในเครื่อง (ยังไม่ได้ตั้งค่า remote)', 'Local Git repository (no remote configured)'],
    setAutoUpdateTitle: ['อัปเดตอัตโนมัติ', 'Auto Update'],
    setAutoUpdateDesc: [
      'ปิดไว้เป็นค่าเริ่มต้น (ตรวจสอบเมื่อกดเองเท่านั้น); เมื่อเปิดจะตรวจสอบเป็นระยะและรีโหลดอัตโนมัติ',
      'Off by default (checks only when triggered manually); when On, checks periodically and hot-reloads.',
    ],
    setUpdateChannelTitle: ['ช่องทางอัปเดต', 'Update Channel'],
    setUpdateChannelDesc: [
      'รับเฉพาะเวอร์ชันเสถียร หรือเลือกรับรุ่นทดลอง -beta / -rc',
      'Receive stable releases only, or opt into -beta / -rc pre-releases.',
    ],
    optChannelStable: ['เสถียร (Stable)', 'Stable'],
    optChannelBeta: ['เบต้า (Beta)', 'Beta'],
    updCheckBtn: ['ตรวจสอบอัปเดต', 'Check Update'],
    updApplyBtn: ['อัปเดตเลย (Hot Reload)', 'Update Now (Hot Reload)'],
    updUpToDate: ['เป็นเวอร์ชันล่าสุดแล้ว v{0}', 'Up to date v{0}'],
    updAvailTpl: ['มีอัปเดต v{0} พร้อมใช้งาน', 'Update v{0} available'],
    updUpdating: ['กำลังดาวน์โหลดและรีโหลด…', 'Downloading & hot-reloading…'],
    updHotDone: [
      'รีโหลดแล้ว (กด Ctrl+R / Cmd+R หรือรีสตาร์ทหากมีการเปลี่ยนส่วนแกนหลัก)',
      'Hot-reloaded (hard reload Ctrl+R / Cmd+R or restart if core changed)',
    ],
    updManualHint: [
      'ดาวน์โหลดตัวติดตั้งจาก Release เพื่ออัปเดตเป็น v{0}',
      'Download installer from Release to update to v{0}',
    ],
    updHotNote: [
      'Hot reload มีผลทันที ส่วนการเปลี่ยนแปลงแกนหลัก สไตล์ หรือเซอร์วิสพื้นหลังต้องรีโหลดหน้าต่าง (Ctrl+R / Cmd+R) หรือรีสตาร์ท Antigravity',
      'Hot reload applies immediately; core, style, or background service changes need a hard reload (Ctrl+R / Cmd+R) or Antigravity restart.',
    ],

    // ── Conversation DB Health & Storage Guard ───────────────────────────────
    storageHealthTitle: ['สุขภาพฐานข้อมูลแชต', 'Conversation DB Health'],
    storageHealthIdle: [
      'ตรวจสอบขนาดฐานข้อมูลของเซอร์วิสพื้นหลังอัตโนมัติ',
      'Auto-checks DB bloat for background service',
    ],
    storageArchiveBtn: ['เตรียมคลังเก็บ (Archive)', 'Prepare Archive'],
    storageOk: ['ปกติ', 'Healthy'],
    storageWarn: ['แนะนำให้จัดเก็บถาวร', 'Archive recommended'],
    storageSummaryTpl: ['{0} ({1} แชตหลัก · {2} ซับเอเจนต์ / {3}) · {4}', '{0} ({1} main · {2} subagents / {3}) · {4}'],
    storageReadyTpl: [
      'สคริปต์พร้อมแล้ว ({0} ซับเอเจนต์ / {1}) ปิด Antigravity แล้วรัน: {2}',
      'Script ready ({0} subagents / {1}). Close Antigravity & run: {2}',
    ],
    storageGuardTitle: ['ตัวดูแลแรมและฐานข้อมูลแชต', 'Memory & Conversation DB Guard'],
    storageGuardSummaryTpl: [
      'ฐานข้อมูล {0} · ซับเอเจนต์ที่เก็บเข้าคลังได้ {1} ({2}) · RAM พื้นหลัง {3} (เก็บแชตหลัก 100% ไม่ลบไฟล์)',
      'DB {0} · {1} archivable subagents ({2}) · Background RAM {3} (100% main chats kept, zero deletion)',
    ],
    storageGuardEnableAutoExitBtn: ['เปิดจัดเก็บอัตโนมัติเมื่อออก', 'Enable Auto-Archive on Exit'],
    storageGuardSnooze24hBtn: ['เลื่อนเตือน 24 ชม.', 'Snooze 24h'],
    storageGuardBusyMsg: ['AI หรือ Swarm กำลังทำงานอยู่ กรุณาลองใหม่เมื่อว่าง', 'AI or Swarm is currently running; retry when idle'],
    storageAutoExitTitle: ['จัดเก็บอัตโนมัติเมื่อปิดโปรแกรม', 'Auto-Archive on Exit'],
    storageAutoExitDesc: [
      'ย้ายซับเอเจนต์ที่เสร็จแล้ว (>2 ชม.) เข้าคลังหลัง Antigravity และเซอร์วิสพื้นหลังปิดไป 4 วินาที (ไม่แตะแชตหลัก ไม่ลบไฟล์)',
      'Moves finished subagents (>2h) offline 4s after Antigravity & its background service exit (main chats untouched, zero deletion)',
    ],
    storageAutoExitOff: ['ปิด (ค่าเริ่มต้น)', 'Off (Default)'],
    storageAutoExitOn: ['เปิด', 'On'],
    storageAutoExitEnabledMsg: ['เปิดการจัดเก็บอัตโนมัติเมื่อปิดโปรแกรมแล้ว', 'Auto-archive on exit enabled'],
    storageArchiveRestartBtn: ['จัดเก็บและรีสตาร์ท', 'Archive & Restart'],
    storageArchiveRestartConfirmDesc: [
      'ระบบจะ: 1) บันทึกสถิติการใช้โทเคน; 2) ปิด Antigravity อย่างปลอดภัยจนเซอร์วิสพื้นหลังหยุด; 3) ย้ายซับเอเจนต์ที่เสร็จแล้ว (>2 ชม.) โดยไม่ลบไฟล์ใดๆ (เก็บแชตหลักทั้งหมด); 4) เปิดโปรแกรมใหม่ให้อัตโนมัติ',
      'This will: 1) persist token usage stats; 2) close Antigravity gracefully until its background service exits; 3) move finished subagents (>2h) without deleting any files (all main chats kept); 4) relaunch automatically.',
    ],
    storageArchiveRestartConfirmBtn: ['ยืนยันและรีสตาร์ท', 'Confirm & Restart'],
    storageArchiveRestartRunning: ['กำลังบันทึกสถิติการใช้งานและเริ่มตัวจัดเก็บ…', 'Saving usage ledger & starting safe archiver…'],
    storageArchiveRestartScheduled: [
      'เริ่มจัดเก็บแบบออฟไลน์แล้ว Antigravity จะปิดและเปิดใหม่โดยอัตโนมัติ',
      'Safe offline archive started; Antigravity will close and relaunch automatically',
    ],
    storageRestoreBtn: ['กู้คืนจากคลังเก็บ', 'Restore Archive'],
    storageRestoreConfirmDesc: [
      'จะปิด Antigravity อย่างปลอดภัย กู้คืนชุดล่าสุด ({0}) กลับมาครบถ้วน แล้วเปิดโปรแกรมใหม่',
      'Will close Antigravity gracefully, restore latest batch ({0}) losslessly, and relaunch.',
    ],
    storageRestoreConfirmBtn: ['ยืนยันการกู้คืน', 'Confirm Restore'],
    storageRestoreScheduled: [
      'ตั้งคิวการกู้คืนครบถ้วนแล้ว Antigravity จะเปิดใหม่โดยอัตโนมัติ',
      'Lossless restore scheduled; Antigravity will relaunch automatically',
    ],
    storageRestoreEmpty: ['ยังไม่มีชุดข้อมูลในคลังเก็บ', 'No archive batches yet'],
    storageLsMemTpl: ['RAM พื้นหลัง {0}', 'Background RAM {0}'],
    goMemLimitTitle: ['จำกัดแรมเซอร์วิสพื้นหลัง (Go GOMEMLIMIT · ทางเลือก)', 'Background Process Memory Limit (Go GOMEMLIMIT · Optional)'],
    goMemLimitDesc: [
      'ใช้ตัวแปรสภาพแวดล้อม GOMEMLIMIT ของ Go 1.19+ ระดับผู้ใช้เพื่อคุมเพดาน heap ของเซอร์วิสพื้นหลังโดยไม่แก้ไฟล์โปรแกรม มีผลหลังรีสตาร์ท Antigravity',
      'Uses Go 1.19+ native user-level GOMEMLIMIT env var to softly cap the host background service heap without modifying official binaries. Takes effect after restarting Antigravity.',
    ],
    goMemLimitUnset: ['ไม่ได้ตั้งค่า (ค่าเริ่มต้นระบบ)', 'Not set (System default)'],
    goMemLimitActiveTpl: ['ตัวแปรผู้ใช้: {0}', 'User env: {0}'],
    goMemLimitRestartNote: ['(รีสตาร์ท Antigravity เพื่อให้มีผล)', '(Restart Antigravity to apply)'],
    goMemLimitApplyBtn: ['นำไปใช้', 'Apply'],
    goMemLimitClearBtn: ['ล้างค่า', 'Clear'],
    goMemLimitAppliedTpl: ['ตั้งค่า GOMEMLIMIT={0} แล้ว รีสตาร์ท Antigravity เพื่อให้มีผล', 'Set GOMEMLIMIT={0}; restart Antigravity to take effect'],
    goMemLimitCleared: ['ล้างค่า GOMEMLIMIT แล้ว รีสตาร์ท Antigravity เพื่อกลับค่าเริ่มต้น', 'Cleared GOMEMLIMIT; restart Antigravity to restore default'],
    aboutCreditsTitle: ['เครดิตโอเพนซอร์สต้นน้ำและแรงบันดาลใจ', 'Upstream Open-Source & Inspiration Credits'],
    aboutLicenseTitle: ['สัญญาอนุญาต GPL-3.0 และประกาศเครดิต', 'GPL-3.0 License & Attribution Notice'],
    aboutDisclaimer: [
      'Obsidian Prism เป็นโปรเจกต์โอเพนซอร์สอิสระ ไม่ได้เกี่ยวข้องหรือได้รับการรับรองจาก Google LLC',
      'Obsidian Prism is an independent open-source project and is not affiliated with or endorsed by Google LLC.',
    ],
    uninstallBtn: ['ถอนการติดตั้ง Prism', 'Uninstall Prism'],
    uninstallPurge: ['ลบไฟล์ตั้งค่า คีย์ และแคชทั้งหมด', 'Purge config, key & cache'],
    uninstallKeepNote: ['เก็บแชต, conversations_archive, Spark และ knowledge ไว้ครบ', 'Keeps chats, conversations_archive, Spark & knowledge'],
    uninstallCancelBtn: ['ยกเลิก', 'Cancel'],
    uninstallConfirmBtn: ['ยืนยัน', 'Confirm'],
    uninstallDone: ['กำลังถอนการติดตั้งและคืนค่า UI เดิม', 'Uninstalling; restoring UI'],

    // ── Home Studio & Telemetry Dashboard ────────────────────────────────────
    studioPlaceholder: ['วันนี้ให้ช่วยอะไรดี?', 'How can I help you today?'],
    tabOverview: ['ภาพรวม', 'Overview'],
    tabModels: ['โมเดล', 'Models'],
    kpiSessions: ['เซสชัน', 'Sessions'],
    kpiCalls: ['ข้อความ', 'Messages'],
    kpiTokens: ['โทเคนรวม', 'Total tokens'],
    kpiDays: ['วันที่ใช้งาน', 'Active days'],
    kpiFavModel: ['โมเดลที่ใช้บ่อย', 'Favorite model'],
    noModelUsage: ['ยังไม่มีข้อมูลการใช้งานโมเดล', 'No model usage data yet'],
    sessionsUnit: ['เซสชัน', 'sessions'],
    subagentsUnit: ['ซับเอเจนต์', 'subagents'],
    swarmBadge: ['Swarm', 'Swarm'],
    tokensInShort: ['เข้า', 'in'],
    tokensOutShort: ['ออก', 'out'],
    quotaJustNow: ['เมื่อสักครู่', 'Just now'],
    tokenUnit: ['โทเคน', 'tokens'],
    showLess: ['แสดงน้อยลง', 'Show less'],
    thinkingEllipsis: ['กำลังคิด…', 'Thinking…'],
    kpiCacheHit: ['อัตรา Cache Hit', 'Cache Hit Rate'],
    cacheRead: ['อ่านแคช', 'Cache Read'],
    cacheShort: ['แคช', 'Cache'],
    quotaPoolsTitle: ['โควตาโมเดลคงเหลือ', 'Model Quota Pools Remaining'],
    quotaLoading: ['กำลังโหลดสถานะโควตาโมเดล…', 'Loading model quota status…'],
    weeklyLabel: ['รายสัปดาห์', 'Weekly'],
    refreshBtnTitle: ['รีเฟรชข้อมูลสถิติ', 'Refresh telemetry'],
    tabQuotas: ['โควตา', 'Quotas'],
    effortTitle: ['ระดับการคิดวิเคราะห์', 'Reasoning effort'],

    // ── Settings Groups & Common Controls ────────────────────────────────────
    grpAppearance: ['หน้าตาและเลย์เอาต์', 'Appearance & Layout'],
    grpInteraction: ['ช่องพิมพ์ แถบข้าง และมาสคอต', 'Composer, Sidebar & Mascots'],
    groupModules: ['โมดูลเครื่องมือเสริม', 'Utility Modules'],
    grpBeta: ['ฟีเจอร์เบต้า (Beta)', 'Beta Features'],
    betaPlaceholderNotice: [
      'หมายเหตุ: หมวดนี้รวมฟีเจอร์ทดลองที่ปิดไว้เป็นค่าเริ่มต้น และอาจเปลี่ยนแปลงได้ตามเวอร์ชัน',
      'Note: This section contains experimental features that are off by default and may evolve across versions.',
    ],
    onLabel: ['เปิด', 'On'],
    offLabel: ['ปิด', 'Off'],
    optAutoCoexist: ['อัตโนมัติ', 'Auto'],
    setLanguageTitle: ['ภาษาอินเทอร์เฟซ', 'UI Language'],
    setLanguageDesc: [
      'สลับภาษาสำหรับแดชบอร์ดและหน้าตั้งค่าของ Obsidian Prism',
      'Switch language for Obsidian Prism dashboard and settings UI.',
    ],
    setHomeLayoutTitle: ['เลย์เอาต์หน้าแรก', 'Home Layout'],
    setHomeLayoutDesc: ['สลับเลย์เอาต์หน้าเริ่มบทสนทนาใหม่', 'Switch new-conversation home layout.'],
    optStudio: ['Studio', 'Studio'],
    optClassic: ['Classic', 'Classic'],
    optNativeOff: ['ปิด', 'Off'],
    setPaletteTitle: ['ชุดสี (Color Palette)', 'Color Palette'],
    setPaletteDesc: [
      'ใช้ตามธีมหลัก หรือสลับไปใช้ชุดสี Obsidian / Alabaster Warm',
      'Follow host theme, or switch to refined Obsidian / Alabaster Warm palettes.',
    ],
    optObsidian: ['Obsidian', 'Obsidian'],
    optWarm: ['Alabaster Warm', 'Alabaster Warm'],
    optClaude: ['Alabaster Warm', 'Alabaster Warm'],
    optHost: ['ตามธีมหลัก', 'Follow Host'],
    setLightPresetTitle: ['โทนพื้นผิวโหมดสว่าง', 'Daylight Surface Preset'],
    setLightPresetDesc: [
      'ปรับระดับพื้นผิว ความคมชัดกระจก และโทนสีในโหมดสว่าง',
      'Tune surface elevation, glass contrast, and tint in light mode.',
    ],
    optLightCrystal: ['Daylight Crystal', 'Daylight Crystal'],
    optLightAlabaster: ['Warm Alabaster', 'Warm Alabaster'],
    lightPresetHintDark: [
      'ทำงานในโหมดสว่าง — สลับธีมหลักเป็นโหมดสว่างเพื่อดูตัวอย่าง',
      'Active in Light mode — switch host theme to Light to preview',
    ],
    lightPresetHintWarm: [
      'ชุดสี Alabaster Warm ใช้พื้นผิวโทนลินินอุ่นอัตโนมัติ',
      'Alabaster Warm palette automatically applies warm linen surface',
    ],
    lightPresetHintHost: [
      'กำลังใช้ตามธีมหลัก — เลือกชุดสี Obsidian ในโหมดสว่างเพื่อปรับแต่ง',
      'Following host theme — select Obsidian palette in Light mode to customize',
    ],

    // ── Modules & Features ───────────────────────────────────────────────────
    setTelemetryTitle: ['แถบสถิติและ Context HUD ด้านล่าง', 'Bottom Telemetry & Context HUD'],
    setTelemetryDesc: [
      'แสดงความเร็ว แคช และปริมาณ Context ใช้งานร่วมกับปลั๊กอินอื่นได้',
      'Show speed, cache, and context usage; compatible with external plugins.',
    ],
    setEffortSliderTitle: ['แถบเลื่อนระดับการคิดของโมเดล', 'Model Reasoning Effort Slider'],
    setEffortSliderDesc: [
      'เพิ่มแถบเลื่อนปรับระดับการคิดวิเคราะห์ในเมนูเลือกโมเดล',
      'Add a reasoning effort slider inside the model menu.',
    ],
    setEffortMemoryTitle: ['จำระดับการคิดแยกตามโมเดล', 'Remember Effort Per Model'],
    setEffortMemoryDesc: [
      'จดจำระดับการคิดล่าสุดของแต่ละโมเดลและ Orchestrator แม้จะปิดแถบเลื่อนไว้',
      'Remember your last reasoning effort per model and Orchestrator planner, even with the slider turned off.',
    ],
    setPeriodicPickerTitle: ['ตัวเลือกโมเดลตารางธาตุ 3D', 'Periodic Table Picker'],
    setPeriodicPickerDesc: [
      'กดค้างที่ปุ่มเลือกโมเดลด้านล่างเพื่อเปิดตารางธาตุ 3D; กดสั้นเปิดรายการปกติ',
      'Long-press the bottom model selector for the 3D periodic table; short-click opens the native list.',
    ],
    setOmniTitle: ['ตัวดูไฟล์และเมนูคลิกขวา (Omni)', 'File Viewer & Context Menu'],
    setOmniDesc: [
      'เปิดการจัดการลิงก์ เมนูคลิกขวาไฟล์ และพรีวิวสื่อ/ข้อมูลในแถบข้าง',
      'Enable link handling, file context menu actions, and side-pane media/data preview.',
    ],
    setLinkTargetTitle: ['ปลายทางเมื่อคลิกลิงก์เว็บ', 'Web Link Target'],
    setLinkTargetDesc: [
      'ปลายทางเริ่มต้นเมื่อคลิกลิงก์เว็บ (กด Ctrl/Cmd+คลิก เพื่อสลับ)',
      'Default target when clicking web links (hold Ctrl/Cmd+Click to invert).',
    ],
    setSidebarStudioTitle: ['โหมดแชต (Chat Mode · Beta)', 'Chat Mode (Beta)'],
    setSidebarStudioDesc: [
      'ฟีเจอร์ทดลอง (ปิดไว้เป็นค่าเริ่มต้น) เพิ่มปุ่มสลับ Code / Chat ที่แถบข้างสำหรับคุยทั่วไปและจัดการเอกสาร',
      'Experimental (off by default). Adds a Code / Chat switcher to the sidebar for everyday chat and document tasks.',
    ],
    optLinkBuiltin: ['แผงด้านข้าง', 'Side Pane'],
    optLinkExternal: ['เบราว์เซอร์ระบบ', 'System Browser'],
    setLogoInkTitle: ['สีโลโก้หน้าแรก', 'Logo Color'],
    setLogoInkDesc: ['โทนสีของสัญลักษณ์หน้าแรก', 'Tint of the home greeting mark.'],
    optAccent: ['สีเน้น (Accent)', 'Accent'],
    optForeground: ['สีหมึก (Ink)', 'Ink'],
    setSidebarTitle: ['ปรับแต่งสไตล์แถบข้าง', 'Sidebar Restyle'],
    setSidebarDesc: ['ปรับความสูงแถวและเอฟเฟกต์ไฮไลต์ของแถบข้างให้เรียบเนียน', 'Apply refined row height and hover plates to sidebar.'],
    setSidebarCompactTitle: ['แถบข้างแบบกระชับ', 'Compact Sidebar'],
    setSidebarCompactDesc: ['ลดความสูงแถวแถบข้างจาก 28px เหลือ 24px', 'Tighten sidebar row height from 28px to 24px.'],
    setComposerTitle: ['ปรับแต่งกล่องพิมพ์ข้อความ', 'Composer Restyle'],
    setComposerDesc: ['กล่องพิมพ์สไตล์มินิมอลพร้อมแถบด้านล่างแบบสะอาดตา', 'Minimalist input box + clean canvas footer.'],
    setPlaceholderTitle: ['สไตล์ข้อความนำในช่องพิมพ์', 'Placeholder Style'],
    setPlaceholderDesc: ['สลับระหว่างข้อความของ Studio กับค่าเริ่มต้นของโปรแกรม', 'Switch between Studio placeholder copy and host default.'],
    optPlaceholderHost: ['ค่าเดิมโปรแกรม', 'Host'],
    setSmoothCaretTitle: ['เคอร์เซอร์พิมพ์แบบลื่นไหล', 'Smooth Typing Caret'],
    setSmoothCaretDesc: ['เปิดการเคลื่อนที่ของเคอร์เซอร์แบบสมูทในช่องพิมพ์ข้อความ', 'Enable smooth gliding caret interpolation in composer input.'],
    rowContextMenuTitle: ['เมนูด่วนในแชต (/btw)', 'Conversation Quick Menu (/btw)'],
    rowContextMenuDesc: [
      'คลิกขวาที่ใดก็ได้ในบทสนทนาเพื่อเปิดแชตข้าง /btw ด้วยข้อความที่เลือกหรือสั่ง /compact; กด Shift+คลิกขวา เพื่อเปิดเมนูเดิม',
      'Right-click anywhere in a conversation to launch /btw side chat with selected text or run /compact; hold Shift+Right-Click for the native menu.',
    ],

    // ── Motion, FPS, Mascots & Ripples ───────────────────────────────────────
    setMotionLevelTitle: ['ระดับแอนิเมชัน', 'Motion Level'],
    setMotionLevelDesc: [
      'ควบคุมสปริงแอนิเมชัน การค่อยๆ ปรากฏของข้อความ และทรานซิชัน',
      'Control spring micro-interactions, streaming text reveal, and scene transitions.',
    ],
    optMotionOff: ['ปิด', 'Off'],
    optMotionSubtle: ['เบาบาง', 'Subtle'],
    optMotionStandard: ['มาตรฐาน', 'Standard'],
    optMotionUltra: ['เต็มรูปแบบ', 'Ultra'],
    setTargetFpsTitle: ['เฟรมเรตเป้าหมาย', 'Target Frame Rate'],
    setTargetFpsDesc: [
      'จำกัด FPS ของแสงขอบ ริปเปิล แท่งคริสตัล และหลอด Context (พักอัตโนมัติเมื่อไม่ได้ใช้งาน)',
      'Cap active FPS for prism rim, home ripples, crystal bar & vial animations (auto-sleeps when idle).',
    ],
    optFps60: ['60 FPS', '60 FPS'],
    optFps120: ['120 FPS', '120 FPS'],
    optFps180: ['180 FPS', '180 FPS'],
    optFpsNative: ['สูงสุดตามจอ', 'Native Max'],
    setMascotTitle: ['เวทีมาสคอตพิกเซล', 'Pixel Mascot Stage'],
    setMascotDesc: ['แสดงมาสคอตพิกเซลโต้ตอบได้เหนือช่องพิมพ์', 'Show interactive pixel mascots on composer.'],
    optMascotCrab: ['คู่ (Dual)', 'Dual'],
    optMascotMinis: ['คู่ + ปูจิ๋ว', 'Dual + Crabs'],
    optMascotQuad: ['4 ตัว (Quad)', 'Quad'],
    optMascotQuadMinis: ['4 ตัว + ปูจิ๋ว', 'Quad + Crabs'],
    optMascotOff: ['ปิด', 'Off'],
    mascotRosterTitle: ['จัดทีมมาสคอตเอง', 'Custom Roster'],
    mascotRosterCount: ['ตัวหลัก {n}/4', 'Main {n}/4'],
    mascotRosterMinis: ['+ปูจิ๋ว 3 ตัว', '+3 Mini Crabs'],
    mascotSpeciesCrab: ['ปู Claude', 'Claude Crab'],
    mascotSpeciesCat: ['แมว Gemini', 'Gemini Cat'],
    mascotSpeciesDragon: ['มังกร GPT', 'GPT Dragon'],
    mascotSpeciesWhale: ['วาฬ DeepSeek', 'DeepSeek Whale'],
    mascotStageOpenBtn: ['เปิดเวทีเลือกมาสคอต', 'Open Casting Stage'],
    mascotStageTitle: ['เวทีเลือกมาสคอต', 'Mascot Casting Stage'],
    mascotStageBackBtn: ['กลับไปหน้าตั้งค่า', 'Back to Settings'],
    mascotStageHint: [
      'คลิกมาสคอตในโรงเตี๊ยมหรือป้ายด้านล่างเพื่อเปิด/ปิดไฟสปอตไลต์ เลื่อนเมาส์เพื่อดูพารัลแลกซ์ 3D',
      'Click mascots in the tavern or badges below to toggle spotlights; move pointer for 3D parallax',
    ],
    mascotStagePresetDual: ['คู่คลาสสิก', 'Classic Dual'],
    mascotStagePresetQuad: ['ครบทั้ง 4 ตัว', 'All Four'],
    mascotStagePresetOff: ['พักทั้งหมด', 'All Resting'],
    mascotStageMinisSlot: ['มุมปูจิ๋ว', 'Mini Crab Corner'],
    mascotStageActiveOn: ['ขึ้นเวที', 'On Stage'],
    mascotStageActiveOff: ['พักผ่อน', 'Resting'],
    setRippleTitle: ['ริปเปิลเมทริกซ์หน้าแรก', 'Home Matrix Ripple'],
    setRippleDesc: ['สนามคลื่นตัวอักษรโต้ตอบได้บนหน้าแรก', 'Interactive character matrix ripple field on home view.'],
    setConvRippleTitle: ['ริปเปิลเมทริกซ์พื้นหลังแชต', 'Chat Matrix Ripple'],
    setConvRippleDesc: [
      'คลื่นตัวอักษรพื้นหลังแชตพร้อมปรับความเข้มได้ (ปิดเป็นค่าเริ่มต้น; หลีกทางให้วอลเปเปอร์หรือมุมมองแบ่งหน้าจออัตโนมัติ)',
      'Character matrix ripple on chat background with adjustable intensity (off by default; auto-yields to custom wallpaper or split view).',
    ],
    optConvRippleOff: ['ปิด', 'Off'],
    optConvRippleSubtle: ['เบาบาง', 'Subtle'],
    optConvRippleMedium: ['ปานกลาง', 'Medium'],
    optConvRippleFull: ['เต็มที่', 'Full'],

    // ── Thought Translation & Polishing ──────────────────────────────────────
    grpThought: ['การแปลและเกลาความคิดของโมเดล', 'Thought Translation & Polishing'],
    setThoughtModeTitle: ['โหมดแปลความคิด (Thought)', 'Thought Translation Mode'],
    setThoughtModeDesc: [
      'แปลกระบวนการคิดของโมเดลด้วยการแปลอัตโนมัติแบบไม่ต้องตั้งค่า หรือเกลาแบบสตรีมด้วย AI ที่รองรับ OpenAI API',
      'Translate English reasoning chains via zero-config Machine Translate or streaming OpenAI-compatible AI polish.',
    ],
    optThoughtOff: ['ปิด', 'Off'],
    optThoughtMachine: ['แปลอัตโนมัติ', 'Machine'],
    optThoughtAi: ['เกลาด้วย AI', 'AI Polish'],
    setThoughtTriggerTitle: ['จังหวะเริ่มแปล', 'Translation Trigger Timing'],
    setThoughtTriggerDesc: [
      'โหลดแปลความคิดล่าสุดล่วงหน้าในพื้นหลัง หรือแปลเฉพาะตอนกดขยายเพื่อประหยัดโทเคน',
      'Preload latest finished thought in background, or translate strictly on expand to save tokens.',
    ],
    optTriggerPreload: ['โหลดล่วงหน้า', 'Preload'],
    optTriggerExpand: ['เมื่อกดขยาย', 'On Expand'],
    thoughtStyleLabel: ['สไตล์การเกลา', 'Polishing Style'],
    optStyleTech: ['บันทึกวิศวกรรมละเอียด', 'Technical Manuscript'],
    optStyleConcise: ['สรุปประเด็นกระชับ', 'Concise Key Points'],
    optStyleCustom: ['พรอมต์กำหนดเอง', 'Custom Prompt'],
    thoughtCustomPromptPh: ['ใส่พรอมต์เกลาความคิดที่ต้องการ (บันทึกไว้เฉพาะในเครื่อง)…', 'Enter custom polishing prompt (saved locally only)…'],
    thoughtProfilesLabel: ['โปรไฟล์ปลายทาง OpenAI', 'OpenAI Endpoint Profiles'],
    thoughtAddProfileBtn: ['+ สร้างโปรไฟล์', '+ New Profile'],
    thoughtDelProfileBtn: ['ลบ', 'Delete'],
    thoughtFieldName: ['ชื่อโปรไฟล์', 'Profile Name'],
    thoughtFieldBaseUrl: ['Base URL', 'Base URL'],
    thoughtFieldApiKey: ['API Key', 'API Key'],
    thoughtFieldModel: ['รหัสโมเดล (Model ID)', 'Model ID'],
    thoughtFetchModelsBtn: ['ดึงรายชื่อโมเดล', 'Fetch Models'],
    thoughtSaveBtn: ['บันทึกการตั้งค่า', 'Save Config'],
    thoughtTestBtn: ['ส่งข้อความทดสอบ', 'Send Test Message'],
    thoughtPrivacyHint: [
      'API Key และพรอมต์กำหนดเองจะถูกเก็บไว้ในเครื่องเท่านั้น ไม่มีการอัปโหลดออกภายนอก',
      'API keys and custom prompts are stored locally only and never uploaded.',
    ],

    // ── Workspace Scope, Presets & Sub-tabs ──────────────────────────────────
    workspaceAll: ['ทุกโปรเจกต์', 'All Projects'],
    workspaceFilterAria: ['กรองสถิติการใช้งานตามเวิร์กสเปซ', 'Filter usage by workspace'],
    homeScopeAll: ['ทั้งหมด', 'All'],
    homeScopeActive: ['ปัจจุบัน', 'Current'],
    homeScopeActiveCount: ['ใช้งานอยู่', 'Active'],
    homeScopeArchivedCount: ['ในคลังเก็บ', 'Archived'],
    homeLocalOnlyTag: ['เฉพาะในเครื่อง', 'Local only'],
    homeLocalScopeNote: ['นับเฉพาะเซสชันที่บันทึกไว้ในเครื่อง (ไม่รวมคลาวด์)', 'Counts saved local sessions only (excludes cloud)'],
    fiveHourLabel: ['รอบ 5 ชั่วโมง', '5-Hour Window'],
    quotaEmptyHint: ['กำลังรอข้อมูลโควตาล่าสุด — กดรีเฟรชเพื่อลองใหม่', 'Waiting for live quota snapshot — click Refresh to retry'],
    presetBarLabel: ['พรีเซตสำเร็จรูป', 'Scene Presets'],
    presetUltra: ['ภาพเต็มรูปแบบ', 'Full Visuals'],
    presetFocus: ['โฟกัสเขียนโค้ด', 'Deep Focus'],
    presetEco: ['เงียบประหยัดพลังงาน', 'Silent Eco'],
    subTabAll: ['ทั้งหมด', 'All'],
    subTabAppearance: ['หน้าตา', 'Appearance'],
    subTabInteraction: ['เวิร์กสเปซ', 'Workspace'],
    subTabThought: ['แปลความคิด', 'Thought'],
    subTabModules: ['โมดูล', 'Modules'],
    subTabBeta: ['เบต้า', 'Beta'],
    subTabAbout: ['ตั้งค่า & เกี่ยวกับ', 'Config & About'],

    // ── Accent, Corners, Scroll, Inline Diff, Sidebar Nav & Fonts ────────────
    setAccentToneTitle: ['โทนสีเน้น (Accent)', 'Accent Tone'],
    setAccentToneDesc: ['ปรับเฉดสีเน้นสำหรับปุ่มที่เลือก กรอบโฟกัส และกราฟ', 'Adjust accent hue for active controls, focus rings, and charts.'],
    optToneFollow: ['ตามโมเดล', 'Follow Model'],
    optToneCobalt: ['โคบอลต์', 'Cobalt'],
    optToneIris: ['ไอริส', 'Iris'],
    optToneAmber: ['อำพัน', 'Amber'],
    optToneMono: ['โมโนโครม', 'Monochrome'],
    setCornerStyleTitle: ['ความโค้งของมุม', 'Corner Radius Style'],
    setCornerStyleDesc: ['ปรับความมนของขอบช่องพิมพ์ การ์ด และป๊อปโอเวอร์', 'Adjust border radius curvature across composer, cards, and popovers.'],
    optCornerSharp: ['คมเฉียบ', 'Sharp'],
    optCornerBalanced: ['สมดุล', 'Balanced'],
    optCornerSoft: ['มนละมุน', 'Soft'],
    setScrollBottomTitle: ['แอนิเมชันเลื่อนลงล่างสุด', 'Scroll-to-Bottom Motion'],
    setScrollBottomDesc: [
      'เลื่อนแบบมีแรงเฉื่อยนุ่มนวลเมื่อกดปุ่มลงล่างสุด (หมุนล้อเมาส์หยุดได้ทันที) หรือกระโดดลงทันทีแบบเดิม',
      'Use high-speed inertial glide when clicking Scroll-to-Bottom (wheel interrupts instantly), or keep native instant jump.',
    ],
    optScrollBottomSmooth: ['เลื่อนนุ่มเร็ว', 'Fast Glide'],
    optScrollBottomInstant: ['ทันที', 'Instant'],
    inlineDiffOpenSidebar: ['เปิดในแถบข้าง', 'Open in Sidebar'],
    inlineDiffCollapse: ['พับเก็บ', 'Collapse'],
    inlineDiffLoading: ['กำลังโหลด diff...', 'Loading diff...'],
    inlineDiffBinary: ['ไฟล์ไบนารีไม่สามารถพรีวิวแบบอินไลน์ได้ คลิกขวาเพื่อเปิดในแถบข้าง', 'Binary file cannot be previewed inline. Right-click to open in Sidebar.'],
    inlineDiffNoPreview: ['ไม่มีแคชข้อความ diff ฉบับเต็มในขั้นตอนนี้ คลิกขวาเพื่อเปิด diff เต็มในแถบข้าง', 'Full hunk text is not cached on this step. Right-click to open full diff in Sidebar.'],
    inlineDiffSnapshotNotice: ['ไม่ได้ติดตามโดย Git · กำลังแสดงไฟล์ปัจจุบัน (คลิกขวาเพื่อเปิด diff เต็มในแถบข้าง)', 'Not tracked by Git · previewing current file (right-click to open full diff in Sidebar)'],
    inlineDiffLongLinesTag: ['บรรทัดยาว', 'long line'],
    inlineDiffMenuExpand: ['ขยาย diff อินไลน์', 'Expand inline diff'],
    inlineDiffMenuCollapse: ['พับ diff อินไลน์', 'Collapse inline diff'],
    inlineDiffMenuCopyPath: ['คัดลอกพาธไฟล์', 'Copy file path'],
    inlineDiffLargeExpandBtn: ['⋯ แสดงเฉพาะส่วนสำคัญ · คลิกเพื่อเปิด diff เต็มในแถบข้าง', '⋯ Showing key hunks · Click to open full diff in Sidebar'],
    sidebarMoreLabel: ['เพิ่มเติม', 'More'],
    sidebarLessLabel: ['ย่อลง', 'Less'],
    setSidebarNavFoldLabel: ['พับเมนูนำทางแถบข้าง', 'Compact Sidebar Nav'],
    setSidebarNavFoldDesc: [
      'เมื่อปิดจะแสดงครบ 3 เมนู; เมื่อเปิดจะปักหมุด New Conversation และพับ Automations กับ Customizations ไว้ใน เพิ่มเติม',
      'Show all 3 nav items when off; when on, keep New Conversation pinned and fold Automations & Customizations into More.',
    ],
    optSidebarNavFoldOff: ['แสดงทั้งหมด', 'Show All'],
    optSidebarNavFoldOn: ['พับเมนูเสริม', 'Fold Extra'],
    setCodeFontTitle: ['ฟอนต์โค้ด (Monospace)', 'Code Monospace Font'],
    setCodeFontDesc: ['เลือกฟอนต์สำหรับบล็อกโค้ดและโค้ดในบรรทัด', 'Preferred monospace font family for code blocks and inline code.'],
    optFontDefault: ['ค่าเริ่มต้น', 'Default'],
    optFontSfmono: ['SF Mono / Consolas', 'SF Mono / Consolas'],
    setCodeLigaturesTitle: ['การเชื่อมอักขระโค้ด (Ligatures)', 'Code Font Ligatures'],
    setCodeLigaturesDesc: ['เปิดใช้ ligatures ของฟอนต์เขียนโค้ด (=>, !==, >=) ในบล็อกโค้ด', 'Enable programming font ligatures (=>, !==, >=) inside code blocks.'],
    setAmbientIntensityTitle: ['ความเข้มแสงบรรยากาศ', 'Ambient Glow Intensity'],
    setAmbientIntensityDesc: ['ปรับความโปร่งแสงของแสงออโรราและแสงสะท้อนขอบ', 'Control opacity scale of ambient aurora and edge refraction glow.'],
    optAmb0: ['0%', '0%'],
    optAmb35: ['35%', '35%'],
    optAmb70: ['70%', '70%'],
    optAmb100: ['100%', '100%'],
    setDarkAuraStyleLabel: ['สไตล์แสงพื้นหลังโหมดมืด', 'Dark Surface Material'],
    setDarkAuraStyleDesc: ['เลือกสไตล์สเปกตรัมแสงออโรราด้านล่างในโหมดมืด', 'Choose the bottom aurora spectrum style in dark chat mode.'],
    optDarkAuraPrism: ['Polar Silk', 'Polar Silk'],
    optDarkAuraNeon: ['Abyssal Glow', 'Abyssal Glow'],
    setDarkAuraLabel: ['ความเข้มแสงขอบฟ้าโหมดมืด', 'Dark Horizon Intensity'],
    setDarkAuraDesc: ['ปรับความสว่างและระยะแผ่ของแสงออโรราด้านล่างในหน้าแชตโหมดมืด', 'Tune brightness and reach of the bottom aurora in dark chat view.'],
    darkAuraHintLight: ['ทำงานในโหมดมืด — สลับธีมหลักเป็นโหมดมืดเพื่อดูตัวอย่าง', 'Active in Dark mode — switch host theme to Dark to preview'],
    optDarkAuraSubtle: ['เบาบาง', 'Subtle'],
    optDarkAuraBalanced: ['สมดุล', 'Balanced'],
    optDarkAuraVivid: ['ชัดเจน', 'Vivid'],
    setThoughtViewTitle: ['มุมมองความคิดที่แปลแล้ว', 'Translated Thought View'],
    setThoughtViewDesc: ['สลับระหว่างแสดงคำแปลล้วน กับแสดงคู่สองภาษา', 'Switch between clean immersive translation and stacked bilingual view.'],
    optThoughtImmersive: ['คำแปลล้วน', 'Immersive'],
    optThoughtBilingual: ['สองภาษา', 'Bilingual'],

    // ── Config Backup & Reset ────────────────────────────────────────────────
    cfgToolbarTitle: ['สำรองและรีเซ็ตการตั้งค่า', 'Configuration Backup & Reset'],
    cfgToolbarHint: [
      'ไฟล์ JSON ที่ส่งออกจะตัด API Key ออกให้อัตโนมัติเพื่อความปลอดภัยในการสำรองและแชร์',
      'Exported JSON strips all API keys automatically for safe backup and sharing.',
    ],
    cfgExportBtn: ['ส่งออก JSON', 'Export JSON'],
    cfgImportBtn: ['นำเข้า JSON', 'Import JSON'],
    cfgResetBtn: ['รีเซ็ตค่าเริ่มต้น', 'Reset Defaults'],
    cfgExportOk: ['ส่งออกไฟล์ตั้งค่าแบบปลอดภัยแล้ว (ตัด API Key ออกแล้ว)', 'Exported sanitized config (API keys stripped)'],
    cfgImportOk: ['ตรวจสอบและกู้คืนการตั้งค่าแล้ว', 'Validated and restored settings'],
    cfgImportErr: ['JSON ไม่ถูกต้อง หรือไม่พบคีย์ตั้งค่าที่รองรับ', 'Invalid JSON or no recognized setting keys'],
    cfgResetOk: ['คืนค่าตั้งต้นทั้งหมดแล้ว', 'Restored all default settings'],
    thoughtClearCacheBtn: ['ล้างแคช', 'Clear Cache'],
    thoughtViewLabel: ['มุมมองการอ่าน', 'Reading View'],

    // ── Omni Context Menu & Built-in Side-Pane Browser / Viewer ──────────────
    omniOpenBuiltin: ['เปิดในแผงด้านข้าง', 'Open in Side Pane'],
    omniOpenPreview: ['พรีวิวใน Workbench', 'Preview in Workbench'],
    omniOpenExternal: ['เปิดด้วยแอปเริ่มต้น', 'Open in Default App'],
    omniOpenBrowser: ['เปิดในเบราว์เซอร์ระบบ', 'Open in System Browser'],
    omniRevealFolder: ['เปิดดูในโฟลเดอร์', 'Reveal in Folder'],
    omniInsertMention: ['แทรกเป็น @Mention', 'Insert as @Mention'],
    omniCopyLink: ['คัดลอกลิงก์ URL', 'Copy Link URL'],
    omniCopyAbsPath: ['คัดลอกพาธเต็ม', 'Copy Absolute Path'],
    omniCopyRelPath: ['คัดลอกพาธสัมพัทธ์', 'Copy Relative Path'],
    omniCopyText: ['คัดลอกข้อความ', 'Copy Text'],
    omniZoomDiagram: ['ซูมดูแผนภาพ', 'Zoom Diagram'],
    omniViewWorkbench: ['มุมมอง Workbench', 'Workbench View'],
    omniViewRaw: ['มุมมองต้นฉบับ', 'Raw View'],
    omniReload: ['โหลดใหม่', 'Reload'],
    omniBack: ['ย้อนกลับ', 'Back'],
    omniForward: ['ถัดไป', 'Forward'],
  };

  // Static UI keys required by non-settings runtime modules (Channel 1 slim slice)
  const RUNTIME_UI_KEYS = Object.freeze([
    'studioPlaceholder',
    'optObsidian',
    'optWarm',
    'optHost',
    'optLightCrystal',
    'optLightAlabaster',
    'optMotionOff',
    'optMotionSubtle',
    'optMotionStandard',
    'optMotionUltra',
    'tabOverview',
    'tabModels',
    'tabQuotas',
    'kpiSessions',
    'kpiCalls',
    'kpiTokens',
    'kpiDays',
    'kpiCacheHit',
    'kpiFavModel',
    'cacheRead',
    'cacheShort',
    'noModelUsage',
    'sessionsUnit',
    'subagentsUnit',
    'swarmBadge',
    'tokensInShort',
    'tokensOutShort',
    'quotaJustNow',
    'tokenUnit',
    'showLess',
    'thinkingEllipsis',
    'quotaPoolsTitle',
    'quotaLoading',
    'quotaEmptyHint',
    'weeklyLabel',
    'fiveHourLabel',
    'refreshBtnTitle',
    'workspaceAll',
    'workspaceFilterAria',
    'homeScopeAll',
    'homeScopeActive',
    'homeScopeActiveCount',
    'homeScopeArchivedCount',
    'homeLocalOnlyTag',
    'homeLocalScopeNote',
    'sidebarMoreLabel',
    'sidebarLessLabel',
    'effortTitle',
    'omniOpenBuiltin',
    'omniOpenPreview',
    'omniOpenExternal',
    'omniOpenBrowser',
    'omniRevealFolder',
    'omniInsertMention',
    'omniCopyLink',
    'omniCopyAbsPath',
    'omniCopyRelPath',
    'omniCopyText',
    'omniZoomDiagram',
    'omniViewWorkbench',
    'omniViewRaw',
    'omniReload',
    'omniBack',
    'omniForward',
    'inlineDiffOpenSidebar',
    'inlineDiffCollapse',
    'inlineDiffLoading',
    'inlineDiffBinary',
    'inlineDiffNoPreview',
    'inlineDiffSnapshotNotice',
    'inlineDiffLongLinesTag',
    'inlineDiffMenuExpand',
    'inlineDiffMenuCollapse',
    'inlineDiffMenuCopyPath',
    'inlineDiffLargeExpandBtn',
    'optThoughtImmersive',
    'optThoughtBilingual',
  ]);

  function getUiStrings(lang) {
    const norm = resolveLangId(lang);
    const out = {};
    for (const key in UI_TABLE) {
      out[key] = pick(norm, UI_TABLE[key]);
    }
    out.optViewImmersive = out.optThoughtImmersive;
    out.optViewBilingual = out.optThoughtBilingual;
    out.swarmSplitSub = (mainPct, subPct) =>
      norm === 'th'
        ? `แชตหลัก ${mainPct}% · ซับเอเจนต์ ${subPct}%`
        : `Main ${mainPct}% · Swarm ${subPct}%`;
    out.showMoreN = (n) =>
      norm === 'th'
        ? `แสดงเพิ่มอีก ${n} รายการ`
        : `Show ${n} more`;
    return out;
  }

  function getRuntimeUiSlice(lang) {
    const norm = resolveLangId(lang);
    const strings = {};
    for (let i = 0; i < RUNTIME_UI_KEYS.length; i++) {
      const k = RUNTIME_UI_KEYS[i];
      if (Object.prototype.hasOwnProperty.call(UI_TABLE, k)) {
        strings[k] = pick(norm, UI_TABLE[k]);
      }
    }
    return { lang: norm, strings };
  }

  // Global host DOM dictionary override stays empty (does not interfere with host native UI)
  const DICT_ROWS = [];

  function resolveLocaleBundle() {
    return null;
  }

  return {
    LANG_IDS,
    LANG_INDEX,
    UI_TABLE,
    RUNTIME_UI_KEYS,
    getUiStrings,
    getRuntimeUiSlice,
    DICT_ROWS,
    resolveLocaleBundle,
    __isFullLocales: true,
  };
});
