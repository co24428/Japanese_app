import type { Unit } from "../types";
import { lesson } from "../helpers";

export const shopping: Unit = {
  id: "shopping",
  title: "Shopping",
  titleJp: "かいもの",
  emoji: "🛍️",
  description: "Try things on, ask for sizes, and buy tax-free.",
  lessons: [
    lesson("shopping-1", "In a clothes shop", "Say you are just looking, and ask to try something on.", [
      ["[何|なに] か お[探|さが]し です か。", "Nanika osagashi desu ka?", "Are you looking for something?", "뭐 찾으시는 거 있으세요?"],
      ["[見|み]て いる だけ です。", "Mite iru dake desu.", "I am just looking.", "그냥 보고 있어요."],
      ["これ を [試着|しちゃく] して も いい です か。", "Kore o shichaku shite mo ii desu ka?", "May I try this on?", "이거 입어 봐도 돼요?",
        "~ても いいですか asks permission, like ~해도 돼요?"],
      ["はい、 [試着室|しちゃくしつ] は あちら です。", "Hai, shichakushitsu wa achira desu.", "Yes, the fitting room is over there.", "네, 탈의실은 저쪽입니다."],
      ["もっと [大|おお]きい サイズ は あります か。", "Motto ookii saizu wa arimasu ka?", "Do you have a bigger size?", "더 큰 사이즈 있어요?"],
      ["[確認|かくにん] します。 [少々|しょうしょう] お[待|ま]ち ください。", "Kakunin shimasu. Shoushou omachi kudasai.", "I will check. One moment, please.", "확인하겠습니다. 잠시만 기다려 주세요."],
    ], [
      ["[試着|しちゃく]", "shichaku", "trying on", "입어 보기"],
      ["[試着室|しちゃくしつ]", "shichakushitsu", "fitting room", "탈의실"],
      ["サイズ", "saizu", "size", "사이즈"],
      ["[確認|かくにん]", "kakunin", "check", "확인"],
    ]),
    lesson("shopping-2", "Price and tax-free", "Ask the price and handle the tax-free question.", [
      ["これ は いくら です か。", "Kore wa ikura desu ka?", "How much is this?", "이거 얼마예요?"],
      ["[三千円|さんぜんえん] です。", "Sanzen en desu.", "It is 3,000 yen.", "3천 엔입니다.",
        "3,000 is irregular: さんぜん, not さんせん."],
      ["[免税|めんぜい] は できます か。", "Menzei wa dekimasu ka?", "Can I get it tax-free?", "면세 돼요?"],
      ["はい、 パスポート を [見|み]せて ください。", "Hai, pasupooto o misete kudasai.", "Yes, please show me your passport.", "네, 여권을 보여 주세요."],
      ["プレゼント [用|よう] です か。", "Purezento you desu ka?", "Is it a gift?", "선물용이세요?"],
      ["いいえ、 [自分用|じぶんよう] です。", "Iie, jibun you desu.", "No, it is for myself.", "아니요, 제가 쓸 거예요."],
    ], [
      ["いくら", "ikura", "how much", "얼마"],
      ["[免税|めんぜい]", "menzei", "tax-free", "면세"],
      ["パスポート", "pasupooto", "passport", "여권"],
      ["[自分用|じぶんよう]", "jibun you", "for myself", "제가 쓸 것"],
    ]),
  ],
};
