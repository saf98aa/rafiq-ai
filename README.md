# رفيق | Rafiq AI — Interactive Patient Journey Experience

A mobile-first, cinematic, interactive product experience for **Rafiq (رفيق)**, the AI-powered patient companion.
Arabic (RTL) is the primary language; English (LTR) is fully supported.

## Run locally

Requirements: Node.js 18+.

```bash
cd rafiq-experience
npm install
npm run dev          # http://localhost:5173 (also exposed on your LAN for phone testing)
```

Production build:

```bash
npm run build        # outputs static files to dist/
npm run preview      # serves dist/ locally
```

`dist/` is fully static with relative paths. Every push to `main` is deployed to GitHub Pages by `.github/workflows/deploy.yml`.

**Test on a phone:** run `npm run dev`, then open the "Network" URL Vite prints (e.g. `http://192.168.x.x:5173`) on a phone connected to the same Wi-Fi.

## Experience structure

| Chapter | What happens |
|---|---|
| 1 · القصة / Story | 11 cinematic scenes built from the real photographs: arrival → emergency & reception → the challenge (4 tappable problem hotspots) → meet Rafiq → Rafiq Voice Companion → hospital navigation → consultation → examinations → results → pharmacy → journey complete. Narration is optional: turn on the sound button to hear Rafiq (and Pharmacist Suleiman in the pharmacy scene). Controls: play/pause, previous/next, sound, progress segments, keyboard arrows and space. |
| 2 · التطبيق / The app | The working prototype: full-screen on phones, inside a device frame on tablets and desktops, with a presentation side panel on wide screens. |
| 3 · الختام / Closing | Recap and restart. |

## Cast — real photographs (`../pic_ref`)

The photo filenames are the source of truth for each role. Faces are **not altered, filtered or regenerated**: the photos are only cropped, resized and converted to WebP in `public/media/people/`.

| File | Role in the story | Name (fictional) |
|---|---|---|
| Elderly_Patient | Patient | عامر / Amer, 68 |
| Patient_Companion | Companion (his daughter) | ناجية / Najia |
| doctor ai | Doctor | د. يسرى زكريا / Dr. Yusra Zakaria |
| nurse ai | Nurse | الممرضة نجوى / Nurse Najwa |
| Pharmacist | Pharmacist | الصيدلي سليمان / Pharmacist Suleiman |
| Patient Check-in & Registration | Reception | صفا / Safaa |
| Lab_Technician | Laboratory | محمد / Mohammed |
| x-ray | Radiology | عمر / Omar |

Scene photographs (used as-is, only resized to WebP):
- `patient Waiting.png` → `waiting.webp`: the results scene ("النتائج"), with Amer and Najia.
- `Patient Discharge & Hospital Exit.png` → `discharge.webp`: the final scene, "اكتملت رحلتك الصحية".

## Hospital — real references (`../hospital-blueprints`)

- **Photos:** the exterior (مستشفى المدينة العام, a fictional hospital name) and the emergency entrance are used in the story, on the welcome screen and as backdrops.
- **Plans:** the ground floor, basement (services) and first floor drawings power the interactive map. They are cropped copies; the originals are untouched. Sensitive areas (morgue, service tunnel, admin, maintenance) are cropped out of the basement view.
- The drawings belong to a **maternity hospital**, so the map labels reflect what the plan actually shows ("غرف فوق الصوت" → ultrasound, "عينات المعامل" → lab samples, etc.). Routes are drawn only along corridors visible on the same floor. The pharmacy is in the basement, so it is shown as a **location only**, because the plans do not show the vertical connection.

## App prototype — screens

Welcome (demo patient selector) · Dashboard · My Journey · Waiting queue · Doctor · Tests · Results · Medication guidance · **Rafiq Voice Companion** · Hospital map · Discharge · **Accessibility settings** · More.

- **Welcome:** Nafath was removed completely. **ابدأ رحلتك مع رفيق / Start Your Journey with Rafiq** gives direct demo access, with an optional choice of *patient* (Mohammed) or *companion* (Reem). The dashboard greeting adapts to the choice.
- **Rafiq Voice Companion (رفيق يتحدث معك)**, the raised centre tab:
  - Mic for spoken questions (browser speech recognition, ar-SA / en-US), plus suggested-question chips as a fallback.
  - Speaker, play/pause, stop, replay and speed (slower / normal / faster), Arabic or English voice, and a waveform.
  - Answers come only from the demo visit data and can open the map at the destination.
- **"اسمع شرح هذه الصفحة"** appears on every screen. A docked player shows the caption and controls while Rafiq speaks.
- **Hospital map: 3D and 2D:**
  - **3D (default where WebGL is available):** a *3D reference visualization*, not an exact architectural model. Each approved plan (`sit_plan_ground floor_ai`, `sit_plan_fristfloor_functional asalysis_ai`) is the textured floor; walls are raised from the plan's own drawn wall lines (`src/data/walls.json`, generated from the plan image); and departments are the traced zones. Wall height is illustrative.
  - Rotate, zoom and pan (touch, mouse or keyboard + − ← → 0), with buttons for zoom, rotate, top view and reset. A floor switcher; the selected department is raised, outlined and pulsing; the route is drawn along the plan's corridors with a moving marker. Arabic and English labels.
  - three.js loads lazily, only when the map opens, and rendering pauses when the map is off-screen. Without WebGL, or if the 3D view fails, the app switches to the **2D plan** automatically. A 3D/2D switch is always available, and the choice is remembered.
  - The position is simulated ("موقعك التجريبي"). No GPS or indoor positioning is claimed.
