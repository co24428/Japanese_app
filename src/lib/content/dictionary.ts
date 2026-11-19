/**
 * The everyday dictionary on the Words page.
 *
 * Each entry: [id, japanese markup, romaji, English, Korean, note?]
 * Clothes also name the verb used to "wear" them (see WEARING_VERBS).
 *
 * IDs are stored in the review database when you press "Save to Review",
 * so never change an existing id; add new words with new ids.
 * `npm test` checks every entry (tests/dictionary.test.ts).
 */
import type { Phrase } from "./types";

export const DICTIONARY_CATEGORIES = [
  { id: "places", title: "Places & buildings", emoji: "🏙️" },
  { id: "nature", title: "Nature & street objects", emoji: "🌳" },
  { id: "clothes", title: "Clothes & accessories", emoji: "👕" },
  { id: "verbs", title: "Everyday verbs", emoji: "🏃" },
] as const;

export type DictionaryCategory = (typeof DICTIONARY_CATEGORIES)[number]["id"];

/**
 * Japanese uses different verbs for "wear" depending on where the item goes.
 * Korean splits them differently, which is why each has a Korean note.
 */
export const WEARING_VERBS = {
  kiru: {
    jp: "[着|き]る",
    romaji: "kiru",
    en: "wear: tops, coats, dresses",
    ko: "입다",
    note: "Upper body or whole body. Korean 입다 also covers trousers, but Japanese does not.",
  },
  haku: {
    jp: "[履|は]く",
    romaji: "haku",
    en: "wear: trousers, skirts, socks, shoes",
    ko: "입다 / 신다",
    note: "Anything from the waist down. Korean uses 입다 for trousers and 신다 for shoes; Japanese uses 履く for both.",
  },
  kaburu: {
    jp: "[被|かぶ]る",
    romaji: "kaburu",
    en: "wear on the head: hats, caps",
    ko: "쓰다",
    note: "Korean 쓰다 covers hats and glasses; Japanese splits them into 被る and 掛ける.",
  },
  kakeru: {
    jp: "[掛|か]ける",
    romaji: "kakeru",
    en: "wear: glasses, sunglasses",
    ko: "쓰다",
    note: "Literally 'hang': glasses hang on your ears.",
  },
  motsu: {
    jp: "[持|も]つ",
    romaji: "motsu",
    en: "hold, carry: bags, umbrellas",
    ko: "들다",
    note: "Bags are carried, not worn. A backpack can also be 背負う (메다).",
  },
  suru: {
    jp: "する",
    romaji: "suru",
    en: "wear: watches, scarves, ties",
    ko: "차다 / 하다 / 매다",
    note: "Accessories simply take する: 時計をする, マフラーをする.",
  },
} as const;

export type WearingVerb = keyof typeof WEARING_VERBS;

export interface DictionaryEntry {
  /** Stable id, e.g. "bank". Stored in the review queue as "words:bank". */
  id: string;
  category: DictionaryCategory;
  jp: string;
  romaji: string;
  en: string;
  ko: string;
  note?: string;
  /** Clothes only: the verb used to wear it. */
  wear?: WearingVerb;
}

type Tuple = [id: string, jp: string, romaji: string, en: string, ko: string, note?: string];

function entries(category: DictionaryCategory, tuples: Tuple[]): DictionaryEntry[] {
  return tuples.map(([id, jp, romaji, en, ko, note]) => ({ id, category, jp, romaji, en, ko, ...(note ? { note } : {}) }));
}

function clothes(tuples: [...Tuple, WearingVerb][]): DictionaryEntry[] {
  return tuples.map(([id, jp, romaji, en, ko, note, wear]) => ({
    id,
    category: "clothes",
    jp,
    romaji,
    en,
    ko,
    ...(note ? { note } : {}),
    wear,
  }));
}

