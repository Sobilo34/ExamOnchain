import { createHash } from "node:crypto";

export type DraftQuestion = {
  type: "MCQ" | "SHORT_ANSWER";
  prompt: string;
  options?: string[];
  correctIndex?: number;
  points: number;
};

/** Stub extraction: uses OpenAI if key set, else heuristic placeholder questions from material text. */
export async function extractQuestionsFromText(text: string, apiKey?: string): Promise<DraftQuestion[]> {
  const key = apiKey ?? process.env.OPENAI_API_KEY;
  if (key && text.length > 20) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "Return JSON only: { questions: [{ type: 'MCQ'|'SHORT_ANSWER', prompt, options?: string[], correctIndex?: number, points: number }] } max 5 questions from the material.",
            },
            { role: "user", content: text.slice(0, 12_000) },
          ],
          temperature: 0.2,
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
        const raw = data.choices?.[0]?.message?.content ?? "";
        const json = JSON.parse(raw.replace(/```json\n?|```/g, "").trim()) as { questions: DraftQuestion[] };
        if (Array.isArray(json.questions)) return json.questions.slice(0, 10);
      }
    } catch {
      // fall through
    }
  }

  const snippet = text.slice(0, 200).replace(/\s+/g, " ");
  const h = createHash("sha256").update(text).digest("hex").slice(0, 8);
  return [
    {
      type: "MCQ",
      prompt: `Based on the material, what is the main topic discussed? (stub-${h})`,
      options: ["Topic A from notes", "Topic B from notes", "Topic C from notes", "Cannot determine"],
      correctIndex: 0,
      points: 1,
    },
    {
      type: "SHORT_ANSWER",
      prompt: `Summarize one key concept from the handout in one sentence. Ref: ${snippet.slice(0, 80)}…`,
      points: 2,
    },
  ];
}
