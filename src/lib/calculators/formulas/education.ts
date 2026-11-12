// Grades, GPA and attendance. Grading conventions differ between institutions — the scales here are the
// common ones named in the UI, and every page tells students to check their own institution's rules.

/** Common US 4.0 letter-grade points (A+ is capped at 4.0, as most US institutions do). */
export const US_GRADE_POINTS: { grade: string; points: number }[] = [
  { grade: "A+", points: 4.0 },
  { grade: "A", points: 4.0 },
  { grade: "A-", points: 3.7 },
  { grade: "B+", points: 3.3 },
  { grade: "B", points: 3.0 },
  { grade: "B-", points: 2.7 },
  { grade: "C+", points: 2.3 },
  { grade: "C", points: 2.0 },
  { grade: "C-", points: 1.7 },
  { grade: "D+", points: 1.3 },
  { grade: "D", points: 1.0 },
  { grade: "D-", points: 0.7 },
  { grade: "F", points: 0 },
];

/** Credit-weighted average: Σ(points × credits) ÷ Σ credits. */
export function weightedAverage(rows: { value: number; weight: number }[]): { average: number; totalWeight: number; totalPoints: number } {
  const totalWeight = rows.reduce((s, r) => s + r.weight, 0);
  const totalPoints = rows.reduce((s, r) => s + r.value * r.weight, 0);
  return { average: totalPoints / totalWeight, totalWeight, totalPoints };
}

export type GradeScale = "us" | "uk";

/** Common US percentage cut-offs (A ≥ 93, A- ≥ 90, B+ ≥ 87 …, F < 60). */
const US_CUTOFFS: [number, string][] = [
  [97, "A+"],
  [93, "A"],
  [90, "A-"],
  [87, "B+"],
  [83, "B"],
  [80, "B-"],
  [77, "C+"],
  [73, "C"],
  [70, "C-"],
  [67, "D+"],
  [63, "D"],
  [60, "D-"],
  [0, "F"],
];

/** UK undergraduate degree classification by overall mark. */
const UK_CUTOFFS: [number, string][] = [
  [70, "First-class honours (1st)"],
  [60, "Upper second-class (2:1)"],
  [50, "Lower second-class (2:2)"],
  [40, "Third-class honours (3rd)"],
  [0, "Fail"],
];

export function percentToGrade(pct: number, scale: GradeScale): { grade: string; points?: number; band: string } {
  const table = scale === "us" ? US_CUTOFFS : UK_CUTOFFS;
  const idx = table.findIndex(([min]) => pct >= min);
  const [min, grade] = table[idx];
  const upper = idx === 0 ? 100 : table[idx - 1][0];
  const band = idx === 0 ? `${min}% and above` : min === 0 ? `below ${upper}%` : `${min}% to under ${upper}%`;
  return { grade, band, points: scale === "us" ? US_GRADE_POINTS.find((g) => g.grade === grade)?.points : undefined };
}

export function examTotals(rows: { obtained: number; total: number }[]): { obtained: number; total: number; percentage: number } {
  const obtained = rows.reduce((s, r) => s + r.obtained, 0);
  const total = rows.reduce((s, r) => s + r.total, 0);
  return { obtained, total, percentage: (obtained / total) * 100 };
}

/**
 * Score needed on a final assessment worth `weightPct` of the overall grade, given the current grade
 * on the rest of the course, to finish with `targetPct`: (target − current × (1 − w)) ÷ w.
 */
export function requiredFinalScore(currentPct: number, weightPct: number, targetPct: number): number {
  const w = weightPct / 100;
  return (targetPct - currentPct * (1 - w)) / w;
}

export interface AttendanceResult {
  percentage: number;
  meetsTarget: boolean;
  /** Classes that can be missed in a row while staying at or above the target (when meeting it). */
  canMiss: number;
  /** Classes to attend in a row to reach the target (when below it); null if the target is unreachable. */
  needToAttend: number | null;
}

export function attendance(attended: number, total: number, targetPct: number): AttendanceResult {
  const percentage = total === 0 ? 0 : (attended / total) * 100;
  const meetsTarget = percentage >= targetPct - 1e-9;
  if (meetsTarget) {
    const canMiss = targetPct === 0 ? Infinity : Math.floor((attended * 100) / targetPct - total + 1e-9);
    return { percentage, meetsTarget, canMiss: Math.max(0, canMiss), needToAttend: 0 };
  }
  if (targetPct >= 100) return { percentage, meetsTarget, canMiss: 0, needToAttend: null };
  const needToAttend = Math.ceil((targetPct * total - 100 * attended) / (100 - targetPct) - 1e-9);
  return { percentage, meetsTarget, canMiss: 0, needToAttend };
}
