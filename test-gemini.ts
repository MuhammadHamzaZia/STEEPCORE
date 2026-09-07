import { GoogleGenAI, Type } from "@google/genai";
import 'dotenv/config';

async function test() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const models = ["gemini-3.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash", "gemini-flash-latest", "gemini-pro-latest"];
  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: "Hello",
      });
      console.log(`${model} success:`, response.text?.substring(0, 20));
    } catch (e: any) {
      console.log(`${model} failed:`, e.message);
    }
  }
}
test();
