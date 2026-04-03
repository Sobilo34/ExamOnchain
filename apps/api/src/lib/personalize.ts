import { keccak256, toUtf8Bytes } from "ethers";

export type QuestionForClient = {
  id: number;
  type: string;
  prompt: string;
  options?: string[];
  points: number;
};

export type PersonalizationResult = {
  questions: QuestionForClient[];
  /** questionId -> correct option index as shown to the student */
  grading: Record<string, number>;
};

type QuestionRow = {
  id: number;
  type: string;
  prompt: string;
  options: unknown;
  correctIndex: number | null;
  points: number;
  order: number;
};

function parseOptions(raw: unknown): unknown {
  if (raw == null) return null;
  if (typeof raw === "string") return JSON.parse(raw);
  return raw;
}

function prng(seedHex: string) {
  let i = 0;
  return () => {
    const h = keccak256(toUtf8Bytes(`${seedHex}:${i++}`));
    return Number(BigInt(h) % 10_000_000n) / 10_000_000;
  };
}

function shuffleInPlace<T>(arr: T[], rand: () => number) {
  for (let k = arr.length - 1; k > 0; k--) {
    const j = Math.floor(rand() * (k + 1));
    [arr[k], arr[j]] = [arr[j], arr[k]];
  }
}

export function personalizeQuestions(
  questions: QuestionRow[],
  examId: number,
  userId: string,
  secret: string
): PersonalizationResult {
  const seed = keccak256(toUtf8Bytes(`${examId}:${userId}:${secret}`));
  const rand = prng(seed);

  const grading: Record<string, number> = {};

  const enriched = questions.map((q) => {
    const options = parseOptions(q.options);
    if (q.type !== "MCQ" || !Array.isArray(options) || q.correctIndex == null) {
      return {
        client: {
          id: q.id,
          type: q.type,
          prompt: q.prompt,
          options: Array.isArray(options) ? (options as string[]) : undefined,
          points: q.points,
        } satisfies QuestionForClient,
        mcq: false as const,
      };
    }
    const opts = [...(options as string[])];
    const indices = opts.map((_, idx) => idx);
    shuffleInPlace(indices, rand);
    const newOptions = indices.map((oi) => opts[oi]!);
    const newCorrect = indices.indexOf(q.correctIndex);
    grading[String(q.id)] = newCorrect;
    return {
      client: {
        id: q.id,
        type: q.type,
        prompt: q.prompt,
        options: newOptions,
        points: q.points,
      } satisfies QuestionForClient,
      mcq: true as const,
    };
  });

  shuffleInPlace(enriched, rand);

  return {
    questions: enriched.map((e) => e.client),
    grading,
  };
}
