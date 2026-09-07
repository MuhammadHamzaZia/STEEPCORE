import { GoogleGenAI } from "@google/genai";
import 'dotenv/config';

async function list() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await ai.models.list();
  console.log(JSON.stringify(response, null, 2));
}
list().catch(console.error);
