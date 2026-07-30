export const CATEGORIES = {
  food: { label: 'フード全般', color: '#e8442e', soft: '#fde5e0', emoji: '🍡' },
  cafe: { label: '喫茶・カフェ', color: '#e64ba0', soft: '#fbe3f1', emoji: '☕' },
  game: { label: 'ゲーム', color: '#2f7de1', soft: '#e0ecfb', emoji: '🎯' },
  exhibit: { label: '展示など', color: '#8a5ce6', soft: '#ece4fb', emoji: '🎨' },
}

export const CATEGORY_IDS = Object.keys(CATEGORIES)

export const FOOD_GENRES = {
  meal: { label: 'ごはん', emoji: '🍚' },
  fried: { label: '揚げ物', emoji: '🍟' },
  sweets: { label: 'デザート', emoji: '🍧' },
  drink: { label: 'ドリンク', emoji: '🥤' },
  snack: { label: 'おやつ', emoji: '🍿' },
}

export const FOOD_GENRE_IDS = Object.keys(FOOD_GENRES)
