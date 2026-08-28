import { GoogleGenerativeAI } from "@google/generative-ai";

const key = process.env.GEMINI_API_KEY;
if (!key || !String(key).trim()) {
  console.log(JSON.stringify({ result: "NOT_CONFIGURED" }));
  process.exit(0);
}

const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const pixel =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

try {
  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({ model: modelName });
  const result = await model.generateContent([
    "Reply with the single word ok",
    { inlineData: { data: pixel, mimeType: "image/png" } },
  ]);
  const text = result.response.text();
  console.log(
    JSON.stringify({
      result: "LIVE_GEMINI_VERIFIED",
      model: modelName,
      hasText: Boolean(text && text.trim()),
    }),
  );
} catch (err) {
  const message = String(err?.message || err).replace(/key[^\s]*/gi, "REDACTED");
  console.log(
    JSON.stringify({
      result: "NOT_VERIFIED",
      model: modelName,
      error: message.slice(0, 240),
    }),
  );
}
