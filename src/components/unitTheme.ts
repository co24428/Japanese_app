/**
 * Each situation gets its own accent colour, so units are easy to tell
 * apart at a glance. Values are hues (0-360) for the `tint`, `ink-accent`
 * ... classes in globals.css. Unknown units fall back to the app's indigo.
 */
const HUES: Record<string, number> = {
  "my-lessons": 300,
  greetings: 25,
  konbini: 145,
  restaurant: 55,
  directions: 230,
  transport: 195,
  shopping: 340,
  hotel: 280,
  smalltalk: 175,
  work: 255,
  trouble: 15,
  "street-walk": 105,
  "salon-shopping": 320,
  "bank-post": 75,
  "pharmacy-clinic": 160,
};

/** Use as `style={unitStyle(unit.id)}` on the element that holds the colour. */
export function unitStyle(unitId: string): React.CSSProperties {
  return { "--hue": HUES[unitId] ?? 270 } as React.CSSProperties;
}
