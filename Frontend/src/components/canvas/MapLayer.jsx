import React, { useEffect, useState } from "react";
import { Image as KonvaImage, Rect } from "react-konva";

export const MapLayer = ({ mapUrl, width = 2000, height = 1500 }) => {
  const [image, setImage] = useState(null);

  useEffect(() => {
    if (!mapUrl) {
      setImage(null);
      return;
    }

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = mapUrl;
    img.onload = () => setImage(img);
    img.onerror = () => {
      console.warn("Failed to load map image, fallback to canvas pattern", mapUrl);
      setImage(null);
    };
  }, [mapUrl]);

  if (!image) {
    return (
        <Rect
            x={0}
            y={0}
            width={width}
            height={height}
            fill="#18181b"
            stroke="#27272a"
            strokeWidth={2}
            cornerRadius={8}
        />
    );
  }

  return (
      <KonvaImage
          image={image}
          x={0}
          y={0}
          width={width}
          height={height}
          listening={false}
          cornerRadius={8}
      />
  );
};