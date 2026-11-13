/**
 * Tests for the AI layer with the network and database replaced by fakes,
 * so they run offline and cost nothing.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

// Pretend Gemini is selected and has a key; no database needed.
vi.mock("@/server/settings", () => ({
  getActiveAi: async () => ({ provider: "gemini", model: "test-model", apiKey: "test-key" }),
  getApiKey: async () => "test-key",
}));
vi.mock("@/server/db", () => ({ query: async () => [] }));

import { chatTurn, generateLesson, safeMarkup } from "@/server/ai";
import { gemini } from "@/server/ai/gemini";

/** Builds a fake Gemini HTTP response carrying `text` as the model's answer. */
function geminiReply(text: string, status = 200): Response {
  const body = status === 200 ? { candidates: [{ content: { parts: [{ text }] } }] } : { error: { message: text } };
  return new Response(JSON.stringify(body), { status });
}

const fetchMock = vi.fn<typeof fetch>();
beforeEach(() => vi.stubGlobal("fetch", fetchMock));
afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
});

/** The JSON bodies our code sent to the fake API. */
const sentBodies = () => fetchMock.mock.calls.map(([, init]) => JSON.parse(init!.body as string));

describe("Gemini provider", () => {
  const schema = z.object({ answer: z.string() });
  const request = { system: "s", messages: [{ role: "user" as const, content: "hi" }], schema, effort: "low" as const };
  const credentials = { apiKey: "test-key", model: "test-model" };

  it("sends the key in a header and parses the JSON answer", async () => {
    fetchMock.mockResolvedValueOnce(geminiReply('{"answer":"ok"}'));
    expect(await gemini.generateJson(credentials, request)).toEqual({ answer: "ok" });
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(String(url)).not.toContain("test-key");
    expect((init!.headers as Record<string, string>)["x-goog-api-key"]).toBe("test-key");
  });

  it("accepts JSON wrapped in a code fence", async () => {
    fetchMock.mockResolvedValueOnce(geminiReply('```json\n{"answer":"ok"}\n```'));
    expect(await gemini.generateJson(credentials, request)).toEqual({ answer: "ok" });
  });

  it("asks again once when the answer has the wrong shape", async () => {
    fetchMock.mockResolvedValueOnce(geminiReply('{"wrong":1}')).mockResolvedValueOnce(geminiReply('{"answer":"fixed"}'));
    expect(await gemini.generateJson(credentials, request)).toEqual({ answer: "fixed" });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("turns HTTP errors into readable messages", async () => {
    fetchMock.mockResolvedValueOnce(geminiReply("quota", 429));
    await expect(gemini.generateJson(credentials, request)).rejects.toMatchObject({ status: 429 });
    fetchMock.mockResolvedValueOnce(geminiReply("API key not valid", 400));
    await expect(gemini.generateJson(credentials, request)).rejects.toThrow(/rejected the API key/);
  });
});

describe("generateLesson", () => {
  const line = (jp: string, romaji: string) => ({ jp, romaji, en: "English", ko: "한국어", note: "" });
  const draft = (lines: ReturnType<typeof line>[]) => JSON.stringify({ title: "SIM card", goal: "Buy a SIM card.", lines });

  const good = [
    line("シム カード は あります か。", "Shimu kaado wa arimasu ka?"),
    line("はい、 あります。", "Hai, arimasu."),
    line("いくら です か。", "Ikura desu ka?"),
    line("[三千円|さんぜんえん] です。", "totally wrong romaji"),
  ];

  it("builds a lesson and repairs romaji that does not match the Japanese", async () => {
    fetchMock.mockResolvedValueOnce(geminiReply(draft(good)));
    const lesson = await generateLesson("buying a SIM card", "beginner");
    expect(lesson.id).toMatch(/^my-[a-z0-9]+$/);
    expect(lesson.lines.map((l) => l.speaker)).toEqual(["A", "B", "A", "B"]);
    expect(lesson.lines[0]!.romaji).toBe("Shimu kaado wa arimasu ka?"); // kept
    expect(lesson.lines[3]!.romaji).toBe("Sanzenen desu."); // rebuilt from the furigana
  });

  it("sends the draft back for correction when kanji lack furigana", async () => {
    const bad = [...good.slice(0, 3), line("三千円 です。", "Sanzen en desu.")];
    fetchMock.mockResolvedValueOnce(geminiReply(draft(bad))).mockResolvedValueOnce(geminiReply(draft(good)));
    const lesson = await generateLesson("buying a SIM card", "beginner");
    expect(lesson.lines).toHaveLength(4);
    // The second request must tell the model what was wrong.
    expect(JSON.stringify(sentBodies()[1].contents)).toContain("kanji without a reading");
  });

  it("gives up with a clear error after two bad drafts", async () => {
    const bad = [line("駅", "eki"), line("駅", "eki"), line("駅", "eki"), line("駅", "eki")];
    fetchMock.mockImplementation(async () => geminiReply(draft(bad)));
    await expect(generateLesson("x y z", "beginner")).rejects.toThrow(/formatting mistakes/);
  });
});

describe("chatTurn", () => {
  const scenario = { id: "t", title: "T", emoji: "", setting: "A shop", aiRole: "clerk", userRole: "customer" };
  const turn = {
    reply: { jp: "いらっしゃいませ。", romaji: "Irasshaimase.", en: "Welcome.", ko: "어서 오세요." },
    feedback: { verdict: "good", corrected: "", correctedRomaji: "", note: "Nice." },
    suggestions: [{ jp: "これ を ください。", romaji: "Kore o kudasai.", en: "This, please." }],
    finished: false,
  };

  it("never shows feedback on the opening line", async () => {
    fetchMock.mockResolvedValueOnce(geminiReply(JSON.stringify(turn)));
    const result = await chatTurn(scenario, []);
    expect(result.feedback.verdict).toBe("none");
  });

  it("sends the history as alternating turns ending with the learner", async () => {
    fetchMock.mockResolvedValueOnce(geminiReply(JSON.stringify(turn)));
    await chatTurn(scenario, [
      { role: "ai", text: "[何|なに] に します か。" },
      { role: "user", text: "kore o kudasai" },
    ]);
    const contents = sentBodies()[0].contents as { role: string; parts: { text: string }[] }[];
    expect(contents.map((c) => c.role)).toEqual(["user", "model", "user"]);
    expect(contents[1]!.parts[0]!.text).toBe("何にしますか。"); // markup removed for the model
    expect(contents[2]!.parts[0]!.text).toBe("kore o kudasai");
  });
});

describe("safeMarkup", () => {
  it("keeps valid markup and flattens invalid markup to plain text", () => {
    expect(safeMarkup("[駅|えき] は どこ")).toBe("[駅|えき] は どこ");
    expect(safeMarkup("駅 は [何処|doko]")).toBe("駅 は 何処");
  });
});
