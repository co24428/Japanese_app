import type { Unit } from "../types";
import { lesson } from "../helpers";

export const directions: Unit = {
  id: "directions",
  title: "Asking the way",
  titleJp: "みちをきく",
  emoji: "🧭",
  description: "Find the station, a restroom, or a shop.",
  lessons: [
    lesson("directions-1", "Where is it?", "Ask where a place is and how far.", [
      ["すみません、 [駅|えき] は どこ です か。", "Sumimasen, eki wa doko desu ka?", "Excuse me, where is the station?", "실례합니다, 역이 어디예요?"],
      ["まっすぐ [行|い]って、 [右|みぎ] です。", "Massugu itte, migi desu.", "Go straight and it is on the right.", "쭉 가서 오른쪽이에요."],
      ["ここ から [遠|とお]い です か。", "Koko kara tooi desu ka?", "Is it far from here?", "여기서 멀어요?"],
      ["いいえ、 [歩|ある]いて [五分|ごふん] です。", "Iie, aruite gofun desu.", "No, it is five minutes on foot.", "아니요, 걸어서 5분이에요."],
      ["トイレ は どこ です か。", "Toire wa doko desu ka?", "Where is the restroom?", "화장실이 어디예요?"],
      ["[二階|にかい] に あります。", "Nikai ni arimasu.", "It is on the second floor.", "2층에 있어요."],
    ], [
      ["[駅|えき]", "eki", "station", "역"],
      ["[右|みぎ]", "migi", "right", "오른쪽"],
      ["[遠|とお]い", "tooi", "far", "멀다"],
      ["[二階|にかい]", "nikai", "second floor", "2층"],
    ]),
    lesson("directions-2", "Nearby places", "Ask if something is nearby and ask someone to repeat.", [
      ["この [近|ちか]く に コンビニ は あります か。", "Kono chikaku ni konbini wa arimasu ka?", "Is there a convenience store near here?", "이 근처에 편의점 있어요?"],
      ["はい、 あの [角|かど] に あります。", "Hai, ano kado ni arimasu.", "Yes, there is one on that corner.", "네, 저 모퉁이에 있어요."],
      ["[地図|ちず] で [教|おし]えて ください。", "Chizu de oshiete kudasai.", "Please show me on the map.", "지도로 알려 주세요."],
      ["[今|いま]、 ここ です。", "Ima, koko desu.", "We are here right now.", "지금 여기예요."],
      ["もう [一度|いちど] [言|い]って ください。", "Mou ichido itte kudasai.", "Please say it one more time.", "한 번 더 말해 주세요.",
        "Your most useful sentence as a beginner."],
      ["[次|つぎ] の [信号|しんごう] を [左|ひだり] です。", "Tsugi no shingou o hidari desu.", "Turn left at the next traffic light.", "다음 신호등에서 왼쪽이에요."],
    ], [
      ["[近|ちか]く", "chikaku", "nearby", "근처"],
      ["[地図|ちず]", "chizu", "map", "지도"],
      ["[信号|しんごう]", "shingou", "traffic light", "신호등"],
      ["[左|ひだり]", "hidari", "left", "왼쪽"],
    ]),
  ],
};
