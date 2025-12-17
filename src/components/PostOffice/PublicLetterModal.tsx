import React, { useRef, useEffect } from 'react';
import { ArrowRight, Disc, X, ChevronDown } from 'lucide-react';
import { PUBLIC_MESSAGE } from '../../constants/messages';

interface PublicLetterModalProps {
  onClose: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export const PublicLetterModal: React.FC<PublicLetterModalProps> = ({
  onClose,
  onMouseEnter,
  onMouseLeave
}) => {
  const contentRef = useRef<HTMLDivElement>(null);

  // 배경 스크롤 방지 (데스크탑만)
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (!isMobile) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const scrollToContent = () => {
    contentRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    // Outer Overlay: 
    // 모바일: snap-y snap-mandatory (스크롤 스냅 적용), bg-black (완전 몰입)
    // 데스크탑: 일반 오버레이, 중앙 정렬
    <div className="fixed inset-0 z-[150] bg-black md:bg-black/90 md:backdrop-blur-md animate-fade-in overflow-y-auto md:overflow-hidden snap-y snap-mandatory scroll-smooth">
      <div className="min-h-full w-full flex items-start md:items-center justify-center p-0 md:p-4">
        
        {/* 모바일용 닫기 버튼 (항상 최상단 고정) */}
        <button 
          onClick={onClose}
          className="fixed top-6 right-6 text-white md:hidden p-3 z-[160] bg-black/30 backdrop-blur-md rounded-full border border-white/10 active:scale-95 transition-transform"
        >
          <X size={24} />
        </button>

        {/* Booklet Container 
          - 모바일: 카드 스타일 제거 (bg-transparent, shadow-none), w-full
          - 데스크탑: 기존 책(Booklet) 스타일 유지
        */}
        <div className="relative w-full max-w-5xl bg-transparent md:bg-[#F0F0F0] text-[#111] shadow-none md:shadow-2xl flex flex-col md:flex-row rounded-none md:rounded-sm overflow-visible md:overflow-hidden md:max-h-[90vh] transition-all duration-500">
          
          {/* === SECTION 1: HERO / TITLE === 
            모바일: h-[100dvh] (전체화면), snap-start (스냅 지점)
          */}
          <div className="w-full md:w-1/2 bg-[#050505] text-[#E0E0E0] p-8 md:p-12 flex flex-col justify-between relative shrink-0 border-b md:border-b-0 md:border-r border-gray-800 h-[100dvh] md:h-auto md:min-h-[500px] snap-start">
            <div className="absolute inset-0 bg-noise opacity-20 pointer-events-none"></div>
            
            {/* Decorative Circle */}
            <div className="absolute -right-16 -top-16 md:-right-24 md:-top-24 w-56 h-56 md:w-64 md:h-64 border border-white/10 rounded-full animate-spin-slow pointer-events-none"></div>

            <div className="relative z-10 flex flex-col justify-center flex-1">
              <div className="flex items-center gap-2 mb-6 md:mb-4 text-xs font-mono text-gray-500 animate-fade-in-up">
                <Disc size={14} className="md:w-3.5 md:h-3.5" />
                <span>LINER NOTES</span>
              </div>
              
              <h2 className="text-5xl sm:text-6xl md:text-6xl font-serif font-bold leading-tight italic tracking-tight mb-4 md:mb-0 animate-fade-in-up delay-100">
                TRUST<br/>THE<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A5F2F3] to-[#FF00FF]">
                  UNCERTAINTY
                </span>.
              </h2>
              
              <p className="mt-6 text-sm font-mono text-gray-400 border-l border-gray-700 pl-4 py-1 max-w-[80%] animate-fade-in-up delay-200">
                "Thanks to all the dips and cracks.<br className="hidden md:block"/>
                They made me who I am."
              </p>
            </div>

            {/* Mobile Scroll Indicator (Only visible on mobile) */}
            <div 
              onClick={scrollToContent}
              className="relative z-10 flex md:hidden flex-col items-center justify-center gap-2 pb-12 cursor-pointer animate-pulse"
            >
              <span className="text-[10px] tracking-[0.2em] font-mono text-gray-500 uppercase">Scroll Down</span>
              <ChevronDown className="text-white/50 w-6 h-6" />
            </div>
          </div>

          {/* === SECTION 2: CONTENT / LETTER === 
            모바일: min-h-[100dvh] (전체화면 이상), snap-start (스냅 지점)
          */}
          <div ref={contentRef} className="w-full md:w-1/2 bg-[#F5F5F0] flex flex-col relative min-h-[100dvh] md:min-h-0 md:h-full md:overflow-hidden snap-start">
            {/* Paper Texture Overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0" 
                 style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulance type='fractalNoise' baseFrequency='1.5' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}>
            </div>

            {/* Content Area */}
            <div className="flex-1 md:overflow-y-auto custom-scrollbar p-8 pt-24 md:p-12 z-10 flex flex-col justify-center md:block">
              <div className="font-mono text-xs text-gray-500 mb-8 tracking-widest uppercase border-b border-gray-300 pb-2">
                Foreword by {PUBLIC_MESSAGE.from}
              </div>
              
              <p className="text-lg md:text-lg leading-loose font-serif text-[#111] whitespace-pre-line text-justify pb-8 md:pb-0">
                {PUBLIC_MESSAGE.content}
              </p>
            </div>

            {/* Footer / Action Area */}
            <div className="p-8 pt-0 md:p-12 md:pt-6 border-t border-gray-200 md:border-none z-20 bg-[#F5F5F0] md:bg-transparent shrink-0 pb-16 md:pb-12">
               <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0 md:border-t md:border-gray-300 md:pt-6">
                  <span className="font-mono text-[10px] text-gray-400 hidden md:block">PAGE 01 / 01</span>
                  
                  <button
                    onClick={onClose}
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}
                    className="group w-full md:w-auto flex items-center justify-center gap-2 px-6 py-4 md:py-3 bg-[#111] text-white font-mono text-xs hover:bg-[#000] transition-all rounded md:rounded-none shadow-lg md:shadow-none active:scale-95 md:active:scale-100"
                  >
                    <span>VIEW TRACKLIST</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
               </div>
            </div>
          </div>

          {/* Center Spine Shadow (Desktop Only) */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-12 -translate-x-1/2 bg-gradient-to-r from-black/10 via-transparent to-black/10 pointer-events-none mix-blend-multiply"></div>
        </div>
      </div>
    </div>
  );
};