/**
 * The built-in curriculum. To add a situation: create a file in ./units,
 * then add it to the list below. The order here is the order on the Learn page.
 *
 * `npm test` checks every line (furigana, romaji, unique ids), so run it
 * after editing content.
 */
import type { Lesson, Unit } from "./types";
import { greetings } from "./units/01-greetings";
import { convenienceStore } from "./units/02-convenience-store";
import { restaurant } from "./units/03-restaurant";
import { directions } from "./units/04-directions";
import { transport } from "./units/05-transport";
import { shopping } from "./units/06-shopping";
import { hotel } from "./units/07-hotel";
import { smallTalk } from "./units/08-small-talk";
import { work } from "./units/09-work";
import { trouble } from "./units/10-trouble";

export const BUILTIN_UNITS: Unit[] = [
  greetings,
  convenienceStore,
  restaurant,
  directions,
  transport,
  shopping,
  hotel,
  smallTalk,
  work,
  trouble,
];

const LESSONS_BY_ID = new Map<string, Lesson>(
  BUILTIN_UNITS.flatMap((u) => u.lessons).map((l) => [l.id, l]),
);

export function getBuiltinLesson(id: string): Lesson | undefined {
  return LESSONS_BY_ID.get(id);
}
