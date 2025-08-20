// data/education.ts
import type { EducationTopic } from '../interfaces/typesEducation';

export const EDUCATION_TOPICS: EducationTopic[] = [
  //Step by Step Guide
  { 
    slug: 'step-by-step-guide',
    title: 'Step-by-step Guide on how to grow Wolffia Globosa',
    heroIcon: require('../../assets/education_assets/stepbystepguide.png'), 
    tagline:'',
    sections: [
      {
        kind: 'paragraph', 
        title: 'Understanding Wolffia Globosa',
        text: 'Wolffia globosa, also known as Asian watermeal or duckweed, is the world\'s smallest flowering plant. It floats on the surface of the water and grows rapidly under the right conditions. This plant is highly valued for its high protein content and its ability to purify water. Growing Wolffia globosa successfully requires careful control of environmental conditions, nutrients, and water quality.',
    },
    {
      kind: 'paragraph',
      title: 'Choosing the Right Growing Environment',
      text: 'Wolffia globosa thrives in warm, nutrient-rich, and stagnant or slow-moving freshwater environments. It is commonly found in ponds, lakes, and slow-moving rivers in tropical and subtropical regions. When cultivating it at home or on a farm, a controlled water body such as an aquarium, pond, or water trough is ideal. The water should be clean and free from contaminants that could hinder growth.'
    },
      
    ],
  },
  //Pesticide Contamination
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
          'Avoid using water from areas near plantations or crop fields that may have been sprayed with pesticides',
          'Use safe water sources such as: \n \t 1. Rainwater (properly stored) \n \t 2. Well water/ underground water \n \t 3. Tested, filtered pond or canal water',
          'After heavy rain, be extra cautious — rain can carry pesticides from fields into natural water bodies',
         'Do not reuse water from other farms unless you\'re sure it\’s chemical-free',
        ],
      },
      {
        kind: 'bullets',
        title: 'Risks to Your Duckweed & Consumers',
        items: [
          'Poor duckweed growth or sudden die-off',
          'Chemical residues may remain in duckweed, making it unsafe for consumption',
          'Could lead to long-term pond contamination, requiring full pond replacement',
          'Affects your reputation and consumer trust if unsafe duckweed is sold',
        ],
      },
    ],
  },
