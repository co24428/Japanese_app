import type { Unit } from "../types";
import { lesson } from "../helpers";

export const hotel: Unit = {
  id: "hotel",
  title: "Hotel",
  titleJp: "ホテル",
  emoji: "🏨",
  description: "Check in, ask about breakfast, and leave your luggage.",
  lessons: [
    lesson("hotel-1", "Checking in", "Check in with a reservation and ask about breakfast.", [
      ["チェックイン を お[願|ねが]いします。", "Chekkuin o onegaishimasu.", "I would like to check in, please.", "체크인 부탁드립니다."],
      ["お[名前|なまえ] を お[願|ねが]いします。", "Onamae o onegaishimasu.", "Your name, please.", "성함 부탁드립니다."],
      ["キム です。 [予約|よやく] して います。", "Kimu desu. Yoyaku shite imasu.", "It is Kim. I have a reservation.", "김입니다. 예약했습니다."],
      ["はい、 [二泊|にはく] です ね。", "Hai, nihaku desu ne.", "Yes, two nights, correct?", "네, 2박이시죠?"],
      ["[朝食|ちょうしょく] は [何時|なんじ] から です か。", "Choushoku wa nanji kara desu ka?", "What time does breakfast start?", "조식은 몇 시부터예요?"],
      ["[七時|しちじ] から [十時|じゅうじ] まで です。", "Shichiji kara juuji made desu.", "From seven to ten.", "7시부터 10시까지입니다.",
        "から ... まで = from ... until, same order as Korean 부터 ... 까지."],
    ]),
    lesson("hotel-2", "During your stay", "Ask for the Wi-Fi password and leave your bags.", [
      ["ワイファイ の パスワード は [何|なん] です か。", "Waifai no pasuwaado wa nan desu ka?", "What is the Wi-Fi password?", "와이파이 비밀번호가 뭐예요?"],
      ["この カード に [書|か]いて あります。", "Kono kaado ni kaite arimasu.", "It is written on this card.", "이 카드에 적혀 있습니다."],
      ["[荷物|にもつ] を [預|あず]かって もらえます か。", "Nimotsu o azukatte moraemasu ka?", "Could you keep my luggage?", "짐을 맡아 주실 수 있어요?",
        "~て もらえますか is a polite way to ask a favour."],
      ["はい、 お[預|あず]かり します。", "Hai, oazukari shimasu.", "Yes, we will keep it for you.", "네, 맡아 드리겠습니다."],
      ["チェックアウト は [何時|なんじ] です か。", "Chekkuauto wa nanji desu ka?", "What time is check-out?", "체크아웃은 몇 시예요?"],
      ["[十一時|じゅういちじ] です。", "Juuichiji desu.", "It is 11 o'clock.", "11시입니다."],
    ]),
  ],
};
