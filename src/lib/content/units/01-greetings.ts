import type { Unit } from "../types";
import { lesson } from "../helpers";

export const greetings: Unit = {
  id: "greetings",
  title: "Greetings",
  titleJp: "あいさつ",
  emoji: "👋",
  description: "Meet people and get through the day politely.",
  lessons: [
    lesson("greetings-1", "Meeting someone", "Introduce yourself and say where you are from.", [
      ["はじめまして。", "Hajimemashite.", "Nice to meet you.", "처음 뵙겠습니다.",
        "Only used the very first time you meet someone."],
      ["よろしく お[願|ねが]いします。", "Yoroshiku onegaishimasu.", "Pleased to meet you.", "잘 부탁드립니다.",
        "Same idea as Korean 잘 부탁드립니다. English has no real equivalent."],
      ["お[名前|なまえ] は [何|なん] です か。", "Onamae wa nan desu ka?", "What is your name?", "성함이 어떻게 되세요?",
        "The particle は is written 'ha' but pronounced 'wa'."],
      ["[私|わたし] は キム です。", "Watashi wa Kimu desu.", "I am Kim.", "저는 김입니다."],
      ["どこ から [来|き]ました か。", "Doko kara kimashita ka?", "Where are you from?", "어디에서 오셨어요?"],
      ["[韓国|かんこく] から [来|き]ました。", "Kankoku kara kimashita.", "I am from Korea.", "한국에서 왔습니다."],
    ], [
      ["[名前|なまえ]", "namae", "name", "이름"],
      ["[私|わたし]", "watashi", "I, me", "저, 나"],
      ["[韓国|かんこく]", "Kankoku", "Korea", "한국"],
      ["[来|き]ました", "kimashita", "came", "왔습니다"],
    ]),
    lesson("greetings-2", "Through the day", "Greet people in the morning and when leaving.", [
      ["おはよう ございます。", "Ohayou gozaimasu.", "Good morning.", "안녕하세요. (아침 인사)"],
      ["いい [天気|てんき] です ね。", "Ii tenki desu ne.", "Nice weather, isn't it?", "날씨가 좋네요.",
        "ね at the end asks for agreement, like Korean ~네요 / ~죠."],
      ["お[元気|げんき] です か。", "Ogenki desu ka?", "How are you?", "잘 지내세요?"],
      ["はい、 [元気|げんき] です。", "Hai, genki desu.", "Yes, I am fine.", "네, 잘 지내요.",
        "Drop the polite お when talking about yourself."],
      ["お[先|さき]に [失礼|しつれい]します。", "Osaki ni shitsurei shimasu.", "Excuse me for leaving before you.", "먼저 실례하겠습니다.",
        "Said when you leave work before others."],
      ["お[疲|つか]れさま でした。", "Otsukaresama deshita.", "Thank you for your hard work.", "수고하셨습니다."],
    ], [
      ["[天気|てんき]", "tenki", "weather", "날씨"],
      ["[元気|げんき]", "genki", "well, healthy", "건강함"],
      ["[失礼|しつれい]", "shitsurei", "excuse me, rudeness", "실례"],
      ["お[疲|つか]れさま", "otsukaresama", "thanks for your work", "수고"],
    ]),
  ],
};
