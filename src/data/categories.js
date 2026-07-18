export const CATEGORIES = {
  food: { label: 'フード', color: '#e8442e', soft: '#fde5e0', emoji: '🍡' },
  cafe: { label: '喫茶', color: '#e64ba0', soft: '#fbe3f1', emoji: '☕' },
  game: { label: 'ゲーム', color: '#2f7de1', soft: '#e0ecfb', emoji: '🎯' },
  exhibit: { label: '展示', color: '#8a5ce6', soft: '#ece4fb', emoji: '🎨' },
}

export const CATEGORY_IDS = Object.keys(CATEGORIES)

export const FOOD_GENRES = {
  meal: { label: 'ごはん・軽食', emoji: '🍜' },
  grill: { label: '焼き物・串', emoji: '🍢' },
  fried: { label: '揚げ物', emoji: '🍟' },
  sweets: { label: 'デザート・甘味', emoji: '🍧' },
  drink: { label: 'ドリンク', emoji: '🥤' },
  snack: { label: 'お菓子', emoji: '🍿' },
}

export const FOOD_GENRE_IDS = Object.keys(FOOD_GENRES)
