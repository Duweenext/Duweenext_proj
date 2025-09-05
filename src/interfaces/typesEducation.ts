// src/educationData/types.ts
import type { ImageSourcePropType } from 'react-native';

// Give every section an optional title
type WithTitle = { title?: string };

export type ParagraphSection = WithTitle & {
  kind: 'paragraph';
  text: string;
};

export type BulletsSection = WithTitle & {
  kind: 'bullets';
  items: string[];
};

export type QuoteSection = WithTitle & {
  kind: 'quote';
  text: string;
};

export type EduSection = ParagraphSection | BulletsSection | QuoteSection;

export interface EducationTopic {
  slug: string;
  title: string;
  heroIcon: ImageSourcePropType;
  tagline?: string;
  sections: EduSection[];
}

export interface Education {
  post_id: number;
  post_title: string;
  post_detail: string;
  image_url: string;
  quote: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}