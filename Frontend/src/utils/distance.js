/**
 * محاسبه مسافت بین دو نقطه بر اساس قوانین سیستم‌های مختلف D&D و گرید
 */
export const calculateSegmentDistance = (
    p1,
    p2,
    gridSize = 60,
    scaleValue = 5,
    rulerType = "dnd5e_5105"
) => {
  if (!p1 || !p2) return { gridUnits: 0, realDistance: 0 };

  const dxPixels = Math.abs(p2.x - p1.x);
  const dyPixels = Math.abs(p2.y - p1.y);

  const S = Math.max(Number(gridSize) || 60, 1);
  const dx = dxPixels / S;
  const dy = dyPixels / S;

  let gridUnits = 0;

  switch (rulerType) {
    case "dnd5e_5105":
    case "dnd5e": {
      gridUnits = Math.max(dx, dy);
      break;
    }

    case "dnd35_alternating":
    case "dnd35": {
      const minD = Math.min(dx, dy);
      const maxD = Math.max(dx, dy);
      gridUnits = Math.floor(minD * 1.5) + (maxD - minD);
      break;
    }

    case "euclidean": {
      gridUnits = Math.sqrt(dx * dx + dy * dy);
      break;
    }

    case "manhattan": {
      gridUnits = dx + dy;
      break;
    }

    default: {
      gridUnits = Math.max(dx, dy);
      break;
    }
  }

  const realDistance = gridUnits * (Number(scaleValue) || 5);
  return {
    gridUnits: Number(gridUnits.toFixed(1)),
    realDistance: Number(realDistance.toFixed(1)),
  };
};

/**
 * محاسبه کل مسیر شامل تمام ایستگاه‌ها (Waypoints)
 */
export const calculateTotalDistance = (
    start,
    current,
    waypoints = [],
    gridSize = 60,
    scaleValue = 5,
    unit = "ft",
    rulerType = "dnd5e_5105"
) => {
  if (!start || !current) {
    return { totalDistance: 0, gridUnits: 0, formattedText: "0 ft" };
  }

  const fullPath = [start, ...waypoints, current];
  let totalGridUnits = 0;
  let totalRealDistance = 0;

  for (let i = 0; i < fullPath.length - 1; i++) {
    const seg = calculateSegmentDistance(
        fullPath[i],
        fullPath[i + 1],
        gridSize,
        scaleValue,
        rulerType
    );
    totalGridUnits += seg.gridUnits;
    totalRealDistance += seg.realDistance;
  }

  const formattedDistance =
      totalRealDistance % 1 === 0 ? totalRealDistance : totalRealDistance.toFixed(1);
  const unitLabel = unit === "m" || unit === "meter" ? "متر" : "ft";

  return {
    totalDistance: totalRealDistance,
    gridUnits: Number(totalGridUnits.toFixed(1)),
    formattedText: `${formattedDistance} ${unitLabel}`,
  };
};