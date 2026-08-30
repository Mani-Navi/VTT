import React, { useEffect, useState } from "react";
import { Image as KonvaImage, Rect, Group } from "react-konva";
import { getFullAssetUrl } from "../../utils/imageUrl";
import { useCanvasStore } from "../../store/canvas.store";

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

    img.onload = () => {
      if (isMounted) {
        setImage(img);
        const naturalW = img.naturalWidth || width;
        const naturalH = img.naturalHeight || height;
        setDimensions({ width: naturalW, height: naturalH });

        if (onDimensionsChange) {
          onDimensionsChange(naturalW, naturalH);
        }

        // سنتر و فیت قطعی دوربین در لحظه لود کامل بایت‌های تصویر
        const screenW = typeof window !== "undefined" ? window.innerWidth : 1920;
        const screenH = typeof window !== "undefined" ? window.innerHeight : 1080;
        fitToMap(naturalW, naturalH, screenW, screenH);
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
          setDimensions({ width: naturalW, height: naturalH });

          if (onDimensionsChange) {
            onDimensionsChange(naturalW, naturalH);
          }

          const screenW = typeof window !== "undefined" ? window.innerWidth : 1920;
          const screenH = typeof window !== "undefined" ? window.innerHeight : 1080;
          fitToMap(naturalW, naturalH, screenW, screenH);
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
                width={width}
                height={height}
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