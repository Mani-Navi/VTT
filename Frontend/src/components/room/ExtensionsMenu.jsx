import React, { useState, memo } from "react";
import { ListOrdered, X, SkipForward, Plus, Trash2, Send } from "lucide-react";
import { useCanvasStore } from "../../store/canvas.store";
import { useSceneStore } from "../../store/scene.store";
import { useAuthStore } from "../../store/auth.store";
import { usePermissions } from "../../hooks/usePermissions";
import { Button } from "../ui/Button";
import { wsService } from "../../services/websocket.service";

export const ExtensionsMenu = memo(() => {
  const isExtOpen = useCanvasStore((state) => state.isExtensionsMenuOpen);
  const toggleMenu = useCanvasStore((state) => state.toggleMenu);

  const initiatives = useSceneStore((state) => state.initiatives) || [];
  const roundNumber = useSceneStore((state) => state.roundNumber) || 1;
  const nextTurn = useSceneStore((state) => state.nextTurn);
  const addInitiativeItem = useSceneStore((state) => state.addInitiativeItem);
  const removeInitiativeItem = useSceneStore((state) => state.removeInitiativeItem);

  const chatMessages = useSceneStore((state) => state.chatMessages) || [];
  const addChatMessage = useSceneStore((state) => state.addChatMessage);

  const user = useAuthStore((state) => state.user);
  const { isGM } = usePermissions();

  const [tab, setTab] = useState("initiative");
  const [newName, setNewName] = useState("");
  const [newScore, setNewScore] = useState(15);
  const [chatInput, setChatInput] = useState("");

  if (!isExtOpen) return null;

  const handleAddInitiative = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    addInitiativeItem({
      name: newName,
      score: Number(newScore) || 10,
    });
    setNewName("");
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const msg = {
      senderId: user?.id || "user-1",
      senderName: user?.username || "Player",
      senderColor: isGM ? "#f59e0b" : "#3b82f6",
      content: chatInput.trim(),
    };
    addChatMessage(msg);
    wsService.send("CHAT_MESSAGE", msg);
    setChatInput("");
  };

  return (
      <div
          className="fixed top-16 left-6 z-40 w-96 max-w-[95vw] bg-zinc-900/95 border border-zinc-800 rounded-2xl shadow-2xl backdrop-blur-xl p-4 text-zinc-100 font-fa flex flex-col max-h-[85vh]"
          dir="rtl"
      >
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <ListOrdered className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold">نوبت مبارزه و چت</h4>
              <p className="text-[11px] text-zinc-400">ترتیب راندها و پیام‌ها</p>
            </div>
          </div>
          <button
              type="button"
              onClick={() => toggleMenu("extensions")}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800 my-3">
          <button
              type="button"
              onClick={() => setTab("initiative")}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  tab === "initiative" ? "bg-amber-500 text-zinc-950 font-bold" : "text-zinc-400"
              }`}
          >
            نوبت مبارزه (#{roundNumber})
          </button>
          <button
              type="button"
              onClick={() => setTab("chat")}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  tab === "chat" ? "bg-amber-500 text-zinc-950 font-bold" : "text-zinc-400"
              }`}
          >
            چت و لاگ
          </button>
        </div>

        {tab === "initiative" && (
            <div className="space-y-3 flex-1 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between p-2.5 bg-zinc-950 rounded-xl border border-zinc-800">
                <span className="text-xs text-zinc-400">راند مبارزه: #{roundNumber}</span>
                <Button size="sm" variant="amber" onClick={nextTurn} className="h-7 px-2.5 text-xs">
                  <SkipForward className="w-3.5 h-3.5 mr-1" /> نوبت بعد
                </Button>
              </div>

              <div className="space-y-1.5 flex-1 overflow-y-auto pr-1">
                {initiatives.map((item) => (
                    <div
                        key={item.id}
                        className={`flex items-center justify-between p-2.5 rounded-xl border ${
                            item.isCurrent
                                ? "bg-amber-500/15 border-amber-500/60"
                                : "bg-zinc-950/60 border-zinc-800"
                        }`}
                    >
                      <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-zinc-800 text-amber-400 flex items-center justify-center font-mono font-bold text-xs">
                    {item.score}
                  </span>
                        <span className="text-xs font-semibold text-zinc-100">{item.name}</span>
                      </div>
                      {isGM && (
                          <button
                              type="button"
                              onClick={() => removeInitiativeItem(item.id)}
                              className="p-1 text-zinc-500 hover:text-rose-400 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                      )}
                    </div>
                ))}
              </div>

              {isGM && (
                  <form onSubmit={handleAddInitiative} className="flex gap-2 pt-2 border-t border-zinc-800">
                    <input
                        type="text"
                        placeholder="نام شرکت‌کننده"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="flex-1 h-8 px-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-100"
                    />
                    <input
                        type="number"
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

        {tab === "chat" && (
            <div className="space-y-3 flex-1 overflow-hidden flex flex-col">
              <div className="space-y-2 flex-1 overflow-y-auto pr-1">
                {chatMessages.map((msg) => (
                    <div
                        key={msg.id}
                        className="p-2 rounded-xl bg-zinc-950/70 border border-zinc-800 text-xs"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-amber-400">{msg.senderName}</span>
                        <span className="text-[10px] text-zinc-500 font-mono">{msg.timestamp}</span>
                      </div>
                      <p className="text-zinc-200">{msg.content}</p>
                    </div>
                ))}
              </div>

              <form onSubmit={handleSendChat} className="flex gap-2 pt-2 border-t border-zinc-800">
                <input
                    type="text"
                    placeholder="ارسال پیام..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="flex-1 h-9 px-3 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-100"
                />
                <Button type="submit" size="sm" variant="amber" className="h-9 px-3">
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </form>
            </div>
        )}
      </div>
  );
});

ExtensionsMenu.displayName = "ExtensionsMenu";