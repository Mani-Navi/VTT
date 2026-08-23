import { useEffect, useCallback } from "react";
import { useCanvasStore } from "../store/canvas.store";
import { TOOLS } from "../constants/tools";

export function useCanvas() {
  const activeTool = useCanvasStore((state) => state.activeTool);
  const zoom = useCanvasStore((state) => state.zoom);
  const stageX = useCanvasStore((state) => state.stageX);
  const stageY = useCanvasStore((state) => state.stageY);
  const selectedTokenIds = useCanvasStore((state) => state.selectedTokenIds);

  const setActiveTool = useCanvasStore((state) => state.setActiveTool);
  const setZoom = useCanvasStore((state) => state.setZoom);
  const setStagePos = useCanvasStore((state) => state.setStagePos);
  const resetView = useCanvasStore((state) => state.resetView);
  const clearSelection = useCanvasStore((state) => state.clearSelection);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger when typing in input or textarea
      if (["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case "v":
        case "s":
          setActiveTool(TOOLS.SELECT);
          break;
        case "h":
          setActiveTool(TOOLS.PAN);
          break;
        case "d":
          setActiveTool(TOOLS.DRAW);
          break;
        case "f":
          setActiveTool(TOOLS.FOG);
          break;
        case "r":
          setActiveTool(TOOLS.RULER);
          break;
        case "l":
          setActiveTool(TOOLS.LASER);
          break;
        case "t":
          setActiveTool(TOOLS.TOKEN);
          break;
        case "escape":
          clearSelection();
          useCanvasStore.getState().closeAllMenus();
          break;
        case "+":
        case "=":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setZoom((z) => Math.min(z + 0.15, 3.5));
          }
          break;
        case "-":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setZoom((z) => Math.max(z - 0.15, 0.2));
          }
          break;
        case "0":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            resetView();
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setActiveTool, clearSelection, setZoom, resetView]);

  const zoomIn = useCallback(() => setZoom((z) => Math.min(z + 0.2, 3.5)), [setZoom]);
  const zoomOut = useCallback(() => setZoom((z) => Math.max(z - 0.2, 0.2)), [setZoom]);

  return {
    activeTool,
    zoom,
    stageX,
    stageY,
    selectedTokenIds,
    setActiveTool,
    setZoom,
    setStagePos,
    resetView,
    zoomIn,
    zoomOut,
  };
}
