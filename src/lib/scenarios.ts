/**
 * Ready-made scenes for the Talk (role-play) tab.
 * Add a scene by adding an object here; nothing else needs to change.
 */
export interface Scenario {
  id: string;
  title: string;
  emoji: string;
  /** Where the conversation happens and what it is about. */
  setting: string;
  /** Who the AI plays. */
  aiRole: string;
  /** Who you play. */
  userRole: string;
}

export const SCENARIOS: Scenario[] = [
  {
    id: "konbini",
    title: "Convenience store",
    emoji: "🏪",
    setting: "A convenience store in Tokyo. The customer is paying for a lunch box and a drink.",
    aiRole: "the cashier",
    userRole: "the customer",
  },
  {
    id: "ramen",
    title: "Ramen shop",
    emoji: "🍜",
    setting: "A small ramen shop. The customer has just walked in and wants to order.",
    aiRole: "the shop staff",
    userRole: "the customer",
  },
  {
    id: "directions",
    title: "Lost in the city",
    emoji: "🧭",
    setting: "A street near a big station. The visitor is looking for their hotel.",
    aiRole: "a friendly passer-by",
    userRole: "a visitor asking for directions",
  },
  {
    id: "hotel",
    title: "Hotel check-in",
    emoji: "🏨",
    setting: "A hotel front desk in the evening. The guest has a reservation for two nights.",
    aiRole: "the receptionist",
    userRole: "the guest",
  },
  {
    id: "shopping",
    title: "Clothes shop",
    emoji: "🛍️",
    setting: "A clothes shop. The customer wants to try on a jacket and ask about sizes and price.",
    aiRole: "the shop assistant",
    userRole: "the customer",
  },
  {
    id: "smalltalk",
    title: "Meeting someone new",
    emoji: "💬",
    setting: "A casual meetup. Two people are meeting for the first time and getting to know each other.",
    aiRole: "a friendly Japanese person of a similar age",
    userRole: "a Korean visitor",
  },
  {
    id: "office",
    title: "At the office",
    emoji: "💼",
    setting: "An office in Japan. A colleague comes over to talk about today's meeting and a deadline.",
    aiRole: "a polite Japanese colleague",
    userRole: "a co-worker from Korea",
  },
  {
    id: "clinic",
    title: "At a clinic",
    emoji: "🏥",
    setting: "A clinic reception. The patient feels unwell and needs to explain the symptoms.",
    aiRole: "the receptionist, then the doctor",
    userRole: "the patient",
  },
];

/** Builds a scene from free text typed by the learner. */
export function customScenario(description: string): Scenario {
  return {
    id: "custom",
    title: description,
    emoji: "✨",
    setting: description,
    aiRole: "whoever the learner would naturally talk to in this situation",
    userRole: "the learner, as themselves",
  };
}
