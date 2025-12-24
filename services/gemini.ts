
import { GoogleGenAI, Type } from "@google/genai";
import { QuizResults } from "../types.ts";

export const generateRecommendation = async (results: QuizResults): Promise<string> => {
  // Inicialización en cada llamada para capturar el estado fresco de process.env.API_KEY
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      summary: {
        type: Type.STRING,
        description: "Análisis de 3-4 frases conectando el dolor del cliente con Aum Shala.",
      },
      traffic_lights: {
        type: Type.OBJECT,
        properties: {
          brand: { type: Type.STRING, description: "red, yellow o green (Estado Físico)" },
          web: { type: Type.STRING, description: "red, yellow o green (Mente)" },
          online: { type: Type.STRING, description: "red, yellow o green (Logística)" },
        },
        required: ["brand", "web", "online"],
      },
      swot: {
        type: Type.OBJECT,
        properties: {
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
          opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
          threats: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["strengths", "weaknesses", "opportunities", "threats"],
      },
      quick_wins: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "3 acciones concretas de valor inmediato.",
      },
      cta_message: {
        type: Type.STRING,
        description: "Mensaje motivador final para reservar.",
      },
      recommended_next_step: {
        type: Type.STRING,
        description: "El grupo/horario específico recomendado.",
      },
    },
    required: ["summary", "traffic_lights", "swot", "quick_wins", "cta_message", "recommended_next_step"],
  };

  const systemInstruction = `
Eres un Auditor Senior de Bienestar y Estratega de Ventas para Aum Shala Coruña (C/ Voluntariado, 3).
Tu objetivo es transformar los datos de un test en un informe persuasivo que convenza al usuario de reservar una clase de prueba.

Reglas Estratégicas:
1. Habla en SEGUNDA PERSONA (tú).
2. Tono: Elegante, directo, profesional y empático. Estilo 'Boutique Yoga'.
3. Conecta el estrés y los dolores físicos con la facilidad de venir al centro de Coruña después del trabajo.
4. Si el usuario tiene poca experiencia, enfatiza que los grupos son reducidos y cuidados.
5. El JSON debe ser la ÚNICA salida.
`;

  const userPrompt = `AUDITORÍA PARA: ${JSON.stringify(results)}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0, // Máxima estabilidad para evitar variaciones en Vercel
        thinkingConfig: { thinkingBudget: 0 } // Desactivado para reducir latencia y fallos de streaming
      }
    });

    const rawText = response.text;
    if (!rawText) throw new Error("Empty response from Gemini");

    // Extracción robusta de JSON usando Regex para ignorar markdown o basura de red
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON found in response:", rawText);
      throw new Error("Invalid format");
    }

    return jsonMatch[0];
  } catch (error) {
    console.error("Gemini Critical Error:", error);
    throw error;
  }
};
