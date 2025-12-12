import React, { useState, useEffect, useRef } from 'react';
import { X, Lock, Heart, Volume2, VolumeX } from 'lucide-react';

// --- TYPE DEFINITION FIX ---
// Fix for 'JSX.IntrinsicElements' interface does not exist error
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

/**
 * WINTER ARCADE LETTER
 * 80s Retro Style Interactive Message Board
 */

// --- 1. DATA & CONTENT ---
const STAGES = [
  { id: 1, keyword: '햇살', color: '#FFD700', message: "추운 겨울, 창가에 스며드는 햇살처럼\n너는 나에게 가장 따뜻한 존재야.\n올해도 곁에 있어줘서 고마워." },
  { id: 2, keyword: '슈톨렌', color: '#FF69B4', message: "기다림의 시간만큼 달콤해지는 슈톨렌처럼,\n우리의 시간도 갈수록 깊어지는 것 같아.\n메리 크리스마스!" },
  { id: 3, keyword: '첫눈', color: '#00FFFF', message: "첫눈이 올 때 가장 먼저 생각나는 사람.\n그게 바로 너라는 걸 알고 있니?\n하얀 세상만큼 깨끗한 네 마음을 사랑해." },
  { id: 4, keyword: '붕어빵', color: '#FFA500', message: "가슴 속에 3천원을 품고 다니는 계절.\n따끈한 붕어빵을 반으로 나눠 먹던\n그 소소한 행복이 그리워." },
  { id: 5, keyword: '목도리', color: '#FF4500', message: "찬바람이 불 때마다 너의 걱정이 앞서.\n내 마음이 너에게 포근한 목도리가 되어\n감기 걸리지 않게 지켜주길." },
  { id: 6, keyword: '코코아', color: '#8B4513', message: "달달한 코코아 한 잔의 여유.\n지친 하루 끝에 너에게\n그런 달콤한 휴식이 되고 싶어." },
  { id: 7, keyword: '장작불', color: '#FF0000', message: "타닥타닥 타오르는 장작불처럼\n내 안의 열정은 아직 식지 않았어.\n너와 함께라면 뭐든 할 수 있을 것 같아." },
  { id: 8, keyword: '북극성', color: '#E6E6FA', message: "길을 잃었을 때 바라보는 북극성.\n내가 흔들릴 때마다 중심을 잡아주는\n너에게 깊은 감사를 전해." },
  { id: 9, keyword: '오르골', color: '#9370DB', message: "태엽을 감으면 흘러나오는 멜로디.\n우리의 추억도 언제든 꺼내 들으면\n미소 짓게 만드는 음악 같아." },
  { id: 10, keyword: '새벽', color: '#4B0082', message: "모두가 잠든 고요한 새벽.\n너를 향한 그리움이\n소복이 쌓이는 시간이야." },
  { id: 11, keyword: '카세트', color: '#00FF00', message: "A면이 끝나면 B면으로 넘어가듯,\n우리의 다음 챕터도 기대돼.\n지지직거리는 잡음마저 추억이 될 거야." },
  { id: 12, keyword: '이글루', color: '#F0F8FF', message: "차가운 얼음으로 만들었지만\n그 안은 누구보다 따뜻하지.\n언제든 쉴 수 있는 너만의 피난처가 될게." },
];

// --- 2. AUDIO ENGINE (Web Audio API) ---
const audioCtx = typeof window !== 'undefined' ? new (window.AudioContext || (window as any).webkitAudioContext)() : null;

const playSound = (type: 'hover' | 'click' | 'success' | 'error') => {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  osc.connect(gain);
  gain.connect(audioCtx.destination);

  const now = audioCtx.currentTime;

  if (type === 'hover') {
    osc.type = 'square';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.05);
    gain.gain.setValueAtTime(0.02, now); // Lower volume for hover
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    osc.start(now);
    osc.stop(now + 0.05);
  } else if (type === 'click') {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.linearRampToValueAtTime(1200, now + 0.1);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.1);
    osc.start(now);
    osc.stop(now + 0.1);
  } else if (type === 'success') {
    osc.type = 'square';
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
        const t = now + i * 0.1;
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.type = 'square';
        o.frequency.value = freq;
        o.connect(g);
        g.connect(audioCtx.destination);
        g.gain.setValueAtTime(0.05, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
        o.start(t);
        o.stop(t + 0.1);
    });
  } else if (type === 'error') {
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, now);
    osc.frequency.linearRampToValueAtTime(50, now + 0.3);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.3);
    osc.start(now);
    osc.stop(now + 0.3);
  }
};

