import React from "react";

export default function VoiceParticipant({ participant, isSpeaking }) {
    const name = participant?.name || "بازیکن";
    const initials = name.slice(0, 2).toUpperCase();

    return (
        <div
            dir="rtl"
            className={`flex items-center justify-between px-2.5 py-1.5 mx-1 rounded-lg transition-all duration-150 select-none ${
                isSpeaking
                    ? "bg-amber-500/10 border border-amber-500/30"
                    : "hover:bg-zinc-800/50 border border-transparent"
            }`}
        >
            <div className="flex items-center gap-2.5 min-w-0">
                {/* آواتار به همراه رینگ صوتی هنگام صحبت */}
                <div className="relative flex-shrink-0">
                    <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white bg-gradient-to-br from-zinc-700 to-zinc-900 border border-zinc-700 transition-all duration-150 ${
                            isSpeaking ? "ring-2 ring-amber-400 ring-offset-1 ring-offset-[#07080c]" : ""
                        }`}
                    >
                        {initials}
                    </div>

                    {/* آیکون قطع میکروفون */}
                    {participant.isMuted && !isSpeaking && (
                        <div className="absolute -bottom-1 -left-1 w-3.5 h-3.5 bg-zinc-900 border border-zinc-700 rounded-full flex items-center justify-center">
                            <span className="text-[8px] text-zinc-400">🔇</span>
                        </div>
                    )}
                </div>

                {/* نام کاربر */}
                <span
                    className={`text-xs font-medium truncate max-w-[95px] ${
                        isSpeaking ? "text-amber-400 font-semibold" : "text-zinc-300"
                    }`}
                >
          {name}
                    {participant.isLocal && (
                        <span className="text-[10px] text-zinc-500 mr-1">(شما)</span>
                    )}
        </span>
            </div>

            {/* انیمیشن ویو صوتی نئونی */}
            {isSpeaking && (
                <div className="flex items-center gap-[2px] flex-shrink-0">
                    <div className="w-[2.5px] h-3 bg-amber-400 rounded-full animate-pulse" />
                    <div className="w-[2.5px] h-4 bg-amber-400 rounded-full animate-bounce" />
                    <div className="w-[2.5px] h-2.5 bg-amber-400 rounded-full animate-pulse" />
                </div>
            )}
        </div>
    );
}