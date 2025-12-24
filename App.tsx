
import React, { useState, useEffect, useCallback } from 'react';
import { Questionnaire, QuizResults } from './types.ts';
import { Layout } from './components/Layout.tsx';
import { StepRenderer } from './components/StepRenderer.tsx';
import { generateRecommendation } from './services/gemini.ts';

const questionnaireData: Questionnaire = {
  "id": "aum-shala-tarde-jueves",
  "title": "Test rápido – ¿Te encaja Aum Shala?",
  "subtitle": "En 3 minutos ves si tiene sentido que pruebes nuestros grupos de última hora o jueves por la mañana.",
  "steps": [
    {
      "id": "step-1-dolor-dia",
      "title": "Acabas el día fundida y tu cuerpo lo nota",
      "description": "Si trabajas o te mueves por el centro, seguramente terminas el día con la espalda, cuello o cabeza cargados. Vamos a ver si te encaja soltar todo eso en Aum Shala.",
      "fields": [
        {
          "name": "listo_empezar",
          "type": "singleChoice",
          "label": "¿Te reconoces en esta situación?",
          "required": true,
          "options": [
            { "value": "si", "label": "Sí, quiero ver si me encaja Aum Shala" },
            { "value": "no_seguro", "label": "No estoy segura, pero quiero mirar opciones" }
          ]
        }
      ],
      "ui": { "showBack": false, "showNext": true, "ctaLabel": "Empezar (3 min)" }
    },
    {
      "id": "step-2-dolor-practico",
      "title": "¿Cómo terminas tu día normalmente?",
      "description": "Elige lo que más se parezca a ti al salir del trabajo o de tus tareas.",
      "fields": [
        {
          "name": "dolor_principal",
          "type": "singleChoice",
          "label": "Lo que más pesa al final del día es...",
          "required": true,
          "options": [
            { "value": "cabeza", "label": "La cabeza: voy saturada y necesito desconectar." },
            { "value": "cuerpo", "label": "El cuerpo: espalda / cervicales / hombros reventados." },
            { "value": "ambos", "label": "Ambas cosas: cabeza y cuerpo a la vez." },
            { "value": "sin_rato", "label": "Siento que nunca tengo un rato para mí." }
          ]
        }
      ],
      "ui": { "showBack": true, "showNext": true, "ctaLabel": "Siguiente" }
    },
    {
      "id": "step-3-franjas-horarias",
      "title": "¿Cuándo podrías venir de verdad?",
      "description": "Piensa en algo realista, no ideal. Puedes marcar varias opciones.",
      "fields": [
        {
          "name": "franjas_posibles",
          "type": "multiChoice",
          "label": "Franjas que te podrían encajar",
          "required": true,
          "options": [
            { "value": "tarde_ultima_hora", "label": "Última hora: entre las 20:30 y las 22:00." },
            { "value": "jueves_manana", "label": "Jueves por la mañana (9:00–10:00)." },
            { "value": "otras_mananas", "label": "Otras mañanas entre semana." },
            { "value": "mediodia", "label": "Mediodía (13:00–16:00)." },
            { "value": "tarde_antes", "label": "Tarde (18:00–20:00)." },
            { "value": "solo_una_vez", "label": "Ahora mismo solo podría una vez a la semana." }
          ]
        }
      ],
      "ui": { "showBack": true, "showNext": true, "ctaLabel": "Siguiente" }
    },
    {
      "id": "step-4-compromiso",
      "title": "¿Qué estás dispuesta a probar de verdad?",
      "description": "Esto nos ayuda a ver qué tipo de prueba tiene más sentido para ti.",
      "fields": [
        {
          "name": "nivel_compromiso",
          "type": "singleChoice",
          "label": "Compromiso inicial",
          "required": true,
          "options": [
            { "value": "probar_1_clase", "label": "Probar 1 clase y decidir." },
            { "value": "probar_2_3_semanas", "label": "Probar 2–3 semanas y ver cómo me sienta." },
            { "value": "minimo_2_meses", "label": "Si me encaja, comprometerme mínimo 2 meses." },
            { "value": "curioseando", "label": "Ahora mismo solo estoy curioseando." }
          ]
        }
      ],
      "ui": { "showBack": true, "showNext": true, "ctaLabel": "Siguiente" }
    },
    {
      "id": "step-5-experiencia",
      "title": "Tu relación con el yoga",
      "description": "Los grupos son multinivel. Es solo para saber desde dónde partes.",
      "fields": [
        {
          "name": "experiencia_yoga",
          "type": "singleChoice",
          "label": "¿Qué has hecho hasta ahora?",
          "required": true,
          "options": [
            { "value": "nunca", "label": "Nunca he hecho, pero lo necesito." },
            { "value": "alguna_clase", "label": "He probado alguna clase suelta." },
            { "value": "meses_de_practica", "label": "He ido durante meses, pero lo dejé." },
            { "value": "otro_estudio", "label": "Estoy en otro estudio actualmente." },
            { "value": "online_casa", "label": "Hago yoga en casa, pero me falta guía." }
          ]
        }
      ],
      "ui": { "showBack": true, "showNext": true, "ctaLabel": "Siguiente" }
    },
    {
      "id": "step-6-frenos",
      "title": "¿Qué es lo que más te frena?",
      "description": "Marca lo que más se parezca a ti.",
      "fields": [
        {
          "name": "frenos_principales",
          "type": "multiChoice",
          "label": "Miedos o frenos",
          "required": false,
          "options": [
            { "value": "ritmo_grupo", "label": "Miedo a no seguir el ritmo." },
            { "value": "verguenza_cuerpo", "label": "Incomodidad con mi cuerpo o nivel." },
            { "value": "tiempos_trabajo_familia", "label": "Duda con la logística personal." },
            { "value": "no_cuidada_otros", "label": "He probado y no me sentí cuidada." },
            { "value": "compromiso_fijo", "label": "Me cuesta comprometerme a algo fijo." }
          ]
        }
      ],
      "ui": { "showBack": true, "showNext": true, "ctaLabel": "Siguiente" }
    },
    {
      "id": "step-7-cercania",
      "title": "¿Qué tan cerca estás de Aum Shala?",
      "description": "Estamos en C/ Voluntariado, 3 (zona centro).",
      "fields": [
        {
          "name": "cercania_estudio",
          "type": "singleChoice",
          "label": "Proximidad al centro",
          "required": true,
          "options": [
            { "value": "trabajo_cerca", "label": "Trabajo a menos de 10 min andando." },
            { "value": "vivo_cerca", "label": "Vivo a menos de 10–15 min andando." },
            { "value": "paso_a_veces", "label": "Paso por el centro a menudo." },
            { "value": "lejos", "label": "Tendría que venir aposta." }
          ]
        }
      ],
      "ui": { "showBack": true, "showNext": true, "ctaLabel": "Siguiente" }
    },
    {
      "id": "step-8-contacto",
      "title": "Te mandamos tu propuesta",
      "description": "Déjanos tus datos para enviarte la recomendación detallada y el bono de clase de prueba.",
      "fields": [
        { "name": "nombre", "type": "text", "label": "Nombre", "required": true },
        { "name": "email", "type": "email", "label": "Email", "required": true },
        { "name": "telefono", "type": "phone", "label": "WhatsApp", "required": false },
        { "name": "acepto_privacidad", "type": "checkbox", "label": "Acepto la política de privacidad.", "required": true }
      ],
      "ui": { "showBack": true, "showNext": true, "ctaLabel": "Ver mi propuesta" }
    },
    {
      "id": "step-9-resultado",
      "title": "Tu camino en Aum Shala",
      "description": "Aquí tienes lo que más se adapta a tus necesidades.",
      "fields": [],
      "ui": { "showBack": false, "showNext": false, "ctaLabel": "" }
    }
  ]
};