class BGMPlayer {
  isPlaying: boolean = false;
  tempo: number = 180;
  noteLength: number = 0.2;
  nextNoteTime: number = 0;
  timerID: number | null = null;
  sequenceIndex: number = 0;
  
  melody = [
    659, 659, 659, null, 659, 659, 659, null,
    659, 783, 523, 587, 659, null, null, null,
    698, 698, 698, 698, 698, 659, 659, 659,
    659, 587, 587, 659, 587, null, 783, null
  ];

  start() {
    if (this.isPlaying || !audioCtx) return;
    this.isPlaying = true;
    this.nextNoteTime = audioCtx.currentTime;
    this.scheduler();
  }

  stop() {
    this.isPlaying = false;
    if (this.timerID) window.clearTimeout(this.timerID);
  }

  scheduler() {
    if (!audioCtx) return;
    while (this.nextNoteTime < audioCtx.currentTime + 0.1) {
      this.playNote(this.nextNoteTime);
      this.nextNoteTime += (60 / this.tempo);
      this.sequenceIndex++;
      if (this.sequenceIndex === this.melody.length) this.sequenceIndex = 0;
    }
    this.timerID = window.setTimeout(() => this.scheduler(), 25);
  }

  playNote(time: number) {
    if (!audioCtx) return;
    const freq = this.melody[this.sequenceIndex];
    if (freq) {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      gain.gain.setValueAtTime(0.02, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + (60 / this.tempo) - 0.05);
      osc.start(time);
      osc.stop(time + (60 / this.tempo));
    }
  }
}

const bgmPlayer = new BGMPlayer();


// --- 3. SUB-COMPONENTS ---