- **Medication Guide | دليلك الدوائي:** explained by **Pharmacist Suleiman** (Rafiq is the app, never the pharmacist). Demo data is clearly labelled.
  - A visual daily schedule (صباحًا / بعد الظهر / مساءً / قبل النوم) that marks only times written on the prescription. As-needed and weekly medicines are listed separately, with no invented time.
  - Each medicine card covers purpose, how to use it (dose and frequency), food, precautions, verified interactions, what to avoid, and a missed dose. The missed dose is shown only when a cited source covers it; otherwise the card refers the patient to the pharmacist.
  - "اسأل الصيدلي سليمان" questions (why, when, what to avoid, missed dose, can I change the dose) with fixed, safe answers. Never a diagnosis, a new prescription, a dose change, inferred timing or "safe with" claims.
  - Optional voice playback that can be stopped at any time.
- **Voice is optional and off by default:** nothing plays when the site opens. The speaker icon in every header (and on the story controls) turns Rafiq's voice on or off, and tapping it on reads the current screen. Listening (speaker) is clearly separated from speaking to Rafiq (microphone), and the microphone asks for consent before the browser's permission prompt. The whole app works with the voice off.
- **Display & accessibility (أ / Aa in every header, and إعدادات الوصول الميسر):**
  - Text size: standard / large / extra-large.
  - Display: standard (brand), high contrast, dark mode. The 3D map has its own colours in each mode.
  - Simplified UI, reduced motion, clear button labels, screen-reader announcements.
  - Changing a setting never leaves the current journey, and settings are saved on the device. Sensitive information is never announced automatically.

## Presentation mode — "لماذا هذه الميزة؟ / Why this feature?"

Every major screen has a four-part explanation (problem, design decision, value, journey connection). The Voice Companion explanation also lists the beneficiaries: elderly patients, visually impaired users, people with reading difficulties, and companions. The interactive map and simplified onboarding have their own explanations.

## Voice — pre-recorded, no keys in the frontend

All Rafiq lines live in `src/data/voice-lines.json` (Arabic and English). They are recorded **offline** with ElevenLabs and shipped as static MP3s in `public/voice/`:

```bash
# PowerShell:  $env:ELEVENLABS_API_KEY = "..."
ELEVENLABS_API_KEY=... node scripts/gen-voice.mjs
```

- The script records only new or changed lines (it tracks a hash in `src/data/voice-manifest.json`).
- The API key is read from the environment and never reaches the browser.
- Voices: Arabic is **"Mo"** (Saudi male); English is **"Eric"**. Model: `eleven_multilingual_v2`.
- If an MP3 fails to load, the app falls back to the browser's built-in speech synthesis.

## Responsible-design notes

- No external authentication; all patient, staff, queue and clinical data is fictional and labelled as demo/simulated.
- Results show **status only**, with no automated interpretation, and refer the patient to the doctor.
- The Medication Guide shows only prescription and leaflet information, with the source on every card; anything missing is referred to the pharmacist or doctor. No dose is ever changed.
- The map uses only what the reference drawings show; nothing is invented.

## Tech

- React 18 + TypeScript + Vite 5 + Framer Motion. **three.js** (lazy chunk) powers the 3D map only. Voice uses the audio element and the Web Speech API; the 2D map uses pointer events and SVG.
- `src/components/CameraStage.tsx` is a virtual camera (push-in, pan, depth) over the still photographs.

```
src/
  App.tsx                 chapters, top bar, skip link
  store.tsx               language, role, journey state, accessibility settings
  data/content.ts         bilingual content, demo data, explanations
  data/people.ts          photo → role mapping (CharacterAssetManager)
  data/blueprint.ts       floors, departments and verified routes
  data/walls.json         wall rectangles traced from the plan images (3D map)
  data/medguide.ts        Medication Guide demo prescription + Suleiman's answers
  data/voice-lines.json   every spoken line (ar/en)
  voice/                  VoiceProvider (playback/fallback), logic (intents), VoiceUI
  scenes/                 SceneStory (11 scenes), story-data, SceneClosing
  app/screens/            Welcome, Dashboard, …, VoiceCompanion, MapScreen, Map3D, Meds, AccessSettings
  app/DisplayPanel.tsx    header voice toggle + text size / display mode sheet
scripts/gen-voice.mjs     offline voice recording (ElevenLabs)
```

## Known limitations

- The source photos are **still images**. Motion comes from camera moves, depth, layered cards and overlays, not from animated faces or video. People do not move or lip-sync.
- The map plan is from a maternity hospital and is used to demonstrate navigation; the position is simulated.
- The 3D map is a reference visualization: walls come from the drawn lines, so text and hatching on the plan can create small stray blocks, and some plan labels conflict with each other (they are shown as drawn).
- The prescription, queue, results and requests are demonstration data. Real use needs integration with the hospital's systems (HIS/EMR, pharmacy, queueing, indoor positioning).
- Speech recognition depends on the browser (best in Chrome/Edge; not available in Firefox). The suggested questions always work.
- The English voice is a different speaker from the Arabic one.
- Fonts load from Google Fonts. Offline, the system Arabic font is used as a fallback.
