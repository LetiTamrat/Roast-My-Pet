export const TRAITS = [
  "Lazy",
  "Chaotic",
  "Dramatic",
  "Aggressive",
  "Friendly",
  "Suspicious",
  "Clingy",
  "Greedy",
  "Sleepy",
  "Goofy",
  "Anxious",
  "Royal",
  "Diva",
  "Derpy",
  "Grumpy",
] as const;

export type Trait = (typeof TRAITS)[number];

export const ROAST_LEVELS = [
  { value: "cute", label: "Cute", emoji: "🍼", desc: "Playful teasing, no edge. Kid-safe." },
  { value: "medium", label: "Medium", emoji: "🌶️", desc: "Clever internet humor with mild attitude." },
  { value: "savage", label: "Savage", emoji: "🔥", desc: "Brutal, witty, edgy — never hateful." },
] as const;

export type RoastLevel = (typeof ROAST_LEVELS)[number]["value"];

export const ROAST_STYLES = [
  { value: "default", label: "Default" },
  { value: "standup", label: "Standup" },
  { value: "shakespearean", label: "Shakespearean" },
  { value: "genz", label: "Gen Z" },
  { value: "corporate", label: "Corporate" },
  { value: "pirate", label: "Pirate" },
  { value: "rap", label: "Rap" },
] as const;

export type RoastStyle = (typeof ROAST_STYLES)[number]["value"];

export const PET_TYPES = [
  { value: "", label: "Let AI guess" },
  { value: "dog", label: "Dog" },
  { value: "cat", label: "Cat" },
  { value: "bird", label: "Bird" },
  { value: "rabbit", label: "Rabbit" },
  { value: "reptile", label: "Reptile" },
  { value: "exotic", label: "Exotic" },
  { value: "other", label: "Other" },
] as const;
