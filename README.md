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

`dist/` is fully static with relative paths, so it can be hosted on any static host (Netlify, Vercel, GitHub Pages, S3) or opened from a USB stick via a simple local server.

**Test on a phone:** run `npm run dev`, then open the "Network" URL Vite prints (e.g. `http://192.168.x.x:5173`) on a phone connected to the same Wi-Fi.

## Experience structure

| Chapter | What happens |
|---|---|
| 1 · الوصول / Arrival | Wide establishing shot of the hospital entrance (ambulance lights flashing, people passing in the foreground), the camera dollies in, then cuts inside to Mohammed in the waiting hall. CTA: **ابدأ التجربة**. |
| 2 · التحدي / Challenge | An explorable scene with three stations (waiting hall, corridors, entrance). Visitors drag to look around and tap glowing hotspots to *discover* 7 real patient challenges. Each card links the problem to the Rafiq feature that addresses it. Live details: the queue display ticks, question bubbles cycle, the companion asks what's next, and corridor signs flip. |
| 3 · رفيق / Transformation | The patient's questions float up and dissolve, blue light rises, the calm shot shows answers, and the live Rafiq app emerges from the phone in his hand. |
| 4 · التطبيق / The app | The working prototype: full-screen on phones, inside a device frame on tablets and desktops, with a presentation side panel on wide screens. |
| 5 · الختام / Closing | "أكثر من مجرد تطبيق…", a recap of the journey, the value pillars, and **استكشف رفيق من جديد** to restart. |

The patient in the story (Mohammed, red shemagh, white thobe) is the same patient inside the app: his avatar, visit **VIS-0001**, his doctor and his hospital carry through every screen.

## App prototype — screens

Welcome & Nafath (demo) · Dashboard · My Journey · Waiting queue · Doctor & consultation · Tests · Results · Medication guidance · Hospital map · Discharge · More (all screens, language, presentation mode, journey simulator).

All controls work. The journey is driven by one central state (`src/store.tsx`), so every screen stays consistent:

1. Dashboard → **Queue** (advance the queue → "It's your turn") → **Start consultation**
2. **Doctor** → *End consultation & request tests* → **Tests** (open a test → start → complete)
3. *Release the results* → **Results** → *Review with the doctor* → **Medication guidance** ("Ask Rafiq" answers only from care-team notes)
4. **Discharge** → *Approve discharge* → "اكتملت رحلتك الصحية." → **Finish** → Closing

Buttons marked **محاكاة / Demo** are clearly labelled simulation controls for presenting. The journey simulator (More tab, or the desktop side panel) can jump to any stage.

## Presentation mode — "لماذا هذه الميزة؟ / Why this feature?"

On by default and can be switched off globally (More tab or desktop panel). Every major screen has a four-part explanation: **the problem, the design decision, the value, the journey connection**, in Arabic and English.

- Phone / tablet: a discreet floating chip opens a dark explanation sheet, kept visually separate from the patient UI.
- Desktop: the explanation appears live in the side panel next to the device as you navigate.

## Responsible-design notes

- Nafath sign-in is a **visual simulation only**, with no real integration and no ID entry. A "Quick demo access" path is provided.
- All patient, doctor, hospital, queue and clinical data is fictional and labelled as sample/simulated data.
- Results show **status and timing only**, with no interpretation or diagnosis, and direct the patient to their doctor.
- Medication guidance shows only what the care team "recorded", with no invented doses, and refers everything else to the pharmacist.
- The map is a simplified prototype; no indoor positioning is claimed.

## Tech

- React 18 + TypeScript + Vite 5
- Framer Motion for scene, screen, sheet and number transitions; CSS keyframes for ambient life (walkers, light sweep, dust, grain, sirens)
- A custom virtual camera (`src/components/CameraStage.tsx`) frames, pans and dollies over the storyboard renders. On portrait screens it frames the wide render as a cinematic band over a blurred fill instead of cropping it to a sliver. Hotspots and overlays are pinned in image space so they stay locked to their subjects.
- Foreground passers-by (`src/components/Ambience.tsx`) are out-of-focus figures that cross close to the camera to add depth and movement.
- Fonts: IBM Plex Sans Arabic + Inter (Google Fonts)
- `prefers-reduced-motion` is respected (ambient motion off, transitions minimised)
- Scene images were cropped (storyboard labels removed) and converted to WebP: about 0.9 MB total, down from about 20 MB of PNG.

```
src/
  App.tsx              chapters, top bar, scene transitions
  store.tsx            language, presentation mode, journey/queue/tests state, navigation
  data/content.ts      all bilingual content, demo data, map, hotspots, explanations
  components/          CameraStage, Ambience (walkers + atmosphere), Icon, Logo
  scenes/              SceneIntro, SceneProblem, SceneTransform, SceneClosing
  app/                 PhoneApp shell, AppStage (device + panel), Explain, ui primitives
  app/screens/         Welcome, Dashboard, Journey, Queue, Doctor, Exams, Results, Meds, MapScreen, Discharge, More
public/media/          optimised scene renders + avatars (from the original storyboard art)
```

## Known limitations

- Scenes are built from the existing still renders brought to life with camera motion, depth-of-field, foreground walkers and diegetic overlays. They are not filmed video or a 3D environment. Characters inside the renders do not move, though the foreground figures and overlays do.
- No audio or voice-over.
- Fonts load from Google Fonts. Offline, the system Arabic font is used as a fallback.
