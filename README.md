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
| 1 · القصة / Story | 11 cinematic scenes built from the real photographs: arrival → emergency & reception → the challenge (4 tappable problem hotspots) → meet Rafiq → Rafiq Voice Companion → hospital navigation → consultation → examinations → results → pharmacy → journey complete. Rafiq narrates scenes after you press **ابدأ التجربة**. Controls: play/pause, previous/next, sound, progress segments, keyboard arrows and space. |
| 2 · التطبيق / The app | The working prototype: full-screen on phones, inside a device frame on tablets and desktops, with a presentation side panel on wide screens. |
| 3 · الختام / Closing | Recap and restart. |

## Cast — real photographs (`../pic_ref`)

The photo filenames are the source of truth for each role. Faces are **not altered, filtered or regenerated**: the photos are only cropped, resized and converted to WebP in `public/media/people/`.

| File | Role in the story | Name (fictional) |
|---|---|---|
| Elderly_Patient | Patient | محمد عبدالله, 68 |
| Patient_Companion | Companion (his daughter) | ريم |
| Doctor | Doctor | د. سارة العتيبي |
| Nurse | Nurse | الممرضة نورة |
| Pharmacist | Pharmacist | الصيدلي يوسف |
| Receptionist | Reception | هند |
| Lab_Technician | Laboratory | خالد |
| Radiology_Technician | Radiology / ultrasound | عمر |

There was no female-patient photo, so the story follows the elderly man with his companion.

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
- **Interactive map:**
  - Floor tabs, pan / pinch / wheel / keyboard zoom, highlighted departments with Arabic and English labels.
  - A simulated "you are here", animated routes and spoken directions ("استمع إلى الاتجاهات").
  - No GPS or indoor positioning is claimed.
- **Medication:** "استمع إلى تعليمات الدواء" reads the approved demo instructions exactly as written. Nothing is invented, and the prescription is never modified.
- **Accessibility (إعدادات الوصول الميسر):**
  - Voice guidance, auto-read (off by default), larger text, high contrast, simplified UI, reduced motion, clear button labels, screen-reader announcements.
  - Saved per device.
  - Sensitive information is never announced automatically.

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
- Medication guidance plays only the approved instructions and refers everything else to the pharmacist.
- The map uses only what the reference drawings show; nothing is invented.

## Tech

- React 18 + TypeScript + Vite 5 + Framer Motion. No extra libraries were added for voice or the map: they use the Web Audio element, the Web Speech API, pointer events and SVG.
- `src/components/CameraStage.tsx` is a virtual camera (push-in, pan, depth) over the still photographs.

```
src/
  App.tsx                 chapters, top bar, skip link
  store.tsx               language, role, journey state, accessibility settings
  data/content.ts         bilingual content, demo data, explanations
  data/people.ts          photo → role mapping (CharacterAssetManager)
  data/blueprint.ts       floors, departments and verified routes
  data/voice-lines.json   every spoken line (ar/en)
  voice/                  VoiceProvider (playback/fallback), logic (intents), VoiceUI
  scenes/                 SceneStory (11 scenes), story-data, SceneClosing
  app/screens/            Welcome, Dashboard, …, VoiceCompanion, MapScreen, AccessSettings
scripts/gen-voice.mjs     offline voice recording (ElevenLabs)
```

## Known limitations

- The source photos are **still images**. Motion comes from camera moves, depth, layered cards and overlays, not from animated faces or video. People do not move or lip-sync.
- The map plan is from a maternity hospital and is used to demonstrate navigation; the position is simulated.
- Speech recognition depends on the browser (best in Chrome/Edge; not available in Firefox). The suggested questions always work.
- The English voice is a different speaker from the Arabic one.
- Fonts load from Google Fonts. Offline, the system Arabic font is used as a fallback.
