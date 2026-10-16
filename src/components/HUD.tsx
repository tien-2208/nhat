import React from 'react';
import { FloatingText } from '../types/game';
import { TARGET_SCORE } from '../game/constants';
import { Sparkles, Trophy, Volume2, VolumeX, Flame, HelpCircle } from 'lucide-react';
import { soundManager } from '../audio/soundEffects';

interface HUDProps {
  score: number;
  floatingTexts: FloatingText[];
  isMuted: boolean;
  onToggleMute: () => void;
  combo: number;
  onOpenGuide?: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  score,
  floatingTexts,
  isMuted,
  onToggleMute,
  combo,
  onOpenGuide,
}) => {
  const progressPercent = Math.min(100, Math.round((score / TARGET_SCORE) * 100));

  // Determine title tier based on score
  const getRankTitle = () => {
    if (score >= 1000) return '👑 NỮ HOÀNG SĂN TOP (HPBD!)';
    if (score >= 750) return '🔥 BÉ BOT QUYẾN RŨ';
    if (score >= 500) return '💅 BÉ BOT SÀNH ĐIỆU';
    if (score >= 250) return '✨ BÉ BOT ĐANG KHỞI ĐỘNG';
    return '🐷 CHÚ HEO TẬP SỰ';
  };

  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-20">
      {/* Top Bar HUD */}
      <div className="p-3 sm:p-5 flex items-start justify-between gap-3 max-w-7xl mx-auto w-full">
        {/* Left: Score Cluster */}
        <div className="bg-slate-900/80 backdrop-blur-md border border-pink-500/40 rounded-2xl p-2.5 sm:p-3.5 shadow-xl shadow-pink-950/30 flex items-center gap-2.5 sm:gap-3 pointer-events-auto">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-pink-600 to-rose-400 flex items-center justify-center text-white text-xl sm:text-2xl shadow-inner">
            🐷
          </div>
          <div>
            <div className="text-[10px] sm:text-[11px] font-bold text-pink-300 tracking-wider uppercase flex items-center gap-1">
              <Trophy className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-yellow-400" />
              Điểm Hiện Tại
            </div>
            <div className="text-2xl sm:text-4xl font-black text-white tabular-nums tracking-tight drop-shadow leading-none mt-0.5">
              {score}
              <span className="text-xs sm:text-base font-normal text-pink-300/80 ml-1">
                / {TARGET_SCORE}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Progress & Title Bar (Desktop/Tablet) */}
        <div className="flex-1 max-w-md mx-2 hidden sm:block pointer-events-auto">
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/60 rounded-2xl p-3 shadow-xl">
            <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
              <span className="text-pink-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                {getRankTitle()}
              </span>
              <span className="text-slate-300 tabular-nums font-bold">
                {progressPercent}%
              </span>
            </div>
            {/* Progress Track */}
            <div className="w-full bg-slate-800/90 h-3 rounded-full overflow-hidden p-0.5 border border-slate-700">
              <div
                className="h-full rounded-full bg-gradient-to-r from-pink-500 via-rose-400 to-amber-400 transition-all duration-300 ease-out shadow-sm"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-medium">
              <span>0</span>
              <span>250</span>
              <span>500</span>
              <span>750</span>
              <span className="text-amber-300 font-bold">1000 🎂</span>
            </div>
          </div>
        </div>

        {/* Right Action Cluster: Combo + Guide + Pause + Mute */}
        <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
          {combo > 1 && (
            <div className="bg-amber-500/90 text-slate-950 font-black px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs sm:text-sm flex items-center gap-1 shadow-lg animate-bounce">
              <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current text-red-600" />
              x{combo}
            </div>
          )}

          {onOpenGuide && (
            <button
              onClick={onOpenGuide}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-slate-900/80 border border-slate-700/80 hover:border-purple-400 text-purple-300 flex items-center justify-center transition shadow-lg active:scale-95"
              title="Xem điểm đồ vật"
            >
              <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}



          <button
            onClick={() => {
              onToggleMute();
              soundManager.isMuted = !isMuted;
            }}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-slate-900/80 border border-slate-700/80 hover:border-pink-500 text-white flex items-center justify-center transition shadow-lg active:scale-95"
            title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
            ) : (
              <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile-only compact progress bar */}
      <div className="sm:hidden px-4 -mt-1 pointer-events-auto">
        <div className="w-full bg-slate-900/80 rounded-full h-2 overflow-hidden border border-slate-700/80">
          <div
            className="h-full bg-gradient-to-r from-pink-500 to-amber-400 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Floating 3D/DOM Score reaction text popups */}
      {floatingTexts.map((ft) => (
        <div
          key={ft.id}
          className="absolute transform -translate-x-1/2 -translate-y-full pointer-events-none transition-all duration-700 ease-out animate-float-up font-black text-center"
          style={{
            left: `${ft.x * 100}%`,
            top: `${ft.y}%`,
          }}
        >
          <div
            className="px-3 py-1 rounded-full text-sm sm:text-base font-extrabold shadow-2xl backdrop-blur-sm border"
            style={{
              backgroundColor: ft.isPositive ? 'rgba(15, 23, 42, 0.88)' : 'rgba(45, 10, 15, 0.92)',
              borderColor: ft.color,
              color: ft.color,
            }}
          >
            {ft.text}
          </div>
        </div>
      ))}
    </div>
  );
};