// CUSTOM CURSOR COMPONENT
const CustomCursor = ({ variant }: { variant: 'default' | 'pointer' }) => {
  const [position, setPosition] = useState({ x: -100, y: -100 });

  useEffect(() => {
    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', updatePosition);
    return () => window.removeEventListener('mousemove', updatePosition);
  }, []);

  return (
    <div 
      className="fixed pointer-events-none z-[9999]"
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px`,
        transform: 'translate(-50%, -50%)',
        mixBlendMode: 'difference' // Ensure visibility on light/dark backgrounds
      }}
    >
      {variant === 'default' ? (
        // Pixel Snowflake Cursor (Updated to Blue/Cyan style)
        <svg width="32" height="32" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Central Cross */}
          <rect x="6" y="2" width="1" height="9" fill="#00FFFF"/>
          <rect x="2" y="6" width="9" height="1" fill="#00FFFF"/>
          {/* Diagonals */}
          <rect x="4" y="4" width="1" height="1" fill="#00BFFF"/>
          <rect x="8" y="4" width="1" height="1" fill="#00BFFF"/>
          <rect x="4" y="8" width="1" height="1" fill="#00BFFF"/>
          <rect x="8" y="8" width="1" height="1" fill="#00BFFF"/>
          {/* Tips */}
          <rect x="6" y="0" width="1" height="1" fill="#E0FFFF"/>
          <rect x="6" y="12" width="1" height="1" fill="#E0FFFF"/>
          <rect x="0" y="6" width="1" height="1" fill="#E0FFFF"/>
          <rect x="12" y="6" width="1" height="1" fill="#E0FFFF"/>
          {/* Inner details */}
          <rect x="5" y="5" width="3" height="3" fill="#00FFFF" fillOpacity="0.5"/>
        </svg>
      ) : (
        // Pixel Key Cursor
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-pulse">
           <path d="M12.5 2C15.5376 2 18 4.46243 18 7.5C18 10.5376 15.5376 13 12.5 13C11.1683 13 9.94726 12.5273 9 11.7383V16H11V18H9V20H11V22H7V10.1504C6.38605 9.42905 6 8.50813 6 7.5C6 4.46243 8.46243 2 12.5 2ZM12.5 4C10.567 4 9 5.567 9 7.5C9 9.433 10.567 11 12.5 11C14.433 11 16 9.433 16 7.5C16 5.567 14.433 4 12.5 4ZM14 6H12V9H14V6Z" fill="#FFFF00"/>
        </svg>
      )}
    </div>
  );
};

// RACING GAME CANVAS FOR INTRO
const RacingIntroCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Game state
    let frame = 0;
    const groundHeight = 100;
    const groundY = height - groundHeight;
    
    // Car
    const car = {
      x: width * 0.1, // Fixed horizontal position
      y: groundY - 40,
      width: 80,
      height: 30,
      color: '#FF0055', // Sports car red
      bounce: 0
    };

    // Obstacles
    let obstacles: { x: number, y: number, w: number, h: number, smashed: boolean }[] = [];
    
    // Particles (for smash effect)
    let particles: { x: number, y: number, vx: number, vy: number, life: number, color: string }[] = [];

    // Background Trees
    let trees: { x: number, h: number }[] = [];

    const spawnObstacle = () => {
       obstacles.push({
         x: width + 50,
         y: groundY - 40,
         w: 40,
         h: 40,
         smashed: false
       });
    };

    const spawnTree = () => {
      trees.push({
        x: width + 50,
        h: 40 + Math.random() * 60
      });
    };

    const createExplosion = (x: number, y: number, color: string) => {
      for(let i=0; i<10; i++) {
        particles.push({
          x: x,
          y: y,
          vx: (Math.random() - 0.5) * 10,
          vy: (Math.random() - 1) * 10,
          life: 30,
          color: color
        });
      }
    };

    const drawPixelCar = (x: number, y: number) => {
      // Body
      ctx.fillStyle = car.color;
      ctx.fillRect(x, y + 10, 80, 20); // Main body
      ctx.fillRect(x + 15, y, 45, 10); // Top
      
      // Window
      ctx.fillStyle = '#00FFFF';
      ctx.fillRect(x + 40, y + 2, 15, 8); 

      // Wheels
      ctx.fillStyle = '#000';
      if (Math.floor(frame / 5) % 2 === 0) {
        ctx.fillRect(x + 10, y + 25, 12, 12);
        ctx.fillRect(x + 55, y + 25, 12, 12);
      } else {
        ctx.fillRect(x + 10, y + 24, 12, 12);
        ctx.fillRect(x + 55, y + 24, 12, 12);
      }

      // Headlight
      ctx.fillStyle = '#FFFF00';
      ctx.fillRect(x + 75, y + 12, 5, 5);
      
      // Speed lines
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fillRect(x - 20, y + 5, 40, 2);
      ctx.fillRect(x - 40, y + 20, 30, 2);
    };

    const animate = () => {
      frame++;
      ctx.fillStyle = '#050510'; // Night sky
      ctx.fillRect(0, 0, width, height);

      // --- Draw Moon ---
      ctx.fillStyle = '#FEFCD7';
      ctx.beginPath();
      ctx.arc(width - 100, 100, 40, 0, Math.PI * 2);
      ctx.fill();

      // --- Draw Ground ---
      // Moving stripes effect
      const speed = 15;
      const offset = (frame * speed) % 40;
      
      ctx.fillStyle = '#FFFFFF'; // Snow
      ctx.fillRect(0, groundY, width, groundHeight);
      
      ctx.fillStyle = '#E0F0FF'; // Snow shadows/texture
      for (let i = -40; i < width; i += 40) {
        ctx.fillRect(i - offset, groundY, 10, groundHeight);
      }

      // --- Manage Trees (Background) ---
      if (frame % 30 === 0) spawnTree();
      for (let i = trees.length - 1; i >= 0; i--) {
        const t = trees[i];
        t.x -= speed * 0.5; // Parallax speed
        
        // Draw Tree (Simple Triangle)
        ctx.fillStyle = '#2d5a27'; // Dark green
        ctx.beginPath();
        ctx.moveTo(t.x, groundY);
        ctx.lineTo(t.x + 20, groundY - t.h);
        ctx.lineTo(t.x + 40, groundY);
        ctx.fill();

        if (t.x < -50) trees.splice(i, 1);
      }


      // --- Manage Obstacles ---
      if (frame % 120 === 0) spawnObstacle();

      for (let i = obstacles.length - 1; i >= 0; i--) {
        const obs = obstacles[i];
        obs.x -= speed;

        if (!obs.smashed) {
           // Draw Ice Block
           ctx.fillStyle = '#A5F2F3';
           ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
           ctx.strokeStyle = '#FFFFFF';
           ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);

           // Collision Check
           if (
             car.x < obs.x + obs.w &&
             car.x + car.width > obs.x &&
             car.y < obs.y + obs.h &&
             car.height + car.y > obs.y
           ) {
             obs.smashed = true;
             createExplosion(obs.x + obs.w/2, obs.y + obs.h/2, '#A5F2F3');
             // Screen Shake Effect logic could be triggered here via state if needed, keeping it simple in canvas
           }
        }

        if (obs.x < -100) obstacles.splice(i, 1);
      }

      // --- Manage Particles ---
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.5; // Gravity
        p.life--;
        
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, 4, 4);

        if (p.life <= 0) particles.splice(i, 1);
      }

      // --- Draw Car ---
      // Car bounce
      const bounceY = Math.sin(frame * 0.5) * 2;
      drawPixelCar(car.x, car.y + bounceY);

      requestAnimationFrame(animate);
    };

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', handleResize);
    animate();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full z-0" />;
};


// PIXEL DOOR COMPONENT
const PixelDoor = ({ stage, onClick, onMouseEnter, onMouseLeave }: any) => {
  // Determine door style variant based on ID (to create variety)
  const isWindowStyle = stage.id % 3 === 0;
  const isPanelStyle = stage.id % 3 !== 0;

  return (
    <div 
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="group relative cursor-none transform hover:-translate-y-1 transition-transform duration-200"
    >
      {/* Outer Door Frame (Dark) */}
      <div 
        className="w-full h-full bg-[#1a1a1a] p-1 md:p-2 relative shadow-lg"
        style={{ 
          boxShadow: `4px 4px 0px rgba(0,0,0,0.5), 0 0 10px ${stage.color}40`
        }}
      >
        {/* Inner Frame (Color Darkened) */}
        <div 
          className="w-full h-full p-1 md:p-2 flex flex-col relative"
          style={{ backgroundColor: stage.color, filter: 'brightness(0.7)' }}
        >
           {/* Door Surface (Main Color) */}
           <div className="flex-1 w-full relative border-2 border-black/20" 
                style={{ backgroundColor: stage.color, filter: 'brightness(0.9)' }}>
              
              {/* --- DOOR DESIGN VARIANTS --- */}
              
              {/* Style 1: Top Window */}
              {isWindowStyle && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-3/4 h-1/3 bg-[#87CEEB] border-4 border-black/30 shadow-inner overflow-hidden">
                   {/* Window Glint */}
                   <div className="absolute top-0 right-0 w-full h-full bg-white/20 -skew-x-12 translate-x-1/2"></div>
                </div>
              )}

              {/* Style 2: Panels */}
              {isPanelStyle && (
                 <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-2 p-3">
                    <div className="bg-black/10 border-r-2 border-b-2 border-white/10 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3)]"></div>
                    <div className="bg-black/10 border-r-2 border-b-2 border-white/10 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3)]"></div>
                    <div className="bg-black/10 border-r-2 border-b-2 border-white/10 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3)]"></div>
                    <div className="bg-black/10 border-r-2 border-b-2 border-white/10 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3)]"></div>
                 </div>
              )}

              {/* Doorknob (Gold Pixel) */}
              <div className="absolute top-1/2 right-2 w-3 h-3 md:w-4 md:h-4 bg-[#FFD700] border-b-2 border-r-2 border-[#B8860B] shadow-md group-hover:bg-[#FFFACD]"></div>

              {/* Hover Glitch Overlay for Door */}
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors pointer-events-none mix-blend-overlay"></div>
           </div>
        </div>

        {/* ID Badge on Top Frame */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-black px-2 py-1 border border-white/20 text-[10px] text-white font-bold">
           STAGE {String(stage.id).padStart(2, '0')}
        </div>
      </div>

      {/* Keyword Label Below Door */}
      <div className="mt-2 text-center">
        <span 
          className="text-xs md:text-sm px-2 py-0.5 bg-black/50 backdrop-blur-sm border border-white/10"
          style={{ color: stage.color, textShadow: '1px 1px 0 #000' }}
        >
          {stage.keyword}
        </span>
      </div>
    </div>
  );
};

const SnowCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const particles: {x: number, y: number, size: number, speed: number}[] = [];
    
    // Create pixels
    for(let i=0; i<150; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 4 + 2, // 8-bit chunky snow
        speed: Math.random() * 2 + 0.5
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#FFFFFF';
      
      particles.forEach(p => {
        p.y += p.speed;
        if(p.y > height) p.y = 0;
        
        // Draw square pixels for 8-bit feel
        ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
      });
      
      requestAnimationFrame(animate);
    };

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', handleResize);
    animate();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 opacity-50" />;
};

const GlitchText = ({ text, as: Component = 'h1', className = '' }: any) => {
  return (
    <Component className={`relative inline-block group ${className}`} data-text={text}>
      <span className="relative z-10">{text}</span>
      <span className="absolute top-0 left-0 -z-10 w-full h-full text-[#0ff] opacity-0 group-hover:opacity-70 animate-glitch-1 clip-rect-1 translate-x-[2px]">{text}</span>
      <span className="absolute top-0 left-0 -z-10 w-full h-full text-[#f0f] opacity-0 group-hover:opacity-70 animate-glitch-2 clip-rect-2 -translate-x-[2px]">{text}</span>
    </Component>
  );
};

// --- 4. MAIN APP COMPONENT ---

export default function App() {
  const [started, setStarted] = useState(false);
  const [selectedStage, setSelectedStage] = useState<number | null>(null);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [glitchMode, setGlitchMode] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [shake, setShake] = useState(false);
  
  // Custom Cursor State
  const [cursorVariant, setCursorVariant] = useState<'default' | 'pointer'>('default');

  // Initialize Audio Context on first interaction
  const handleStart = () => {
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    bgmPlayer.start();
    playSound('click');
    setStarted(true);
  };

  const handleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted) bgmPlayer.stop();
    else bgmPlayer.start();
  };

  const handleStageClick = (id: number) => {
    playSound('click');
    setSelectedStage(id);
    setPasswordInput('');
    setIsUnlocked(false);
    setIsPasswordOpen(true);
  };

  const handleClose = () => {
    playSound('click');
    setIsPasswordOpen(false);
    setSelectedStage(null);
  };

  const checkPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === '1234') {
      playSound('success');
      setIsUnlocked(true);
    } else {
      playSound('error');
      triggerGlitch();
    }
  };

  const triggerGlitch = () => {
    setGlitchMode(true);
    setShake(true);
    setTimeout(() => {
      setGlitchMode(false);
      setShake(false);
    }, 500);
  };

  const currentStage = STAGES.find(s => s.id === selectedStage);

  return (
    <div className={`min-h-screen bg-[#050510] text-white font-mono overflow-hidden select-none cursor-none ${glitchMode ? 'animate-glitch-screen' : ''}`}>
      
      {/* GLOBAL STYLES */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700;900&family=Gowun+Batang:wght@400;700&display=swap');
        
        body { 
          font-family: 'Press Start 2P', 'Noto Sans KR', cursive, sans-serif; 
          cursor: none !important; /* Force hide default cursor */
        }
        
        /* 한글 텍스트에 우아한 폰트 적용 */
        .korean-text {
          font-family: 'Gowun Batang', 'Noto Sans KR', serif;
        }

        /* Ensure all interactive elements show custom cursor logic via JS, not CSS cursor */
        a, button, input { cursor: none; }
        
        ::-webkit-scrollbar { width: 10px; }
        ::-webkit-scrollbar-track { bg: #000; }
        ::-webkit-scrollbar-thumb { bg: #444; border: 1px solid #fff; }

        .scanlines {
          background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.2));
          background-size: 100% 4px;
          animation: scroll 10s linear infinite;
        }

        @keyframes glitch-skew {
          0% { transform: skew(0deg); }
          20% { transform: skew(-2deg); }
          40% { transform: skew(2deg); }
          60% { transform: skew(-1deg); }
          80% { transform: skew(1deg); }
          100% { transform: skew(0deg); }
        }

        @keyframes shake {
          0% { transform: translate(1px, 1px) rotate(0deg); }
          10% { transform: translate(-1px, -2px) rotate(-1deg); }
          20% { transform: translate(-3px, 0px) rotate(1deg); }
          30% { transform: translate(3px, 2px) rotate(0deg); }
          40% { transform: translate(1px, -1px) rotate(1deg); }
          50% { transform: translate(-1px, 2px) rotate(-1deg); }
          60% { transform: translate(-3px, 1px) rotate(0deg); }
          70% { transform: translate(3px, 1px) rotate(-1deg); }
          80% { transform: translate(-1px, -1px) rotate(1deg); }
          90% { transform: translate(1px, 2px) rotate(0deg); }
          100% { transform: translate(1px, -2px) rotate(-1deg); }
        }
        .animate-shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
        
        @keyframes flicker {
          0% { opacity: 0.97; }
          5% { opacity: 0.95; }
          10% { opacity: 0.9; }
          15% { opacity: 0.95; }
          20% { opacity: 0.99; }
          100% { opacity: 0.9; }
        }
        .crt-flicker { animation: flicker 0.15s infinite; }
      `}</style>

      {/* CUSTOM CURSOR */}
      <CustomCursor variant={cursorVariant} />

      {/* BACKGROUND LAYERS */}
      {/* Only show SnowCanvas after starting, show RacingIntroCanvas before starting */}
      {started ? <SnowCanvas /> : <RacingIntroCanvas />}
      
      <div className="fixed inset-0 scanlines pointer-events-none z-40 opacity-30"></div>
      <div className="fixed inset-0 pointer-events-none z-50 shadow-[inset_0_0_100px_rgba(0,0,0,0.9)]"></div>

      {/* START SCREEN */}
      {!started && (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px]">
          <h1 className="text-4xl md:text-6xl text-center text-[#0ff] mb-8 animate-pulse shadow-[#0ff] drop-shadow-[4px_4px_0_rgba(0,0,0,1)]">
            WINTER<br/>ARCADE
          </h1>
          <button 
            onClick={handleStart}
            onMouseEnter={() => setCursorVariant('pointer')}
            onMouseLeave={() => setCursorVariant('default')}
            className="px-8 py-4 bg-black/80 border-4 border-white text-white hover:bg-white hover:text-black transition-colors text-xl animate-bounce backdrop-blur-sm"
          >
            INSERT COIN / START
          </button>
          <p className="mt-8 text-white/80 text-xs drop-shadow-md bg-black/50 px-2">CLICK TO START SOUND & EXPERIENCE</p>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div className={`relative z-10 container mx-auto px-4 py-8 min-h-screen flex flex-col ${started ? 'opacity-100' : 'opacity-0'} transition-opacity duration-1000`}>
        
        {/* HEADER */}
        <header className="flex justify-between items-center mb-12 border-b-4 border-white/20 pb-4">
          <div className="text-left">
            <h2 className="text-[#FF00FF] text-sm md:text-base mb-2">1P START</h2>
            <GlitchText text="STAGE SELECT" className="text-2xl md:text-4xl text-white drop-shadow-[2px_2px_0px_#FF00FF]" />
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="text-[#00FF00] text-xs">SCORE: <span className="text-white">999999</span></p>
              <p className="text-[#00FF00] text-xs">TIME: <span className="text-white">∞</span></p>
            </div>
            <button 
              onClick={handleMute}
              onMouseEnter={() => setCursorVariant('pointer')}
              onMouseLeave={() => setCursorVariant('default')}
              className="p-2 border-2 border-white hover:bg-white/20 transition-colors"
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
          </div>
        </header>

        {/* STAGE GRID */}
        <div className="flex-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12 pb-12 px-4">
          {STAGES.map((stage) => (
            <PixelDoor 
              key={stage.id} 
              stage={stage} 
              onClick={() => handleStageClick(stage.id)}
              onMouseEnter={() => {
                playSound('hover');
                setCursorVariant('pointer');
              }}
              onMouseLeave={() => setCursorVariant('default')}
            />
          ))}
        </div>

        {/* FOOTER */}
        <footer className="text-center text-xs text-gray-500 mt-auto crt-flicker pt-12">
          <p>© 198X WINTER MEMORIES. ALL RIGHTS RESERVED.</p>
          <p className="mt-2 text-[#FFFF00]">INSERT PASSWORD TO UNLOCK MEMORIES</p>
        </footer>
      </div>

      {/* MODAL OVERLAY */}
      {isPasswordOpen && currentStage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div 
            className={`w-full max-w-lg bg-black border-4 p-6 relative shadow-[0_0_50px_rgba(0,0,0,0.8)] ${shake ? 'animate-shake' : ''}`}
            style={{ borderColor: currentStage.color, boxShadow: `0 0 30px ${currentStage.color}40` }}
          >
            {/* Close Button */}
            <button 
              onClick={handleClose}
              onMouseEnter={() => setCursorVariant('pointer')}
              onMouseLeave={() => setCursorVariant('default')}
              className="absolute top-4 right-4 text-white hover:text-red-500 transition-colors"
            >
              <X size={24} />
            </button>

            {!isUnlocked ? (
              /* PASSWORD SCREEN */
              <div className="text-center py-8">
                <Lock className="mx-auto mb-4 animate-bounce" size={48} color={currentStage.color} />
                <h3 className="text-xl mb-6 text-[#0ff]">SECURITY CHECK</h3>
                <p className="text-xs text-gray-400 mb-8">ENTER PASSWORD FOR "{currentStage.keyword}"</p>
                
                <form onSubmit={checkPassword} className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <input 
                      type="text" 
                      maxLength={4}
                      value={passwordInput}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPasswordInput(e.target.value)}
                      placeholder="XXXX"
                      className="bg-black border-b-4 text-center text-3xl tracking-[1em] py-2 outline-none uppercase w-64 focus:border-white transition-colors cursor-none"
                      style={{ borderColor: currentStage.color, color: currentStage.color }}
                      autoFocus
                    />
                  </div>
                  <p className="text-[10px] text-gray-500 mt-2">* HINT: 1234 (Demo)</p>
                  
                  {glitchMode && (
                    <div className="text-red-500 text-sm mt-4 animate-pulse">
                      ACCESS DENIED // SYSTEM ERROR
                    </div>
                  )}
                  
                  <button 
                    type="submit"
                    onMouseEnter={() => setCursorVariant('pointer')}
                    onMouseLeave={() => setCursorVariant('default')}
                    className="mt-6 px-6 py-2 bg-white text-black hover:bg-gray-200 text-sm font-bold"
                  >
                    UNLOCK
                  </button>
                </form>
              </div>
            ) : (
              /* LETTER CONTENT */
              <div className="text-center py-4 animate-fade-in">
                <div className="mb-6 flex justify-center">
                  <Heart className="animate-pulse" size={48} color={currentStage.color} fill={currentStage.color} />
                </div>
                <h3 
                  className="text-2xl mb-8 underline decoration-wavy underline-offset-8"
                  style={{ textDecorationColor: currentStage.color }}
                >
                  DEAR. {currentStage.keyword}
                </h3>
                
                <div className="bg-[#111] p-6 border border-white/20 mb-8 transform -rotate-1">
                  <p className="text-base md:text-lg leading-relaxed whitespace-pre-line korean-text text-gray-100">
                    {currentStage.message}
                  </p>
                </div>

                <div className="flex justify-center gap-2 mb-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="w-2 h-2 bg-white animate-ping" style={{ animationDelay: `${i * 0.2}s` }}></div>
                  ))}
                </div>
                
                <p className="text-xs text-gray-500">MESSAGE DECODED SUCCESSFULLY</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}