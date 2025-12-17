import React, { useState, useEffect } from 'react';
import { X, Mic, Square, Play, Save, Disc, Activity } from 'lucide-react';
import { MessageData } from '../../types';

interface PostOfficeModalProps {
  messageData: MessageData;
  onClose: () => void;
  onReply: (content: string) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  setCursor?: (variant: 'default' | 'quill' | 'stamp' | 'pointer') => void;
}

export const PostOfficeModal: React.FC<PostOfficeModalProps> = ({
  messageData,
  onClose,
  onReply
}) => {
  // 이미 답장이 있으면 해당 내용을 초기값으로 설정
  const [replyContent, setReplyContent] = useState(messageData.reply || '');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [hasExistingReply] = useState(!!messageData.reply);

  // 녹음(전송) 시뮬레이션
  const handleRecord = () => {
    if (!replyContent.trim()) {
      alert("Please enter a message before recording.");
      return;
    }
    
    setIsRecording(true);
    let progress = 0;
    
    const interval = setInterval(() => {
      progress += 2;
      setRecordingProgress(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        setIsRecording(false);
        setIsCompleted(true);
        setTimeout(() => {
          onReply(replyContent);
        }, 1500);
      }
    }, 50);
  };

  // 배경 스크롤 방지
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-hidden">
      
      {/* 닫기 버튼 */}
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors z-50"
      >
        <X size={24} />
      </button>

      {/* Main Container: Split View (CD Player + DAW) */}
      <div className="flex flex-col md:flex-row items-center gap-8 w-full max-w-6xl h-[85vh]">
        
        {/* LEFT: Spinning CD Player (Visualizer) */}
        <div className="hidden md:flex flex-col items-center justify-center w-1/3 h-full animate-fade-in-up">
          <div className="relative w-[300px] h-[300px] group">
             <div className="absolute inset-0 bg-[#A5F2F3] rounded-full blur-[60px] opacity-10 group-hover:opacity-20 transition-opacity"></div>
             
             <div className="relative w-full h-full rounded-full border border-white/10 bg-black shadow-2xl animate-spin-slow flex items-center justify-center">
                <div className="absolute inset-0 rounded-full cd-hologram opacity-40 mix-blend-color-dodge"></div>
                <div className="w-[120px] h-[120px] bg-[#111] rounded-full border border-white/20 flex flex-col items-center justify-center text-center p-2 z-10">
                   <p className="text-[8px] font-mono text-gray-500 mb-1">NOW PLAYING</p>
                   <p className="text-[10px] font-serif font-bold text-white leading-tight">{messageData.from}'s<br/>VOICE LETTER</p>
                </div>
             </div>
             
             <div className="absolute -top-10 -right-10 w-32 h-32 border-l border-b border-white/20 rounded-bl-full pointer-events-none"></div>
          </div>
          
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
               <Activity size={12} className="text-[#A5F2F3] animate-pulse" />
               <span className="text-[10px] font-mono text-[#A5F2F3]">AUDIO VISUALIZER ACTIVE</span>
            </div>
          </div>
        </div>

        {/* RIGHT: DAW Interface */}
        <div className="flex-1 w-full h-full bg-[#111] border border-white/10 rounded-lg shadow-2xl flex flex-col overflow-hidden animate-slide-up relative">
          
          {/* DAW Header */}
          <div className="h-10 bg-[#1a1a1a] border-b border-white/10 flex items-center justify-between px-4 select-none">
            <div className="flex items-center gap-2">
               <div className="flex gap-1.5">
                 <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                 <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                 <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
               </div>
               <span className="ml-3 text-xs font-mono text-gray-400">Resilience_Studio_v2.0.26 - {messageData.from}.proj</span>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-mono text-gray-500">
               <span>CPU: 12%</span>
               <span>MEM: 2048MB</span>
            </div>
          </div>

          {/* Toolbar */}
          <div className="h-12 bg-[#0a0a0a] border-b border-white/5 flex items-center px-4 gap-4">
             <div className="flex gap-1">
                <button 
                  className="p-2 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors"
                  title="Stop"
                  disabled={!isRecording}
                >
                  <Square size={14} fill="currentColor" />
                </button>
                <button 
                  className="p-2 hover:bg-white/10 rounded text-[#A5F2F3] transition-colors"
                  title="Play"
                >
                  <Play size={14} fill="currentColor" />
                </button>
                <button 
                  onClick={handleRecord}
                  disabled={isRecording || isCompleted || !replyContent.trim()}
                  className={`p-2 rounded flex items-center gap-2 transition-all ${
                    isRecording 
                      ? 'bg-red-500/20 text-red-500 animate-pulse' 
                      : !replyContent.trim() || isCompleted
                      ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                      : 'hover:bg-red-500/10 text-red-500 hover:text-red-400'
                  }`}
                  title="Record and Send"
                >
                  <div className={`w-3 h-3 rounded-full bg-current ${isRecording ? 'animate-ping' : ''}`}></div>
                  <span className="text-xs font-mono font-bold">REC</span>
                </button>
             </div>
             <div className="w-[1px] h-6 bg-white/10"></div>
             <div className="text-xs font-mono text-[#A5F2F3]">
                {isRecording ? `00:00:0${Math.floor(recordingProgress/20)}` : "00:00:00"}
             </div>
             
             <div className="flex-1 h-8 bg-[#050505] rounded border border-white/5 relative overflow-hidden flex items-center px-2">
                <div className="absolute inset-0 w-full h-full opacity-20" style={{ backgroundImage: 'linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '20px 100%' }}></div>
                <div className="h-full w-[2px] bg-red-500 absolute left-[30%] opacity-50"></div>
             </div>
          </div>

          {/* Main Workspace (Tracks) */}
          <div className="flex-1 bg-[#050505] p-1 overflow-y-auto custom-scrollbar relative">
             <div className="absolute inset-0 pointer-events-none opacity-10" style={{ backgroundImage: 'linear-gradient(#222 1px, transparent 1px)', backgroundSize: '100% 40px' }}></div>

             {/* TRACK 1: Sender's Letter */}
             <div className="mb-2 flex bg-[#111] border border-white/5 rounded h-[200px] md:h-[250px] relative group overflow-hidden">
                <div className="w-32 bg-[#1a1a1a] border-r border-white/5 flex flex-col p-3 gap-2 shrink-0 z-10">
                   <span className="text-[10px] font-mono text-gray-500">TRACK 01</span>
                   <div className="flex items-center gap-2">
                      <Mic size={14} className="text-[#A5F2F3]" />
                      <span className="text-xs font-bold text-white truncate">{messageData.from}</span>
                   </div>
                   <div className="mt-auto flex gap-1">
                      <div className="w-full h-1 bg-green-500/50 rounded-full"></div>
                      <div className="w-full h-1 bg-green-500/50 rounded-full"></div>
                   </div>
                </div>
                
                <div className="flex-1 p-6 relative overflow-y-auto custom-scrollbar">
                   <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none flex items-center">
                      {Array.from({ length: 50 }).map((_, i) => (
                        <div key={i} className="flex-1 mx-[1px] bg-white" style={{ height: `${Math.random() * 60 + 20}%` }}></div>
                      ))}
                   </div>
                   <p className="relative z-10 font-serif text-sm md:text-base leading-loose text-white/90 whitespace-pre-line">
                      "{messageData.content}"
                   </p>
                </div>
             </div>

             {/* TRACK 2: User's Reply */}
             <div className="flex bg-[#111] border border-white/5 rounded min-h-[180px] relative group">
                <div className="w-32 bg-[#1a1a1a] border-r border-white/5 flex flex-col p-3 gap-2 shrink-0">
                   <span className="text-[10px] font-mono text-gray-500">TRACK 02</span>
                   <div className="flex items-center gap-2">
                      <Disc size={14} className={hasExistingReply ? "text-green-500" : "text-red-500"} />
                      <span className="text-xs font-bold text-white">{hasExistingReply ? 'Reply_Saved' : 'Reply_Mix'}</span>
                   </div>
                   <div className={`mt-auto w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-ping' : hasExistingReply ? 'bg-green-500' : 'bg-gray-700'}`}></div>
                </div>

                <div className="flex-1 relative flex items-center justify-center bg-[#080808]">
                   
                   {!isRecording && !isCompleted && (
                      <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder={hasExistingReply ? "Edit your reply and record again..." : "Type your message here to record and send..."}
                        className="w-full h-full bg-transparent p-6 text-white font-serif text-sm md:text-base resize-none outline-none placeholder:text-gray-700 focus:bg-white/5 transition-colors leading-relaxed z-10"
                        spellCheck={false}
                        autoFocus
                      />
                   )}

                   {isRecording && (
                      <div className="w-full h-full flex items-center px-4 gap-[2px]">
                         {Array.from({ length: 60 }).map((_, i) => (
                            <div 
                              key={i} 
                              className="flex-1 bg-gradient-to-t from-red-900 to-red-500 rounded-sm transition-all duration-75"
                              style={{ 
                                height: i < (recordingProgress / 100 * 60) ? `${Math.random() * 80 + 10}%` : '2px',
                                opacity: i < (recordingProgress / 100 * 60) ? 1 : 0.2
                              }}
                            ></div>
                         ))}
                         <div 
                           className="absolute top-0 bottom-0 w-[2px] bg-red-500 shadow-[0_0_10px_red] z-20 transition-all duration-75 ease-linear"
                           style={{ left: `${recordingProgress}%` }}
                         ></div>
                      </div>
                   )}

                   {isCompleted && (
                      <div className="w-full h-full flex items-center justify-center flex-col gap-4 animate-fade-in">
                         <div className="w-full h-24 flex items-center px-4 gap-[2px] opacity-60">
                            {Array.from({ length: 60 }).map((_, i) => (
                               <div 
                                 key={i} 
                                 className="flex-1 bg-green-500 rounded-sm"
                                 style={{ height: `${Math.random() * 80 + 10}%` }}
                               ></div>
                            ))}
                         </div>
                         <div className="flex items-center gap-2 text-green-500 font-mono text-xs">
                            <Save size={14} />
                            <span>TRACK SAVED SUCCESSFULLY</span>
                         </div>
                      </div>
                   )}
                   
                   {!isRecording && !isCompleted && !replyContent && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                         <span className="font-mono text-4xl text-gray-500 font-bold uppercase tracking-widest">Empty Track</span>
                      </div>
                   )}
                </div>
             </div>

          </div>

          {/* Footer Status Bar */}
          <div className="h-6 bg-[#0a0a0a] border-t border-white/5 flex items-center justify-between px-2 text-[9px] font-mono text-gray-500">
             <span>SAMPLE RATE: 44100Hz</span>
             <span>LATENCY: 0ms</span>
          </div>

        </div>

      </div>
    </div>
  );
};
