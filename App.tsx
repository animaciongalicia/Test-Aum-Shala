
import React, { useState } from 'react';
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
      "title": "Propuesta Estratégica",
      "description": "Análisis de bienestar y plan de acción para Aum Shala.",
      "fields": [],
      "ui": { "showBack": false, "showNext": false, "ctaLabel": "" }
    }
  ]
};

const App: React.FC = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [results, setResults] = useState<QuizResults>({});
  const [report, setReport] = useState<any>(null);
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
        const rawResponse = await generateRecommendation(results);
        setReport(JSON.parse(rawResponse));
      } catch (e) {
        console.error("Error generating report", e);
        setReport({ 
          summary: "Parece que hay un retraso en la red. No te preocupes, hemos recibido tus respuestas.",
          cta_message: "Haz clic abajo para que revisemos tu caso personalmente y te reservemos tu plaza de prueba.",
          quick_wins: ["Respira profundo", "Mueve tus hombros", "Escríbenos por WhatsApp"],
          recommended_next_step: "Contactar por WhatsApp ahora mismo."
        });
      } finally {
        setIsLoading(false);
      }
    } else if (currentStepIndex < questionnaireData.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const updateResult = (name: string, value: any) => {
    setResults(prev => ({ ...prev, [name]: value }));
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
              <span className="bg-[#e8ede8] text-[#3d4f3d] text-[10px] uppercase font-bold px-3 py-1 rounded-full tracking-wider">Plan Personalizado</span>
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
            <div className="min-h-[400px]">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-8">
                  <div className="relative flex items-center justify-center">
                    <div className="absolute w-24 h-24 bg-[#e8ede8] rounded-full animate-breathe"></div>
                    <div className="relative w-12 h-12 bg-[#4a5d4a]/20 rounded-full flex items-center justify-center">
                       <div className="w-4 h-4 bg-[#4a5d4a] rounded-full"></div>
                    </div>
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-[#3d4f3d] font-serif italic text-xl">Preparando tu plan estratégico...</p>
                    <p className="text-gray-400 text-xs uppercase tracking-widest">Aum Shala Coruña</p>
                  </div>
                </div>
              ) : report && (
                <div className="animate-fadeIn space-y-8">
                   {/* Resumen Persuasivo */}
                   <div className="flex flex-col items-center justify-center py-2">
                     <p className="text-[#3d4f3d] font-serif italic text-lg leading-relaxed border-b border-[#e8ede8] pb-8 text-center max-w-md">
                       {report.summary}
                     </p>
                   </div>

                   {/* Indicadores Visuales */}
                   {report.traffic_lights && (
                     <div className="grid grid-cols-3 gap-3">
                       {[
                         { label: 'Cuerpo', light: report.traffic_lights.brand },
                         { label: 'Mente', light: report.traffic_lights.web },
                         { label: 'Rutina', light: report.traffic_lights.online }
                       ].map((item, idx) => (
                         <div key={idx} className="bg-white p-4 rounded-2xl border border-gray-100 text-center shadow-sm">
                           <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${item.light === 'green' ? 'bg-green-400' : item.light === 'yellow' ? 'bg-yellow-400' : 'bg-red-400'}`}></div>
                           <div className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">{item.label}</div>
                         </div>
                       ))}
                     </div>
                   )}

                   {/* DAFO Estratégico */}
                   {report.swot && (
                     <div className="space-y-4">
                       <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Análisis Estratégico</h3>
                       <div className="grid grid-cols-2 gap-3">
                         <div className="bg-green-50/40 p-4 rounded-2xl border border-green-100/30">
                           <span className="text-[9px] font-bold text-green-700 uppercase block mb-2">Potencial</span>
                           <ul className="text-[11px] text-green-900 space-y-1">
                             {report.swot.strengths?.slice(0, 2).map((s: string, i: number) => <li key={i}>• {s}</li>)}
                           </ul>
                         </div>
                         <div className="bg-red-50/40 p-4 rounded-2xl border border-red-100/30">
                           <span className="text-[9px] font-bold text-red-700 uppercase block mb-2">Riesgos</span>
                           <ul className="text-[11px] text-red-900 space-y-1">
                             {report.swot.weaknesses?.slice(0, 2).map((s: string, i: number) => <li key={i}>• {s}</li>)}
                           </ul>
                         </div>
                       </div>
                     </div>
                   )}

                   {/* Quick Wins */}
                   {report.quick_wins && (
                     <div className="bg-[#4a5d4a] text-white p-6 rounded-3xl space-y-4 shadow-xl shadow-[#4a5d4a]/10">
                       <h3 className="text-lg font-serif italic">Para empezar HOY:</h3>
                       <div className="space-y-3">
                          {report.quick_wins.map((win: string, i: number) => (
                            <div key={i} className="flex gap-3 items-start">
                              <span className="bg-white/20 w-5 h-5 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5 font-bold">{i+1}</span>
                              <p className="text-xs opacity-95">{win}</p>
                            </div>
                          ))}
                       </div>
                     </div>
                   )}

                   {/* CTA Final y Cierre */}
                   <div className="pt-6 text-center space-y-6">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-[#3d4f3d]">{report.cta_message}</p>
                        {report.recommended_next_step && (
                          <p className="text-[10px] text-[#4a5d4a] bg-[#e8ede8] inline-block px-4 py-1 rounded-full uppercase tracking-widest font-bold">
                            {report.recommended_next_step}
                          </p>
                        )}
                      </div>
                      <button 
                        onClick={() => window.open('https://wa.me/34664234565', '_blank')}
                        className="w-full bg-[#4a5d4a] text-white py-5 rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-[#4a5d4a]/20 hover:scale-[1.02] transition-transform flex items-center justify-center gap-3"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.319 1.592 5.448 0 9.886-4.438 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.815-.981z"/></svg>
                        RESERVAR MI SESIÓN DE PRUEBA
                      </button>
                      <button onClick={() => window.location.reload()} className="text-[9px] text-gray-400 uppercase tracking-widest underline decoration-gray-200">Volver a empezar</button>
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
                onClick={() => setCurrentStepIndex(currentStepIndex - 1)}
                className="flex-1 px-6 py-5 rounded-2xl border border-gray-200 text-gray-400 font-medium hover:bg-gray-50 transition-all flex items-center justify-center"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
              </button>
            )}
            {currentStep.ui.showNext && (
              <button
                onClick={handleNext}
                className="flex-[4] px-6 py-5 rounded-2xl bg-[#4a5d4a] text-white font-semibold shadow-xl shadow-[#4a5d4a]/10 hover:bg-[#3d4f3d] transition-all active:scale-[0.98] flex items-center justify-center gap-3 uppercase tracking-widest text-[10px]"
              >
                {currentStep.ui.ctaLabel}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
              </button>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default App;
