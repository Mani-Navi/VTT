import React, { useState } from "react";
import {
  ListOrdered,
  X,
  Play,
  SkipForward,
  RotateCcw,
  Plus,
  Trash2,
  Heart,
  Shield,
  MessageSquare,
  FileText,
  Send,
} from "lucide-react";
import { useCanvasStore } from "../../store/canvas.store";
import { useSceneStore } from "../../store/scene.store";
import { useAuthStore } from "../../store/auth.store";
import { usePermissions } from "../../hooks/usePermissions";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Badge } from "../ui/Badge";
import { wsService } from "../../services/websocket.service";

export const ExtensionsMenu: React.FC = () => {
  const isExtOpen = useCanvasStore((state) => state.isExtensionsMenuOpen);
  const toggleMenu = useCanvasStore((state) => state.toggleMenu);

  const initiatives = useSceneStore((state) => state.initiatives);
  const roundNumber = useSceneStore((state) => state.roundNumber);
  const nextTurn = useSceneStore((state) => state.nextTurn);
  const previousTurn = useSceneStore((state) => state.previousTurn);
  const sortInitiatives = useSceneStore((state) => state.sortInitiatives);
  const addInitiativeItem = useSceneStore((state) => state.addInitiativeItem);
  const removeInitiativeItem = useSceneStore((state) => state.removeInitiativeItem);
  const resetInitiatives = useSceneStore((state) => state.resetInitiatives);

  const chatMessages = useSceneStore((state) => state.chatMessages);
  const addChatMessage = useSceneStore((state) => state.addChatMessage);

  const user = useAuthStore((state) => state.user);
  const { isGM } = usePermissions();

  const [tab, setTab] = useState<"initiative" | "chat" | "notes">("initiative");
  const [newName, setNewName] = useState("");
  const [newScore, setNewScore] = useState(15);
  const [chatInput, setChatInput] = useState("");
  const [gmNotes, setGmNotes] = useState(
    "یادداشت‌های محرمانه دانجن مستر:\n- تله سنگی در مختصات (700, 420) فعال است.\n- صندوقچه حاوی ۵۰ سکه طلا و معجون شفاست."
  );

  if (!isExtOpen) return null;

  const handleAddInitiative = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    addInitiativeItem({
      name: newName,
      score: Number(newScore) || 10,
      conditions: [],
    });
    setNewName("");
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const msg = {
      senderId: user?.id || "user-1",
      senderName: user?.displayName || "Player",
      senderColor: user?.role === "GM" ? "#3b82f6" : "#10b981",
      isGM: user?.role === "GM",
      content: chatInput.trim(),
    };
    addChatMessage(msg);
    wsService.send("CHAT_MESSAGE", msg);
    setChatInput("");
  };

  return (
    <div className="fixed top-16 left-6 z-40 w-96 max-w-[95vw] bg-zinc-900/95 border border-zinc-800 rounded-2xl shadow-2xl backdrop-blur-xl p-4 text-zinc-100 animate-in fade-in slide-in-from-top-2 duration-150 flex flex-col max-h-[85vh]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <ListOrdered className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold">ابزارها و افزونه‌های کمکی</h4>
            <p className="text-[11px] text-zinc-400 font-fa">ترتیب نوبت مبارزه، چت و یادداشت</p>
          </div>
        </div>
        <button
          onClick={() => toggleMenu("extensions")}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800 my-3">
        <button
          onClick={() => setTab("initiative")}
          className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
            tab === "initiative" ? "bg-amber-500 text-zinc-950 font-bold" : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          نوبت مبارزه (Initiative)
        </button>
        <button
          onClick={() => setTab("chat")}
          className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
            tab === "chat" ? "bg-amber-500 text-zinc-950 font-bold" : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          چت و پیام‌ها
        </button>
        {isGM && (
          <button
            onClick={() => setTab("notes")}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
              tab === "notes" ? "bg-amber-500 text-zinc-950 font-bold" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            یادداشت GM
          </button>
        )}
      </div>

      {/* Tab 1: Initiative Tracker */}
      {tab === "initiative" && (
        <div className="space-y-3 flex-1 overflow-hidden flex flex-col">
          {/* Round & Action Bar */}
          <div className="flex items-center justify-between p-2.5 bg-zinc-950 rounded-xl border border-zinc-850">
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400 font-fa">راند مبارزه:</span>
              <span className="text-sm font-bold font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                #{roundNumber}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <Button size="sm" variant="amber" onClick={nextTurn} className="h-7 px-2.5 text-xs">
                <SkipForward className="w-3.5 h-3.5 mr-1" />
                نوبت بعد
              </Button>
              {isGM && (
                <button
                  onClick={sortInitiatives}
                  className="px-2 py-1 text-xs bg-zinc-800 text-zinc-300 hover:bg-zinc-700 rounded-lg transition-colors"
                  title="مرتب‌سازی بر اساس امتیاز"
                >
                  مرتب‌سازی
                </button>
              )}
            </div>
          </div>

          {/* Initiative List */}
          <div className="space-y-1.5 flex-1 overflow-y-auto pr-1">
            {initiatives.map((item) => (
              <div
                key={item.id}
                className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                  item.isCurrent
                    ? "bg-amber-500/15 border-amber-500/60 ring-1 ring-amber-500/30"
                    : "bg-zinc-950/60 border-zinc-850"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                      item.isCurrent ? "bg-amber-500 text-zinc-950" : "bg-zinc-800 text-zinc-300"
                    }`}
                  >
                    {item.score}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-zinc-100 font-fa">{item.name}</span>
                      {item.isCurrent && (
                        <span className="text-[10px] text-amber-400 font-bold font-fa animate-pulse">
                          (نوبت فعلی)
                        </span>
                      )}
                    </div>
                    {item.hp !== undefined && (
                      <span className="text-[10px] text-emerald-400">
                        HP: {item.hp}/{item.maxHp}
                      </span>
                    )}
                  </div>
                </div>

                {isGM && (
                  <button
                    onClick={() => removeInitiativeItem(item.id)}
                    className="p-1 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add Combatant Form */}
          {isGM && (
            <form onSubmit={handleAddInitiative} className="flex gap-2 pt-2 border-t border-zinc-800">
              <input
                type="text"
                placeholder="نام شرکت‌کننده"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="flex-1 h-8 px-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-100 font-fa"
              />
              <input
                type="number"
                placeholder="تاس"
                value={newScore}
                onChange={(e) => setNewScore(Number(e.target.value))}
                className="w-14 h-8 px-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs font-mono text-center text-amber-400"
              />
              <Button type="submit" size="sm" variant="secondary" className="h-8 px-2.5 text-xs">
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </form>
          )}
        </div>
      )}

      {/* Tab 2: Live Chat & Rolls Log */}
      {tab === "chat" && (
        <div className="space-y-3 flex-1 overflow-hidden flex flex-col">
          <div className="space-y-2 flex-1 overflow-y-auto pr-1">
            {chatMessages.map((msg) => (
              <div key={msg.id} className="p-2 rounded-xl bg-zinc-950/70 border border-zinc-850 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold" style={{ color: msg.senderColor }}>
                    {msg.senderName}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono">{msg.timestamp}</span>
                </div>
                <p className="text-zinc-200 font-fa leading-relaxed">{msg.content}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendChat} className="flex gap-2 pt-2 border-t border-zinc-800">
            <input
              type="text"
              placeholder="ارسال پیام به میز بازی..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 h-9 px-3 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-100 font-fa"
            />
            <Button type="submit" size="sm" variant="amber" className="h-9 px-3">
              <Send className="w-3.5 h-3.5" />
            </Button>
          </form>
        </div>
      )}

      {/* Tab 3: GM Notes */}
      {tab === "notes" && isGM && (
        <div className="space-y-2 flex-1 flex flex-col">
          <textarea
            value={gmNotes}
            onChange={(e) => setGmNotes(e.target.value)}
            rows={8}
            className="w-full flex-1 p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 font-fa leading-relaxed focus:outline-none focus:border-amber-500 resize-none"
            placeholder="یادداشت‌های محرمانه بازی که فقط شما می‌بینید..."
          />
          <p className="text-[10px] text-zinc-500 font-fa">
            * این یادداشت‌ها فقط برای دانجن‌مستر قابل مشاهده است.
          </p>
        </div>
      )}
    </div>
  );
};
