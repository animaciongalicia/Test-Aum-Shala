
import { GoogleGenAI, Type } from "@google/genai";
import { QuizResults } from "../types.ts";

export const generateRecommendation = async (results: QuizResults): Promise<string> => {
  // Inicialización dinámica para asegurar que la API_KEY se capture correctamente en el entorno de ejecución
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      summary: {
        type: Type.STRING,
        description: "Análisis persuasivo de 3-4 frases conectando el dolor del cliente con Aum Shala.",
      },
      traffic_lights: {
        type: Type.OBJECT,
        properties: {
          brand: { type: Type.STRING, description: "red, yellow o green" },
          web: { type: Type.STRING, description: "red, yellow o green" },
          online: { type: Type.STRING, description: "red, yellow o green" },
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
        description: "3 micro-acciones de valor inmediato.",
      },
      cta_message: {
        type: Type.STRING,
        description: "Gancho final para la reserva.",
      },
      recommended_next_step: {
        type: Type.STRING,
        description: "El grupo o frecuencia ideal.",
      },
    },
    required: ["summary", "traffic_lights", "swot", "quick_wins", "cta_message", "recommended_next_step"],
  };

  const systemInstruction = `
Eres un Auditor Senior de Bienestar y Estratega de Ventas para Aum Shala Coruña.
Tu objetivo es analizar los datos y crear un informe que convierta la duda del usuario en una reserva inmediata.

Estrategia de Ventas:
1. Conecta el cansancio físico (espalda, cervicales) con la ubicación premium en C/ Voluntariado (cerca de su trabajo/casa).
2. Usa un lenguaje que evoque calma pero urgencia por mejorar ("Tu cuerpo te está enviando señales").
3. Presenta a Aum Shala como el refugio exclusivo para gente ocupada en el centro de Coruña.
4. Habla siempre en segunda persona del singular (tú).
`;

  const userPrompt = `DATOS DEL TEST PARA AUDITORÍA: ${JSON.stringify(results)}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.1, // Menor temperatura = mayor estabilidad en el formato JSON
      }
    });

    if (!response.text) throw new Error("La IA no devolvió contenido");
    
    // Limpieza profunda del string por si el proxy de red añade basura
    let cleanText = response.text.trim();
    if (cleanText.startsWith("```json")) {
      cleanText = cleanText.replace(/^```json/, "").replace(/```$/, "").trim();
    }
    
    return cleanText;
  } catch (error) {
    console.error("Gemini API Error details:", error);
    throw error;
  }
};
