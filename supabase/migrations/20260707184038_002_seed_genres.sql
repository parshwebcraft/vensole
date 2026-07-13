/*
# Seed Genres

## Description
Populates the genres table with common storytelling genres for user categorization.

## New Records
- Fantasy, Romance, Science Fiction, Mystery, Horror, Thriller
- Adventure, Historical Fiction, Young Adult, Contemporary
- Paranormal, Fan Fiction, Poetry, Non-Fiction, Humor
- Drama, Action, Chick Lit, LGBTQ+, Spiritual
- Short Story, Essay, Memoir
*/
INSERT INTO genres (name, slug, description, icon, color) VALUES
('Fantasy', 'fantasy', 'Stories featuring magic, mythical creatures, and imaginary worlds', 'wand', '#8B5CF6'),
('Romance', 'romance', 'Stories focused on romantic relationships and love', 'heart', '#EC4899'),
('Science Fiction', 'science-fiction', 'Stories exploring futuristic concepts, technology, and space', 'rocket', '#3B82F6'),
('Mystery', 'mystery', 'Stories centered around solving crimes or puzzles', 'search', '#6B7280'),
('Horror', 'horror', 'Stories designed to frighten and create suspense', 'ghost', '#1F2937'),
('Thriller', 'thriller', 'Fast-paced stories with tension and excitement', 'zap', '#EF4444'),
('Adventure', 'adventure', 'Stories involving exciting journeys and exploration', 'compass', '#F59E0B'),
('Historical Fiction', 'historical-fiction', 'Stories set in the past with historical elements', 'castle', '#78716C'),
('Young Adult', 'young-adult', 'Stories targeted at teenage readers', 'star', '#06B6D4'),
('Contemporary', 'contemporary', 'Stories set in modern times with realistic themes', 'smartphone', '#10B981'),
('Paranormal', 'paranormal', 'Stories featuring supernatural phenomena', 'moon', '#A855F7'),
('Fan Fiction', 'fan-fiction', 'Stories based on existing fictional universes', 'users', '#F97316'),
('Poetry', 'poetry', 'Written works expressing emotions through verse', 'feather', '#D946EF'),
('Non-Fiction', 'non-fiction', 'Factual stories based on real events', 'book-open', '#0EA5E9'),
('Humor', 'humor', 'Stories designed to entertain and amuse', 'smile', '#84CC16'),
('Drama', 'drama', 'Stories focusing on realistic characters and conflict', 'masks', '#BE185D'),
('Action', 'action', 'Stories with intense physical action and combat', 'flame', '#DC2626'),
('Spiritual', 'spiritual', 'Stories exploring faith and spirituality', 'sparkles', '#7C3AED'),
('Short Story', 'short-story', 'Brief fictional narratives under 10,000 words', 'file-text', '#5EEAD4'),
('Essay', 'essay', 'Short non-fiction works on specific topics', 'pen', '#64748B'),
('Memoir', 'memoir', 'Personal accounts of life experiences', 'book-marked', '#B45309')
ON CONFLICT (slug) DO NOTHING;
