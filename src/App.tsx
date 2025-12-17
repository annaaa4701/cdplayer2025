import { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { CursorVariant, MessageData } from './types';
import { audioCtx, bgmPlayer, playSound } from './utils/audio';
import { findMessage, addReply, markAsRead } from './utils/firebaseService';

import { CustomCursor } from './components/CustomCursor';
import { NoiseCanvas } from './components/NoiseCanvas';
import { GlitchText } from './components/GlitchText';
import { PixelDoor } from './components/PixelDoor';
import { StartScreen } from './components/StartScreen';
import { LoginModal } from './components/PostOffice/LoginModal';
import { PostOfficeModal } from './components/PostOffice/PostOfficeModal';
import { PublicLetterModal } from './components/PostOffice/PublicLetterModal';

import './styles/global.css';

export default function App() {
  // ======================
  // 🎵 Audio & UI State
  // ======================
  const [isMuted, setIsMuted] = useState(false);
  const [cursorVariant, setCursorVariant] = useState<CursorVariant>('default');

  // ======================
  // 🌟 UX Flow State
  // ======================
  const [started, setStarted] = useState(false);                      
  const [showPublicLetter, setShowPublicLetter] = useState(false);   
  const [showLogin, setShowLogin] = useState(false);                  
  const [loginError, setLoginError] = useState(false);
  const [targetDoorId, setTargetDoorId] = useState<number | null>(null);   
  const [openedDoorId, setOpenedDoorId] = useState<number | null>(null);   
  const [foundMessage, setFoundMessage] = useState<MessageData | null>(null); 
  const [showLetter, setShowLetter] = useState(false);

  // ======================
  // 🔥 Firebase State
  // ======================
  const [isLoadingMessage, setIsLoadingMessage] = useState(false);

  // ======================
  // 📬 Phase 1: 진입 
  // ======================
  const handleStart = () => {
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
    bgmPlayer.start();
    playSound('click');
    setStarted(true);
    
    // 부드러운 전환 후 앨범 속지(초대장) 표시
    setTimeout(() => {
      setShowPublicLetter(true);
      setCursorVariant('pointer');
    }, 1000);
  };

  // ======================
  // Phase 2 -> 3: 앨범 속지 닫고 트랙리스트(로비) 입장
  // ======================
  const handleEnterPostOffice = () => {
    playSound('click');
    setShowPublicLetter(false);
    setCursorVariant('default'); 
  };

  // ======================
  // 📬 Phase 4 -> 5: 로그인 (Firebase 연동)
  // ======================
  const handleLogin = async (name: string, pw: string) => {
    setIsLoadingMessage(true);
    
    try {
      // Firebase에서 메시지 찾기
      const msg = await findMessage(name, pw);
      
      if (msg) {
        setLoginError(false);
        setShowLogin(false);
        setFoundMessage(msg);
        setTargetDoorId(msg.doorId);
        playSound('success');

        // 읽음 상태 업데이트
        if (msg.firebaseId && !msg.isRead) {
          await markAsRead(msg.firebaseId);
        }

        setTimeout(() => {
          playSound('open');
          setOpenedDoorId(msg.doorId);
          
          setTimeout(() => {
            setShowLetter(true);
            setCursorVariant('default');
          }, 800);
        }, 1000);

      } else {
        playSound('error');
        setLoginError(true);
      }
    } catch (error) {
      playSound('error');
      setLoginError(true);
    } finally {
      setIsLoadingMessage(false);
    }
  };

  // ======================
  // 📮 답장 전송 (Firebase 연동)
  // ======================
  const handleReply = async (content: string) => {
    if (!foundMessage?.firebaseId) {
      return;
    }

    try {
      // Firebase에 답장 저장
      await addReply(foundMessage.firebaseId, content);
      playSound('success');
      
      setTimeout(() => {
        handleCloseAll();
      }, 2000);
    } catch (error) {
      alert('답장 전송에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleCloseAll = () => {
    setShowLetter(false);
    setOpenedDoorId(null);
    setTargetDoorId(null);
    setFoundMessage(null);
    setShowLogin(false);
    setCursorVariant('default');
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted) bgmPlayer.stop(); else bgmPlayer.start();
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#E0E0E0] font-sans overflow-hidden select-none cursor-none">
      
      {/* 🖱️ 커서 (추후 CD 아이콘 등으로 업데이트 가능) */}
      <CustomCursor variant={cursorVariant} />

      {/* 📺 노이즈 배경 (전역) */}
      <NoiseCanvas />
      
      {/* 📺 스캔라인 오버레이 (CRT 느낌) */}
      <div className="fixed inset-0 pointer-events-none z-[5] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_2px,3px_100%] bg-repeat opacity-20"></div>

      {!started && (
        <StartScreen 
          onStart={handleStart} 
          onMouseEnter={() => setCursorVariant('pointer')}
          onMouseLeave={() => setCursorVariant('default')}
        />
      )}

      {/* 💿 메인 트랙리스트 (구 우체국 로비) */}
      <div className={`relative z-10 container mx-auto px-4 py-8 min-h-screen flex flex-col transition-all duration-1000 ${started ? 'opacity-100' : 'opacity-0'} ${showPublicLetter ? 'blur-sm scale-95' : ''}`}>
        
        {/* 헤더 */}
        <header className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
          <div 
            onClick={() => setShowPublicLetter(true)}
            className="cursor-none group"
          >
            <p className="text-[10px] font-mono text-gray-500 mb-1 tracking-widest">NOW PLAYING</p>
            <GlitchText text="THE RESILIENCE MIX" className="text-xl md:text-3xl font-bold text-white font-serif italic" />
            <span className="text-[10px] text-gray-500 group-hover:text-white transition-colors block mt-1 opacity-0 group-hover:opacity-100 font-mono">
              ( View Liner Notes )
            </span>
          </div>
          <button 
            onClick={toggleMute} 
            className="p-3 hover:bg-white/10 rounded-full border border-white/10 transition-colors"
            onMouseEnter={() => setCursorVariant('pointer')}
            onMouseLeave={() => setCursorVariant('default')}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </header>

        {/* FIND MY TRACK 버튼 */}
        <div className="mb-8 text-center">
          <button 
            onClick={() => setShowLogin(true)}
            onMouseEnter={() => setCursorVariant('pointer')}
            onMouseLeave={() => setCursorVariant('default')}
            disabled={showPublicLetter}
            className="px-10 py-3 bg-white text-black font-bold text-sm tracking-widest hover:bg-gray-300 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed font-mono shadow-[4px_4px_0_rgba(255,255,255,0.2)]"
          >
            UNLOCK HIDDEN TRACK
          </button>
        </div>

        {/* 트랙리스트 그리드 (구 사서함) */}
        <div className="grid grid-cols-3 md:grid-cols-4 gap-4 p-6 bg-[#111] border border-white/10 relative shadow-2xl">
          {/* CD 케이스 힌지 장식 */}
          <div className="absolute left-0 top-0 bottom-0 w-3 bg-[#1a1a1a] border-r border-white/5 z-20"></div>
          <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/5 z-20"></div>

          {Array.from({ length: 24 }, (_, i) => i + 1).map((doorId) => (
            <PixelDoor 
              key={doorId} 
              id={doorId} 
              isTarget={targetDoorId === doorId}
              isOpen={openedDoorId === doorId}
              onClick={() => {
                if(!openedDoorId && !showPublicLetter) {
                    setShowLogin(true);
                    setCursorVariant('default');
                }
              }}
              onMouseEnter={() => {
                 if(!openedDoorId && !showPublicLetter) {
                     playSound('hover');
                     setCursorVariant('key');
                 }
              }}
              onMouseLeave={() => setCursorVariant('default')}
            />
          ))}
        </div>

        <footer className="mt-12 text-center py-4 text-gray-600 text-[10px] font-mono uppercase tracking-widest">
          <p>© 2026 Resilience Records. All Rights Reserved.</p>
        </footer>
      </div>

      {showPublicLetter && (
        <PublicLetterModal
          onClose={handleEnterPostOffice}
          onMouseEnter={() => setCursorVariant('pointer')}
          onMouseLeave={() => setCursorVariant('default')}
        />
      )}

      {showLogin && (
        <LoginModal 
          onClose={() => { setShowLogin(false); setLoginError(false); }}
          onSubmit={handleLogin}
          error={loginError}
          isLoading={isLoadingMessage}
          onMouseEnter={() => setCursorVariant('pointer')}
          onMouseLeave={() => setCursorVariant('default')}
        />
      )}

      {showLetter && foundMessage && (
        <PostOfficeModal 
          messageData={foundMessage}
          onClose={handleCloseAll}
          onReply={handleReply}
          onMouseEnter={() => setCursorVariant('pointer')}
          onMouseLeave={() => setCursorVariant('default')}
        />
      )}
    </div>
  );
}