
import { GoogleGenAI, Type } from "@google/genai";
import { QuizResults } from "../types.ts";

export const generateRecommendation = async (results: QuizResults): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      summary: {
        type: Type.STRING,
        description: "Un resumen ejecutivo persuasivo de 3-4 frases que conecte los problemas del usuario con los beneficios de Aum Shala.",
      },
      traffic_lights: {
        type: Type.OBJECT,
        properties: {
          brand: { type: Type.STRING, description: "Semáforo para estado físico: red, yellow, green" },
          web: { type: Type.STRING, description: "Semáforo para equilibrio mental: red, yellow, green" },
          online: { type: Type.STRING, description: "Semáforo para hábitos/logística: red, yellow, green" },
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
        description: "3 acciones concretas y ultra-rápidas para mejorar su bienestar hoy mismo.",
      },
      cta_message: {
        type: Type.STRING,
        description: "Un mensaje directo y motivador invitando a la clase de prueba.",
      },
      recommended_next_step: {
        type: Type.STRING,
        description: "El grupo o frecuencia específica que mejor encaja con su perfil.",
      },
    },
    required: ["summary", "traffic_lights", "swot", "quick_wins", "cta_message", "recommended_next_step"],
  };

  const systemInstruction = `
Eres un Estratega Senior de Ventas y Bienestar para el estudio Aum Shala en Coruña.
Tu misión es transformar los datos de un test en un INFORME DE AUDITORÍA IRRESISTIBLE que convierta a un interesado en un cliente de pago.

Reglas de Oro:
1. Tono: Profesional, empático, directo y orientado a resultados (estilo Boutique Yoga).
2. Habla en SEGUNDA PERSONA (tú).
3. En el 'summary', destaca cómo Aum Shala (en C/ Voluntariado) es el 'tercer espacio' perfecto entre el trabajo y casa para Coruñeses con poco tiempo.
4. Usa los 'Quick Wins' para demostrar autoridad y valor inmediato.
5. El informe debe generar una sensación de: "Necesito empezar en Aum Shala ahora para no quemarme".
`;

  const userPrompt = `Analiza estos resultados y genera la auditoría de ventas para Aum Shala: ${JSON.stringify(results)}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.7,
      }
    });

    return response.text || "{}";
  } catch (error) {
    console.error("Error generating recommendation:", error);
    throw error;
  }
};
