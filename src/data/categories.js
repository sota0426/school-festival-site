export const CATEGORIES = {
  food: { label: 'フード', color: '#e8442e', soft: '#fde5e0', emoji: '🍡' },
  cafe: { label: 'カフェ', color: '#e64ba0', soft: '#fbe3f1', emoji: '☕' },
  game: { label: 'ゲーム', color: '#2f7de1', soft: '#e0ecfb', emoji: '🎯' },
  exhibit: { label: '展示など', color: '#8a5ce6', soft: '#ece4fb', emoji: '🎨' },
}

export const CATEGORY_IDS = Object.keys(CATEGORIES)

export const FOOD_GENRES = {
  meal: { label: 'ごはん', emoji: '🍚', color: '#b86614', soft: '#fff1d6' },
  fried: { label: '揚げ物', emoji: '🍟', color: '#d94832', soft: '#ffe4dc' },
  sweets: { label: 'デザート', emoji: '🍧', color: '#d83b83', soft: '#ffe1ef' },
  drink: { label: 'ドリンク', emoji: '🥤', color: '#2477c9', soft: '#dfefff' },
  snack: { label: 'おやつ', emoji: '🍿', color: '#7650b8', soft: '#eee4ff' },
}

export const FOOD_GENRE_IDS = Object.keys(FOOD_GENRES)

export function pinEmojiForStall(stall) {
  if (stall.cat === 'food') return FOOD_GENRES[stall.foodGenre]?.emoji || CATEGORIES.food.emoji
  return CATEGORIES[stall.cat]?.emoji || CATEGORIES.exhibit.emoji
}
