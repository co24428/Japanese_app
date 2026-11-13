import type { Unit } from "../types";
import { lesson } from "../helpers";

export const convenienceStore: Unit = {
  id: "konbini",
  title: "Convenience store",
  titleJp: "コンビニ",
  emoji: "🏪",
  description: "Answer the questions the clerk always asks.",
  lessons: [
    lesson("konbini-1", "At the register", "Buy something and answer about bags and heating.", [
      ["いらっしゃいませ。", "Irasshaimase.", "Welcome.", "어서 오세요.",
        "Staff say this to every customer. You do not need to reply."],
      ["これ を ください。", "Kore o kudasai.", "This one, please.", "이거 주세요.",
        "The particle を is pronounced 'o'."],
      ["[袋|ふくろ] は いります か。", "Fukuro wa irimasu ka?", "Do you need a bag?", "봉투 필요하세요?"],
      ["いいえ、 [大丈夫|だいじょうぶ] です。", "Iie, daijoubu desu.", "No, I am fine.", "아니요, 괜찮습니다.",
        "大丈夫です is the soft way to refuse, like 괜찮아요."],
      ["お[弁当|べんとう] を [温|あたた]めます か。", "Obentou o atatamemasu ka?", "Shall I heat up your lunch box?", "도시락 데워 드릴까요?"],
      ["はい、 お[願|ねが]いします。", "Hai, onegaishimasu.", "Yes, please.", "네, 부탁드립니다."],
    ]),
    lesson("konbini-2", "Paying", "Ask the price and pay by card.", [
      ["[全部|ぜんぶ] で いくら です か。", "Zenbu de ikura desu ka?", "How much is it altogether?", "전부 얼마예요?"],
      ["[八百円|はっぴゃくえん] です。", "Happyaku en desu.", "It is 800 yen.", "800엔입니다.",
        "800 is irregular: はっぴゃく, not はちひゃく."],
      ["カード で [払|はら]えます か。", "Kaado de haraemasu ka?", "Can I pay by card?", "카드로 계산할 수 있어요?"],
      ["はい、 こちら に タッチ して ください。", "Hai, kochira ni tatchi shite kudasai.", "Yes, please tap here.", "네, 여기에 터치해 주세요."],
      ["レシート は いります か。", "Reshiito wa irimasu ka?", "Do you need a receipt?", "영수증 필요하세요?"],
      ["はい、 ください。", "Hai, kudasai.", "Yes, please.", "네, 주세요."],
    ]),
  ],
};
