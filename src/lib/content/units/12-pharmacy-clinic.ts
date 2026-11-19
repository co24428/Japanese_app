import type { Unit } from "../types";
import { lesson } from "../helpers";

export const pharmacyClinic: Unit = {
  id: "pharmacy-clinic",
  title: "Pharmacy and clinic",
  titleJp: "くすりや・びょういん",
  emoji: "💊",
  description: "Explain your symptoms and buy medicine.",
  lessons: [
    lesson(
      "pharmacy-clinic-1",
      "At the pharmacy",
      "Ask for medicine and understand how to take it.",
      [
        ["[頭痛|ずつう] の [薬|くすり] は あります か。", "Zutsuu no kusuri wa arimasu ka?", "Do you have medicine for a headache?", "두통약 있어요?"],
        ["はい、 こちら です。 [一日|いちにち] [三回|さんかい] です。", "Hai, kochira desu. Ichinichi sankai desu.", "Yes, here. Three times a day.", "네, 이거예요. 하루 세 번이에요."],
        ["[風邪|かぜ] を ひきました。 [喉|のど] が [痛|いた]い です。", "Kaze o hikimashita. Nodo ga itai desu.", "I caught a cold. My throat hurts.", "감기에 걸렸어요. 목이 아파요.",
          "風邪をひく takes を, while Korean says 감기에 걸리다 with 에."],
        ["この [風邪薬|かぜぐすり] が よく [効|き]きます よ。", "Kono kazegusuri ga yoku kikimasu yo.", "This cold medicine works well.", "이 감기약이 잘 들어요."],
        ["[食後|しょくご] に [飲|の]んで ください。", "Shokugo ni nonde kudasai.", "Please take it after meals.", "식후에 드세요.",
          "Medicine is 'drunk' in Japanese (薬を飲む), where Korean 'eats' it (약을 먹다)."],
        ["[分|わ]かりました。 [眠|ねむ]く なります か。", "Wakarimashita. Nemuku narimasu ka?", "Understood. Will it make me sleepy?", "알겠습니다. 졸리게 되나요?"],
      ],
      [
        ["[薬|くすり]", "kusuri", "medicine", "약"],
        ["[頭痛|ずつう]", "zutsuu", "headache", "두통"],
        ["[風邪|かぜ]", "kaze", "a cold", "감기"],
        ["[喉|のど]", "nodo", "throat", "목"],
        ["[食後|しょくご]", "shokugo", "after meals", "식후"],
      ],
    ),
    lesson(
      "pharmacy-clinic-2",
      "At the clinic",
      "Tell a doctor what hurts and since when.",
      [
        ["[今日|きょう] は どう されました か。", "Kyou wa dou saremashita ka?", "What brings you in today?", "오늘은 어디가 불편하세요?",
          "The standard opening question from doctors and nurses."],
        ["[昨日|きのう] から お[腹|なか] が [痛|いた]い です。", "Kinou kara onaka ga itai desu.", "My stomach has hurt since yesterday.", "어제부터 배가 아파요.",
          "から after a time means 'since', like Korean 부터."],
        ["[熱|ねつ] は あります か。", "Netsu wa arimasu ka?", "Do you have a fever?", "열은 있어요?"],
        ["[少|すこ]し あります。 [三十八度|さんじゅうはちど] です。", "Sukoshi arimasu. Sanjuuhachido desu.", "A little. It is 38 degrees.", "조금 있어요. 38도예요."],
        ["[保険証|ほけんしょう] を お[持|も]ち です か。", "Hokenshou o omochi desu ka?", "Do you have your health insurance card?", "보험증 가지고 계세요?",
          "お持ちですか is the polite 'do you have it with you?'."],
        ["はい、 これ です。", "Hai, kore desu.", "Yes, here it is.", "네, 여기 있어요."],
      ],
      [
        ["お[腹|なか]", "onaka", "stomach", "배"],
        ["[熱|ねつ]", "netsu", "fever", "열"],
        ["[昨日|きのう]", "kinou", "yesterday", "어제"],
        ["[保険証|ほけんしょう]", "hokenshou", "health insurance card", "보험증"],
      ],
    ),
  ],
};
