import React, { useState } from "react";
import {
    Layers,
    Plus,
    Trash2,
    Image as ImageIcon,
    Check,
    X,
    ChevronDown,
} from "lucide-react";
import { useSceneStore } from "../../store/scene.store";
import { sceneApi } from "../../api/scene.api";
import { Button } from "../ui/Button";
import { cn } from "../../utils/cn";

export const SceneBar = ({ isGM = false, roomId = null }) => {
    const scenes = useSceneStore((state) => state.scenes);
    const currentScene = useSceneStore((state) => state.currentScene);
    const switchScene = useSceneStore((state) => state.switchScene);
    const loadScenes = useSceneStore((state) => state.loadScenes);

    const [isCreating, setIsCreating] = useState(false);
    const [newSceneName, setNewSceneName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!roomId) return null;

    const handleCreateScene = async (e) => {
        e.preventDefault();
        if (!newSceneName.trim()) return;

        setIsSubmitting(true);
        try {
            await sceneApi.createScene({
                roomId,
                name: newSceneName.trim(),
                isActive: true,
            });
            setNewSceneName("");
            setIsCreating(false);
            await loadScenes(roomId);
        } catch (err) {
            console.error("خطا در ایجاد صحنه:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteScene = async (sceneId, e) => {
        e.stopPropagation();
        if (!confirm("آیا از حذف این صحنه و محتویات آن اطمینان دارید؟")) return;

        try {
            await sceneApi.deleteScene(sceneId);
            await loadScenes(roomId);
        } catch (err) {
            console.error("خطا در حذف صحنه:", err);
        }
    };

    return (
        <div
            className="fixed top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 p-1 bg-zinc-900/90 border border-zinc-800/80 rounded-2xl shadow-2xl backdrop-blur-xl font-fa select-none pointer-events-auto"
            dir="rtl"
        >
            <div className="flex items-center gap-1 px-2 text-zinc-400 text-xs font-bold">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">صحنه‌ها:</span>
            </div>

            {/* تب‌های صحنه‌ها */}
            <div className="flex items-center gap-1 max-w-[40vw] overflow-x-auto custom-scrollbar py-0.5">
                {scenes.map((scene) => {
                    const isActive = currentScene?.id === scene.id;
                    return (
                        <div
                            key={scene.id}
                            onClick={() => isGM && switchScene(scene.id)}
                            className={cn(
                                "group flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0",
                                isActive
                                    ? "bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20"
                                    : isGM
                                        ? "bg-zinc-950/60 border border-zinc-800/60 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 cursor-pointer"
                                        : "bg-zinc-950/60 text-zinc-500 cursor-default"
                            )}
                        >
                            <span className="truncate max-w-[120px]">{scene.name}</span>

                            {/* دکمه حذف فقط برای GM و در صورت وجود بیش از یک صحنه */}
                            {isGM && scenes.length > 1 && (
                                <button
                                    type="button"
                                    onClick={(e) => handleDeleteScene(scene.id, e)}
                                    className={cn(
                                        "w-4 h-4 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity",
                                        isActive
                                            ? "hover:bg-amber-600 text-zinc-950"
                                            : "hover:bg-rose-500/20 text-rose-400"
                                    )}
                                    title="حذف صحنه"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* دکمه افزودن صحنه جدید (فقط برای GM) */}
            {isGM && (
                <>
                    {!isCreating ? (
                        <button
                            type="button"
                            onClick={() => setIsCreating(true)}
                            className="w-7 h-7 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-amber-400 flex items-center justify-center transition-colors cursor-pointer mr-1"
                            title="ایجاد صحنه جدید"
                        >
                            <Plus className="w-3.5 h-3.5" />
                        </button>
                    ) : (
                        <form onSubmit={handleCreateScene} className="flex items-center gap-1 mr-1 animate-in fade-in duration-100">
                            <input
                                type="text"
                                value={newSceneName}
                                onChange={(e) => setNewSceneName(e.target.value)}
                                placeholder="نام صحنه..."
                                autoFocus
                                className="w-28 px-2 py-1 bg-zinc-950 border border-amber-500/50 rounded-lg text-xs text-zinc-100 focus:outline-none"
                            />
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-6 h-6 rounded-lg bg-amber-500 text-zinc-950 flex items-center justify-center cursor-pointer"
                            >
                                <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsCreating(false)}
                                className="w-6 h-6 rounded-lg bg-zinc-800 text-zinc-400 hover:text-zinc-200 flex items-center justify-center cursor-pointer"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </form>
                    )}
                </>
            )}
        </div>
    );
};