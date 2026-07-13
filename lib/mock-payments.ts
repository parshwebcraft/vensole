export const MOCK_BOOK_PRICE_INR = 99

export function getMockPurchaseKey(storyId: string) {
  return `vensoul-mock-purchase-${storyId}`
}

export function isMockBookUnlocked(storyId: string) {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(getMockPurchaseKey(storyId)) === 'paid'
}

export function unlockMockBook(storyId: string) {
  if (typeof window === 'undefined') return

  localStorage.setItem(getMockPurchaseKey(storyId), 'paid')
}

export function resetMockBookUnlock(storyId: string) {
  if (typeof window === 'undefined') return

  localStorage.removeItem(getMockPurchaseKey(storyId))
}

export function isFreePreviewChapter(chapterNumber: number) {
  return chapterNumber <= 1
}
