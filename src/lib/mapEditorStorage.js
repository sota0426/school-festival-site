const STORAGE_KEY = 'festival-map-annotations-v1'

export function readMapAnnotations() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

export function saveMapAnnotations(value) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
}
