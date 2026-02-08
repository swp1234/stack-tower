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
    name: '클래식',
    emoji: '🏗️',
    colors: ['#3498db','#e74c3c','#2ecc71','#f39c12','#9b59b6','#1abc9c','#e91e63'],
    background: '#1a1a2e',
    backgroundGradient: ['#1a1a2e','#16213e'],
    textColor: '#ecf0f1',
    unlockCondition: 'default',
    unlockFloor: 0,
    description: '기본 블록 테마'
  },
  {
    id: 'neon',
    name: '네온',
    emoji: '💡',
    colors: ['#00f0ff','#ff006e','#00ff41','#ff9e00','#9d00ff'],
    background: '#0a0a0a',
    backgroundGradient: ['#0a0a0a','#1a0a2e'],
    textColor: '#00f0ff',
    glowEffect: true,
    unlockCondition: 'floor',
    unlockFloor: 10,
    description: '10층 달성 시 해금'
  },
  {
    id: 'space',
    name: '우주',
    emoji: '🌌',
    colors: ['#2c3e50','#34495e','#7f8c8d','#16a085','#2980b9'],
    background: '#000814',
    backgroundGradient: ['#000814','#001d3d'],
    textColor: '#a8dadc',
    stars: true,
    unlockCondition: 'floor',
    unlockFloor: 30,
    description: '30층 달성 시 해금'
  },
  {
    id: 'candy',
    name: '캔디',
    emoji: '🍬',
    colors: ['#ff6b9d','#ffa07a','#ffd700','#98fb98','#dda0dd'],
    background: '#2d1b3d',
    backgroundGradient: ['#2d1b3d','#1a1a2e'],
    textColor: '#ffd700',
    unlockCondition: 'floor',
    unlockFloor: 50,
    description: '50층 달성 시 해금'
  },
  {
    id: 'retro',
    name: '레트로',
    emoji: '👾',
    colors: ['#8b4513','#d2691e','#cd853f','#f4a460','#daa520'],
    background: '#2b2b2b',
    backgroundGradient: ['#2b2b2b','#1a1a1a'],
    textColor: '#daa520',
    pixelated: true,
    unlockCondition: 'floor',
    unlockFloor: 100,
    description: '100층 달성 시 해금'
  }
];

const TITLES_DATA = [
  { floor: 1, name: '쌓기 입문자', emoji: '🐣' },
  { floor: 5, name: '초보 건축가', emoji: '🔨' },
  { floor: 10, name: '견습 건축가', emoji: '👷' },
  { floor: 15, name: '숙련된 건축가', emoji: '🏗️' },
  { floor: 20, name: '전문 건축가', emoji: '🏛️' },
  { floor: 25, name: '마스터 건축가', emoji: '🎓' },
  { floor: 30, name: '타워 전문가', emoji: '🗼' },
  { floor: 40, name: '스카이스크래퍼', emoji: '🏙️' },
  { floor: 50, name: '마천루 건설자', emoji: '🌃' },
  { floor: 60, name: '구름 정복자', emoji: '☁️' },
  { floor: 70, name: '하늘의 지배자', emoji: '🌌' },
  { floor: 80, name: '우주 건축가', emoji: '🚀' },
  { floor: 90, name: '은하계 건설자', emoji: '🌠' },
  { floor: 100, name: '세기의 건축물', emoji: '🏆' },
  { floor: 125, name: '전설의 탑', emoji: '⭐' },
  { floor: 150, name: '신화의 건축가', emoji: '💎' },
  { floor: 200, name: '차원 초월자', emoji: '🔮' },
  { floor: 250, name: '시공간 지배자', emoji: '⚡' },
  { floor: 300, name: '절대자', emoji: '👑' },
  { floor: 500, name: '신의 경지', emoji: '🌟' }
];

const SPECIAL_TITLES = [
  { id: 'perfect_10', condition: 'perfect_streak', value: 10, name: '퍼펙셔니스트', emoji: '💯' },
  { id: 'perfect_30', condition: 'perfect_streak', value: 30, name: '타이밍의 신', emoji: '⏱️' },
  { id: 'veteran', condition: 'total_floors', value: 1000, name: '베테랑', emoji: '🎖️' },
  { id: 'legend', condition: 'total_floors', value: 10000, name: '레전드', emoji: '👑' }
];
