// data/education.ts
// Your data structure is now clean and separated from the content.
// It only contains logic, keys, and non-translatable assets like icons.

export const EDUCATION_TOPICS = [
  // Step by Step Guide
  {
    slug: 'step-by-step-guide',
    titleKey: 'education.step-by-step-guide.title',
    heroIcon: require('@/assets/education_assets/stepbystepguide.png'),
    taglineKey: 'education.step-by-step-guide.tagline',
    sections: [
      {
        kind: 'paragraph',
        titleKey: 'education.step-by-step-guide.sections.0.title',
        textKey: 'education.step-by-step-guide.sections.0.text',
      },
      {
        kind: 'paragraph',
        titleKey: 'education.step-by-step-guide.sections.1.title',
        textKey: 'education.step-by-step-guide.sections.1.text',
      },
    ],
  },
  // Pesticide Contamination
  {
    slug: 'pesticide-contamination',
    titleKey: 'education.pesticide-contamination.title',
    heroIcon: require('@/assets/education_assets/pesticide.png'),
    taglineKey: 'education.pesticide-contamination.tagline',
    sections: [
      {
        kind: 'paragraph',
        textKey: 'education.pesticide-contamination.sections.0.text',
      },
      {
        kind: 'bullets',
        titleKey: 'education.pesticide-contamination.sections.1.title',
        itemsKey: 'education.pesticide-contamination.sections.1.items',
      },
      {
        kind: 'bullets',
        titleKey: 'education.pesticide-contamination.sections.2.title',
        itemsKey: 'education.pesticide-contamination.sections.2.items',
      },
      {
        kind: 'bullets',
        titleKey: 'education.pesticide-contamination.sections.3.title',
        itemsKey: 'education.pesticide-contamination.sections.3.items',
      },
    ],
  },
  // Heavy Metal Contamination
  {
    slug: 'heavy-metal-contamination',
    titleKey: 'education.heavy-metal-contamination.title',
    heroIcon: require('@/assets/education_assets/heavy_metal.png'),
    taglineKey: 'education.heavy-metal-contamination.tagline',
    sections: [
      {
        kind: 'paragraph',
        titleKey: 'education.heavy-metal-contamination.sections.0.title',
        textKey: 'education.heavy-metal-contamination.sections.0.text',
      },
      {
        kind: 'bullets',
        titleKey: 'education.heavy-metal-contamination.sections.1.title',
        itemsKey: 'education.heavy-metal-contamination.sections.1.items',
      },
      {
        kind: 'bullets',
        titleKey: 'education.heavy-metal-contamination.sections.2.title',
        itemsKey: 'education.heavy-metal-contamination.sections.2.items',
      },
      {
        kind: 'bullets',
        titleKey: 'education.heavy-metal-contamination.sections.3.title',
        itemsKey: 'education.heavy-metal-contamination.sections.3.items',
      },
    ],
  },
  // Overuse of Chemical Fertilizers (NPK)
  {
    slug: 'overuse-of-NPK',
    titleKey: 'education.overuse-of-NPK.title',
    heroIcon: require('@/assets/education_assets/npk.png'),
    taglineKey: 'education.overuse-of-NPK.tagline',
    sections: [
      {
        kind: 'paragraph',
        titleKey: 'education.overuse-of-NPK.sections.0.title',
        textKey: 'education.overuse-of-NPK.sections.0.text',
      },
      {
        kind: 'bullets',
        titleKey: 'education.overuse-of-NPK.sections.1.title',
        itemsKey: 'education.overuse-of-NPK.sections.1.items',
      },
      {
        kind: 'bullets',
        titleKey: 'education.overuse-of-NPK.sections.2.title',
        itemsKey: 'education.overuse-of-NPK.sections.2.items',
      },
      {
        kind: 'bullets',
        titleKey: 'education.overuse-of-NPK.sections.3.title',
        itemsKey: 'education.overuse-of-NPK.sections.3.items',
      },
    ],
  },
  // Use of Organic Fertilizers
  {
    slug: 'user-of-organic-fertilizers',
    titleKey: 'education.user-of-organic-fertilizers.title',
    heroIcon: require('@/assets/education_assets/organic_fertilizer.png'),
    taglineKey: 'education.user-of-organic-fertilizers.tagline',
    sections: [
      {
        kind: 'paragraph',
        titleKey: 'education.user-of-organic-fertilizers.sections.0.title',
        textKey: 'education.user-of-organic-fertilizers.sections.0.text',
      },
      {
        kind: 'bullets',
        titleKey: 'education.user-of-organic-fertilizers.sections.1.title',
        itemsKey: 'education.user-of-organic-fertilizers.sections.1.items',
      },
      {
        kind: 'bullets',
        titleKey: 'education.user-of-organic-fertilizers.sections.2.title',
        itemsKey: 'education.user-of-organic-fertilizers.sections.2.items',
      },
      {
        kind: 'bullets',
        titleKey: 'education.user-of-organic-fertilizers.sections.3.title',
        itemsKey: 'education.user-of-organic-fertilizers.sections.3.items',
      },
    ],
  },
];

export const getTopicBySlug = (slug: string) =>
  EDUCATION_TOPICS.find((t) => t.slug === slug);