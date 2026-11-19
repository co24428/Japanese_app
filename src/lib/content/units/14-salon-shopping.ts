import type { Unit } from "../types";
import { lesson } from "../helpers";

export const salonShopping: Unit = {
  id: "salon-shopping",
  title: "Hair salon and clothes shop",
  titleJp: "びよういん・ふくや",
  emoji: "💇",
  description: "Explain a haircut, ask for sizes and colours.",
  lessons: [
    lesson(
      "salon-shopping-1",
      "At the hair salon",
      "Ask for a cut and say how short you want it.",
      [
        ["[今日|きょう] は どう なさいます か。", "Kyou wa dou nasaimasu ka?", "What would you like today?", "오늘은 어떻게 해 드릴까요?",
          "なさいます is the very polite form of します, used by staff."],
        ["カット を お[願|ねが]いします。", "Katto o onegaishimasu.", "A cut, please.", "커트 부탁드립니다."],
        ["どれ ぐらい [切|き]ります か。", "Dore gurai kirimasu ka?", "How much should I cut?", "얼마나 자를까요?"],
        ["[三|さん] センチ ぐらい [短|みじか]く して ください。", "San senchi gurai mijikaku shite kudasai.", "Please make it about 3 cm shorter.", "3센티 정도 짧게 해 주세요.",
          "～くしてください means 'please make it ~', like Korean ～게 해 주세요."],
        ["[前髪|まえがみ] は どう します か。", "Maegami wa dou shimasu ka?", "What about your bangs?", "앞머리는 어떻게 할까요?"],
        ["[眉|まゆ] ぐらい の [長|なが]さ で お[願|ねが]いします。", "Mayu gurai no nagasa de onegaishimasu.", "Eyebrow length, please.", "눈썹 정도 길이로 해 주세요."],
      ],
      [
        ["カット", "katto", "haircut", "커트"],
        ["[短|みじか]く", "mijikaku", "shorter", "짧게"],
        ["[前髪|まえがみ]", "maegami", "bangs, fringe", "앞머리"],
        ["[長|なが]さ", "nagasa", "length", "길이"],
      ],
    ),
    lesson(
      "salon-shopping-2",
      "Sizes and colours",
      "Ask for another colour or size and try something on.",
      [
        ["これ の [別|べつ] の [色|いろ] は あります か。", "Kore no betsu no iro wa arimasu ka?", "Do you have this in another colour?", "이거 다른 색 있어요?"],
        ["[黒|くろ] と [紺|こん] が あります。", "Kuro to kon ga arimasu.", "We have black and navy.", "검정이랑 남색이 있어요.",
          "と joins nouns ('A and B'), like Korean 와/과 or 랑."],
        ["[少|すこ]し きつい です。 [一|ひと]つ [上|うえ] の サイズ は あります か。", "Sukoshi kitsui desu. Hitotsu ue no saizu wa arimasu ka?", "It is a bit tight. Do you have one size up?", "좀 끼네요. 한 사이즈 큰 거 있어요?"],
        ["すみません、 [今|いま] [在庫|ざいこ] が ありません。", "Sumimasen, ima zaiko ga arimasen.", "Sorry, it is out of stock right now.", "죄송해요, 지금 재고가 없어요."],
        ["この スカート を [履|は]いて みて も いい です か。", "Kono sukaato o haite mite mo ii desu ka?", "May I try on this skirt?", "이 치마 입어 봐도 돼요?",
          "Skirts and trousers take 履く, not 着る."],
        ["はい、 [靴|くつ] を [脱|ぬ]いで お[入|はい]り ください。", "Hai, kutsu o nuide ohairi kudasai.", "Sure. Please take off your shoes and go in.", "네, 신발 벗고 들어가세요.",
          "Fitting rooms in Japan often ask you to take off your shoes."],
      ],
      [
        ["[色|いろ]", "iro", "colour", "색"],
        ["きつい", "kitsui", "tight", "꽉 끼다"],
        ["[在庫|ざいこ]", "zaiko", "stock", "재고"],
        ["[脱|ぬ]ぐ", "nugu", "take off (clothes, shoes)", "벗다"],
      ],
    ),
  ],
};
