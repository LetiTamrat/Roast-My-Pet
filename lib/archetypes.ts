export const ARCHETYPES = [
  { name: "Chaos Gremlin", emoji: "🤡", desc: "High-energy, breaks things, no remorse" },
  { name: "Household Dictator", emoji: "👑", desc: "Bossy, demanding, opinionated" },
  { name: "Snack Addict", emoji: "🍔", desc: "Always begging, food-obsessed" },
  { name: "Couch Goblin", emoji: "🛋️", desc: "Lazy, judgmental from the cushions" },
  { name: "Suspicious Potato", emoji: "🥔", desc: "Round, paranoid, sus" },
  { name: "Professional Sleeper", emoji: "😴", desc: "Sleeps 22 hours a day" },
  { name: "Drama Queen", emoji: "🎭", desc: "Theatrical, attention-seeking" },
  { name: "Tiny Detective", emoji: "🕵️", desc: "Sniffs everything, investigates" },
  { name: "Mastermind", emoji: "🦹", desc: "Plotting something, always" },
  { name: "Walking Disaster", emoji: "🌪️", desc: "Chaos incarnate" },
  { name: "Soft Launch", emoji: "🥹", desc: "Acts tough, secretly clingy" },
  { name: "Vibe Curator", emoji: "🎧", desc: "Aesthetic, moody, photogenic" },
  { name: "Snitch", emoji: "📣", desc: "Barks at literally everything" },
  { name: "Fluff Cloud", emoji: "☁️", desc: "90% fur, 10% personality" },
  { name: "Goblin Mode", emoji: "👹", desc: "Permanently feral" },
  { name: "Velvet Villain", emoji: "😼", desc: "Elegantly evil, knocks things off tables" },
  { name: "Emotional Support Tyrant", emoji: "🫀", desc: "Needs you, punishes you for leaving" },
  { name: "Zoomie Specialist", emoji: "⚡", desc: "Bursts of unhinged speed at 3am" },
  { name: "Gentle Loaf", emoji: "🍞", desc: "Soft, round, mostly decorative" },
  { name: "Retired Intellectual", emoji: "📚", desc: "Wise, tired, above your drama" },
] as const;

export type Archetype = (typeof ARCHETYPES)[number];

export function archetypeListForPrompt(): string {
  return ARCHETYPES.map((a) => `${a.emoji} ${a.name} — ${a.desc}`).join("\n");
}

export function findArchetype(name: string): Archetype | undefined {
  const lower = name.trim().toLowerCase();
  return ARCHETYPES.find((a) => a.name.toLowerCase() === lower);
}
