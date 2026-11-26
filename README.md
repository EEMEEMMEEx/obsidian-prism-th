<div align="center">

<img src="assets/logo.svg" width="96" height="96" alt="Obsidian Prism Logo" />

# Obsidian Prism (Personal Edition)

**Optical UI & Motion Suite สำหรับ Google Antigravity — คลังโปรเจคส่วนตัวของ [@EEMEEMMEEx](https://github.com/EEMEEMMEEx)**

ชุดธีมแสง/มืด 4 ชุด · หลอดวัดบริบท 512K · ตัวเลื่อนระดับการคิด · มาสคอตพิกเซล · วอลเปเปอร์นิ่ง/วิดีโอ (Beta) · แปลกระบวนการคิด (TH/EN)

[**คลังโปรเจค (GitHub)**](https://github.com/EEMEEMMEEx/obsidian-prism-th) · [**บันทึกการเปลี่ยนแปลง (CHANGELOG)**](./CHANGELOG.md) · [**Releases**](https://github.com/EEMEEMMEEx/obsidian-prism-th/releases)

<p>
  <img src="https://img.shields.io/badge/Version-1.0.8--beta.5-0f172a?style=flat-square" alt="Version 1.0.8-beta.5" />
  <img src="https://img.shields.io/badge/Owner-EEMEEMMEEx-1e293b?style=flat-square" alt="Owner EEMEEMMEEx" />
  <img src="https://img.shields.io/badge/Languages-TH%20%7C%20EN-0ea5e9?style=flat-square" alt="Languages TH | EN" />
  <a href="./LICENSE"><img src="https://img.shields.io/badge/License-GPL--3.0-2563eb?style=flat-square" alt="License: GPL-3.0" /></a>
</p>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/screenshots/hero-dark.webp" />
  <source media="(prefers-color-scheme: light)" srcset="assets/screenshots/hero-light.webp" />
  <img src="assets/screenshots/hero-dark.webp" width="100%" alt="Obsidian Prism v1.0.8-beta.5 Preview" />
</picture>

</div>

> **ข้อจำกัดความรับผิดชอบ (Non-Affiliation Disclaimer)**
>
> **Obsidian Prism is an independent open-source project and is not affiliated with or endorsed by Google LLC.**
> โปรเจคนี้เป็นคลังปรับแต่งส่วนตัวของ `EEMEEMMEEx` ไม่มีความเกี่ยวข้องหรือได้รับการรับรองจาก Google LLC

---

## ความสามารถหลัก

- **4 ชุดสี (2 มืด / 2 สว่าง)**: `obsidian`, `warm`, `crystal`, `alabaster` ปรับตามธีมระบบอัตโนมัติ
- **512K Context Vial & Telemetry**: แสดงปริมาณบริบท, แยกการใช้ token หลัก/ซับเอเจนต์, อัตรา Cache Hit และพยากรณ์โควตา 5 ชั่วโมง / รายสัปดาห์
- **Reasoning Effort Slider & Periodic Model Picker**: เลือกระดับการคิดและรุ่นโมเดลได้ตรงจากเมนู
- **Thought Translator (TH / EN)**: แปลกระบวนการคิดและหัวข้อแชตแบบเลือกเปิดเอง (ค่าเริ่มต้นปิด) รองรับทั้งโหมดแปลอัตโนมัติและ OpenAI-compatible API พร้อมปุ่ม **1-Click Diagnose**
- **Omni Viewer & Inline Diff**: เปิดดูลิงก์, ไฟล์ขนาดใหญ่ (วิดีโอ/เสียง/PDF/SVG/CSV/HTML/ฟอนต์) และ Diff ในแถบข้าง
- **Wallpaper (Beta) & Sidebar Studio (Beta)**: ปิดเป็นค่าเริ่มต้น เปิดใช้ตามต้องการจากหน้าตั้งค่า

---

## การติดตั้งและใช้งาน

ต้องใช้ **Node.js >= 22** และ **Antigravity v2.33.0+**

```bash
git clone https://github.com/EEMEEMMEEx/obsidian-prism-th.git
cd obsidian-prism-th

# 1. ติดตั้งปลั๊กอินลง ~/.gemini/config/plugins/obsidian-prism และเริ่ม Sidecar Daemon
npm run install:plugin

# 2. ตรวจสอบสถานะการติดตั้งและ Daemon
node tools/install-plugin.cjs --status
```

> **หมายเหตุการติดตั้ง**
> - ห้ามใช้ `npm run inject` แทน `npm run install:plugin` สำหรับการใช้งานจริง เพราะ `npm run inject` เป็นการฉีดชั่วคราวครั้งเดียวโดยไม่ติดตั้งปลั๊กอินและไม่เปิด Sidecar Daemon
> - เมื่อเปิดใช้งาน Thought Translator ครั้งแรก ให้ไปที่ **Settings → Appearance → Obsidian Prism** แล้วเลือกโหมดแปลที่ต้องการ หากมีปัญหาใช้ปุ่ม **1-Click Diagnose** เพื่อตรวจสอบการเชื่อมต่อ

### คำสั่งสำหรับพัฒนาและบิลด์

```bash
npm run inject                 # ฉีดหน้าต่างที่เปิดอยู่ชั่วคราว (node src/inject.js)
npm run watch                  # โหมดเฝ้าดูไฟล์และรีโหลดอัตโนมัติ (node src/inject.js --watch)
npm run remove                 # ลบสไตล์และส่วนเสริมที่ฉีดออกทั้งหมด (node src/remove.js)
npm run workbench              # เปิด Workbench จำลองหน้าจอสำหรับทดสอบ UI
npm test                       # รันชุดทดสอบทั้งหมด (รวม test/gates/)
npm run test:gates             # รันเฉพาะ hygiene / gate tests
npm run test:fast              # รันชุดทดสอบเร็ว
npm run build:installer        # สร้างตัวติดตั้ง Windows (.exe) ลง dist/
npm run build:macos            # สร้างตัวติดตั้ง macOS Universal (.dmg)
npm run archive:conversations  # จัดเก็บประวัติซับเอเจนต์แบบไม่สูญหาย
npm run clean:legacy           # ล้างโค้ดค้างรุ่นเก่าใน app.asar
```

---

## โครงสร้างโปรเจค

```text
obsidian-prism-th/
├── package.json / plugin.json          # ข้อมูลโปรเจคส่วนตัวและ manifest ปลั๊กอิน (v1.0.8-beta.5)
├── config.example.json                 # ตัวอย่างค่าตั้งต้น
├── LICENSE / NOTICE                    # สัญญาอนุญาต GPL-3.0 และประกาศการดัดแปลง/อ้างอิงต้นทาง
├── THIRD_PARTY_NOTICES.md              # สัญญาอนุญาตคอมโพเนนต์ MIT ต้นทาง
├── CHANGELOG.md                        # ประวัติการเปลี่ยนแปลงเวอร์ชัน
├── src/                                # ซอร์สโค้ดหลักฝั่ง Runtime, CDP Bundler, Injector และ Stylesheet
│   ├── cdp.js                          # ตัวรวมแพ็กเกจ Zero-eval LZSS, Cache และโปรโตคอล CDP
│   ├── inject.js / remove.js           # สคริปต์ฉีด / ถอดถอนชั่วคราว
│   ├── style.css                       # ธีม 4 ชุดและ Smoked Obsidian surfaces
│   ├── ui-runtime.js                   # Micro-kernel จัดการวงจรชีวิตและ config hot-sync
│   ├── settings-panel.js               # หน้าตั้งค่า Appearance (TH/EN)
│   ├── i18n-core.js / i18n-locales.js  # ระบบภาษา TH/EN
│   ├── motion-engine.js / animated-icons.js
│   ├── ripple-core.js / conv-aura.js / prism-rim-canvas.js
│   ├── crystal-prism-core.js / model-glyph-crystal.js
│   ├── usage-core.js / vial-core.js / pulse-vial-bridge.js
│   ├── home-studio-panel.js / home-ripple-host.js
│   ├── host-workbench-enhancer.js / stream-choreography.js
│   ├── smooth-caret.js / dual-mascot-rig.js / context-menu-btw.js
├── sidecars/daemon/                    # Sidecar Daemon (settings, telemetry, updater, git sync, archive)
├── vendor/                             # โมดูลเสริมแยกส่วน (omni-viewer, pulse-dashboard, thought-translator, ฯลฯ)
├── installer/                          # ตัวติดตั้งเนทีฟ Windows (C#) และ macOS (Swift)
├── scripts/                            # สคริปต์บิลด์ตัวติดตั้ง, test runner และ .bat สำหรับ Windows
├── tools/                              # เครื่องมือติดตั้งปลั๊กอิน (install-plugin.cjs) และล้าง legacy (patch-asar.cjs)
├── workbench/                          # เซิร์ฟเวอร์และหน้าจำลอง UI สำหรับทดสอบ
├── assets/                             # โลโก้ SVG และภาพตัวอย่าง
└── test/                               # ชุดทดสอบอัตโนมัติและ repo hygiene gates
```

---

## สัญญาอนุญาตและการอ้างอิงต้นทาง (GPL-3.0)

> Built upon [Obsidian Prism](https://github.com/RMvdesi/obsidian-prism) by [@RMvdesi](https://github.com/RMvdesi), licensed under [GPL-3.0](./LICENSE). Personal fork maintained exclusively by [@EEMEEMMEEx](https://github.com/EEMEEMMEEx). Upstream notices are preserved in [`NOTICE`](./NOTICE) and [`THIRD_PARTY_NOTICES.md`](./THIRD_PARTY_NOTICES.md).

คอมโพเนนต์และแรงบันดาลใจต้นทางที่คงการอ้างอิงตาม [`THIRD_PARTY_NOTICES.md`](./THIRD_PARTY_NOTICES.md):

1. [0DNANCY/agy-claude-style](https://github.com/0DNANCY/agy-claude-style) — MIT License
2. [ATtacK030130/antigrative-dashboard](https://github.com/ATtacK030130/antigrative-dashboard) — MIT License
3. [LLYSH-HANNARI/antigravity-Codex-Claude-effort-slider](https://github.com/LLYSH-HANNARI/antigravity-Codex-Claude-effort-slider) — MIT License
4. [yiheng8023/antigravity-chinese](https://github.com/yiheng8023/antigravity-chinese) — MIT License
5. [Nwflower/dsh-claude-style](https://github.com/Nwflower/dsh-claude-style) — Design reference
6. [Microqian2th/dsh-codex-effort-slider](https://github.com/Microqian2th/dsh-codex-effort-slider) — Design reference
7. [mobius/dsh-performance-slider](https://github.com/mobius/dsh-performance-slider) — Design reference
8. [claudenoshujin/claude-web](https://github.com/claudenoshujin/claude-web) — Design reference
9. [wp3171216237/dsh-TUI](https://github.com/wp3171216237/dsh-TUI) — MIT License
