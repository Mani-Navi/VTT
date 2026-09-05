import React from "react";
import { useVoice } from "../../hooks/useVoice";
import VoiceParticipant from "./VoiceParticipant";

export default function VoicePanel({ roomId }) {
    const {
        participants,
        isTalking,
        isConnected,
        isConnecting,
        error,
        speakingMap,
        startTalking,
        stopTalking,
    } = useVoice(roomId);

    return (
        <div
            dir="rtl"
            className="flex flex-col w-52 bg-[#0c0e14]/95 backdrop-blur-md border border-zinc-800 rounded-xl shadow-2xl overflow-hidden font-sans select-none"
        >
            {/* هدر پنل صدا */}
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-zinc-800/80 bg-zinc-900/40">
                <div className="flex items-center gap-2">
          <span
              className={`w-2 h-2 rounded-full ${
                  isConnected
                      ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]"
                      : isConnecting
                          ? "bg-amber-500 animate-ping"
                          : "bg-zinc-600"
              }`}
          />
                    <span className="text-xs font-bold text-zinc-200 tracking-wide">
            {isConnecting ? "در حال اتصال..." : isConnected ? "چت صوتی فعال" : "صدا قطع"}
          </span>
                </div>
                <span className="text-[10px] text-zinc-500 font-mono">
          {participants.length} نفر
        </span>
            </div>

            {/* نمایش خطا در صورت بروز */}
            {error && (
                <div className="mx-2 mt-2 p-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
                    <p className="text-[11px] text-rose-400 text-center leading-tight">{error}</p>
                </div>
            )}

            {/* لیست شرکت‌کنندگان در وویس */}
            <div className="flex-1 max-h-56 overflow-y-auto py-2 space-y-0.5 custom-scrollbar">
                {participants.length > 0 ? (
                    participants.map((p) => (
                        <VoiceParticipant
                            key={p.identity}
                            participant={p}
                            isSpeaking={Boolean(speakingMap[p.identity] || (p.isLocal && isTalking))}
                        />
                    ))
                ) : (
                    <div className="py-6 text-center text-xs text-zinc-500">
                        {isConnecting ? "در حال اتصال به کانال..." : "کاربری در کانال نیست"}
                    </div>
                )}
            </div>

            {/* دکمه Push to Talk */}
            {isConnected && (
                <div className="p-2.5 border-t border-zinc-800/80 bg-zinc-900/30">
                    <button
                        type="button"
                        onMouseDown={startTalking}
                        onMouseUp={stopTalking}
                        onTouchStart={startTalking}
                        onTouchEnd={stopTalking}
                        className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-all duration-100 flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                            isTalking
                                ? "bg-amber-400 text-zinc-950 scale-[0.98] shadow-[0_0_15px_rgba(245,158,11,0.5)] ring-2 ring-amber-300"
                                : "bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200 border border-zinc-700"
                        }`}
                    >
                        <span>{isTalking ? "🎙️" : "🔇"}</span>
                        <span>{isTalking ? "در حال صحبت..." : "نگه دار برای صحبت"}</span>
                    </button>
                    <div className="flex items-center justify-center gap-1 mt-1.5 text-[10px] text-zinc-500">
                        <span>یا کلید</span>
                        <kbd className="px-1 py-0.5 text-[9px] bg-zinc-800 border border-zinc-700 rounded text-zinc-300 font-mono">
                            Space
                        </kbd>
                        <span>را نگه دارید</span>
                    </div>
                </div>
            )}
        </div>
    );
}