// Pre-records Rafiq's spoken lines with ElevenLabs.
// The API key is read from the ELEVENLABS_API_KEY environment variable and never shipped to the website.
// Usage:  node scripts/gen-voice.mjs            (only new or changed lines)
//         node scripts/gen-voice.mjs --force    (re-record everything)
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const lines = JSON.parse(readFileSync(join(root, 'src/data/voice-lines.json'), 'utf8'));
const outDir = join(root, 'public/voice');
const manifestPath = join(root, 'src/data/voice-manifest.json');
const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : {};
const force = process.argv.includes('--force');

const KEY = process.env.ELEVENLABS_API_KEY;
if (!KEY) {
  console.error('ELEVENLABS_API_KEY is not set.');
  process.exit(1);
}

// Rafiq's voices: a Saudi-Arabic voice for Arabic, a warm neutral voice for English.
const VOICE = { ar: 'U3VTDAOHUpJMtg7ja2IS', en: 'cjVigY5qzO86Huf0OWal' };
const MODEL = 'eleven_multilingual_v2';

mkdirSync(outDir, { recursive: true });

const jobs = [];
for (const [id, text] of Object.entries(lines)) {
  for (const lang of ['ar', 'en']) {
    const t = text[lang];
    const hash = createHash('sha1').update(`${VOICE[lang]}|${MODEL}|${t}`).digest('hex').slice(0, 10);
    const file = `${id}.${lang}.mp3`;
    if (!force && manifest[id]?.[lang] === hash && existsSync(join(outDir, file))) continue;
    jobs.push({ id, lang, t, hash, file });
  }
}
console.log(`${jobs.length} line(s) to record`);

async function record(j) {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE[j.lang]}?output_format=mp3_44100_64`, {
    method: 'POST',
    headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
    body: JSON.stringify({
      text: j.t,
      model_id: MODEL,
      voice_settings: { stability: 0.55, similarity_boost: 0.8, style: 0.15, use_speaker_boost: true },
    }),
  });
  if (!res.ok) throw new Error(`${j.file}: ${res.status} ${(await res.text()).slice(0, 200)}`);
  writeFileSync(join(outDir, j.file), Buffer.from(await res.arrayBuffer()));
  manifest[j.id] = { ...(manifest[j.id] || {}), [j.lang]: j.hash };
  console.log('ok', j.file);
}

const queue = [...jobs];
const workers = Array.from({ length: 3 }, async () => {
  while (queue.length) {
    const j = queue.shift();
    try {
      await record(j);
    } catch (e) {
      console.error('FAILED', e.message);
    }
  }
});
await Promise.all(workers);

// drop entries for lines that no longer exist
for (const id of Object.keys(manifest)) if (!lines[id]) delete manifest[id];
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
console.log('manifest written');
