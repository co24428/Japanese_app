import type { Unit } from "../types";
import { lesson } from "../helpers";

export const restaurant: Unit = {
  id: "restaurant",
  title: "Restaurant",
  titleJp: "レストラン",
  emoji: "🍜",
  description: "Get a table, order, and pay.",
  lessons: [
    lesson("restaurant-1", "Ordering", "Say how many people and order food and a drink.", [
      ["[何名様|なんめいさま] です か。", "Nanmeisama desu ka?", "How many people?", "몇 분이세요?"],
      ["[二人|ふたり] です。", "Futari desu.", "Two people.", "두 명입니다.",
        "One person is ひとり, two is ふたり. From three: さんにん, よにん ..."],
      ["ご[注文|ちゅうもん] は お[決|き]まり です か。", "Gochuumon wa okimari desu ka?", "Have you decided on your order?", "주문 정하셨어요?"],
      ["ラーメン を [一|ひと]つ ください。", "Raamen o hitotsu kudasai.", "One ramen, please.", "라멘 하나 주세요."],
      ["お[飲|の]み[物|もの] は いかが です か。", "Onomimono wa ikaga desu ka?", "Would you like something to drink?", "음료는 어떠세요?"],
      ["お[水|みず] を お[願|ねが]いします。", "Omizu o onegaishimasu.", "Water, please.", "물 부탁드립니다."],
    ], [
      ["[二人|ふたり]", "futari", "two people", "두 명"],
      ["[注文|ちゅうもん]", "chuumon", "order", "주문"],
      ["お[飲|の]み[物|もの]", "onomimono", "drink", "음료"],
      ["お[水|みず]", "omizu", "water", "물"],
    ]),
    lesson("restaurant-2", "Recommendations and the bill", "Ask what is good and ask for the check.", [
      ["おすすめ は [何|なん] です か。", "Osusume wa nan desu ka?", "What do you recommend?", "추천 메뉴는 뭐예요?"],
      ["この [定食|ていしょく] が [人気|にんき] です。", "Kono teishoku ga ninki desu.", "This set meal is popular.", "이 정식이 인기 있어요."],
      ["すみません、 お[会計|かいけい] を お[願|ねが]いします。", "Sumimasen, okaikei o onegaishimasu.", "Excuse me, the check, please.", "저기요, 계산 부탁드립니다.",
        "すみません is how you call staff, like 저기요."],
      ["はい、 [少々|しょうしょう] お[待|ま]ち ください。", "Hai, shoushou omachi kudasai.", "Certainly, one moment, please.", "네, 잠시만 기다려 주세요."],
      ["[別々|べつべつ] に [払|はら]えます か。", "Betsubetsu ni haraemasu ka?", "Can we pay separately?", "따로따로 계산할 수 있어요?"],
      ["はい、 できます。", "Hai, dekimasu.", "Yes, you can.", "네, 가능합니다."],
    ], [
      ["おすすめ", "osusume", "recommendation", "추천"],
      ["[定食|ていしょく]", "teishoku", "set meal", "정식"],
      ["お[会計|かいけい]", "okaikei", "the bill", "계산"],
      ["[別々|べつべつ]", "betsubetsu", "separately", "따로따로"],
    ]),
  ],
};
