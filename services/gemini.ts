
import { GoogleGenAI } from "@google/genai";
import { QuizResults } from "../types.ts";

export const generateRecommendation = async (results: QuizResults): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `
Eres un consultor senior especializado en bienestar y estilo de vida para el estudio Aum Shala en Coruña.
Tu objetivo es analizar los datos del test y generar un INFORME ESTRATÉGICO DE BIENESTAR que "venda" la necesidad de empezar yoga.

Habla SIEMPRE en ESPAÑOL, de forma directa, profesional y sin humo.

Debes responder ÚNICAMENTE en formato JSON con esta estructura EXACTA:
{
  "global_score": 0-100,
  "brand_score": 0-100, // Representa Estado Físico
  "web_score": 0-100,   // Representa Equilibrio Mental
  "online_score": 0-100, // Representa Hábitos/Logística
  "traffic_lights": {
    "brand": "red" | "yellow" | "green",
    "web": "red" | "yellow" | "green",
    "online": "red" | "yellow" | "green"
  },
  "summary": "Resumen ejecutivo de 3 frases sobre su estado actual y por qué Aum Shala es su solución.",
  "swot": {
    "strengths": ["Fortaleza 1", "Fortaleza 2"],
    "weaknesses": ["Debilidad 1", "Debilidad 2"],
    "opportunities": ["Oportunidad 1", "Oportunidad 2"],
    "threats": ["Amenaza 1", "Amenaza 2"]
  },
  "quick_wins": [
    "Acción rápida 1 (ej: estiramiento de 2 min)",
    "Acción rápida 2 (ej: reservar clase de prueba)",
    "Acción rápida 3"
  ],
  "cta_message": "Invitación directa a la sesión de prueba en Aum Shala.",
  "recommended_next_step": "El horario específico o grupo que mejor le encaja."
}
NO añadas texto fuera del JSON.
  `;

  const userPrompt = `Resultados del test de bienestar: ${JSON.stringify(results)}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.7,
      }
    });
    return response.text || "{}";
  } catch (error) {
    console.error("Error generating recommendation:", error);
    throw error;
  }
};
