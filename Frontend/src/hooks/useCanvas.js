import { useEffect, useCallback } from "react";
import { useCanvasStore } from "../store/canvas.store";
import { TOOLS } from "../constants/tools.js";

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

  // لیسنر میانبرهای صفحه کلید
  useEffect(() => {
    const handleKeyDown = (e) => {
      // در زمان تایپ داخل اینپوت‌ها یا تکست‌اریاها میانبرها فعال نشوند
      if (["INPUT", "TEXTAREA", "SELECT"].includes(e.target?.tagName)) {
        return;
      }

      const selectTool = TOOLS?.SELECT || "SELECT";
      const panTool = TOOLS?.PAN || "PAN";
      const drawTool = TOOLS?.DRAW || "DRAW";
      const fogTool = TOOLS?.FOG || "FOG";
      const rulerTool = TOOLS?.RULER || "RULER";
      const laserTool = TOOLS?.LASER || "LASER";
      const tokenTool = TOOLS?.TOKEN || "TOKEN";

      switch (e.key?.toLowerCase()) {
        case "v":
        case "s":
          setActiveTool(selectTool);
          break;
        case "h":
          setActiveTool(panTool);
          break;
        case "d":
          setActiveTool(drawTool);
          break;
        case "f":
          setActiveTool(fogTool);
          break;
        case "r":
          setActiveTool(rulerTool);
          break;
        case "l":
          setActiveTool(laserTool);
          break;
        case "t":
          setActiveTool(tokenTool);
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