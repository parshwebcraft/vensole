const UNSPLASH_FALLBACKS = [
  'https://images.unsplash.com/photo-1543002588-bfa74002ed7e', // Open book in warm light
  'https://images.unsplash.com/photo-1544947950-fa07a98d237f', // Cozy reading stack
  'https://images.unsplash.com/photo-1512820790803-83ca734da794', // Vintage book covers
  'https://images.unsplash.com/photo-1474932430478-367db26836c1', // Fountain pen on paper
  'https://images.unsplash.com/photo-1516979187457-637abb4f9353', // Stack of open pages
  'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6', // Reading with coffee mug
  'https://images.unsplash.com/photo-1497633762265-9d179a990aa6', // Beautiful classical library
  'https://images.unsplash.com/photo-1519681393784-d120267933ba', // Starry mountains
  'https://images.unsplash.com/photo-1509021436665-8f37da1e10c3', // Dark moody woods
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23', // Medieval stone castle
  'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8', // Warm wooden writing desk
  'https://images.unsplash.com/photo-1476275466078-4007374efbbe', // Reading outdoors on grass
  'https://images.unsplash.com/photo-1518199266791-5375a83190b7', // Romantic hands under light
  'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4', // Sparkles/fire in dark background
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800', // Scenic winding desert road
  'https://images.unsplash.com/photo-1501504905252-473c47e087f8'  // Writing notes in cafe
]

export function getUnsplashCover(id: string | null | undefined, width = 400, height = 600): string {
  if (!id) {
    return `${UNSPLASH_FALLBACKS[0]}?w=${width}&h=${height}&fit=crop`;
  }
  
  // Calculate a deterministic index based on the string id
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const index = Math.abs(hash) % UNSPLASH_FALLBACKS.length;
  return `${UNSPLASH_FALLBACKS[index]}?w=${width}&h=${height}&fit=crop`;
}
