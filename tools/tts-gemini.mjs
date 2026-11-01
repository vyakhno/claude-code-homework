// node tts-gemini.mjs <text.txt> <out.wav> [voice]
import { readFileSync, writeFileSync } from "node:fs";
const [, , txtPath, outPath, voice = "Sulafat"] = process.argv;
const text = readFileSync(txtPath, "utf8");
const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent", {
  method: "POST",
  headers: { "content-type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY },
  body: JSON.stringify({
    contents: [{ parts: [{ text }] }],
    generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } } },
  }),
});
if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
const pcm = Buffer.from((await res.json()).candidates[0].content.parts[0].inlineData.data, "base64");
// Gemini returns 24 kHz mono 16-bit PCM; wrap it in a WAV header.
const h = Buffer.alloc(44);
h.write("RIFF", 0); h.writeUInt32LE(36 + pcm.length, 4); h.write("WAVE", 8); h.write("fmt ", 12);
h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22); h.writeUInt32LE(24000, 24);
h.writeUInt32LE(48000, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34); h.write("data", 36); h.writeUInt32LE(pcm.length, 40);
writeFileSync(outPath, Buffer.concat([h, pcm]));
console.log(`${outPath}: ${(pcm.length / 48000).toFixed(1)} s`);
