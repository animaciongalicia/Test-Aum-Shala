
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden bg-[#fdfcf9]">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-40 pointer-events-none">
        <div className="absolute top-[-15%] right-[-10%] w-[30rem] h-[30rem] rounded-full bg-[#e8ede8] blur-[100px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-80 h-80 rounded-full bg-[#fdf2f2] blur-[80px]"></div>
      </div>

      <header className="mb-6 text-center">
        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-[0.4em] text-gray-400 mb-2 font-medium">Estudio de Yoga</span>
          <h1 className="text-4xl md:text-5xl font-serif text-[#3d4f3d] tracking-tight italic">Aum Shala</h1>
          <div className="w-10 h-px bg-[#d8e0d8] mt-4"></div>
        </div>
      </header>

      <main className="w-full max-w-xl bg-white/60 backdrop-blur-lg rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-white p-8 md:p-12 relative">
        {children}
      </main>

      <footer className="mt-10 text-gray-500 text-[11px] text-center flex flex-col gap-2 max-w-xs leading-relaxed">
        <p className="font-semibold text-gray-700">Aum Shala Coruña</p>
        <p>C/ Voluntariado, 3 – 1°izq – 15003 – A Coruña</p>
        <p className="flex justify-center gap-3">
          <span>info@aumshala.com</span>
          <span className="text-gray-300">|</span>
          <span>+34 664 234 565</span>
        </p>
        <p className="mt-2 text-gray-400 italic">Tu espacio de calma en el centro de la ciudad.</p>
      </footer>
    </div>
  );
};
