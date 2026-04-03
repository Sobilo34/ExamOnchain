type Q = {
  id: number;
  type: string;
  points: number;
};

/** @param mcqGrading questionId -> correct shuffled index; omit keys for non-MCQ */
export function scoreAttempt(
  questions: Q[],
  answers: Record<string, number | string>,
  mcqGrading: Record<string, number>
): { score: number; max: number } {
  let score = 0;
  let max = 0;
  for (const q of questions) {
    max += q.points;
    const a = answers[String(q.id)];
    if (q.type === "MCQ") {
      const correct = mcqGrading[String(q.id)];
      if (correct !== undefined && typeof a === "number" && a === correct) {
        score += q.points;
      }
    } else if (q.type === "SHORT_ANSWER" && typeof a === "string" && a.trim().length > 3) {
      score += Math.floor(q.points / 2);
    }
  }
  return { score, max };
}
