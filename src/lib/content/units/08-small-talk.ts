import type { Unit } from "../types";
import { lesson } from "../helpers";

export const smallTalk: Unit = {
  id: "smalltalk",
  title: "Small talk",
  titleJp: "ざつだん",
  emoji: "💬",
  description: "Talk about work, hobbies, and Japan.",
  lessons: [
    lesson("smalltalk-1", "About you", "Answer the questions people ask visitors.", [
      ["お[仕事|しごと] は [何|なん] です か。", "Oshigoto wa nan desu ka?", "What do you do for work?", "무슨 일 하세요?"],
      ["[会社員|かいしゃいん] です。", "Kaishain desu.", "I am an office worker.", "회사원이에요."],
      ["[日本|にほん] は [初|はじ]めて です か。", "Nihon wa hajimete desu ka?", "Is this your first time in Japan?", "일본은 처음이세요?"],
      ["いいえ、 [二回目|にかいめ] です。", "Iie, nikaime desu.", "No, it is my second time.", "아니요, 두 번째예요."],
      ["[日本語|にほんご] が [上手|じょうず] です ね。", "Nihongo ga jouzu desu ne.", "Your Japanese is good!", "일본어 잘하시네요."],
      ["いいえ、 まだまだ です。", "Iie, madamada desu.", "No, I still have a long way to go.", "아니에요, 아직 멀었어요.",
        "The standard modest reply to a compliment."],
    ]),
    lesson("smalltalk-2", "Hobbies and weekends", "Talk about what you like to do.", [
      ["[趣味|しゅみ] は [何|なん] です か。", "Shumi wa nan desu ka?", "What are your hobbies?", "취미가 뭐예요?"],
      ["[映画|えいが] を [見|み]る こと です。", "Eiga o miru koto desu.", "Watching movies.", "영화 보는 거예요.",
        "Verb + こと turns it into a noun, like ~는 것."],
      ["[週末|しゅうまつ] は [何|なに] を します か。", "Shuumatsu wa nani o shimasu ka?", "What do you do on weekends?", "주말에는 뭐 하세요?"],
      ["よく [友達|ともだち] と [出|で]かけます。", "Yoku tomodachi to dekakemasu.", "I often go out with friends.", "자주 친구들이랑 놀러 나가요."],
      ["[日本|にほん] の [食|た]べ[物|もの] は [好|す]き です か。", "Nihon no tabemono wa suki desu ka?", "Do you like Japanese food?", "일본 음식 좋아하세요?"],
      ["はい、 [大好|だいす]き です。", "Hai, daisuki desu.", "Yes, I love it.", "네, 정말 좋아해요."],
    ]),
  ],
};
