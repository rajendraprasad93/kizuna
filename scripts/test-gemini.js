#!/usr/bin/env node
import dotenv from "dotenv";
dotenv.config();

import { GoogleGenerativeAI } from "@google/generative-ai";

async function testGemini() {
  console.log("🧪 Testing Gemini API...\n");

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("❌ GEMINI_API_KEY not found in .env");
    process.exit(1);
  }

  console.log("✓ API Key found (value not printed)\n");

  try {
    const genAI = new GoogleGenerativeAI(apiKey);

    // Try different models
    const models = [
      process.env.GEMINI_MODEL || "gemini-2.5-flash",
      "gemini-2.0-flash-exp",
      "gemini-2.0-flash",
      "gemini-1.5-pro",
    ];

    console.log("Testing available models:\n");

    for (const modelName of models) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });

        // Try a simple text generation first
        const testResult = await model.generateContent(
          'Say "working" in one word',
        );
        console.log(`✅ ${modelName}: WORKS`);
        console.log(`   Response: ${testResult.response.text().trim()}\n`);
        break; // Stop at first successful model
      } catch (err) {
        const errorMsg = err.message || String(err);
        if (errorMsg.includes("404")) {
          console.log(`⚠️  ${modelName}: NOT AVAILABLE (404)`);
        } else if (
          errorMsg.includes("permission") ||
          errorMsg.includes("unauthorized")
        ) {
          console.log(`❌ ${modelName}: PERMISSION DENIED`);
        } else {
          console.log(`❌ ${modelName}: ERROR - ${errorMsg.substring(0, 60)}`);
        }
      }
    }
  } catch (err) {
    console.error("❌ Test failed:", err.message);
    process.exit(1);
  }
}

testGemini();
