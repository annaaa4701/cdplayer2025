import React from 'react';
import { Play } from 'lucide-react';

interface StartScreenProps {
  onStart: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ 
  onStart, 
  onMouseEnter, 
  onMouseLeave 
}) => {
  return (
    <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-[#050505] text-[#E0E0E0] overflow-hidden">
      
      {/* 📺 배경 노이즈 오버레이 (NoiseCanvas와 별도로 추가 질감) */}
      <div className="absolute inset-0 bg-noise opacity-30 pointer-events-none"></div>
      
      {/* 💿 중앙 회전하는 CD (The Main Object) */}
      <div className="relative group mb-8 md:mb-12 scale-75 md:scale-100 transition-transform duration-700 hover:scale-105">
        
        {/* CD 그림자/Glow */}
        <div className="absolute inset-0 rounded-full blur-3xl bg-white/5 animate-pulse"></div>

        {/* CD 본체 Container */}
        <div className="relative w-[300px] h-[300px] md:w-[450px] md:h-[450px] rounded-full flex items-center justify-center animate-spin-slow shadow-2xl border border-white/10 bg-black">
          
          {/* CD 표면 (홀로그램 + 메탈릭) */}
          <div className="absolute inset-0 rounded-full cd-hologram opacity-40 mix-blend-color-dodge"></div>
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none"></div>
          
          {/* CD 트랙 라인 (장식) */}
          <div className="absolute inset-[4px] rounded-full border border-white/5 opacity-50"></div>
          <div className="absolute inset-[50px] rounded-full border border-white/5 opacity-30"></div>
          <div className="absolute inset-[25%] rounded-full border border-white/10 opacity-40"></div>
          
          {/* CD 라벨 (Inner Circle) */}
          <div className="absolute w-[100px] h-[100px] md:w-[150px] md:h-[150px] bg-[#111] rounded-full border border-white/20 flex flex-col items-center justify-center z-10 shadow-lg">
             {/* 구멍 */}
             <div className="w-3 h-3 md:w-4 md:h-4 bg-[#050505] rounded-full border border-white/30 shadow-[inset_0_0_5px_rgba(255,255,255,0.5)] mb-3"></div>
             
             {/* 라벨 텍스트 */}
             <p className="text-[6px] md:text-[8px] font-mono text-gray-500 tracking-widest text-center leading-tight">
               THE<br/>RESILIENCE<br/>MIX
             </p>
             <p className="text-[5px] text-gray-600 mt-2 font-mono">2026 LP</p>
          </div>

          {/* CD 위의 타이포그래피 (회전함 - SVG textPath) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <svg viewBox="0 0 300 300" className="w-full h-full animate-spin-slow" style={{ animationDuration: '20s', animationDirection: 'reverse' }}>
               <defs>
                 <path id="curve" d="M 150, 150 m -120, 0 a 120, 120 0 1, 1 240, 0 a 120, 120 0 1, 1 -240, 0" fill="none" />
               </defs>
               <text className="text-[9px] font-bold fill-white/60 tracking-[0.2em] font-mono uppercase">
                 <textPath xlinkHref="#curve" startOffset="0%">
                   Trust the uncertainty • Thanks to all the dips and cracks • Resilience • 
                 </textPath>
               </text>
            </svg>
          </div>
        </div>

        {/* 🎧 재생 바늘 (Stylus) - 장식용 */}
        <div className="absolute -top-10 -right-20 w-48 h-48 border-l-2 border-b-2 border-white/10 rounded-bl-[60px] pointer-events-none opacity-40 z-0 hidden md:block"></div>
      </div>

      {/* 📝 메인 타이틀 영역 */}
      <div className="relative z-20 text-center space-y-4 mix-blend-screen px-4">
        
        <p className="text-[10px] md:text-xs font-mono text-gray-500 tracking-[0.5em] mb-2 uppercase">
          First Season's greeting
        </p>

        {/* Glitch Title */}
        <h1 className="text-5xl md:text-8xl font-serif font-black text-white tracking-tighter italic glitch-wrapper" data-text="RESILIENCE">
          RESILIENCE
        </h1>

        {/* Subtitle with lines */}
        <div className="flex items-center justify-center gap-4 mt-2">
           <span className="h-[1px] w-8 md:w-16 bg-gray-800"></span>
           <p className="text-[10px] md:text-xs font-sans text-gray-400 uppercase tracking-widest">
             Trust the uncertainty
           </p>
           <span className="h-[1px] w-8 md:w-16 bg-gray-800"></span>
        </div>
      </div>

      {/* ▶ 재생 버튼 (Enter) */}
      <div className="mt-12 md:mt-16 relative group z-30">
        <button 
          onClick={onStart}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          className="relative flex items-center gap-4 px-10 py-4 bg-white/5 border border-white/20 text-white hover:bg-white hover:text-black transition-all duration-300 backdrop-blur-sm group-hover:scale-105 overflow-hidden"
        >
          {/* Button Shine Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shine_1s_infinite]"></div>
          
          <Play size={18} fill="currentColor" className="group-hover:animate-pulse" />
          <span className="font-mono text-sm md:text-base font-bold tracking-widest uppercase">
            Play Disc
          </span>
        </button>
        
        {/* 버튼 밑 캡션 */}
        <p className="text-[9px] text-gray-600 text-center mt-4 font-mono tracking-widest group-hover:text-gray-400 transition-colors">
          INSERT COIN OR PRESS START
        </p>
      </div>

      {/* 푸터 정보 (L/R) */}
      <div className="absolute bottom-6 left-6 text-[9px] text-gray-700 font-mono text-left leading-relaxed hidden md:block">
        STEREO SOUND<br/>
        HIGH FIDELITY<br/>
        © 2026
      </div>

      <div className="absolute bottom-6 right-6 text-[9px] text-gray-700 font-mono text-right leading-relaxed hidden md:block">
        TOTAL TIME 365:24:60<br/>
        PRODUCED BY NAYEON
      </div>

    </div>
  );
};