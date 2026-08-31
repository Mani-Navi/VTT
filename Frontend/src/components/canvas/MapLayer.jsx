import React, { useEffect, useState } from "react";
import { Image as KonvaImage, Rect, Group } from "react-konva";
import { getFullAssetUrl } from "../../utils/imageUrl";
import { useCanvasStore } from "../../store/canvas.store";
import { useSceneStore } from "../../store/scene.store";

export const MapLayer = ({ mapUrl, width = 2000, height = 1500, onDimensionsChange = null }) => {
  const [image, setImage] = useState(null);
  const [dimensions, setDimensions] = useState({ width, height });
  const fitToMap = useCanvasStore((state) => state.fitToMap);

  const resolvedUrl = getFullAssetUrl(mapUrl);

  useEffect(() => {
    if (!resolvedUrl) {
      setImage(null);
      return;
    }

    let isMounted = true;
    const img = new window.Image();

    if (!resolvedUrl.startsWith("data:") && !resolvedUrl.startsWith("blob:")) {
      img.crossOrigin = "anonymous";
    }

    img.src = resolvedUrl;

    const applyFocus = (naturalW, naturalH) => {
      if (!isMounted) return;

      setDimensions({ width: naturalW, height: naturalH });

      useSceneStore.setState((state) => ({
        currentScene: state.currentScene
            ? { ...state.currentScene, mapWidth: naturalW, mapHeight: naturalH }
            : state.currentScene,
      }));

      if (onDimensionsChange) {
        onDimensionsChange(naturalW, naturalH);
      }

      // سنتر فوری و تکرار در فریم بعدی جهت اعمال قطعی پس از تغییر DOM
      fitToMap(naturalW, naturalH);
      requestAnimationFrame(() => {
        if (isMounted) {
          fitToMap(naturalW, naturalH);
        }
      });
    };

    img.onload = () => {
      if (isMounted) {
        setImage(img);
        const naturalW = img.naturalWidth || width;
        const naturalH = img.naturalHeight || height;
        applyFocus(naturalW, naturalH);
      }
    };

    img.onerror = () => {
      const fallbackImg = new window.Image();
      fallbackImg.src = resolvedUrl;
      fallbackImg.onload = () => {
        if (isMounted) {
          setImage(fallbackImg);
          const naturalW = fallbackImg.naturalWidth || width;
          const naturalH = fallbackImg.naturalHeight || height;
          applyFocus(naturalW, naturalH);
        }
      };
      fallbackImg.onerror = () => {
        console.warn("خطا در بارگذاری تصویر نقشه:", resolvedUrl);
      };
    };

    return () => {
      isMounted = false;
    };
  }, [resolvedUrl]);

  if (!resolvedUrl) return null;

  const cornerRadius = 24;

  return (
      <Group listening={false}>
        {/* کادر و سایه عمیق دور نقشه */}
        <Rect
            x={0}
            y={0}
            width={dimensions.width}
            height={dimensions.height}
            cornerRadius={cornerRadius}
            fill="transparent"
            stroke="rgba(245, 158, 11, 0.45)"
            strokeWidth={3}
            shadowColor="#000000"
            shadowBlur={40}
            shadowOpacity={0.9}
            shadowOffset={{ x: 0, y: 15 }}
            listening={false}
        />

        {image ? (
            <KonvaImage
                image={image}
                x={0}
                y={0}
                width={dimensions.width}
                height={dimensions.height}
                cornerRadius={cornerRadius}
                name="map-background"
                listening={false}
            />
        ) : (
            <Rect
                x={0}
                y={0}
                width={dimensions.width}
                height={dimensions.height}
                cornerRadius={cornerRadius}
                fill="#18181b"
                stroke="#3f3f46"
                strokeWidth={2}
                name="map-background"
                listening={false}
            />
        )}
      </Group>
  );
};