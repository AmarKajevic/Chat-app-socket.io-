// backend/services/GeminiService.js
import dotenv from 'dotenv';
dotenv.config();
// backend/services/GeminiService.js
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GOOGLE_API_KEY;
if (!apiKey) {
  console.error("❌ GOOGLE_API_KEY is missing in .env");
}

const client = new GoogleGenAI({ apiKey });

// Lista modela – probaće redom dok jedan ne proradi
const MODEL_CANDIDATES = [
    "gemini-3.1-flash-lite",
];

export const generateAIResponse = async (userMessage, history = []) => {
  // Formatiramo istoriju u oblik koji SDK očekuje
  const contents = history.map(msg => ({
    role: msg.role === 'model' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));
  // Dodajemo trenutnu poruku
  contents.push({
    role: 'user',
    parts: [{ text: userMessage }]
  });

  let lastError = null;

  // Probaj svaki model redom
  for (const modelName of MODEL_CANDIDATES) {
    try {
      const response = await client.models.generateContent({
        model: modelName,
        contents: contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        }
      });

      // Odgovor može biti u različitim formatima, ali obično je `text`
      const reply = response.text || 
                    response.candidates?.[0]?.content?.parts?.[0]?.text || 
                    "I'm sorry, I couldn't generate a response.";

      console.log(`✅ AI responded using model: ${modelName}`);
      return reply;
    } catch (error) {
      lastError = error;
      console.warn(`⚠️ Model ${modelName} failed:`, error.message);
      // Nastavi sa sledećim modelom
    }
  }

  // Ako svi modeli padnu
  console.error("❌ All models failed. Last error:", lastError);
  throw new Error("No working Gemini model found. Check your API key or try again later.");
};