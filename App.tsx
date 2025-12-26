
import React, { useState, useEffect } from 'react';
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
      "title": "Acabas el día agotada y tu cuerpo lo nota",
      "description": "Si trabajas o te mueves por el centro, seguramente terminas el día con la espalda, cuello o cabeza cargados. Vamos a ver si te encaja soltar todo eso en nuestra sala de Yoga - Aum Shala.",
      "fields": [
        {
          "name": "listo_empezar",
          "type": "singleChoice",
          "label": "¿Te reconoces en esta situación?",
          "required": true,
          "options": [
            { "value": "si", "label": "Sí, quiero ver si me encaja en Yoga en Aum Shala" },
            { "value": "no_seguro", "label": "No lo sé, pero quiero mirar opciones de Yoga" }
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
      "title": "Auditoría de Bienestar",
      "description": "Análisis estratégico personalizado.",
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
  const [loadingStep, setLoadingStep] = useState(0);

  const currentStep = questionnaireData.steps[currentStepIndex];
  const progress = ((currentStepIndex) / (questionnaireData.steps.length - 1)) * 100;

  const loadingMessages = [
    "Conectando con tu ritmo...",
    "Analizando tensiones musculares...",
    "Evaluando disponibilidad de grupos...",
    "Personalizando tu plan de calma...",
    "Finalizando auditoría boutique..."
  ];

  // Efecto para animar los mensajes de carga
  useEffect(() => {
    let interval: any;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingStep(prev => (prev + 1) % loadingMessages.length);
      }, 800);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

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
      
      const startTime = Date.now();
      
      try {
        const rawResponse = await generateRecommendation(results);
        const parsedReport = JSON.parse(rawResponse);
        
        const elapsedTime = Date.now() - startTime;
        const minimumWait = 3500; // Aseguramos que la carga se vea en Vercel
        const delay = Math.max(0, minimumWait - elapsedTime);
        
        setTimeout(() => {
          setReport(parsedReport);
          setIsLoading(false);
        }, delay);

      } catch (e: any) {
        console.error("Error crítico:", e);
        setTimeout(() => {
          setReport({ 
            summary: "Error de conexión con la IA. Es posible que la API_KEY no esté configurada correctamente en el entorno de Vercel.",
            cta_message: "Por favor, contacta directamente con Aum Shala por WhatsApp para resolver tu duda manualmente.",
            quick_wins: ["Verifica tu conexión", "Escríbenos un WhatsApp", "Vuelve a intentarlo en unos minutos"],
            traffic_lights: { brand: 'red', web: 'red', online: 'red' },
            recommended_next_step: "Contactar soporte técnico o vía WhatsApp."
          });
          setIsLoading(false);
        }, 1500);
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
        <div className="absolute top-0 left-0 w-full h-1 bg-gray-50/50">
          <div 
            className="h-full bg-[#4a5d4a] transition-all duration-1000 ease-in-out" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}

      <div className="space-y-6">
        <div className="space-y-2">
          {isResultStep ? (
            <div className="flex items-center gap-3 mb-2 animate-fadeIn">
              <span className="bg-[#e8ede8] text-[#3d4f3d] text-[10px] uppercase font-bold px-3 py-1 rounded-full tracking-[0.3em]">Aum Shala Auditoría</span>
            </div>
          ) : (
            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em]">
              Paso {currentStepIndex + 1} de {questionnaireData.steps.length - 1}
            </span>
          )}
          
          <h2 className={`text-2xl md:text-3xl font-serif text-[#3d4f3d] leading-tight transition-all duration-700 ${isLoading ? 'text-center opacity-50' : ''}`}>
            {isLoading ? "Un momento de calma..." : currentStep.title}
          </h2>
          
          {!isLoading && (
            <p className="text-gray-500 text-sm md:text-base leading-relaxed font-light animate-fadeIn">
              {currentStep.description}
            </p>
          )}
        </div>

        <div className="py-2 space-y-6">
          {isResultStep ? (
            <div className="min-h-[500px] flex flex-col justify-center">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-10 animate-fadeIn">
                  <div className="relative flex items-center justify-center">
                    <div className="absolute w-36 h-36 bg-[#e8ede8] rounded-full animate-breathe"></div>
                    <div className="absolute w-24 h-24 bg-[#4a5d4a]/5 rounded-full animate-breathe" style={{ animationDelay: '1.5s' }}></div>
                    <div className="relative w-16 h-16 bg-[#4a5d4a]/10 rounded-full flex items-center justify-center border border-[#4a5d4a]/20 backdrop-blur-sm">
                       <div className="w-5 h-5 bg-[#4a5d4a] rounded-full shadow-lg shadow-[#4a5d4a]/40"></div>
                    </div>
                  </div>
                  <div className="text-center space-y-4 max-w-xs mx-auto">
                    <p className="text-[#3d4f3d] font-serif italic text-2xl transition-all duration-500">{loadingMessages[loadingStep]}</p>
                    <p className="text-gray-400 text-[10px] uppercase tracking-[0.4em] font-bold mt-4 opacity-60">Auditoría en curso</p>
                  </div>
                </div>
              ) : report && (
                <div className="animate-fadeIn space-y-12">
                   {/* Mensaje de la IA */}
                   <div className="text-center py-6 relative">
                     <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[50px] text-[#e8ede8] font-serif opacity-60 italic">“</span>
                     <p className="text-[#3d4f3d] font-serif italic text-xl md:text-2xl leading-relaxed px-6 relative z-10">
                       {report.summary}
                     </p>
                     <span className="absolute -bottom-14 left-1/2 -translate-x-1/2 text-[50px] text-[#e8ede8] font-serif opacity-60 italic rotate-180">“</span>
                   </div>

                   {/* Semáforos */}
                   {report.traffic_lights && (
                     <div className="grid grid-cols-3 gap-5 pt-10">
                       {[
                         { label: 'Cuerpo', light: report.traffic_lights.brand },
                         { label: 'Mente', light: report.traffic_lights.web },
                         { label: 'Rutina', light: report.traffic_lights.online }
                       ].map((item, idx) => (
                         <div key={idx} className="bg-white p-6 rounded-[2.5rem] border border-gray-50 text-center shadow-sm hover:shadow-lg transition-all duration-500">
                           <div className={`w-4 h-4 rounded-full mx-auto mb-4 shadow-inner ${item.light === 'green' ? 'bg-green-400' : item.light === 'yellow' ? 'bg-yellow-400' : 'bg-red-400'}`}></div>
                           <div className="text-[10px] uppercase tracking-[0.25em] text-gray-400 font-extrabold">{item.label}</div>
                         </div>
                       ))}
                     </div>
                   )}

                   {/* Plan de Acción */}
                   {report.quick_wins && (
                     <div className="bg-[#4a5d4a] text-white p-10 md:p-12 rounded-[3rem] space-y-8 shadow-2xl shadow-[#4a5d4a]/30 relative overflow-hidden group">
                       <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24 blur-3xl group-hover:bg-white/10 transition-colors duration-1000"></div>
                       <h3 className="text-2xl font-serif italic border-b border-white/15 pb-6 tracking-wide">Tu Estrategia de Calma:</h3>
                       <div className="space-y-6">
                          {report.quick_wins.map((win: string, i: number) => (
                            <div key={i} className="flex gap-5 items-start group/item">
                              <span className="bg-white text-[#4a5d4a] w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-1 font-bold shadow-xl shadow-black/10 transition-transform duration-300 group-hover/item:scale-110">{i+1}</span>
                              <p className="text-[14px] md:text-[15px] opacity-90 leading-relaxed font-light">{win}</p>
                            </div>
                          ))}
                       </div>
                     </div>
                   )}

                   {/* CTA Final */}
                   <div className="pt-10 text-center space-y-10 animate-fadeIn" style={{ animationDelay: '0.6s' }}>
                      <div className="space-y-5">
                        <p className="text-lg font-medium text-[#3d4f3d] leading-relaxed italic px-6">{report.cta_message}</p>
                        {report.recommended_next_step && (
                          <div className="inline-block px-10 py-4 bg-[#f3f7f3] rounded-full border border-[#e8ede8] shadow-sm">
                            <p className="text-[12px] text-[#4a5d4a] uppercase tracking-[0.3em] font-bold italic">
                              Recomendación: {report.recommended_next_step}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <button 
                        onClick={() => window.open('https://wa.me/34664234565', '_blank')}
                        className="w-full bg-[#4a5d4a] text-white py-7 rounded-[2rem] font-bold uppercase tracking-[0.4em] text-[13px] shadow-2xl shadow-[#4a5d4a]/40 hover:bg-[#3d4f3d] active:scale-[0.96] transition-all flex items-center justify-center gap-5 relative group"
                      >
                        <svg className="w-6 h-6 group-hover:scale-125 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.319 1.592 5.448 0 9.886-4.438 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.815-.981z"/></svg>
                        RESERVAR MI CLASE POR WHATSAPP
                      </button>
                      
                      <button 
                        onClick={() => window.location.reload()} 
                        className="text-[11px] text-gray-400 uppercase tracking-[0.4em] border-b border-gray-100 inline-block mx-auto py-3 font-bold hover:text-[#4a5d4a] hover:border-[#4a5d4a] transition-all duration-300"
                      >
                        Reiniciar Auditoría
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
          <div className="flex gap-4 pt-12">
            {currentStep.ui.showBack && (
              <button
                onClick={() => setCurrentStepIndex(currentStepIndex - 1)}
                className="flex-1 px-7 py-6 rounded-2xl border border-gray-200 text-gray-400 font-medium hover:bg-gray-50 transition-all flex items-center justify-center group"
              >
                <svg className="w-6 h-6 group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
              </button>
            )}
            {currentStep.ui.showNext && (
              <button
                onClick={handleNext}
                className="flex-[4] px-7 py-6 rounded-2xl bg-[#4a5d4a] text-white font-semibold shadow-xl shadow-[#4a5d4a]/15 hover:bg-[#3d4f3d] transition-all active:scale-[0.98] flex items-center justify-center gap-5 uppercase tracking-[0.3em] text-[12px] group"
              >
                {currentStep.ui.ctaLabel}
                <svg className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
              </button>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default App;
