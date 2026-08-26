import React, { useEffect, useState } from "react";
import { Image as KonvaImage, Rect, Group } from "react-konva";
import { getFullAssetUrl } from "../../utils/imageUrl";

export const MapLayer = ({ mapUrl, width = 2000, height = 1500 }) => {
  const [image, setImage] = useState(null);
  const [dimensions, setDimensions] = useState({ width, height });

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
        setDimensions({
          width: img.naturalWidth || width,
          height: img.naturalHeight || height,
        });
      }
    };

    img.onerror = () => {
      // تلاش مجدد بدون crossOrigin
      const fallbackImg = new window.Image();
      fallbackImg.src = resolvedUrl;
      fallbackImg.onload = () => {
        if (isMounted) {
          setImage(fallbackImg);
          setDimensions({
            width: fallbackImg.naturalWidth || width,
            height: fallbackImg.naturalHeight || height,
          });
        }
      };
      fallbackImg.onerror = () => {
        console.warn("خطا در بارگذاری تصویر نقشه:", resolvedUrl);
      };
    };

    return () => {
      isMounted = false;
    };
  }, [resolvedUrl, width, height]);

  if (!resolvedUrl) return null;

  return (
      <Group listening={false}>
        {image ? (
            <KonvaImage
                image={image}
                x={0}
                y={0}
                width={dimensions.width}
                height={dimensions.height}
                listening={false}
            />
        ) : (
            <Rect
                x={0}
                y={0}
                width={width}
                height={height}
                fill="#18181b"
                stroke="#3f3f46"
                strokeWidth={2}
                listening={false}
            />
        )}
      </Group>
  );
};