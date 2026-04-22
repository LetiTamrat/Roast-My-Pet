export type RoastLevel = "cute" | "medium" | "savage";
export type RoastStyle =
  | "default"
  | "standup"
  | "shakespearean"
  | "genz"
  | "corporate"
  | "pirate"
  | "rap";
export type MemeFormat = "square" | "story" | "landscape";
export type MemeTemplate = "classic" | "polaroid" | "tabloid";

export interface RoastRow {
  id: string;
  short_id: string;
  user_id: string | null;
  anon_session_id: string | null;
  pet_name: string;
  pet_type: string | null;
  traits: string[];
  roast_level: RoastLevel;
  roast_style: RoastStyle;
  source_image_url: string;
  source_image_path: string | null;
  image_hash: string | null;
  roast_text: string;
  archetype: string;
  archetype_emoji: string;
  vibe_tags: string[];
  follow_up: string | null;
  visual_observation: string | null;
  is_public: boolean;
  is_flagged: boolean;
  regenerations: number;
  model_used: string;
  generation_ms: number | null;
  owner_token: string;
  ip_hash: string | null;
  created_at: string;
}

export interface MemeAssetRow {
  id: string;
  roast_id: string;
  format: MemeFormat;
  template: MemeTemplate;
  url: string;
  width: number;
  height: number;
  bytes: number | null;
  created_at: string;
}

export interface ReactionRow {
  id: number;
  roast_id: string;
  emoji: string;
  ip_hash: string;
  created_at: string;
}

export interface ShareEventRow {
  id: number;
  roast_id: string;
  channel: string;
  occurred_at: string;
  ip_hash: string | null;
  user_agent: string | null;
}

export interface FlagRow {
  id: number;
  roast_id: string;
  reason: string | null;
  reporter_ip_hash: string | null;
  status: "pending" | "dismissed" | "removed";
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      roasts: { Row: RoastRow; Insert: Partial<RoastRow>; Update: Partial<RoastRow> };
      meme_assets: {
        Row: MemeAssetRow;
        Insert: Partial<MemeAssetRow>;
        Update: Partial<MemeAssetRow>;
      };
      reactions: {
        Row: ReactionRow;
        Insert: Partial<ReactionRow>;
        Update: Partial<ReactionRow>;
      };
      share_events: {
        Row: ShareEventRow;
        Insert: Partial<ShareEventRow>;
        Update: Partial<ShareEventRow>;
      };
      flags: { Row: FlagRow; Insert: Partial<FlagRow>; Update: Partial<FlagRow> };
    };
  };
}
