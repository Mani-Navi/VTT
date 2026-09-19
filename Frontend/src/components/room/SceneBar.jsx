import React, { useState, memo } from "react";
import {
    Layers,
    Plus,
    Trash2,
    Edit2,
    Check,
    X,
} from "lucide-react";
import { useSceneStore } from "../../store/scene.store";
import { sceneApi } from "../../api/scene.api";
import { wsService } from "../../services/websocket.service";
import { cn } from "../../utils/cn";

export const SceneBar = memo(({ isGM = false, roomId = null }) => {
    const scenes = useSceneStore((state) => state.scenes);
    const currentScene = useSceneStore((state) => state.currentScene);
    const switchScene = useSceneStore((state) => state.switchScene);
    const renameScene = useSceneStore((state) => state.renameScene);

    const [isCreating, setIsCreating] = useState(false);
    const [newSceneName, setNewSceneName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [editingSceneId, setEditingSceneId] = useState(null);
    const [editingName, setEditingName] = useState("");

    if (!roomId) return null;

    const handleCreateScene = async (e) => {
        e.preventDefault();
        if (!newSceneName.trim() || isSubmitting) return;

        const sceneName = newSceneName.trim();
        setIsSubmitting(true);
        try {
            const created = await sceneApi.createScene({
                roomId,
                name: sceneName,
                isActive: true,
            });

            setNewSceneName("");
            setIsCreating(false);

            if (created && created.id) {
                // اضافه کردن سریع صحنه به استیت محلی بدون کوئری‌های سنگین
                useSceneStore.setState((state) => ({
                    scenes: [...state.scenes, created],
                }));

                // سوییچ آنی به صحنه جدید
                await switchScene(created.id, false);

                // برادکست سریع به بازیکنان
                wsService.send("SCENE_CREATED", { scene: created });
                wsService.send("SCENE_ACTIVATED", { sceneId: created.id });
            }
        } catch (err) {
            if (import.meta.env.DEV) {
                console.error("خطا در ایجاد صحنه:", err);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteScene = async (sceneId, e) => {
        e.stopPropagation();
        if (!confirm("آیا از حذف این صحنه و تمام محتویات آن اطمینان دارید؟")) return;

        try {
            await sceneApi.deleteScene(sceneId);

            const remaining = scenes.filter((s) => s.id !== sceneId);
            const nextActive = remaining.length > 0 ? remaining[0].id : null;

            useSceneStore.setState({ scenes: remaining });
            if (nextActive) {
                await switchScene(nextActive, false);
            }

            wsService.send("SCENE_DELETE", {
                sceneId: sceneId,
                activeSceneId: nextActive,
            });
        } catch (err) {
            if (import.meta.env.DEV) {
                console.error("خطا در حذف صحنه:", err);
            }
        }
    };

    const startEditing = (scene, e) => {
        e.stopPropagation();
        setEditingSceneId(scene.id);
        setEditingName(scene.name);
    };

    const saveRename = async (sceneId, e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!editingName.trim()) {
            setEditingSceneId(null);
            return;
        }

        await renameScene(sceneId, editingName.trim());
        setEditingSceneId(null);
    };

    return (
        <div
            className="fixed top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5 px-3 py-1.5 bg-zinc-950/85 border border-zinc-800/90 rounded-2xl shadow-2xl shadow-black/70 backdrop-blur-xl font-fa select-none pointer-events-auto"
            dir="rtl"
        >
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-900/80 border border-zinc-800/60 text-zinc-300 text-xs font-semibold shrink-0">
                <Layers className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">صحنه‌ها</span>
            </div>

            <div className="flex items-center gap-1.5 max-w-[55vw] overflow-x-auto custom-scrollbar py-0.5 px-0.5">
                {scenes.map((scene) => {
                    const isActive = currentScene?.id === scene.id;
                    const isEditingThis = editingSceneId === scene.id;

                    if (isEditingThis && isGM) {
                        return (
                            <form
                                key={scene.id}
                                onSubmit={(e) => saveRename(scene.id, e)}
                                className="flex items-center gap-1.5 bg-zinc-900 px-2.5 py-1 rounded-xl border border-amber-500 shadow-md shrink-0 animate-in fade-in duration-150"
                            >
                                <input
                                    type="text"
                                    value={editingName}
                                    onChange={(e) => setEditingName(e.target.value)}
                                    autoFocus
                                    className="w-28 px-1 py-0.5 bg-transparent text-xs text-zinc-100 font-medium focus:outline-none"
                                />
                                <button
                                    type="submit"
                                    className="w-6 h-6 rounded-lg bg-amber-500 text-zinc-950 flex items-center justify-center cursor-pointer hover:bg-amber-400 transition-colors"
                                >
                                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEditingSceneId(null)}
                                    className="w-6 h-6 rounded-lg bg-zinc-800 text-zinc-400 hover:text-zinc-200 flex items-center justify-center cursor-pointer transition-colors"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </form>
                        );
                    }

                    return (
                        <div
                            key={scene.id}
                            onClick={() => isGM && switchScene(scene.id)}
                            onDoubleClick={(e) => isGM && startEditing(scene, e)}
                            className={cn(
                                "group relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0",
                                isActive
                                    ? "bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 shadow-lg shadow-amber-500/20 border border-amber-400/40 cursor-default"
                                    : isGM
                                        ? "bg-zinc-900/60 border border-zinc-800/60 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 hover:bg-zinc-800/60 cursor-pointer"
                                        : "bg-zinc-900/40 border border-zinc-800/40 text-zinc-500 cursor-default"
                            )}
                            title={isGM ? "برای سوییچ کلیک و برای ویرایش نام دابل‌کلیک کنید" : ""}
                        >
                            <span className="truncate max-w-[150px] tracking-wide">{scene.name}</span>

                            {isGM && (
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-150 mr-0.5">
                                    <button
                                        type="button"
                                        onClick={(e) => startEditing(scene, e)}
                                        className={cn(
                                            "w-5 h-5 rounded-md flex items-center justify-center transition-colors",
                                            isActive
                                                ? "hover:bg-amber-600 text-zinc-950"
                                                : "hover:bg-zinc-700/80 text-zinc-400 hover:text-zinc-200"
                                        )}
                                        title="ویرایش نام"
                                    >
                                        <Edit2 className="w-3 h-3" />
                                    </button>

                                    {scenes.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={(e) => handleDeleteScene(scene.id, e)}
                                            className={cn(
                                                "w-5 h-5 rounded-md flex items-center justify-center transition-colors",
                                                isActive
                                                    ? "hover:bg-rose-600 text-zinc-950 hover:text-white"
                                                    : "hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400"
                                            )}
                                            title="حذف صحنه"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {isGM && (
                <div className="shrink-0">
                    {!isCreating ? (
                        <button
                            type="button"
                            onClick={() => setIsCreating(true)}
                            className="h-8 px-2.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800/80 hover:border-amber-500/50 text-amber-400 flex items-center gap-1 text-xs font-semibold transition-all cursor-pointer shadow-sm"
                            title="ایجاد صحنه جدید"
                        >
                            <Plus className="w-4 h-4 stroke-[2.5]" />
                            <span className="hidden md:inline">صحنه جدید</span>
                        </button>
                    ) : (
                        <form
                            onSubmit={handleCreateScene}
                            className="flex items-center gap-1.5 bg-zinc-900 px-2 py-1 rounded-xl border border-amber-500/70 shadow-lg animate-in fade-in duration-150"
                        >
                            <input
                                type="text"
                                value={newSceneName}
                                onChange={(e) => setNewSceneName(e.target.value)}
                                placeholder="نام صحنه..."
                                autoFocus
                                className="w-32 px-2 py-0.5 bg-transparent text-xs text-zinc-100 font-medium focus:outline-none"
                            />
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-6 h-6 rounded-lg bg-amber-500 text-zinc-950 flex items-center justify-center cursor-pointer hover:bg-amber-400 transition-colors"
                            >
                                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsCreating(false)}
                                className="w-6 h-6 rounded-lg bg-zinc-800 text-zinc-400 hover:text-zinc-200 flex items-center justify-center cursor-pointer transition-colors"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </form>
                    )}
                </div>
            )}
        </div>
    );
});

SceneBar.displayName = "SceneBar";