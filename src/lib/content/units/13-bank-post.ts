import type { Unit } from "../types";
import { lesson } from "../helpers";

export const bankPost: Unit = {
  id: "bank-post",
  title: "Bank, post office and ATM",
  titleJp: "ぎんこう・ゆうびんきょく",
  emoji: "🏦",
  description: "Withdraw cash, send packages and wait your turn.",
  lessons: [
    lesson(
      "bank-post-1",
      "At the bank",
      "Withdraw cash and take a number to wait.",
      [
        ["[現金|げんきん] を [下|お]ろしたい です。", "Genkin o oroshitai desu.", "I want to withdraw cash.", "현금을 뽑고 싶어요.",
          "～たいです means 'I want to', like Korean ～고 싶어요."],
        ["あちら の [機械|きかい] で [下|お]ろせます よ。", "Achira no kikai de orosemasu yo.", "You can withdraw it at that machine over there.", "저쪽 기계에서 뽑을 수 있어요.",
          "で marks where an action happens, like Korean 에서."],
        ["[海外|かいがい] の カード は [使|つか]えます か。", "Kaigai no kaado wa tsukaemasu ka?", "Can I use a foreign card?", "해외 카드 쓸 수 있어요?"],
        ["はい、 [手数料|てすうりょう] が かかります。", "Hai, tesuuryou ga kakarimasu.", "Yes, there is a fee.", "네, 수수료가 들어요."],
        ["[番号札|ばんごうふだ] を お[取|と]り ください。", "Bangoufuda o otori kudasai.", "Please take a number ticket.", "번호표를 뽑아 주세요."],
        ["[何分|なんぷん] ぐらい [待|ま]ちます か。", "Nanpun gurai machimasu ka?", "About how many minutes is the wait?", "몇 분 정도 기다려요?"],
      ],
      [
        ["[現金|げんきん]", "genkin", "cash", "현금"],
        ["[下|お]ろす", "orosu", "withdraw (money)", "인출하다, 뽑다"],
        ["[手数料|てすうりょう]", "tesuuryou", "fee", "수수료"],
        ["[番号札|ばんごうふだ]", "bangoufuda", "number ticket", "번호표"],
      ],
    ),
    lesson(
      "bank-post-2",
      "At the post office",
      "Send a package abroad and buy stamps.",
      [
        ["この [荷物|にもつ] を [韓国|かんこく] に [送|おく]りたい です。", "Kono nimotsu o Kankoku ni okuritai desu.", "I want to send this package to Korea.", "이 짐을 한국에 보내고 싶어요."],
        ["[航空便|こうくうびん] です か、 [船便|ふなびん] です か。", "Koukuubin desu ka, funabin desu ka?", "By air or by sea?", "항공편이에요, 배편이에요?"],
        ["[何日|なんにち] ぐらい かかります か。", "Nannichi gurai kakarimasu ka?", "About how many days does it take?", "며칠 정도 걸려요?"],
        ["[航空便|こうくうびん] なら [一週間|いっしゅうかん] ぐらい です。", "Koukuubin nara isshuukan gurai desu.", "About a week by air.", "항공편이면 일주일 정도예요.",
          "なら means 'if it is ...', like Korean (이)면."],
        ["[切手|きって] を [五枚|ごまい] ください。", "Kitte o gomai kudasai.", "Five stamps, please.", "우표 다섯 장 주세요.",
          "枚 counts flat things (stamps, tickets, bags), like Korean 장."],
        ["[全部|ぜんぶ] で [四百五十円|よんひゃくごじゅうえん] です。", "Zenbu de yonhyaku gojuu en desu.", "That is 450 yen altogether.", "전부 450엔입니다."],
      ],
      [
        ["[荷物|にもつ]", "nimotsu", "package, luggage", "짐, 소포"],
        ["[送|おく]る", "okuru", "send", "보내다"],
        ["[航空便|こうくうびん]", "koukuubin", "airmail", "항공편"],
        ["[切手|きって]", "kitte", "stamp", "우표"],
      ],
    ),
  ],
};
