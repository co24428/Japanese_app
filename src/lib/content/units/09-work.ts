import type { Unit } from "../types";
import { lesson } from "../helpers";

export const work: Unit = {
  id: "work",
  title: "At work",
  titleJp: "しごと",
  emoji: "💼",
  description: "Polite requests, meetings, and deadlines.",
  lessons: [
    lesson("work-1", "Asking a colleague", "Get someone's attention and ask them to check something.", [
      ["[今|いま]、 お[時間|じかん] よろしい です か。", "Ima, ojikan yoroshii desu ka?", "Do you have a moment now?", "지금 시간 괜찮으세요?"],
      ["はい、 [大丈夫|だいじょうぶ] です よ。", "Hai, daijoubu desu yo.", "Yes, that is fine.", "네, 괜찮아요."],
      ["この [資料|しりょう] を [確認|かくにん] して もらえます か。", "Kono shiryou o kakunin shite moraemasu ka?", "Could you check this document?", "이 자료 확인해 주실 수 있어요?"],
      ["[分|わ]かりました。 [後|あと] で [見|み]ます。", "Wakarimashita. Ato de mimasu.", "Understood. I will look at it later.", "알겠습니다. 나중에 볼게요."],
      ["[会議|かいぎ] は [何時|なんじ] から です か。", "Kaigi wa nanji kara desu ka?", "What time does the meeting start?", "회의는 몇 시부터예요?"],
      ["[午後|ごご] [三時|さんじ] から です。", "Gogo sanji kara desu.", "From 3 p.m.", "오후 3시부터입니다."],
    ], [
      ["[時間|じかん]", "jikan", "time", "시간"],
      ["[資料|しりょう]", "shiryou", "document", "자료"],
      ["[会議|かいぎ]", "kaigi", "meeting", "회의"],
      ["[午後|ごご]", "gogo", "afternoon, p.m.", "오후"],
    ]),
    lesson("work-2", "Deadlines and help", "Ask about a deadline, offer help, and ask for a day off.", [
      ["[締|し]め[切|き]り は いつ です か。", "Shimekiri wa itsu desu ka?", "When is the deadline?", "마감이 언제예요?"],
      ["[来週|らいしゅう] の [金曜日|きんようび] です。", "Raishuu no kin'youbi desu.", "Next Friday.", "다음 주 금요일이에요."],
      ["[手伝|てつだ]いましょう か。", "Tetsudaimashou ka?", "Shall I help you?", "도와드릴까요?",
        "~ましょうか offers to do something, like ~(으)ㄹ까요?"],
      ["ありがとう ございます。 [助|たす]かります。", "Arigatou gozaimasu. Tasukarimasu.", "Thank you. That helps a lot.", "감사합니다. 도움이 됩니다."],
      ["[明日|あした]、 [休|やす]み を [取|と]って も いい です か。", "Ashita, yasumi o totte mo ii desu ka?", "May I take tomorrow off?", "내일 휴가 내도 될까요?"],
      ["はい、 いい です よ。", "Hai, ii desu yo.", "Sure, that is fine.", "네, 괜찮아요."],
    ], [
      ["[締|し]め[切|き]り", "shimekiri", "deadline", "마감"],
      ["[来週|らいしゅう]", "raishuu", "next week", "다음 주"],
      ["[手伝|てつだ]う", "tetsudau", "help", "돕다"],
      ["[休|やす]み", "yasumi", "day off", "휴가"],
    ]),
  ],
};
