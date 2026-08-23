import confetti from "canvas-confetti";
import { DiceRoll, SingleDieResult } from "../types";

export function parseDiceFormula(formula: string): {
  count: number;
  sides: number;
  modifier: number;
  keepHighest?: number;
} {
  const clean = formula.toLowerCase().replace(/\s+/g, "");

  // Match pattern like 2d20kh1+5 or 3d6+2 or 1d20-1 or 1d100
  const match = clean.match(/^(\d*)d(\d+)(?:kh(\d+))?([+-]\d+)?$/);

  if (!match) {
    // Default fallback to 1d20
    return { count: 1, sides: 20, modifier: 0 };
  }

  const count = match[1] ? parseInt(match[1], 10) : 1;
  const sides = parseInt(match[2], 10) || 20;
  const keepHighest = match[3] ? parseInt(match[3], 10) : undefined;
  const modifier = match[4] ? parseInt(match[4], 10) : 0;

  return {
    count: Math.min(Math.max(count, 1), 50),
    sides: Math.min(Math.max(sides, 2), 1000),
    modifier,
    keepHighest,
  };
}

export function rollDice(
  formula: string,
  userName: string = "Player",
  userColor: string = "#3b82f6",
  userId: string = "user-1",
  label?: string
): DiceRoll {
  const parsed = parseDiceFormula(formula);
  const rawResults: number[] = [];

  for (let i = 0; i < parsed.count; i++) {
    rawResults.push(Math.floor(Math.random() * parsed.sides) + 1);
  }

  const dice: SingleDieResult[] = rawResults.map((val) => ({
    sides: parsed.sides,
    result: val,
  }));

  // Handle keep highest (e.g. 4d6kh3)
  if (parsed.keepHighest && parsed.keepHighest < dice.length) {
    const sortedIndices = dice
      .map((d, index) => ({ index, result: d.result }))
      .sort((a, b) => b.result - a.result);

    const keptIndices = new Set(
      sortedIndices.slice(0, parsed.keepHighest).map((s) => s.index)
    );

    dice.forEach((die, index) => {
      if (!keptIndices.has(index)) {
        die.dropped = true;
      }
    });
  }

  const activeDiceSum = dice
    .filter((d) => !d.dropped)
    .reduce((sum, d) => sum + d.result, 0);

  const total = activeDiceSum + parsed.modifier;

  // Critical checks for d20
  const isD20Single = parsed.sides === 20 && parsed.count === 1;
  const isCriticalHit = isD20Single && dice[0].result === 20;
  const isCriticalFail = isD20Single && dice[0].result === 1;

  if (isCriticalHit) {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#fbbf24", "#f59e0b", "#ef4444", "#3b82f6", "#10b981"],
      });
    } catch {
      // Ignore if canvas-confetti fails in iframe
    }
  }

  return {
    id: `roll-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    userId,
    userName,
    userColor,
    formula,
    dice,
    modifier: parsed.modifier,
    total,
    isCriticalHit,
    isCriticalFail,
    timestamp: new Date().toLocaleTimeString("fa-IR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
    label,
  };
}
