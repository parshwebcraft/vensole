const fs = require('fs');
const path = require('path');

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
    .replace(/'/g, "''") // Escape single quotes for SQL
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

function run() {
  console.log('Parsing book HTML...');
  const chapters = parseBook();
  console.log(`Parsed ${chapters.length} chapters successfully.`);

  const totalWordCount = chapters.reduce((sum, ch) => sum + ch.word_count, 0);

  let sql = `-- =========================================================================\n`;
  sql += `-- VENSOULL — Romance Book Seed Script\n`;
  sql += `-- Run this script inside the Supabase SQL Editor\n`;
  sql += `-- =========================================================================\n\n`;
  sql += `CREATE EXTENSION IF NOT EXISTS pgcrypto;\n\n`;
  sql += `-- Create helper function to increment views bypassing RLS\n`;
  sql += `CREATE OR REPLACE FUNCTION increment_story_views(story_id uuid)\n`;
  sql += `RETURNS void AS $$\n`;
  sql += `BEGIN\n`;
  sql += `  UPDATE stories\n`;
  sql += `  SET views_count = COALESCE(views_count, 0) + 1\n`;
  sql += `  WHERE id = story_id;\n`;
  sql += `END;\n`;
  sql += `$$ LANGUAGE plpgsql SECURITY DEFINER;\n\n`;
  
  sql += `DO $$\n`;
  sql += `DECLARE\n`;
  sql += `  v_author_id uuid;\n`;
  sql += `  v_story_id uuid;\n`;
  sql += `  v_genre_id uuid;\n`;
  sql += `BEGIN\n`;
  sql += `  -- 1. Fetch or create user ID for rhythm@vensoul.com (direct DB insert to bypass auth limits)\n`;
  sql += `  SELECT id INTO v_author_id FROM auth.users WHERE email = 'rhythm@vensoul.com' LIMIT 1;\n\n`;
  
  sql += `  IF v_author_id IS NULL THEN\n`;
  sql += `    v_author_id := gen_random_uuid();\n`;
  sql += `    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud, confirmation_token)\n`;
  sql += `    VALUES (\n`;
  sql += `      v_author_id,\n`;
  sql += `      '00000000-0000-0000-0000-000000000000',\n`;
  sql += `      'rhythm@vensoul.com',\n`;
  sql += `      crypt('RhythmLoveStory2026!', gen_salt('bf')),\n`;
  sql += `      now(),\n`;
  sql += `      '{"provider":"email","providers":["email"]}'::jsonb,\n`;
  sql += `      '{}'::jsonb,\n`;
  sql += `      now(),\n`;
  sql += `      now(),\n`;
  sql += `      'authenticated',\n`;
  sql += `      'authenticated',\n`;
  sql += `      ''\n`;
  sql += `    );\n`;
  sql += `  END IF;\n\n`;

  sql += `  -- 2. Upsert profile for Rhythm\n`;
  sql += `  INSERT INTO profiles (id, username, display_name, role)\n`;
  sql += `  VALUES (v_author_id, 'Rhythm', 'Rhythm', 'writer')\n`;
  sql += `  ON CONFLICT (id) DO UPDATE SET display_name = 'Rhythm', role = 'writer';\n\n`;

  sql += `  -- 3. Fetch Romance genre ID\n`;
  sql += `  SELECT id INTO v_genre_id FROM genres WHERE slug = 'romance' LIMIT 1;\n\n`;

  sql += `  -- 4. Upsert Story\n`;
  sql += `  INSERT INTO stories (author_id, title, slug, description, cover_url, language, status, content_rating, word_count, chapter_count, is_premium, is_featured, published_at)\n`;
  sql += `  VALUES (\n`;
  sql += `    v_author_id, \n`;
  sql += `    'I Moved On. My Heart Didn''t.', \n`;
  sql += `    'i-moved-on-my-heart-didnt', \n`;
  sql += `    'A story about love that survives. Hearts that don''t. And the terrifying distance between the two.', \n`;
  sql += `    '/images/book_1_cover_full.jpg', \n`;
  sql += `    'en', \n`;
  sql += `    'published', \n`;
  sql += `    'general', \n`;
  sql += `    ${totalWordCount}, \n`;
  sql += `    ${chapters.length}, \n`;
  sql += `    false, \n`;
  sql += `    true, \n`;
  sql += `    now()\n`;
  sql += `  )\n`;
  sql += `  ON CONFLICT (slug) DO UPDATE SET author_id = EXCLUDED.author_id, title = EXCLUDED.title\n`;
  sql += `  RETURNING id INTO v_story_id;\n\n`;

  sql += `  -- 5. Link Story to Romance Genre\n`;
  sql += `  IF v_story_id IS NOT NULL AND v_genre_id IS NOT NULL THEN\n`;
  sql += `    INSERT INTO story_genres (story_id, genre_id)\n`;
  sql += `    VALUES (v_story_id, v_genre_id)\n`;
  sql += `    ON CONFLICT DO NOTHING;\n`;
  sql += `  END IF;\n\n`;

  sql += `  -- 6. Clean existing chapters to prevent unique constraint conflicts\n`;
  sql += `  DELETE FROM chapters WHERE story_id = v_story_id;\n\n`;

  sql += `  -- 7. Insert Chapters\n`;
  for (const ch of chapters) {
    sql += `  INSERT INTO chapters (story_id, author_id, title, content, chapter_number, word_count, status, is_premium, published_at)\n`;
    sql += `  VALUES (\n`;
    sql += `    v_story_id, \n`;
    sql += `    v_author_id, \n`;
    sql += `    '${ch.title}', \n`;
    sql += `    '${ch.content}', \n`;
    sql += `    ${ch.chapter_number}, \n`;
    sql += `    ${ch.word_count}, \n`;
    sql += `    'published', \n`;
    sql += `    false, \n`;
    sql += `    now()\n`;
    sql += `  );\n\n`;
  }

  sql += `  RAISE NOTICE 'Book seeding completed successfully.';\n`;
  sql += `END $$;\n`;

  const outputPath = path.join(__dirname, 'seed_book.sql');
  fs.writeFileSync(outputPath, sql, 'utf8');
  console.log(`Successfully generated seed SQL file at: ${outputPath}`);
}

run();
