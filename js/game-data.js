// Stack Tower - Game Data (Themes, Titles, Config)

const GAME_CONFIG = {
  canvasWidth: 400,
  canvasHeight: 700,
  blockInitialWidth: 160,
  blockHeight: 28,
  blockInitialSpeed: 2.5,
  speedIncrement: 0.3,
  speedIncrementInterval: 5,
  maxSpeed: 8,
  gravity: 0.5,
  perfectThreshold: 5,
  goodThreshold: 15,
  minBlockWidth: 12,
  maxBlockWidth: 200,
  scoring: {
    basePoints: 10,
    perfectBonus: 50,
    comboMultiplier: 10,
    floorBonus: 100,
    floorBonusInterval: 10
  },
  ads: {
    interstitialFrequency: 3
  }
};

const THEMES_DATA = [
  {
    id: 'classic',
    name: 'Classic',
    nameKey: 'themes.classic',
    emoji: '🏗️',
    colors: ['#3498db','#e74c3c','#2ecc71','#f39c12','#9b59b6','#1abc9c','#e91e63'],
    background: '#1a1a2e',
    backgroundGradient: ['#1a1a2e','#16213e'],
    textColor: '#ecf0f1',
    unlockCondition: 'default',
    unlockFloor: 0,
    description: 'Default block theme',
    descKey: 'themeDesc.classic'
  },
  {
    id: 'neon',
    name: 'Neon',
    nameKey: 'themes.neon',
    emoji: '💡',
    colors: ['#00f0ff','#ff006e','#00ff41','#ff9e00','#9d00ff'],
    background: '#0a0a0a',
    backgroundGradient: ['#0a0a0a','#1a0a2e'],
    textColor: '#00f0ff',
    glowEffect: true,
    unlockCondition: 'floor',
    unlockFloor: 10,
    description: 'Unlock at floor 10',
    descKey: 'themeDesc.neon'
  },
  {
    id: 'space',
    name: 'Space',
    nameKey: 'themes.space',
    emoji: '🌌',
    colors: ['#2c3e50','#34495e','#7f8c8d','#16a085','#2980b9'],
    background: '#000814',
    backgroundGradient: ['#000814','#001d3d'],
    textColor: '#a8dadc',
    stars: true,
    unlockCondition: 'floor',
    unlockFloor: 30,
    description: 'Unlock at floor 30',
    descKey: 'themeDesc.space'
  },
  {
    id: 'candy',
    name: 'Candy',
    nameKey: 'themes.candy',
    emoji: '🍬',
    colors: ['#ff6b9d','#ffa07a','#ffd700','#98fb98','#dda0dd'],
    background: '#2d1b3d',
    backgroundGradient: ['#2d1b3d','#1a1a2e'],
    textColor: '#ffd700',
    unlockCondition: 'floor',
    unlockFloor: 50,
    description: 'Unlock at floor 50',
    descKey: 'themeDesc.candy'
  },
  {
    id: 'retro',
    name: 'Retro',
    nameKey: 'themes.retro',
    emoji: '👾',
    colors: ['#8b4513','#d2691e','#cd853f','#f4a460','#daa520'],
    background: '#2b2b2b',
    backgroundGradient: ['#2b2b2b','#1a1a1a'],
    textColor: '#daa520',
    pixelated: true,
    unlockCondition: 'floor',
    unlockFloor: 100,
    description: 'Unlock at floor 100',
    descKey: 'themeDesc.retro'
  },
  {
    id: 'sakura',
    name: 'Sakura',
    nameKey: 'themes.sakura',
    emoji: '🌸',
    colors: ['#ffb7c5','#ff69b4','#db7093','#c71585','#ff1493'],
    background: '#1a0a14',
    backgroundGradient: ['#1a0a14','#2d1020'],
    textColor: '#ffb7c5',
    glowEffect: true,
    unlockCondition: 'floor',
    unlockFloor: 75,
    description: 'Unlock at floor 75',
    descKey: 'themeDesc.sakura'
  }
];

const TITLES_DATA = [
  { floor: 1, name: 'Stacking Beginner', nameKey: 'titles.1', emoji: '🐣' },
  { floor: 5, name: 'Novice Builder', nameKey: 'titles.5', emoji: '🔨' },
  { floor: 10, name: 'Apprentice Builder', nameKey: 'titles.10', emoji: '👷' },
  { floor: 15, name: 'Skilled Builder', nameKey: 'titles.15', emoji: '🏗️' },
  { floor: 20, name: 'Expert Builder', nameKey: 'titles.20', emoji: '🏛️' },
  { floor: 25, name: 'Master Builder', nameKey: 'titles.25', emoji: '🎓' },
  { floor: 30, name: 'Tower Expert', nameKey: 'titles.30', emoji: '🗼' },
  { floor: 40, name: 'Skyscraper', nameKey: 'titles.40', emoji: '🏙️' },
  { floor: 50, name: 'High-rise Builder', nameKey: 'titles.50', emoji: '🌃' },
  { floor: 60, name: 'Cloud Conqueror', nameKey: 'titles.60', emoji: '☁️' },
  { floor: 70, name: 'Sky Ruler', nameKey: 'titles.70', emoji: '🌌' },
  { floor: 80, name: 'Space Architect', nameKey: 'titles.80', emoji: '🚀' },
  { floor: 90, name: 'Galaxy Builder', nameKey: 'titles.90', emoji: '🌠' },
  { floor: 100, name: 'Masterpiece', nameKey: 'titles.100', emoji: '🏆' },
  { floor: 125, name: 'Legendary Tower', nameKey: 'titles.125', emoji: '⭐' },
  { floor: 150, name: 'Mythical Architect', nameKey: 'titles.150', emoji: '💎' },
  { floor: 200, name: 'Dimension Transcender', nameKey: 'titles.200', emoji: '🔮' },
  { floor: 250, name: 'Spacetime Ruler', nameKey: 'titles.250', emoji: '⚡' },
  { floor: 300, name: 'The Absolute', nameKey: 'titles.300', emoji: '👑' },
  { floor: 500, name: 'Divine Level', nameKey: 'titles.500', emoji: '🌟' }
];

const SPECIAL_TITLES = [
  { id: 'perfect_10', condition: 'perfect_streak', value: 10, name: 'Perfectionist', nameKey: 'specialTitles.perfect_10', emoji: '💯' },
  { id: 'perfect_30', condition: 'perfect_streak', value: 30, name: 'Timing God', nameKey: 'specialTitles.perfect_30', emoji: '⏱️' },
  { id: 'veteran', condition: 'total_floors', value: 1000, name: 'Veteran', nameKey: 'specialTitles.veteran', emoji: '🎖️' },
  { id: 'legend', condition: 'total_floors', value: 10000, name: 'Legend', nameKey: 'specialTitles.legend', emoji: '👑' }
];
