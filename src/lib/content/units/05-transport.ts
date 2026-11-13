import type { Unit } from "../types";
import { lesson } from "../helpers";

export const transport: Unit = {
  id: "transport",
  title: "Train and taxi",
  titleJp: "でんしゃ・タクシー",
  emoji: "🚃",
  description: "Buy tickets, find your platform, and take a taxi.",
  lessons: [
    lesson("transport-1", "At the station", "Check the train, buy a ticket, and ask the time.", [
      ["この [電車|でんしゃ] は [新宿|しんじゅく] に [行|い]きます か。", "Kono densha wa Shinjuku ni ikimasu ka?", "Does this train go to Shinjuku?", "이 전철 신주쿠에 가요?"],
      ["いいえ、 [三番線|さんばんせん] です。", "Iie, sanbansen desu.", "No, it is platform 3.", "아니요, 3번 승강장이에요."],
      ["[切符|きっぷ] は どこ で [買|か]えます か。", "Kippu wa doko de kaemasu ka?", "Where can I buy a ticket?", "표는 어디에서 살 수 있어요?"],
      ["あの [券売機|けんばいき] で [買|か]えます。", "Ano kenbaiki de kaemasu.", "You can buy one at that ticket machine.", "저 발매기에서 살 수 있어요."],
      ["[次|つぎ] の [電車|でんしゃ] は [何時|なんじ] です か。", "Tsugi no densha wa nanji desu ka?", "What time is the next train?", "다음 전철은 몇 시예요?"],
      ["[十時|じゅうじ] [五分|ごふん] です。", "Juuji gofun desu.", "It is 10:05.", "10시 5분이에요."],
    ]),
    lesson("transport-2", "In a taxi", "Tell the driver where to go and where to stop.", [
      ["どちら まで です か。", "Dochira made desu ka?", "Where to?", "어디까지 가세요?"],
      ["この [住所|じゅうしょ] まで お[願|ねが]いします。", "Kono juusho made onegaishimasu.", "To this address, please.", "이 주소까지 부탁드립니다.",
        "Show the address on your phone while you say it."],
      ["[空港|くうこう] まで いくら ぐらい です か。", "Kuukou made ikura gurai desu ka?", "About how much is it to the airport?", "공항까지 얼마 정도예요?"],
      ["[五千円|ごせんえん] ぐらい です。", "Gosen en gurai desu.", "About 5,000 yen.", "5천 엔 정도예요."],
      ["ここ で [止|と]めて ください。", "Koko de tomete kudasai.", "Please stop here.", "여기서 세워 주세요."],
      ["はい、 かしこまりました。", "Hai, kashikomarimashita.", "Certainly.", "네, 알겠습니다.",
        "Very polite 'understood', used by staff. You would say わかりました."],
    ]),
  ],
};
