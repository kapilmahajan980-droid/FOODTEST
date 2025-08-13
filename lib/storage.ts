// IndexedDB utility for storing large files (videos/images)
const DB_NAME = 'HotelVegDB'
const DB_VERSION = 1
const STORE_NAME = 'dishes'

export interface StoredDish {
  id: string
  name: string
  category: string
  price: number
  description: string
  rating: number
  image: string
  video: string
  imageBlob?: Blob
  videoBlob?: Blob
}

// Initialize IndexedDB
export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }
  })
}

// Store dish with large files
export const storeDish = async (dish: StoredDish): Promise<void> => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.put(dish)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

// Get all dishes
export const getAllDishes = async (): Promise<StoredDish[]> => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.getAll()
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

// Delete a dish
export const deleteDish = async (id: string): Promise<void> => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.delete(id)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

// Convert file to blob URL for display
export const createBlobURL = (blob: Blob): string => {
  return URL.createObjectURL(blob)
}

// Compress image before storing
export const compressImage = (file: File, maxWidth: number = 800, quality: number = 0.8): Promise<Blob> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const img = new Image()
    
    img.onload = () => {
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height)
      canvas.width = img.width * ratio
      canvas.height = img.height * ratio
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(resolve, 'image/jpeg', quality)
    }
    
    img.src = URL.createObjectURL(file)
  })
}

// Get storage usage info
export const getStorageUsage = async (): Promise<{ used: number; quota: number }> => {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate()
    return {
      used: estimate.usage || 0,
      quota: estimate.quota || 0
    }
  }
  return { used: 0, quota: 0 }
}