const App: React.FC = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [results, setResults] = useState<QuizResults>({});
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const currentStep = questionnaireData.steps[currentStepIndex];
  const progress = ((currentStepIndex) / (questionnaireData.steps.length - 1)) * 100;

  const handleNext = async () => {
    const currentFields = currentStep.fields;
    for (const field of currentFields) {
      if (field.required && !results[field.name]) {
        alert(`Por favor, completa: ${field.label}`);
        return;
      }
    }

    if (currentStepIndex === questionnaireData.steps.length - 2) {
      setIsLoading(true);
      setCurrentStepIndex(currentStepIndex + 1);
      try {
        const rec = await generateRecommendation(results);
        setRecommendation(rec);
      } catch (e) {
        setRecommendation("Gracias por tu confianza. Te enviaremos una propuesta personalizada a tu email pronto.");
      } finally {
        setIsLoading(false);
      }
    } else if (currentStepIndex < questionnaireData.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const resetQuiz = () => {
    setCurrentStepIndex(0);
    setResults({});
    setRecommendation(null);
  };

  const handleBack = () => {
    if (currentStepIndex > 0) setCurrentStepIndex(currentStepIndex - 1);
  };

  const updateResult = (name: string, value: any) => {
    setResults(prev => ({ ...prev, [name]: value }));
  };

  const renderFormattedText = (text: string | null) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-[#2d3b2d] bg-[#e8ede8]/40 px-1 rounded-md">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const isResultStep = currentStep.id === 'step-9-resultado';

  return (
    <Layout>
      {!isResultStep && (
        <div className="absolute top-0 left-0 w-full h-1 bg-gray-50">
          <div 
            className="h-full bg-[#4a5d4a] transition-all duration-700 ease-in-out" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}

      <div className="space-y-6">
        <div className="space-y-2">
          {isResultStep ? (
            <div className="flex items-center gap-3 mb-2 animate-fadeIn">
              <span className="bg-[#e8ede8] text-[#3d4f3d] text-[10px] uppercase font-bold px-3 py-1 rounded-full tracking-wider">Tu Propuesta</span>
            </div>
          ) : (
            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em]">
              Paso {currentStepIndex + 1} de {questionnaireData.steps.length - 1}
            </span>
          )}
          <h2 className="text-2xl md:text-3xl font-serif text-[#3d4f3d] leading-tight">
            {currentStep.title}
          </h2>
          <p className="text-gray-500 text-sm md:text-base leading-relaxed font-light">
            {currentStep.description}
          </p>
        </div>

        <div className="py-2 space-y-6">
          {isResultStep ? (
            <div className="bg-[#fcfbf7]/80 rounded-3xl p-6 md:p-8 min-h-[300px] relative">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-8">
                  <div className="relative flex items-center justify-center">
                    <div className="absolute w-24 h-24 bg-[#e8ede8] rounded-full animate-breathe"></div>
                    <div className="relative w-12 h-12 bg-[#4a5d4a]/20 rounded-full flex items-center justify-center">
                       <div className="w-4 h-4 bg-[#4a5d4a] rounded-full"></div>
                    </div>
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-[#3d4f3d] font-serif italic text-xl">Respira...</p>
                    <p className="text-gray-400 text-xs uppercase tracking-widest">Creando tu espacio de calma</p>
                  </div>
                </div>
              ) : (
                <div className="animate-fadeIn">
                  <div className="whitespace-pre-wrap text-[#3d4f3d] leading-relaxed italic text-lg md:text-xl font-serif mb-10">
                    {renderFormattedText(recommendation)}
                  </div>
                  
                  <div className="mt-10 pt-10 border-t border-[#e8ede8] space-y-8 text-center">
                    <div className="space-y-3">
                      <h4 className="text-[#3d4f3d] font-serif text-2xl italic">¿Damos el primer paso?</h4>
                      <p className="text-sm text-gray-500 max-w-sm mx-auto">
                        Te contactaremos para concretar tu clase de prueba. Si tienes cualquier duda, estamos aquí:
                      </p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50 space-y-3">
                      <p className="text-xs uppercase tracking-widest text-gray-400">Contacto Directo</p>
                      <p className="text-[#3d4f3d] font-medium">+34 664 234 565</p>
                      <p className="text-[#3d4f3d] font-medium underline">info@aumshala.com</p>
                      <p className="text-gray-400 text-[11px] pt-2">C/ Voluntariado, 3 – 1°izq – 15003 – A Coruña</p>
                    </div>

                    <button 
                      onClick={resetQuiz}
                      className="w-full bg-[#4a5d4a] text-white py-5 rounded-2xl font-semibold shadow-lg shadow-[#4a5d4a]/20 hover:bg-[#3d4f3d] transition-all active:scale-[0.98] text-sm uppercase tracking-widest"
                    >
                      Realizar el test de nuevo
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            currentStep.fields.map(field => (
              <StepRenderer
                key={field.name}
                field={field}
                value={results[field.name]}
                onChange={(val) => updateResult(field.name, val)}
              />
            ))
          )}
        </div>

        {!isResultStep && (
          <div className="flex gap-4 pt-6">
            {currentStep.ui.showBack && (
              <button
                onClick={handleBack}
                className="flex-1 px-6 py-5 rounded-2xl border border-gray-200 text-gray-400 font-medium hover:bg-gray-50 transition-all flex items-center justify-center"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
              </button>
            )}
            {currentStep.ui.showNext && (
              <button
                onClick={handleNext}
                className="flex-[4] px-6 py-5 rounded-2xl bg-[#4a5d4a] text-white font-semibold shadow-xl shadow-[#4a5d4a]/10 hover:bg-[#3d4f3d] transition-all active:scale-[0.98] flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
              >
                {currentStep.ui.ctaLabel}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
              </button>
            )}
          </div>
        )}
      </div>

      {!isResultStep && currentStepIndex === 0 && (
        <div className="mt-10 flex items-center justify-center gap-8 text-gray-300">
           <span className="text-[9px] font-bold uppercase tracking-[0.3em]">Cercanía</span>
           <span className="text-gray-200">|</span>
           <span className="text-[9px] font-bold uppercase tracking-[0.3em]">Calma</span>
           <span className="text-gray-200">|</span>
           <span className="text-[9px] font-bold uppercase tracking-[0.3em]">Equilibrio</span>
        </div>
      )}
    </Layout>
  );
};

export default App;
