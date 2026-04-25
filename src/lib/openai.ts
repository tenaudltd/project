const OPENAI_API_URL = "https://api.openai.com/v1/responses";
const OPENAI_API_KEY =
  import.meta.env.VITE_OPENAI_API_KEY || "sample api key";
const OPENAI_MODEL = "gpt-4.1-mini";

type QuizDraftQuestion = {
  questionText: string;
  options: string[];
  correctAnswer: number;
};

type LessonDraft = {
  title: string;
  markdown: string;
};

type QuizDraft = {
  title: string;
  questions: QuizDraftQuestion[];
};

function hasRealApiKey() {
  return (
    OPENAI_API_KEY.trim().length > 0 &&
    OPENAI_API_KEY.trim().toLowerCase() !== "sample api key"
  );
}

async function createStructuredResponse<T>({
  schemaName,
  schema,
  systemPrompt,
  userPrompt,
}: {
  schemaName: string;
  schema: Record<string, unknown>;
  systemPrompt: string;
  userPrompt: string;
}): Promise<T> {
  if (!hasRealApiKey()) {
    throw new Error(
      "Replace the sample OpenAI API key in `src/lib/openai.ts` or set `VITE_OPENAI_API_KEY` first.",
    );
  }

  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      input: [
        {
          role: "system",
          content: [{ type: "input_text", text: systemPrompt }],
        },
        {
          role: "user",
          content: [{ type: "input_text", text: userPrompt }],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: schemaName,
          schema,
          strict: true,
        },
      },
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    const message =
      typeof data?.error?.message === "string"
        ? data.error.message
        : "OpenAI request failed.";
    throw new Error(message);
  }

  if (typeof data?.output_text !== "string" || !data.output_text.trim()) {
    throw new Error("OpenAI returned an empty structured response.");
  }

  return JSON.parse(data.output_text) as T;
}

export async function generateLessonDraftFromText(
  sourceText: string,
  suggestedTitle: string,
): Promise<LessonDraft> {
  const schema = {
    type: "object",
    additionalProperties: false,
    properties: {
      title: { type: "string" },
      markdown: { type: "string" },
    },
    required: ["title", "markdown"],
  };

  return createStructuredResponse<LessonDraft>({
    schemaName: "lesson_draft",
    schema,
    systemPrompt:
      "You convert civic education source material into a clean lesson draft. Return concise, readable markdown only. Use headings, bullet lists, and short paragraphs where helpful. Stay faithful to the source and do not invent facts.",
    userPrompt: `Create a lesson draft from this source material.

Suggested title: ${suggestedTitle}

Source material:
${sourceText.slice(0, 18000)} convert to markdown`,
  });
}

export async function generateQuizDraftFromText(
  sourceText: string,
  suggestedTitle: string,
): Promise<QuizDraft> {
  const schema = {
    type: "object",
    additionalProperties: false,
    properties: {
      title: { type: "string" },
      questions: {
        type: "array",
        minItems: 3,
        maxItems: 6,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            questionText: { type: "string" },
            options: {
              type: "array",
              minItems: 4,
              maxItems: 4,
              items: { type: "string" },
            },
            correctAnswer: {
              type: "integer",
              minimum: 0,
              maximum: 3,
            },
          },
          required: ["questionText", "options", "correctAnswer"],
        },
      },
    },
    required: ["title", "questions"],
  };

  return createStructuredResponse<QuizDraft>({
    schemaName: "quiz_draft",
    schema,
    systemPrompt:
      "You create simple, factual multiple-choice quiz drafts from civic education source material. Return 3 to 6 questions. Each question must have exactly 4 options and one correct answer index. Use only information stated in the source.",
    userPrompt: `Create a quiz draft from this source material.

Suggested title: ${suggestedTitle}

Source material:
${sourceText.slice(0, 18000)}`,
  });
}
