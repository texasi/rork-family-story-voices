export type StoryTemplate = {
  id: string;
  title: string;
  description: string;
  emoji: string;
  lengthMin: [number, number];
  themes: string[];
};

export const STORY_TEMPLATES: StoryTemplate[] = [
  {
    id: 'goodnight_adventure',
    title: 'Goodnight Adventure',
    description: 'A gentle journey to dreamland with your favorite friend',
    emoji: '🌙',
    lengthMin: [2, 4],
    themes: ['space', 'forest', 'ocean', 'clouds'],
  },
  {
    id: 'cozy_forest',
    title: 'The Cozy Forest',
    description: 'Snuggle up with woodland creatures in their warm homes',
    emoji: '🌲',
    lengthMin: [2, 3],
    themes: ['animals', 'treehouse', 'campfire', 'stars'],
  },
  {
    id: 'space_pillow',
    title: 'Space Pillow Journey',
    description: 'Float through the stars on a magical pillow ride',
    emoji: '🚀',
    lengthMin: [3, 4],
    themes: ['planets', 'stars', 'moon', 'astronaut'],
  },
  {
    id: 'rainy_day_dreams',
    title: 'Rainy Day Dreams',
    description: 'Listen to the rain and drift into peaceful sleep',
    emoji: '🌧️',
    lengthMin: [2, 3],
    themes: ['rain', 'cozy', 'window', 'blanket'],
  },
];
