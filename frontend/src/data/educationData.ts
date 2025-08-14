// data/education.ts
import type { EducationTopic } from '../interfaces/typesEducation';

export const EDUCATION_TOPICS: EducationTopic[] = [
  {
    slug: 'pesticide-contamination',
    title: 'Pesticide Contamination',
    heroIcon: require('../../assets/education_assets/pesticide.png'),
    tagline:
      'If your pond is near a rice field or plantation, always check water sources — clean water = safe duckweed = safe consumers.',
    sections: [
      {
        kind: 'paragraph',
        text:
          'Pesticide contamination happens when harmful chemicals used to kill pests in nearby farms or plantations wash into your duckweed pond, usually through rainwater runoff or contaminated water sources.',
      },
      {
        kind: 'bullets',
        title: 'Common Sources',
        items: [
          'Runoff water from nearby plantations or rice fields',
          'Water pumped from canals collecting farm runoff',
          'Leftover water from pesticide-sprayed crops',
        ],
      },
      {
        kind: 'bullets',
        title: 'How to Prevent',
        items: [
          'Avoid using water from areas near plantations or fields that may be sprayed',
          'Prefer tested, filtered pond/canal water or well water',
          'Be extra cautious right after heavy rain',
          'Do not reuse water from other farms unless chemical‑free',
        ],
      },
      {
        kind: 'bullets',
        title: 'Risks to Your Duckweed & Consumers',
        items: [
          'Poor duckweed growth or sudden die‑off',
          'Residues may remain in duckweed -> unsafe for consumption',
          'Can require full pond replacement if long‑term contamination occurs',
        ],
      },
    ],
  },

  {
    slug: 'heavy-metal-contamination',
    title: 'Heavy Metal Contamination',
    heroIcon: require('../../assets/education_assets/heavy_metal.png'),
    sections: [
      { kind: 'paragraph', text: '…(fill similar to above)…' },
    ],
  },

  // add more topics here...
];

export const getTopicBySlug = (slug: string) =>
  EDUCATION_TOPICS.find(t => t.slug === slug);
