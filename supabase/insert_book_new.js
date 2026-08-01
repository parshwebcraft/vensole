const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// 1. Read environment variables from .env
const envPath = path.join(__dirname, '../.env');
if (!fs.existsSync(envPath)) {
  console.error('.env file not found at:', envPath);
  process.exit(1);
}

const envText = fs.readFileSync(envPath, 'utf8');
const getEnvVar = (name) => {
  const match = envText.match(new RegExp(`${name}=(.*)`));
  return match ? match[1].trim() : null;
};

const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing in .env file.');
  process.exit(1);
}

console.log('Connecting to Supabase:', supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const htmlPath = path.join(__dirname, '../book/index.html');
if (!fs.existsSync(htmlPath)) {
  console.error('Book HTML file not found at:', htmlPath);
  process.exit(1);
}
const html = fs.readFileSync(htmlPath, 'utf8');

function stripTags(str) {
  return str
    .replace(/<[^>]*>/g, '')
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&lsquo;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&raquo;/g, '»')
    .replace(/&laquo;/g, '«')
    .replace(/&mdash;/g, '—')
    .replace(/&hellip;/g, '...')
    .trim();
}

function parseBook() {
  const sections = html.split('<section class="chapter"');
  const chapters = [];

  for (let i = 1; i < sections.length; i++) {
    const section = sections[i].split('</section>')[0];
    
    // Extract ID (chapter number)
    const idMatch = section.match(/id="ch(\d+)"/);
    const chapterNumber = idMatch ? parseInt(idMatch[1], 10) : i;

    // Extract title
    const titleMatch = section.match(/<h2 class="ch-title">([\s\S]*?)<\/h2>/);
    let title = titleMatch ? stripTags(titleMatch[1]) : `Chapter ${chapterNumber}`;

    // Extract letter ranges
    const letterRegex = /<div class="letter[^"]*"[^>]*>([\s\S]*?)<\/div>/g;
    const letterRanges = [];
    let lMatch;
    while ((lMatch = letterRegex.exec(section)) !== null) {
      letterRanges.push({ start: lMatch.index, end: lMatch.index + lMatch[0].length });
    }

    const items = [];

    // Find all p matches
    const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/g;
    let pMatch;
    while ((pMatch = pRegex.exec(section)) !== null) {
      if (pMatch[0].includes('class="ch-tag"')) continue; 
      items.push({
        type: 'p',
        index: pMatch.index,
        content: stripTags(pMatch[1])
      });
    }

    // Find all br matches
    const brRegex = /<div class="br[^"]*"[^>]*>/g;
    let brMatch;
    while ((brMatch = brRegex.exec(section)) !== null) {
      items.push({
        type: 'br',
        index: brMatch.index,
        content: '***'
      });
    }

    // Sort all items by index
    items.sort((a, b) => a.index - b.index);

    const paragraphs = [];
    for (const item of items) {
      if (item.type === 'br') {
        paragraphs.push(item.content);
      } else {
        const isLetter = letterRanges.some(r => item.index >= r.start && item.index < r.end);
        if (isLetter) {
          paragraphs.push(`> ${item.content}`);
        } else {
          paragraphs.push(item.content);
        }
      }
    }

    const content = paragraphs.join('\n\n');
    const wordCount = content.split(/\s+/).filter(Boolean).length;

    chapters.push({
      chapter_number: chapterNumber,
      title: title,
      content: content,
      word_count: wordCount
    });
  }

  return chapters;
}

async function run() {
  console.log('Parsing book HTML...');
  const chapters = parseBook();
  console.log(`Parsed ${chapters.length} chapters successfully.`);

  // Calculate total word count
  const totalWordCount = chapters.reduce((sum, ch) => sum + ch.word_count, 0);

  const email = "rhythm@vensoul.com";
  const password = "RhythmLoveStory2026!";
  let userId;

  console.log('Authenticating user...');
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  
  if (signInError) {
    console.log('Signing up user rhythm@vensoul.com...');
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });
    if (signUpError) {
      console.error('Error signing up user:', signUpError.message);
      return;
    }
    userId = signUpData.user.id;
    console.log('User signed up successfully. Creating profile Rhythm...');
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: userId,
      username: 'Rhythm',
      display_name: 'Rhythm',
      role: 'writer'
    });
    if (profileError) {
      console.error('Error creating profile:', profileError.message);
      return;
    }
  } else {
    userId = signInData.user.id;
    console.log('Logged in successfully. User ID:', userId);
  }

  // Fetch the actual ID of the Romance genre from the database dynamically
  console.log('Fetching Romance genre ID dynamically...');
  const { data: genreData, error: genreFindError } = await supabase
    .from('genres')
    .select('id')
    .eq('slug', 'romance')
    .maybeSingle();

  if (genreFindError || !genreData) {
    console.error('Error finding Romance genre. Please ensure the SQL schema is executed first.', genreFindError?.message);
    return;
  }
  const romanceGenreId = genreData.id;
  console.log('Romance Genre ID found:', romanceGenreId);

  // Delete existing story if it exists to avoid duplicate entries
  console.log('Checking for existing story with slug "i-moved-on-my-heart-didnt"...');
  const { data: existingStories } = await supabase
    .from('stories')
    .select('id')
    .eq('slug', 'i-moved-on-my-heart-didnt');

  if (existingStories && existingStories.length > 0) {
    console.log('Deleting existing story...');
    await supabase.from('stories').delete().eq('slug', 'i-moved-on-my-heart-didnt');
  }

  // Insert Story
  console.log('Inserting story...');
  const storyData = {
    author_id: userId,
    title: "I Moved On. My Heart Didn't.",
    slug: "i-moved-on-my-heart-didnt",
    description: "A story about love that survives. Hearts that don't. And the terrifying distance between the two.",
    cover_url: "/images/book_1_cover_full.jpg", 
    language: "en",
    status: "published",
    content_rating: "general",
    word_count: totalWordCount,
    chapter_count: chapters.length,
    is_premium: false,
    is_featured: true,
    published_at: new Date().toISOString()
  };

  const { data: story, error: storyError } = await supabase
    .from('stories')
    .insert(storyData)
    .select()
    .single();

  if (storyError) {
    console.error('Error inserting story:', storyError.message);
    return;
  }
  console.log('Story inserted successfully. Story ID:', story.id);

  // Link to Romance Genre
  console.log('Linking to Romance genre...');
  const { error: genreLinkError } = await supabase
    .from('story_genres')
    .insert({
      story_id: story.id,
      genre_id: romanceGenreId
    });

  if (genreLinkError) {
    console.error('Error linking genre:', genreLinkError.message);
  } else {
    console.log('Linked to Romance genre successfully.');
  }

  // Insert Chapters
  console.log('Inserting chapters...');
  for (const ch of chapters) {
    const chapterData = {
      story_id: story.id,
      author_id: userId,
      title: ch.title,
      content: ch.content,
      chapter_number: ch.chapter_number,
      word_count: ch.word_count,
      status: "published",
      is_premium: false,
      published_at: new Date().toISOString()
    };

    const { error: chError } = await supabase.from('chapters').insert(chapterData);
    if (chError) {
      console.error(`Error inserting chapter ${ch.chapter_number}:`, chError.message);
    }
  }

  console.log('All chapters inserted successfully! Book integration complete.');
}

run();
