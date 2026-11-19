import type { Unit } from "../types";
import { lesson } from "../helpers";

/**
 * Describing what you see on a walk: buildings, nature, and what people
 * are wearing. Lesson 3 focuses on the Japanese "wearing" verbs, which
 * split differently from Korean 입다 / 신다 / 쓰다.
 */
export const streetWalk: Unit = {
  id: "street-walk",
  title: "Walking around town",
  titleJp: "さんぽ",
  emoji: "🚶",
  description: "Name buildings, nature and what people are wearing.",
  lessons: [
    lesson(
      "street-walk-1",
      "Around the neighbourhood",
      "Point out buildings and say where they are.",
      [
        ["あれ は [何|なん] です か。", "Are wa nan desu ka?", "What is that?", "저건 뭐예요?"],
        ["あれ は [銀行|ぎんこう] です。", "Are wa ginkou desu.", "That is a bank.", "저건 은행이에요.",
          "あれ is something far from both of you, like Korean 저것."],
        ["[郵便局|ゆうびんきょく] は どこ に あります か。", "Yuubinkyoku wa doko ni arimasu ka?", "Where is the post office?", "우체국은 어디에 있어요?"],
        ["[銀行|ぎんこう] の [隣|となり] に あります。", "Ginkou no tonari ni arimasu.", "It is next to the bank.", "은행 옆에 있어요.",
          "銀行の隣に: 'bank's side at'. Korean drops the 의 (은행 옆에), Japanese keeps の."],
        ["[横断歩道|おうだんほどう] を [渡|わた]りましょう か。", "Oudanhodou o watarimashou ka?", "Shall we cross at the crosswalk?", "횡단보도로 건널까요?",
          "The place you cross takes を: 道を渡る, like Korean 길을 건너다."],
        ["[信号|しんごう] が [赤|あか] です よ。", "Shingou ga aka desu yo.", "The light is red, you know.", "신호가 빨간불이에요.",
          "よ at the end tells the listener something they may not have noticed."],
      ],
      [
        ["[銀行|ぎんこう]", "ginkou", "bank", "은행"],
        ["[郵便局|ゆうびんきょく]", "yuubinkyoku", "post office", "우체국"],
        ["[隣|となり]", "tonari", "next to", "옆"],
        ["[横断歩道|おうだんほどう]", "oudanhodou", "crosswalk", "횡단보도"],
        ["[信号|しんごう]", "shingou", "traffic light", "신호등"],
      ],
    ),
    lesson(
      "street-walk-2",
      "Nature on a walk",
      "Talk about the sky, the wind, flowers and trees.",
      [
        ["[今日|きょう] は [空|そら] が きれい です ね。", "Kyou wa sora ga kirei desu ne.", "The sky is beautiful today, isn't it?", "오늘은 하늘이 예쁘네요."],
        ["そう です ね。 [風|かぜ] も [気持|きも]ちいい です。", "Sou desu ne. Kaze mo kimochi ii desu.", "It is. The breeze feels nice too.", "그러네요. 바람도 기분 좋아요.",
          "も means 'also', like Korean 도: 風も = 바람도."],
        ["あの [花|はな] は [何|なん] です か。", "Ano hana wa nan desu ka?", "What is that flower?", "저 꽃은 뭐예요?"],
        ["[桜|さくら] です。 [春|はる] に [咲|さ]きます。", "Sakura desu. Haru ni sakimasu.", "It is a cherry blossom. It blooms in spring.", "벚꽃이에요. 봄에 피어요."],
        ["[木|き] の [葉|は] が [赤|あか]い です ね。", "Ki no ha ga akai desu ne.", "The leaves on the tree are red, aren't they?", "나뭇잎이 빨갛네요.",
          "Korean makes one word (나뭇잎); Japanese joins the two words with の."],
        ["もう [秋|あき] です ね。", "Mou aki desu ne.", "It is already autumn.", "벌써 가을이네요."],
      ],
      [
        ["[空|そら]", "sora", "sky", "하늘"],
        ["[風|かぜ]", "kaze", "wind, breeze", "바람"],
        ["[花|はな]", "hana", "flower", "꽃"],
        ["[木|き]", "ki", "tree", "나무"],
        ["[葉|は]", "ha", "leaf", "잎"],
      ],
    ),
    lesson(
      "street-walk-3",
      "What people are wearing",
      "Describe clothes with the right 'wear' verb for each item.",
      [
        ["あの [人|ひと] は [何|なに] を [着|き]て います か。", "Ano hito wa nani o kite imasu ka?", "What is that person wearing?", "저 사람은 뭘 입고 있어요?"],
        ["[黒|くろ]い コート を [着|き]て います。", "Kuroi kooto o kite imasu.", "They are wearing a black coat.", "검은 코트를 입고 있어요.",
          "着る is for things on the upper body or the whole body: shirts, coats, dresses."],
        ["[下|した] は [何|なに] を [履|は]いて います か。", "Shita wa nani o haite imasu ka?", "What are they wearing on the bottom?", "하의는 뭘 입고 있어요?"],
        ["ジーンズ と [白|しろ]い [靴|くつ] を [履|は]いて います。", "Jiinzu to shiroi kutsu o haite imasu.", "Jeans and white shoes.", "청바지를 입고 흰 신발을 신고 있어요.",
          "履く covers trousers, skirts, socks and shoes. Korean splits these into 입다 and 신다."],
        ["[帽子|ぼうし] を [被|かぶ]って いる [人|ひと] は [誰|だれ] です か。", "Boushi o kabutte iru hito wa dare desu ka?", "Who is the person wearing a hat?", "모자를 쓴 사람은 누구예요?",
          "被る is for things on your head."],
        ["[眼鏡|めがね] を [掛|か]けて いる [人|ひと] の [友達|ともだち] です。", "Megane o kakete iru hito no tomodachi desu.", "A friend of the person wearing glasses.", "안경을 쓴 사람의 친구예요.",
          "Korean uses 쓰다 for both hats and glasses; Japanese uses 被る for hats and 掛ける for glasses."],
        ["[彼女|かのじょ] は [何|なに] を して います か。", "Kanojo wa nani o shite imasu ka?", "What is she doing?", "그녀는 뭘 하고 있어요?"],
        ["[赤|あか]い かばん を [持|も]って、 [犬|いぬ] と [散歩|さんぽ] して います。", "Akai kaban o motte, inu to sanpo shite imasu.", "She is carrying a red bag and walking her dog.", "빨간 가방을 들고 개랑 산책하고 있어요.",
          "Bags are not 'worn' in Japanese: you hold them, 持つ (Korean 들다)."],
      ],
      [
        ["[着|き]る", "kiru", "wear (tops, coats)", "입다"],
        ["[履|は]く", "haku", "wear (trousers, shoes)", "입다 / 신다"],
        ["[被|かぶ]る", "kaburu", "wear (hats)", "쓰다"],
        ["[掛|か]ける", "kakeru", "wear (glasses)", "쓰다 (안경)"],
        ["[持|も]つ", "motsu", "hold, carry (bags)", "들다"],
      ],
    ),
  ],
};
