const STORAGE_KEY = 'festival-map-annotations-v1'
const DB_NAME = 'festival-map-editor'
const IMAGE_STORE = 'map-images'

export function readMapAnnotations() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

function openImageDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => request.result.createObjectStore(IMAGE_STORE)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function imageFromDb(key) {
  const db = await openImageDb()
  return new Promise((resolve, reject) => {
    const request = db.transaction(IMAGE_STORE).objectStore(IMAGE_STORE).get(key)
    request.onsuccess = () => resolve(request.result || null)
    request.onerror = () => reject(request.error)
  })
}

export async function saveImageToDb(key, value) {
  const db = await openImageDb()
  return new Promise((resolve, reject) => {
    const request = db.transaction(IMAGE_STORE, 'readwrite').objectStore(IMAGE_STORE).put(value, key)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export function saveMapAnnotations(value) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
}
