/**
 * The particle cheat sheet ("Korean bridge") on the Words page.
 *
 * One entry per core particle: its pattern as a formula, how it maps to
 * Korean, a tip about where the two languages differ, and everyday
 * examples. Examples use the same markup as lessons and are checked by
 * `npm test` (tests/dictionary.test.ts).
 *
 * The short facts about each particle (pronunciation, Korean equivalent,
 * colour) live in src/lib/grammar.ts so lessons can use them too.
 */
import type { LineTuple } from "./helpers";

/** One piece of a formula: a slot to fill in, or a particle / fixed word. */
export type FormulaPart = { slot: string } | { text: string };

export interface ParticleGuide {
  /** Key into PARTICLES in src/lib/grammar.ts. */
  particle: "は" | "が" | "を" | "の" | "に" | "で";
  /** The pattern, e.g. [Place] で [Object] を [Verb]. */
  formula: FormulaPart[];
  /** The same pattern in Korean, e.g. "[장소]에서 [목적어]을/를 [동사]". */
  formulaKo: string;
  /** Where Japanese and Korean agree, and where they do not. */
  tip: string;
  examples: { jp: string; romaji: string; en: string; ko: string }[];
}

const s = (slot: string): FormulaPart => ({ slot });
const t = (text: string): FormulaPart => ({ text });
const examples = (tuples: LineTuple[]) => tuples.map(([jp, romaji, en, ko]) => ({ jp, romaji, en, ko }));

export const PARTICLE_GUIDES: ParticleGuide[] = [
  {
    particle: "は",
    formula: [s("Topic"), t("は"), s("Comment"), t("です")],
    formulaKo: "[주제]은/는 [설명]이에요",
    tip: "Works like 은/는: it marks what you are talking about, often something already known. Written は but pronounced 'wa'.",
    examples: examples([
      ["[私|わたし] は [学生|がくせい] です。", "Watashi wa gakusei desu.", "I am a student.", "저는 학생이에요."],
      ["トイレ は どこ です か。", "Toire wa doko desu ka?", "Where is the restroom?", "화장실은 어디예요?"],
      ["[今日|きょう] は [暑|あつ]い です ね。", "Kyou wa atsui desu ne.", "It's hot today, isn't it?", "오늘은 덥네요."],
    ]),
  },
  {
    particle: "が",
    formula: [s("Subject"), t("が"), s("あります / 好きです / 痛いです")],
    formulaKo: "[주어]이/가 [있어요 / 아파요]",
    tip: "Like 이/가 for new information and for what exists or hurts. Trap: with 好き (like) and 分かる (understand) Japanese uses が where Korean uses 을/를.",
    examples: examples([
      ["[頭|あたま] が [痛|いた]い です。", "Atama ga itai desu.", "My head hurts.", "머리가 아파요."],
      ["[猫|ねこ] が [好|す]き です。", "Neko ga suki desu.", "I like cats.", "고양이를 좋아해요."],
      ["[近|ちか]く に コンビニ が あります。", "Chikaku ni konbini ga arimasu.", "There is a convenience store nearby.", "근처에 편의점이 있어요."],
    ]),
  },
  {
    particle: "を",
    formula: [s("Object"), t("を"), s("Verb")],
    formulaKo: "[목적어]을/를 [동사]",
    tip: "Exactly like 을/를 for the object of a verb. It also marks a place you move through: 道を渡る = 길을 건너다. Pronounced 'o'.",
    examples: examples([
      ["[水|みず] を ください。", "Mizu o kudasai.", "Water, please.", "물 주세요."],
      ["[写真|しゃしん] を [撮|と]ります。", "Shashin o torimasu.", "I take a photo.", "사진을 찍어요."],
      ["[道|みち] を [渡|わた]ります。", "Michi o watarimasu.", "I cross the road.", "길을 건너요."],
    ]),
  },
  {
    particle: "の",
    formula: [s("Owner / Place"), t("の"), s("Thing")],
    formulaKo: "[소유자](의) [명사]",
    tip: "Like 의, but Japanese almost never drops it where Korean does: 駅の前 = 역 앞, 私の傘 = 제 우산.",
    examples: examples([
      ["[私|わたし] の [傘|かさ] です。", "Watashi no kasa desu.", "It's my umbrella.", "제 우산이에요."],
      ["[駅|えき] の [前|まえ] で [待|ま]ちます。", "Eki no mae de machimasu.", "I'll wait in front of the station.", "역 앞에서 기다릴게요."],
      ["[日本|にほん] の [食|た]べ[物|もの] が [好|す]き です。", "Nihon no tabemono ga suki desu.", "I like Japanese food.", "일본 음식을 좋아해요."],
    ]),
  },
  {
    particle: "に",
    formula: [s("Place / Time / Person"), t("に"), s("Verb")],
    formulaKo: "[장소/시간]에 · [사람]에게 [동사]",
    tip: "Like 에 for destinations, times and where something is, and 에게 for people. Trap: 乗る (ride) and 会う (meet) take に, while Korean uses 을/를: 電車に乗る = 전철을 타다.",
    examples: examples([
      ["[駅|えき] に [行|い]きます。", "Eki ni ikimasu.", "I'm going to the station.", "역에 가요."],
      ["[七時|しちじ] に [起|お]きます。", "Shichiji ni okimasu.", "I get up at seven.", "7시에 일어나요."],
      ["[電車|でんしゃ] に [乗|の]ります。", "Densha ni norimasu.", "I take the train.", "전철을 타요."],
    ]),
  },
  {
    particle: "で",
    formula: [s("Place"), t("で"), s("Object"), t("を"), s("Verb")],
    formulaKo: "[장소]에서 [목적어]을/를 [동사]",
    tip: "Two jobs, two Korean endings: where an action happens (에서) and the means or tool (으로). Compare 駅にいます (역에 있어요) with 駅で待ちます (역에서 기다려요).",
    examples: examples([
      ["コンビニ で [水|みず] を [買|か]います。", "Konbini de mizu o kaimasu.", "I buy water at the convenience store.", "편의점에서 물을 사요."],
      ["カード で [払|はら]います。", "Kaado de haraimasu.", "I'll pay by card.", "카드로 낼게요."],
      ["バス で [行|い]きます。", "Basu de ikimasu.", "I'll go by bus.", "버스로 가요."],
    ]),
  },
];

/** Looks up the cheat-sheet entry for a particle, if it has one. */
export function particleGuide(particle: string): ParticleGuide | undefined {
  return PARTICLE_GUIDES.find((g) => g.particle === particle);
}