//Heavy Metal Contamination
  {
    slug: 'heavy-metal-contamination',
    title: 'Heavy Metal Contamination',
    heroIcon: require('../../assets/education_assets/heavy_metal.png'),
    tagline: 'Just because water looks clean doesn’t mean it’s safe. Choose water sources wisely to protect your duckweed and your customers.',
    sections: [
      { kind: 'paragraph', 
        title: 'What is Heavy Metal Contamination?', 
        text: 'Heavy metals like lead, cadmium, mercury, and arsenic can pollute your duckweed pond if your water source comes from industrial zones, old mining areas, or heavily polluted canals and rivers. These metals are invisible and odorless—you won’t notice them without testing.',
      },
      {
        kind: 'bullets',
        title: 'Common Sources',
        items: [
              'Water from canals or rivers near factories or industrial estates',
              'Runoff from areas around old mining or waste disposal sites',
              'Contaminated groundwater in polluted regions',
              'Irrigation water that flows through multiple farm zones', 
        ],
      },
      {
        kind: 'bullets',
        title: 'How to Prevent',
        items: [
              'Do not use water from unknown or untested sources, espcially near industrial zones',
              'Prefer safe water source like: \n \t 1. Well/underground water from clean, uncontaminated wells \n\t 2. Properly stored rainwater \n\t 3.Water source verified by agricultural advisors or local authorities',
              'If you\'re unsure, get your water tested - especially if your area has a history of pollution',
              'Avoid mixing water from multiple uncertain sources', 
        ],
      },
      {
        kind: 'bullets',
        title: 'Risks to Your Duckweed & Consumers',
        items: [
              'Causes slow or stunted growth in duckweed',
              'Makes duckweed unsafe to eat due to toxic metal buildup',
              'Contamination can persist in your pond even after water is changed',
              'Can damage the health of animals or people who consume contaminated duckweed',
              'May result in regulatory or health safety issues if you\'re supplying food-grade duckweed',
        ],
      },

    ],
  },
  // Overuse of Chemical Fertilizers (NPK)
  {
    slug: 'overuse-of-NPK',
    title: 'Overuse of Chemical Fertilizers (NPK)',
    heroIcon: require('../../assets/education_assets/npk.png'),
    tagline: 'Fertilizer is food, not a cure. Too much can do more harm than good. Watch your duckweed, check your data, and apply only what’s needed.',
    sections: [
      { kind: 'paragraph', 
        title: 'What is Overuse of Chemical Fertilizers (NPK)?', 
        text: 'Chemical fertilizers containing Nitrogen (N), Phosphorus (P), and Potassium (K)—commonly known as NPK—are helpful when used correctly. But when overused, they can disrupt pond balance, leading to unhealthy duckweed and poor water quality.',
      },
      {
        kind: 'bullets',
        title: 'Common Signs of NPK Overuse',
        items: [
              'Sudden drop or spike in pH or TDS (check with DuweeNext sensors)',
              'Appearance of unhealthy bubbles or cloudy water',
              'Duckweed turns yellowish, grows slowly, or starts dying off',
              'Thick green scum or algae on the water surface',
        ],
      },
      {
        kind: 'bullets',
        title: 'How to Apply NPK Safely',
        items: [
              'Follow the recommended dosage based on your pond size and duckweed density',
              'Start with small amounts and observe duckweed reaction',
              'Avoid applying fertilizer just before or after rain, as it can lead to runoff buildup',
              'Use DuweeNext to monitor pH and TDS regularly—unusual changes could be a warning' 
        ],
      },
      {
        kind: 'bullets',
        title: 'Risks to Your Duckweed & Pond',
        items: [
              'Excess nutrients can suffocate duckweed and promote harmful algae',
              'Leads to unstable pH and TDS levels, making it harder to manage water quality',
              'Increases the risk of producing unsafe or low-quality duckweed',
              'May cause long-term pond health problems, requiring full cleaning',
            ],
      },

    ],
  },

  // Use of Organic Fertilizers
  {
    slug: 'user-of-organic-fertilizers',
    title: 'Use of Organic Fertilizers (Animal Waste)',
    heroIcon: require('../../assets/education_assets/organic_fertilizer.png'),
    tagline: 'Just because it’s organic doesn’t mean it’s safe. Avoid animal waste in ponds to protect your duckweed and your health.',
    sections: [
      { kind: 'paragraph', 
        title: 'What is Organic Fertilizers (Animal Waste)?', 
        text: 'Some farmers use animal waste (like pig, cow, or chicken manure) as organic fertilizer. While it may seem natural, it can introduce dangerous bacteria and pathogens into your pond, making your duckweed unsafe for consumption.'
      },
      {
        kind: 'bullets',
        title: 'Common Issues from Animal Waste Use',
        items: [
              'Bacterial contamination (e.g., E. coli, Salmonella)',
              'Murky or foul-smelling water',
              'Rapid duckweed death or discoloration',
              'Unsafe duckweed that can’t be sold or eaten',
        ],
      },
      {
        kind: 'bullets',
        title: 'Safer Organic Alternatives',
        items: [
              'If using organic methods, choose plant-based compost or properly treated bio-fertilizers',
              'Never apply raw animal waste directly into ponds',
              'Maintain pond hygiene and clean water flow',
        ],
      },
      {
        kind: 'bullets',
        title: 'Risks to Your Duckweed & Consumers',
        items: [
              'Contaminated duckweed can make people or animals sick',
              'Water may require full draining and cleaning',
              'Reduces credibility and trust from buyers or processors',
              'Creates long-term biohazard issues in your farming system',
            ],
      },

    ],
  },
];

export const getTopicBySlug = (slug: string) =>
  EDUCATION_TOPICS.find(t => t.slug === slug);
