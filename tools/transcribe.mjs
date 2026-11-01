// node transcribe.mjs <audio.wav>: Gemini transcript with phrase start times
import { readFileSync } from "node:fs";
const b64 = readFileSync(process.argv[2]).toString("base64");
const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent", {
  method: "POST",
  headers: { "content-type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY },
  body: JSON.stringify({ contents: [{ parts: [
    { inlineData: { mimeType: "audio/wav", data: b64 } },
    { text: "Transcribe this Russian voice-over exactly as spoken, one phrase per line, each line prefixed with its start time in seconds like [12.3]. Then, on a separate line, note any mispronounced words, especially the English names 'Claude Code' and 'My Energy'." },
  ] }] }),
});
const j = await res.json();
console.log(j.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") ?? JSON.stringify(j));
