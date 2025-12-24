
import { GoogleGenAI, Type } from "@google/genai";
import { QuizResults } from "../types";

export const generateRecommendation = async (results: QuizResults): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Como consultor experto en bienestar y yoga del estudio Aum Shala en A Coruña (C/ Voluntariado, 3 – 1°izq), 
    genera una propuesta personalizada para una posible alumna basándote en sus respuestas:
    
    Respuestas del test:
    ${JSON.stringify(results, null, 2)}
    
    Instrucciones críticas:
    1. Tono: Cálido, profesional, empático y muy directo.
    2. Información de valor: Menciona que tenemos **más de 15 años de experiencia** cuidando a personas en el centro.
    3. Resaltados: Usa negritas (formato **texto**) para resaltar conceptos como: **acogedor**, **cercano**, **experiencia**, **tu ritmo**, y **sin coche**.
    4. Estructura: 
       - Breve validación de su situación actual (cansancio, estrés, etc.).
       - Por qué Aum Shala: un espacio **acogedor**, un primero tranquilo donde te sentirás cuidada por nuestra **experiencia de más de 15 años**.
       - Recomendación específica de horario basada en su disponibilidad.
       - Cierre invitando a la clase de prueba.
    5. Idioma: Español.
    6. Formato: Texto limpio con párrafos. No incluyas títulos de sección.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.7,
        topP: 0.9,
      }
    });
    return response.text || "No se pudo generar una recomendación en este momento. ¡Pero te esperamos en Aum Shala!";
  } catch (error) {
    console.error("Error generating recommendation:", error);
    return "Gracias por completar el test. Analizaremos tu perfil y te contactaremos pronto con la mejor propuesta para ti.";
  }
};
