
import { GoogleGenAI, Type } from "@google/genai";
import { QuizResults } from "../types.ts";

export const generateRecommendation = async (results: QuizResults): Promise<string> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("CONFIG_ERROR: La API_KEY no está configurada en Vercel.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      summary: {
        type: Type.STRING,
        description: "Análisis profundo de 4-5 frases sobre el estado del usuario.",
      },
      traffic_lights: {
        type: Type.OBJECT,
        properties: {
          brand: { type: Type.STRING, description: "red, yellow o green (Cuerpo)" },
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
        description: "5 acciones detalladas e inmediatas.",
      },
      cta_message: {
        type: Type.STRING,
        description: "Mensaje de cierre potente y personalizado.",
      },
      recommended_next_step: {
        type: Type.STRING,
        description: "Recomendación específica de clase/horario.",
      },
    },
    required: ["summary", "traffic_lights", "swot", "quick_wins", "cta_message", "recommended_next_step"],
  };

  const systemInstruction = `
Eres el Consultor Jefe de Bienestar de Aum Shala Coruña. 
Tu objetivo es realizar una AUDITORÍA DE BIENESTAR PREMIUM basada en las respuestas del usuario.
No des respuestas genéricas. Sé específico, elegante y persuasivo.

Directrices de contenido:
1. Conecta los dolores específicos (espalda, estrés) con la práctica de yoga.
2. Destaca que estamos en el centro de Coruña (C/ Voluntariado) para su conveniencia.
3. El tono debe ser el de un estudio boutique: exclusivo, calmado pero orientado a resultados.
4. Genera un plan de acción que parezca redactado por un experto humano.
5. El resultado DEBE ser un JSON puro.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `DATOS DEL TEST: ${JSON.stringify(results)}`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema,
        temperature: 0.2, // Un poco más de creatividad para el informe "pobre"
      }
    });

    const text = response.text || "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("FORMAT_ERROR: La respuesta no es un JSON válido.");
    
    return jsonMatch[0];
  } catch (error: any) {
    console.error("Gemini API Error:", error.message);
    throw error;
  }
};
