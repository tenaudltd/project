type QuizDraftQuestion = {
  questionText: string;
  options: string[];
  correctAnswer: number;
};

const SUPPORTED_EXTENSIONS = new Set([
  "txt",
  "md",
  "markdown",
  "html",
  "htm",
  "json",
  "docx",
]);

const STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "that",
  "with",
  "this",
  "from",
  "have",
  "will",
  "your",
  "about",
  "into",
  "their",
  "there",
  "which",
  "while",
  "where",
  "when",
  "what",
  "would",
  "could",
  "should",
  "been",
  "being",
  "through",
  "than",
  "them",
  "they",
  "were",
  "also",
  "because",
]);

function fileExtension(name: string) {
  const parts = name.toLowerCase().split(".");
  return parts.length > 1 ? parts.pop() ?? "" : "";
}

function fileStem(name: string) {
  return name.replace(/\.[^.]+$/, "");
}

function stripHtml(html: string) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|section|article|li|h1|h2|h3|h4|h5|h6)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\r/g, "");
}

function normalizeText(text: string) {
  return text
    .replace(/\r/g, "")
    .replace(/\t/g, " ")
    .replace(/[ ]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function extractDocumentText(file: File): Promise<{
  text: string;
  suggestedTitle: string;
}> {
  const ext = fileExtension(file.name);
  if (!SUPPORTED_EXTENSIONS.has(ext)) {
    throw new Error(
      "Unsupported document type. Use .txt, .md, .html, .json, or .docx for now.",
    );
  }

  let raw = "";
  if (ext === "docx") {
    const mammoth = await import("mammoth");
    const buffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({
      arrayBuffer: buffer,
    });
    raw = result.value;
  } else {
    raw = await file.text();
  }

  const text = normalizeText(
    ext === "html" || ext === "htm" ? stripHtml(raw) : raw,
  );

  if (!text) {
    throw new Error("The uploaded document is empty.");
  }

  return {
    text,
    suggestedTitle: fileStem(file.name).replace(/[-_]+/g, " ").trim(),
  };
}

export function documentTextToMarkdown(
  text: string,
  suggestedTitle?: string,
): string {
  const sections = text
    .split(/\n\s*\n/)
    .map((section) => normalizeText(section))
    .filter(Boolean);

  const title =
    suggestedTitle?.trim() ||
    sections[0]?.split("\n")[0]?.slice(0, 80) ||
    "Imported Lesson";

  const body = sections
    .map((section, index) => {
      if (index === 0 && section.toLowerCase() === title.toLowerCase()) {
        return "";
      }
      const lines = section
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
      if (lines.length === 1) return lines[0];
      return lines.join("\n\n");
    })
    .filter(Boolean)
    .join("\n\n");

  return `# ${title}\n\n${body}`.trim();
}

function extractSentences(text: string) {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length >= 40 && sentence.length <= 220);
}

function phraseCandidates(sentence: string) {
  const phraseMatches = sentence.match(
    /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3}\b/g,
  );
  const wordMatches = sentence.match(/\b[a-zA-Z]{5,}\b/g) ?? [];
  const significantWords = wordMatches.filter(
    (word) => !STOP_WORDS.has(word.toLowerCase()),
  );
  return [...(phraseMatches ?? []), ...significantWords];
}

function bestPhrase(sentence: string) {
  const candidates = phraseCandidates(sentence).sort((a, b) => b.length - a.length);
  return candidates.find((candidate) => candidate.trim().length >= 5) ?? null;
}

function unique<T>(items: T[]) {
  return [...new Set(items)];
}

export function buildQuizDraftFromText(
  text: string,
  suggestedTitle?: string,
): {
  title: string;
  questions: QuizDraftQuestion[];
} {
  const sentences = extractSentences(text);
  const promptPool = sentences
    .map((sentence) => {
      const answer = bestPhrase(sentence);
      if (!answer) return null;
      const escaped = answer.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const questionText = sentence.replace(new RegExp(escaped), "____");
      if (questionText === sentence) return null;
      return {
        sentence,
        answer,
        questionText: `Complete the statement: ${questionText}`,
      };
    })
    .filter(Boolean) as Array<{
    sentence: string;
    answer: string;
    questionText: string;
  }>;

  const answerPool = unique(promptPool.map((item) => item.answer));
  const questions = promptPool
    .slice(0, 5)
    .map((item) => {
      const distractors = answerPool
        .filter((answer) => answer !== item.answer)
        .slice(0, 3);
      if (distractors.length < 3) return null;
      const options = [item.answer, ...distractors];
      return {
        questionText: item.questionText,
        options,
        correctAnswer: 0,
      };
    })
    .filter(Boolean) as QuizDraftQuestion[];

  if (questions.length === 0) {
    throw new Error(
      "Could not generate quiz questions from this document. Try a longer text-based document.",
    );
  }

  return {
    title: suggestedTitle
      ? `${suggestedTitle} Quiz`
      : "Imported Module Quiz",
    questions,
  };
}
