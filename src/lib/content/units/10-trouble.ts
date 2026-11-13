import type { Unit } from "../types";
import { lesson } from "../helpers";

export const trouble: Unit = {
  id: "trouble",
  title: "Trouble",
  titleJp: "こまったとき",
  emoji: "🆘",
  description: "Lost things, feeling sick, and asking for help.",
  lessons: [
    lesson("trouble-1", "Lost and found", "Explain that you lost something and find the police box.", [
      ["どう しました か。", "Dou shimashita ka?", "What is the matter?", "무슨 일이세요?"],
      ["[財布|さいふ] を なくしました。", "Saifu o nakushimashita.", "I lost my wallet.", "지갑을 잃어버렸어요."],
      ["[英語|えいご] を [話|はな]せます か。", "Eigo o hanasemasu ka?", "Can you speak English?", "영어 할 수 있어요?"],
      ["[少|すこ]し だけ [話|はな]せます。", "Sukoshi dake hanasemasu.", "I can speak just a little.", "조금만 할 수 있어요."],
      ["[交番|こうばん] は どこ です か。", "Kouban wa doko desu ka?", "Where is the police box?", "파출소가 어디예요?",
        "A 交番 is a small neighbourhood police post. Go there for lost items."],
      ["[駅|えき] の [前|まえ] に あります。", "Eki no mae ni arimasu.", "It is in front of the station.", "역 앞에 있어요."],
    ]),
    lesson("trouble-2", "Feeling sick", "Say what hurts and whether you need help.", [
      ["[大丈夫|だいじょうぶ] です か。", "Daijoubu desu ka?", "Are you okay?", "괜찮으세요?"],
      ["[気分|きぶん] が [悪|わる]い です。", "Kibun ga warui desu.", "I feel sick.", "몸이 안 좋아요.",
        "気分が悪い means feeling physically unwell, not 'in a bad mood'."],
      ["どこ が [痛|いた]い です か。", "Doko ga itai desu ka?", "Where does it hurt?", "어디가 아프세요?"],
      ["[頭|あたま] が [痛|いた]い です。", "Atama ga itai desu.", "I have a headache.", "머리가 아파요."],
      ["[救急車|きゅうきゅうしゃ] を [呼|よ]びましょう か。", "Kyuukyuusha o yobimashou ka?", "Shall I call an ambulance?", "구급차 부를까요?"],
      ["いいえ、 [少|すこ]し [休|やす]めば [大丈夫|だいじょうぶ] です。", "Iie, sukoshi yasumeba daijoubu desu.", "No, I will be fine if I rest a little.", "아니요, 조금 쉬면 괜찮아요."],
    ]),
  ],
};
