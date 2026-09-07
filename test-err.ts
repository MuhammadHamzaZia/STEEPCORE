import { GoogleGenAI } from "@google/genai";
import 'dotenv/config';

async function list() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
     await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: "Hello"
     });
     console.log("Success");
  } catch (err: any) {
     console.log("TYPE:", typeof err.message);
     console.log("MESSAGE:", err.message);
  }
}
list().catch(console.error);