export const DICTIONARY: DictionaryEntry[] = [
  ...entries("places", [
    ["bank", "[銀行|ぎんこう]", "ginkou", "bank", "은행"],
    ["post-office", "[郵便局|ゆうびんきょく]", "yuubinkyoku", "post office", "우체국", "Look for the red 〒 sign."],
    ["station", "[駅|えき]", "eki", "station", "역"],
    ["police-box", "[交番|こうばん]", "kouban", "police box", "파출소", "Small neighbourhood police post; go here for lost items and directions."],
    ["hospital", "[病院|びょういん]", "byouin", "hospital, clinic", "병원", "Careful: 美容院 (biyouin) is a hair salon."],
    ["pharmacy", "[薬局|やっきょく]", "yakkyoku", "pharmacy", "약국", "Drugstores are also called ドラッグストア."],
    ["konbini", "コンビニ", "konbini", "convenience store", "편의점"],
    ["supermarket", "スーパー", "suupaa", "supermarket", "슈퍼마켓"],
    ["library", "[図書館|としょかん]", "toshokan", "library", "도서관"],
    ["park", "[公園|こうえん]", "kouen", "park", "공원"],
    ["hair-salon", "[美容院|びよういん]", "biyouin", "hair salon", "미용실"],
    ["crosswalk", "[横断歩道|おうだんほどう]", "oudanhodou", "crosswalk", "횡단보도"],
    ["traffic-light", "[信号|しんごう]", "shingou", "traffic light", "신호등", "Green lights are often called 青 (blue) in Japanese."],
    ["intersection", "[交差点|こうさてん]", "kousaten", "intersection", "교차로"],
    ["corner", "[角|かど]", "kado", "corner", "모퉁이"],
    ["railway-crossing", "[踏切|ふみきり]", "fumikiri", "railway crossing", "건널목"],
    ["bus-stop", "バス[停|てい]", "basutei", "bus stop", "버스 정류장"],
    ["pedestrian-bridge", "[歩道橋|ほどうきょう]", "hodoukyou", "pedestrian bridge", "육교"],
  ]),
  ...entries("nature", [
    ["tree", "[木|き]", "ki", "tree", "나무"],
    ["leaf", "[葉|は]っぱ", "happa", "leaf", "잎, 이파리"],
    ["flower", "[花|はな]", "hana", "flower", "꽃"],
    ["wind", "[風|かぜ]", "kaze", "wind", "바람", "Same sound as 風邪 (a cold), but a different kanji."],
    ["sky", "[空|そら]", "sora", "sky", "하늘"],
    ["cloud", "[雲|くも]", "kumo", "cloud", "구름"],
    ["rain", "[雨|あめ]", "ame", "rain", "비"],
    ["snow", "[雪|ゆき]", "yuki", "snow", "눈"],
    ["cherry-blossom", "[桜|さくら]", "sakura", "cherry blossom", "벚꽃"],
    ["river", "[川|かわ]", "kawa", "river", "강"],
    ["vending-machine", "[自動販売機|じどうはんばいき]", "jidouhanbaiki", "vending machine", "자판기", "Usually shortened to 自販機 (jihanki)."],
    ["trash-can", "ゴミ[箱|ばこ]", "gomibako", "trash can", "쓰레기통", "Public trash cans are rare in Japan; look near convenience stores."],
    ["bicycle", "[自転車|じてんしゃ]", "jitensha", "bicycle", "자전거"],
    ["sign", "[看板|かんばん]", "kanban", "sign, signboard", "간판"],
  ]),
  ...clothes([
    ["shirt", "シャツ", "shatsu", "shirt", "셔츠", undefined, "kiru"],
    ["coat", "コート", "kooto", "coat", "코트", undefined, "kiru"],
    ["sweater", "セーター", "seetaa", "sweater", "스웨터", undefined, "kiru"],
    ["dress", "ワンピース", "wanpiisu", "dress", "원피스", undefined, "kiru"],
    ["trousers", "ズボン", "zubon", "trousers", "바지", "Korean 입다, but Japanese 履く.", "haku"],
    ["jeans", "ジーンズ", "jiinzu", "jeans", "청바지", undefined, "haku"],
    ["skirt", "スカート", "sukaato", "skirt", "치마", undefined, "haku"],
    ["shoes", "[靴|くつ]", "kutsu", "shoes", "신발", undefined, "haku"],
    ["socks", "[靴下|くつした]", "kutsushita", "socks", "양말", undefined, "haku"],
    ["hat", "[帽子|ぼうし]", "boushi", "hat, cap", "모자", undefined, "kaburu"],
    ["glasses", "[眼鏡|めがね]", "megane", "glasses", "안경", "Korean 쓰다, but Japanese 掛ける.", "kakeru"],
    ["sunglasses", "サングラス", "sangurasu", "sunglasses", "선글라스", undefined, "kakeru"],
    ["bag", "かばん", "kaban", "bag", "가방", undefined, "motsu"],
    ["umbrella", "[傘|かさ]", "kasa", "umbrella", "우산", "An open umbrella is 傘をさす.", "motsu"],
    ["watch", "[腕時計|うでどけい]", "udedokei", "wristwatch", "손목시계", undefined, "suru"],
    ["scarf", "マフラー", "mafuraa", "scarf", "목도리", undefined, "suru"],
    ["tie", "ネクタイ", "nekutai", "necktie", "넥타이", undefined, "suru"],
  ]),
  ...entries("verbs", [
    ["walk", "[歩|ある]く", "aruku", "walk", "걷다"],
    ["cross", "[渡|わた]る", "wataru", "cross (a road, bridge)", "건너다", "The thing you cross takes を: 道を渡る."],
    ["turn", "[曲|ま]がる", "magaru", "turn (a corner)", "돌다", "The corner takes を: 角を曲がる."],
    ["wait", "[待|ま]つ", "matsu", "wait", "기다리다"],
    ["buy", "[買|か]う", "kau", "buy", "사다"],
    ["pay", "[払|はら]う", "harau", "pay", "내다, 지불하다"],
    ["ride", "[乗|の]る", "noru", "ride, get on", "타다", "Takes に: 電車に乗る, where Korean says 전철을 타다."],
    ["get-off", "[降|お]りる", "oriru", "get off", "내리다", "Takes を: 電車を降りる."],
    ["look-for", "[探|さが]す", "sagasu", "look for", "찾다"],
    ["see", "[見|み]る", "miru", "see, look at", "보다"],
    ["take-off", "[脱|ぬ]ぐ", "nugu", "take off (clothes, shoes)", "벗다", "Opposite of all the 'wear' verbs."],
    ["send", "[送|おく]る", "okuru", "send", "보내다"],
    ["withdraw", "[下|お]ろす", "orosu", "withdraw (money)", "인출하다, 뽑다"],
    ["line-up", "[並|なら]ぶ", "narabu", "line up, queue", "줄 서다"],
    ["bloom", "[咲|さ]く", "saku", "bloom", "피다"],
    ["blow", "[吹|ふ]く", "fuku", "blow (wind)", "불다", "風が吹く: the wind blows."],
  ]),
];

/** Lesson id used for dictionary words in the review database. */
export const WORDS_LESSON_ID = "words";

/** "bank" -> "words:bank": the id used in the review queue. */
export function wordPhraseId(entryId: string): string {
  return `${WORDS_LESSON_ID}:${entryId}`;
}

/**
 * Dictionary entries as phrases, so the review system (which works with
 * phrases) can schedule and quiz them like lesson sentences.
 */
export const DICTIONARY_PHRASES: Phrase[] = DICTIONARY.map((entry) => {
  const wear = entry.wear ? WEARING_VERBS[entry.wear] : undefined;
  const note = [entry.note, wear ? `Wear it with ${wear.romaji} (${wear.ko}).` : undefined].filter(Boolean).join(" ");
  return {
    id: wordPhraseId(entry.id),
    lessonId: WORDS_LESSON_ID,
    speaker: "A",
    jp: entry.jp,
    romaji: entry.romaji,
    en: entry.en,
    ko: entry.ko,
    ...(note ? { note } : {}),
  };
});
