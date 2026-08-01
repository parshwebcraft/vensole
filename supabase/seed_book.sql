-- =========================================================================
-- VENSOULL — Romance Book Seed Script
-- Run this script inside the Supabase SQL Editor
-- =========================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create helper function to increment views bypassing RLS
CREATE OR REPLACE FUNCTION increment_story_views(story_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE stories
  SET views_count = COALESCE(views_count, 0) + 1
  WHERE id = story_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$
DECLARE
  v_author_id uuid;
  v_story_id uuid;
  v_genre_id uuid;
BEGIN
  -- 1. Fetch or create user ID for rhythm@vensoul.com (direct DB insert to bypass auth limits)
  SELECT id INTO v_author_id FROM auth.users WHERE email = 'rhythm@vensoul.com' LIMIT 1;

  IF v_author_id IS NULL THEN
    v_author_id := gen_random_uuid();
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud, confirmation_token)
    VALUES (
      v_author_id,
      '00000000-0000-0000-0000-000000000000',
      'rhythm@vensoul.com',
      crypt('RhythmLoveStory2026!', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{}'::jsonb,
      now(),
      now(),
      'authenticated',
      'authenticated',
      ''
    );
  END IF;

  -- 2. Upsert profile for Rhythm
  INSERT INTO profiles (id, username, display_name, role)
  VALUES (v_author_id, 'Rhythm', 'Rhythm', 'writer')
  ON CONFLICT (id) DO UPDATE SET display_name = 'Rhythm', role = 'writer';

  -- 3. Fetch Romance genre ID
  SELECT id INTO v_genre_id FROM genres WHERE slug = 'romance' LIMIT 1;

  -- 4. Upsert Story
  INSERT INTO stories (author_id, title, slug, description, cover_url, language, status, content_rating, word_count, chapter_count, is_premium, is_featured, published_at)
  VALUES (
    v_author_id, 
    'I Moved On. My Heart Didn''t.', 
    'i-moved-on-my-heart-didnt', 
    'A story about love that survives. Hearts that don''t. And the terrifying distance between the two.', 
    '/images/book_1_cover_full.jpg', 
    'en', 
    'published', 
    'general', 
    7885, 
    21, 
    false, 
    true, 
    now()
  )
  ON CONFLICT (slug) DO UPDATE SET author_id = EXCLUDED.author_id, title = EXCLUDED.title
  RETURNING id INTO v_story_id;

  -- 5. Link Story to Romance Genre
  IF v_story_id IS NOT NULL AND v_genre_id IS NOT NULL THEN
    INSERT INTO story_genres (story_id, genre_id)
    VALUES (v_story_id, v_genre_id)
    ON CONFLICT DO NOTHING;
  END IF;

  -- 6. Clean existing chapters to prevent unique constraint conflicts
  DELETE FROM chapters WHERE story_id = v_story_id;

  -- 7. Insert Chapters
  INSERT INTO chapters (story_id, author_id, title, content, chapter_number, word_count, status, is_premium, published_at)
  VALUES (
    v_story_id, 
    v_author_id, 
    'The Day I Stopped Waiting', 
    'People think heartbreak happens in a single moment.

It doesn''t.

It breaks slowly and quietly, in pieces — a little when they stop calling, a little when their name disappears from your notifications, a little when you realize you''re the only one still holding on.

And then one day, you wake up and discover that the person you loved has become someone you remember.

That''s when the real heartbreak begins.

***

***

The last message from him sat untouched in my phone, three words long.

Take care, Rhythm.

No explanation, no dramatic goodbye, no promises, no anger — just three simple words that somehow felt heavier than every conversation we''d ever had.

Take care. As if he wasn''t the person who taught me what feeling alive was. As if he wasn''t the reason every song suddenly had meaning. As if he wasn''t the first person I wanted to tell whenever something good happened. And the first person I wanted when things went wrong.

I stared at those words for weeks, waiting for another message, another explanation, another chance.

Nothing came.

***

***

The strange thing about losing someone is that the world doesn''t stop with you. The trains still arrive on time. Coffee shops still open every morning. Friends still laugh at jokes. The city still glows at night.

Everything continues. Except you.

You stay trapped somewhere between what happened and what could have been. Watching everyone move forward while you''re still standing in the ruins.

For months, I carried Aarav everywhere — not physically, since memories don''t need suitcases, they travel light. He was in the corner table of a café, the smell of old books, the first rain of July, a song playing from a passing car. Everywhere and nowhere at the same time.

***

***

Then one day, something changed — not dramatically, no life-changing realization or grand speech. I simply got tired: tired of waiting, tired of hoping, tired of reopening wounds that had never been allowed to heal.

So I did what everyone told me to do. I moved on. I deleted old photos, stopped rereading conversations, stopped checking whether he had viewed my stories, stopped searching for signs that he missed me too.

I built a new routine. A new life. A new version of myself. And slowly... it worked. The days became easier. The nights became quieter. The memories became softer.

Not happy. But okay.

And sometimes, okay is enough.

***

***

Two years later, I was standing in a bookstore on a rainy Thursday evening. Just another ordinary version of me. The version that had survived. The version that had moved on.

I was reaching for a novel when another hand touched the same book, and my fingers froze as time slowed and the world blurred.

And suddenly, after two years of silence...

There he was. Aarav.

Older, different, familiar — the kind of familiar that hurts. For a second, neither of us spoke, because some people aren''t memories. They''re earthquakes. Even after years, they can still shake everything inside you.

"Hi," he finally said. Just one word. Simple. Normal. Harmless. Yet somehow my heartbeat forgot how to behave. "Hi." That was all I managed. Years of unanswered questions. Years of missing someone. Years of imagining this exact moment. And all we had were two awkward greetings.

Funny how life works.

***

***

He smiled politely. The same smile that once felt like home. "You look happy," he said. I almost laughed. People always say that. As if happiness can be measured by someone''s face. As if they can see the ghosts living behind your eyes. "I am," I replied. And for the first time, it wasn''t entirely a lie.

We talked for ten minutes, maybe fifteen, about work and life and the weather — everything except the thing that mattered. Us. Because sometimes the biggest conversations hide behind the smallest ones.

Eventually he glanced at his watch. "I should go." Of course he should. People always leave. That''s what they do. He smiled one last time.

"Take care, Rhythm."

The same words. The same goodbye. The same ache. And just like that, he was gone. Again.

***

***

I stood there long after Aarav left. Rain tapping softly against the glass. People moving around me. Life continuing. Just like it always had. And that''s when I realized something terrifying.

I had moved on. My life had moved on. My habits had moved on. My routine had moved on. Even my pain had moved on. But somewhere deep inside me — a place time had never reached —

my heart still hadn''t.

And for the first time in two years, it whispered his name again.

Aarav.

I had buried the memories, silenced the questions, and outgrown the pain.

But some loves don''t die. They simply learn how to haunt you quietly.', 
    1, 
    809, 
    'published', 
    false, 
    now()
  );

  INSERT INTO chapters (story_id, author_id, title, content, chapter_number, word_count, status, is_premium, published_at)
  VALUES (
    v_story_id, 
    v_author_id, 
    'The Things I Never Published', 
    'For a long time, I thought healing looked like progress.

New cafés, new routines, new stories — a life that no longer had Aarav''s fingerprints all over it. So that''s exactly what I built. A life without him, at least from the outside.

I changed apartments, started writing under a new pen name, cut my hair shorter, filled my shelves with books I never had time to read, started drinking black coffee even though I hated the taste. Little things — tiny rebellions against a past that refused to leave me alone.

People noticed. "You seem different." "You seem happier." "You seem stronger." Maybe I was. Or maybe I had simply become better at hiding the cracks.

***

***

The truth lived inside a folder on my laptop that nobody knew existed — not my readers, not my friends, not even the version of me that smiled during interviews and book signings.

The folder was called: Unpublished.

Inside were hundreds of pages — stories, letters, fragments — every single one written for him, and every single one unfinished.

> October 12.

> "Today my second novel got accepted. You would''ve been the first person I called. Success feels strange when the person you wanted to celebrate with isn''t here."

> December 24.

> "The city looks beautiful tonight. The lights remind me of that Christmas when we got lost and pretended we weren''t. I still catch myself looking for you in crowded places."

> March 17.

> "I saw someone wearing your favorite jacket today. For three seconds, my heart forgot what reality looked like."

I never published them. Not because they weren''t good enough. But because every sentence belonged to him. And some stories aren''t meant to be shared with the world. Only with the person they were written for.

***

***

One night, unable to sleep, I opened the folder again. The oldest document sat at the very top. Written the night Aarav left. I had never been brave enough to read it. Until now.

My fingers hovered over the screen. Not because I was scared. Because I remembered. And sometimes memories weigh more than grief itself. I clicked. The room glowed softly in the darkness. And there she was. The old version of me. The girl who still believed love could survive distance. The girl who thought goodbye was temporary. The girl who still sounded hopeful.

And for the first time in two years... I began to read.

Some stories remain unfinished not because the writer gave up.

But because her heart never found the courage to write the ending.', 
    2, 
    433, 
    'published', 
    false, 
    now()
  );

  INSERT INTO chapters (story_id, author_id, title, content, chapter_number, word_count, status, is_premium, published_at)
  VALUES (
    v_story_id, 
    v_author_id, 
    'The Version of You I Remember', 
    'There are two versions of every person we lose.

The one who existed. And the one memory creates. The second one is always harder to forget.

Because memories don''t keep the bad days. They don''t keep the arguments. The silences. The disappointments. They keep the laughter. The warmth. The moments that made you believe forever was a real thing.

***

***

For days after the bookstore, I couldn''t write, which was ironic — writing had always been my escape, my refuge, my way of making sense of things that didn''t make sense. But every sentence I started somehow found its way back to him. Every character carried pieces of Aarav. Every love story sounded like us. Every ending felt wrong.

One evening, frustrated, I closed my laptop and went for a walk. The city was glowing beneath the rain. Streetlights blurred against wet pavement. People hurried home. Couples shared umbrellas. Strangers passed without looking at each other. And somehow all of it felt unbearably lonely.

***

***

I found myself standing outside a small coffee shop — our coffee shop, the place where Aarav had once spent three hours convincing me that pineapple belonged on pizza, where he accidentally spilled coffee on my manuscript and spent a week apologizing for it, where we used to sit by the window and talk about futures that never happened.

After two years, my feet still remembered places my heart pretended to forget.

So I went inside. The café looked different. New chairs. New paint. Different music. But some things remained the same. The smell of coffee. The sound of rain against the glass. The empty seat across from me. The one that used to belong to him.

I ordered a coffee and opened my notebook. A blank page stared back. I wrote three words. "Aarav was here." Then immediately crossed them out. Because he wasn''t. That was the problem. He wasn''t here. And somehow that still hurt.

***

***

I sat there for almost an hour. Thinking. Remembering. Missing. Until a question appeared in my mind. One I had spent years avoiding.

Did I miss Aarav?

Or did I miss the girl I used to be when I loved him?

The girl who believed everything would work out. The girl who wasn''t afraid of getting hurt. The girl who thought some people stayed forever. Maybe that was who I was mourning. Not him. Her. And somehow... that realization felt even sadder. Because people come back sometimes. But old versions of ourselves rarely do.

I kept searching for the boy I used to love.

Only to realize I was really searching for the girl I used to be.', 
    3, 
    444, 
    'published', 
    false, 
    now()
  );

  INSERT INTO chapters (story_id, author_id, title, content, chapter_number, word_count, status, is_premium, published_at)
  VALUES (
    v_story_id, 
    v_author_id, 
    'The Letter I Was Never Meant To Read', 
    'The cruelest goodbyes are not the ones we hear. They''re the ones hidden inside words we never get to read.

The rain hadn''t stopped for three days. Neither had my thoughts. That Saturday, I decided to clean my apartment. Not because it needed cleaning. Because I needed distraction. There is a difference. One is productive. The other is survival.

I started with bookshelves, then drawers, then old storage boxes I hadn''t opened in years. Most contained things people normally keep — receipts, photographs, movie tickets, birthday cards. Tiny pieces of lives we are afraid to forget.

***

***

At the very bottom of one box sat an old notebook. Dust covered the cover. My handwriting covered the first page. I recognized it immediately. My first manuscript. The one I had started writing during college. The one I never finished.

I flipped through the pages — old chapters, terrible dialogue, embarrassing descriptions. The kind of writing that makes you cringe years later.

Then something fell out.

A folded piece of paper. Yellowed slightly with time. My smile disappeared. I didn''t recognize it. Slowly, I unfolded it. The moment I saw the handwriting... my heart stopped.

Aarav.

I would have recognized his handwriting anywhere. Messy. Slanted. As if his thoughts always moved faster than his pen.

> "If you''re reading this, I''m sorry."

I sat down. Not because I wanted to. Because my knees suddenly felt weak. The room became quiet. The rain outside faded. The world faded. Until there was only me. And that letter.

> "There are things I never told you."

I stared at those words. Again. And again. And again. Because suddenly every memory felt unstable. Every certainty questionable. Every version of our ending incomplete. For two years I had believed I knew what happened. I thought Aarav stopped fighting. Stopped choosing us. Stopped loving me enough to stay.

But what if I was wrong?

My hands trembled. Not from fear. From possibility. I looked at the rest of the letter. Pages. Plural. Not a note. Not an apology. A story. His story. The story I had never heard. I swallowed hard. Took a shaky breath. And began to read.

Sometimes the past doesn''t return to haunt us.

It returns because we never knew the whole truth.', 
    4, 
    379, 
    'published', 
    false, 
    now()
  );

  INSERT INTO chapters (story_id, author_id, title, content, chapter_number, word_count, status, is_premium, published_at)
  VALUES (
    v_story_id, 
    v_author_id, 
    'The Truth He Never Told Me', 
    'Sometimes the people who leave us aren''t running away from love. They''re running away from something they don''t know how to survive.

> Rhythm,

> If you''re reading this, then I never had the courage to give this to you. There are things I never told you because I didn''t know how. And maybe that''s my biggest mistake.

I stopped reading. Not because I wanted to. Because suddenly breathing felt difficult. Two years. For two years I had carried a version of our story. A version where Aarav left. A version where he stopped choosing me. A version where I wasn''t enough. And now — for the first time — I wasn''t sure any of it was true.

I looked at the date. My heart sank. The letter had been written three days before our breakup. Three days. Which meant he hadn''t written it afterward. He had written it before. Before the silence. Before the goodbye. Before everything fell apart.

> "You always thought I was strong. I let you believe that because I liked the way you looked at me. But the truth is... I''ve been falling apart for months."

> "The panic attacks started last winter. At first I thought they would stop. Then they got worse. And eventually I became someone I didn''t recognize."

My hands started shaking. Because suddenly things began making sense. The late-night disappearances. The cancelled plans. The distant texts. The exhaustion in his eyes. The sadness he always brushed away with a smile. All those moments I thought he was pulling away from me. Maybe he had been struggling with himself.

> "I wanted to tell you. A hundred times, I wanted to tell you. But every time I imagined you worrying about me, I couldn''t do it. You deserved someone whole. And I felt broken."

A sob escaped before I could stop it. How many people destroy themselves trying not to burden the people they love?

> "I didn''t leave because I stopped loving you. I left because loving you while hating myself felt impossible."

***

***

For two years I had asked myself the same question, over and over. Why wasn''t I enough? Why didn''t he stay? Why wasn''t our love worth fighting for? And now I finally had an answer.

It had never been about me.

Not once.

The tears came harder. Not because the pain disappeared. Because it changed shape. The heartbreak I had carried for years suddenly became something else. Something sadder. Something more complicated. Understanding.

For years, I thought he broke my heart.

I never realized he was trying to survive his own.', 
    5, 
    436, 
    'published', 
    false, 
    now()
  );

  INSERT INTO chapters (story_id, author_id, title, content, chapter_number, word_count, status, is_premium, published_at)
  VALUES (
    v_story_id, 
    v_author_id, 
    'The Boy Behind The Smile', 
    'The saddest people are often the ones who spend the most time making sure everyone else is okay.

> "You always loved the version of me that smiled. The version that made jokes when things got serious. The version that looked like he had everything figured out. I loved him too. The problem was... he wasn''t real."

> "I got so good at pretending that eventually nobody noticed I was drowning. Not my friends. Not my family. Not even you. And that''s not your fault. I made sure nobody could see it."

I remembered all the times I had asked if he was okay. All the times he smiled. All the times he said: "I''m fine." Such a small lie. Such a dangerous one.

Because suddenly every memory looked different. The cancelled dates weren''t rejection. The distance wasn''t indifference. The silence wasn''t lack of love. It was pain. Pain I never knew existed.

> "There were days when getting out of bed felt impossible. Days when I looked in the mirror and didn''t recognize the person staring back. Days when loving you felt like the only good thing left in my life."

> "The reason I left wasn''t because I thought you deserved better. The truth is much uglier than that. I left because I was terrified that one day you would see the version of me I was hiding. And I couldn''t survive losing you twice."

***

***

I closed my eyes. How lonely had he been? How scared? How exhausted? For two years, I had been angry at him. And now all I felt was grief. Not grief for us. Grief for him. For the boy who sat beside me carrying battles he never spoke about. The boy who laughed through pain. The boy who convinced himself that disappearing was kinder than staying.

> "If you''re reading this, then maybe fate decided you deserved the truth. Maybe years have passed. Maybe you''ve already moved on. Honestly, I hope you have. Because if there''s one thing I never wanted... it was for my brokenness to become your prison."

The tears wouldn''t stop anymore. Because he still sounded like Aarav. Still thinking about me. Still protecting me. Even in goodbye.

Sometimes the people who leave us aren''t asking to be forgotten.

They''re begging to be understood.', 
    6, 
    386, 
    'published', 
    false, 
    now()
  );

  INSERT INTO chapters (story_id, author_id, title, content, chapter_number, word_count, status, is_premium, published_at)
  VALUES (
    v_story_id, 
    v_author_id, 
    'The Last Page', 
    'For a long moment, I just stared at the final page.

The last page of a letter Aarav never sent. The last page of a version of him I had never known. Outside, the rain continued. Inside, everything felt still.

> "There''s one more thing I need to tell you. The real reason I''m writing this letter."

> "A few weeks ago, my father lost everything. His business. His savings. The house he spent twenty years building. What followed was worse. Debt collectors. Lawyers. Threats. The kind of stress that changes a family overnight."

> "I never told you because I knew what you would do. You would''ve stayed. You would''ve helped. You would''ve carried my problems like they were your own. And I couldn''t let that happen."

> "I kept telling myself things would get better. That once the storm passed, I would come back and explain. But storms don''t always end when we expect them to."

For two years I had believed he chose to leave. But according to this letter... he planned to return.

> "If you''re reading this years from now, there''s a chance you''ve already forgotten me. Honestly, I hope you have. You deserve peace."

> "If life is kind, maybe we''ll meet again someday. And if we do... I hope you look happy."

I laughed through tears. A sad laugh. A broken laugh. Because even now, he still didn''t understand. I never forgot him. Not once.

***

***

Slowly, I picked up my phone. Opened my contacts. And stared at a name I hadn''t called in two years.

Aarav.

Some people leave your life and become a memory.

Others leave your life and become a question that only they can answer.', 
    7, 
    287, 
    'published', 
    false, 
    now()
  );

  INSERT INTO chapters (story_id, author_id, title, content, chapter_number, word_count, status, is_premium, published_at)
  VALUES (
    v_story_id, 
    v_author_id, 
    'The Call I Never Thought I''d Make', 
    'My thumb hovered above his name.

Aarav. Two years. Seven hundred and thirty days. Thousands of moments where I wanted to call him. Thousands more where I convinced myself not to. And now, after everything I had just read, one question echoed inside me.

What if I had been wrong?

I pressed the call button. Then immediately panicked. The phone rang once. Twice. Three times. My heart pounded so loudly I couldn''t hear anything else. Four times. Five. Then the line connected.

"Rhythm?"

His voice. Two years later and my heart still recognized it instantly. I closed my eyes, and suddenly twenty-two felt like nineteen again. "Hi." A soft, nervous laugh came through the phone. "Hi."

How do you fit two years of heartbreak into a single conversation?

"I didn''t think you''d ever call." "I didn''t think I would either." Then I said the words that changed everything.

"I found your letter."

The silence on the other end was immediate. Heavy. Shocked. "What?" "Your letter. The one you never gave me." "...You read it?" "Every word."

***

***

"Why didn''t you tell me?" A long silence. "Because I was ashamed. I couldn''t fix anything, Rhythm. I couldn''t fix my family. I couldn''t fix myself. And I couldn''t stand the idea of you watching me fall apart."

"You should''ve let me stay."

"I know." "We lost so much time." "I think about that every day."

***

***

Then Aarav spoke again. "Rhythm?" "Yeah?" Another pause.

"If I asked to see you again... would you come?"

For the first time in two years... I didn''t know the answer.

Sometimes closure isn''t the end of a story.

Sometimes it''s the beginning of the one that should have happened all along.', 
    8, 
    287, 
    'published', 
    false, 
    now()
  );

  INSERT INTO chapters (story_id, author_id, title, content, chapter_number, word_count, status, is_premium, published_at)
  VALUES (
    v_story_id, 
    v_author_id, 
    'The Space Between Then and Now', 
    '"Okay," I said. "Okay?" he repeated. "Don''t make me repeat it." For the first time during the call, he laughed. Actually laughed. And something inside me remembered exactly why I had fallen in love with him.

Tomorrow. Such a simple word. Such a terrifying one.

That night I barely slept. Every memory seemed awake. Every question louder. What if he looked at me differently? What if I looked at him differently? What if the distance had changed everything? Or worse — what if it hadn''t changed anything at all?

***

***

Morning arrived too quickly. I changed outfits three times. Then four. Then gave up entirely. Because no amount of preparation could prepare me for seeing someone who once knew every version of me.

The café was small and quiet. I arrived first, of course — I had always been early, Aarav had always been late, some things never change. I ordered coffee, sat by the window, and waited.

And then the door opened.

My heart recognized him before my eyes did.

Aarav. For a second, everything disappeared. The people. The music. The city outside. Just him. Standing there. Looking at me. And suddenly two years didn''t feel like two years. They felt like a single unfinished sentence.

He looked different. Older. More tired. More real. For the first time, I wasn''t looking at the version of Aarav I remembered. I was looking at the version that survived. His eyes met mine. And neither of us moved. Then slowly... he smiled. Not the smile from old photographs. A quieter one. A sadder one. A genuine one. And somehow I loved that smile more. Because it wasn''t hiding anything.

"Hi, Rhythm." "Hi, Aarav." Neither of us sat down. We just looked at each other, trying to understand how someone could feel familiar and unfamiliar at the same time. "You cut your hair." I laughed. "That''s what you noticed?" "It''s the first thing I noticed."

And just like that, the distance between then and now became a little smaller.

We spent years mourning what we had lost.

Neither of us realized we were about to discover who we''d become.', 
    9, 
    357, 
    'published', 
    false, 
    now()
  );

  INSERT INTO chapters (story_id, author_id, title, content, chapter_number, word_count, status, is_premium, published_at)
  VALUES (
    v_story_id, 
    v_author_id, 
    'Why Didn''t You Come Back?', 
    'For a while, we talked about ordinary things. Work. Books. The city. Life. The safe topics. The ones people use when they''re standing too close to something painful. Then the silence arrived. The kind where both people know there''s still something waiting to be said.

"If you loved me that much... why didn''t you come back?"

Aarav looked down, not surprised, as if he''d been expecting the question from the moment he walked in. He laughed softly — a sad laugh, the kind that belongs to old regrets. "Because I was a coward." "No." "Rhythm—" "No. You were scared. You were hurting. You made terrible decisions. But you weren''t a coward."

"Then maybe I was selfish." He looked away. "I kept telling myself I''d come back when things got better. When my family recovered. When I felt okay again. When I became someone worthy of you. The problem was... every time one thing got better, something else went wrong."

"I thought about calling you hundreds of times." "Hundreds?" "I knew your number by memory. Still do." I looked away immediately. Because somehow that hurt more. "I would pick up my phone. Type your name. Stare at it for ten minutes. And then convince myself you were happier without me."

***

***

"We were idiots." The words slipped out. Aarav laughed. Actually laughed. "Yeah. We really were."

Then I whispered the thing I had never admitted. Not to him. Not to anyone.

"I waited."

Aarav froze. "I waited longer than I should have. Every unknown number. Every notification. Every birthday. A part of me thought you''d come back."

When I finally looked up, his eyes were shining — not with happiness, with heartbreak. Now he knew: we had both been standing on opposite sides of the same door, waiting for the other person to open it.

"I never stopped loving you."

The world stopped. Quietly, like a heartbeat skipping once, then twice, then forgetting how to continue.

We lost two years to silence.

And in a single sentence, neither of us knew what to do with the truth that remained.', 
    10, 
    349, 
    'published', 
    false, 
    now()
  );

  INSERT INTO chapters (story_id, author_id, title, content, chapter_number, word_count, status, is_premium, published_at)
  VALUES (
    v_story_id, 
    v_author_id, 
    'The Love That Never Left', 
    'I should have said something. Anything. Instead, I just stared at him. Because after spending two years teaching myself how to live without Aarav... I wasn''t prepared to hear that. For so long, love had been something I remembered. A chapter. A memory. But now it was sitting across from me. Breathing. Looking back at me. Real.

"Say something," he said, his voice almost a whisper. I laughed softly. "You disappear for two years. You break my heart. You come back. And then casually tell me you''ve loved me this whole time?" He rubbed a hand across his face. "When you say it like that..." "Because that''s exactly how it happened." To my surprise, he smiled — and somehow that made it harder to stay angry. I hated that.

***

***

"I don''t expect anything," he said. "I''m not asking you to forgive me. I''m not asking you to come back. I''m not asking for another chance. I just wanted you to know the truth." That would''ve been easier if he had asked for something. But he didn''t. He simply gave me honesty. And somehow honesty was harder to fight.

"Aarav." "Yeah?" "There wasn''t a single book I wrote that didn''t have a piece of you in it." His eyes widened slightly. "There wasn''t a birthday where I didn''t think about calling. There wasn''t a year where I completely forgot you."

And for the first time that afternoon... I saw hope. Not certainty. Not expectation. Hope. The fragile kind. The dangerous kind. The kind that breaks easily.

***

***

As we stood to leave, Aarav hesitated. "Rhythm?" "Yeah?" "Can I ask you something?" "Depends." A faint smile appeared. "Would you let me walk you home?"

Such a small question. Such a dangerous one. Because once upon a time... walking home together had been our favorite thing. And suddenly I realized something.

The hardest part wasn''t falling in love again.

The hardest part was trusting that this time, he would stay.

Love wasn''t the thing we had lost.

Trust was.', 
    11, 
    339, 
    'published', 
    false, 
    now()
  );

  INSERT INTO chapters (story_id, author_id, title, content, chapter_number, word_count, status, is_premium, published_at)
  VALUES (
    v_story_id, 
    v_author_id, 
    'Learning You Again', 
    'The first time Aarav and I met after the café, nothing dramatic happened. No confessions. No stolen kisses. No movie-worthy moments. We just walked. Through streets we used to know. Past places that had changed. Past places that hadn''t.

The old Aarav knew exactly how I took my coffee; the new Aarav preferred tea. The old Aarav hated waking up early; the new Aarav was somehow jogging at six in the morning, voluntarily, like a psychopath. When I pointed that out, he laughed. "People change." "Not that much."

***

***

Over the next few weeks, we kept meeting. Sometimes for coffee. Sometimes for dinner. Sometimes for no reason at all. One evening he tried making pasta for me. The fire alarm became involved. I laughed so hard I cried. Aarav claimed the smoke detector was being dramatic. The smoke detector disagreed.

For the first time in years, being around him felt easy.

And that scared me.

Because loving him had never been the difficult part. Trusting him again was.

***

***

One evening, while walking home, Aarav stopped. "What did you do?" I asked immediately. His grin returned. "I read your book." I froze. "No." "Yes." "You promised you wouldn''t." "The male lead was obviously me." "He was not." "He literally drinks coffee the way I do." "Millions of people drink coffee that way."

Aarav''s smile softened. "You wrote about me." The words weren''t teasing anymore. They were gentle. And somehow that made them harder to answer. "I wrote about missing someone," I said quietly.

"So did I," he said. "You write?" "Not professionally. Mostly letters." The world suddenly felt very small. Because two years apart... and somehow we''d both been writing to people who weren''t there.

We just walked. Side by side. Like two people learning a language they used to speak fluently. Slowly. Carefully. Patiently. Learning each other again.

The strangest thing about seeing him again wasn''t realizing how much he''d changed.

It was realizing how much I still wanted to know the person he''d become.', 
    12, 
    338, 
    'published', 
    false, 
    now()
  );

  INSERT INTO chapters (story_id, author_id, title, content, chapter_number, word_count, status, is_premium, published_at)
  VALUES (
    v_story_id, 
    v_author_id, 
    'The Second Chance', 
    'If someone had told me a year ago that Aarav and I would find our way back to each other, I would''ve laughed. Then probably cried. Then laughed again. Because for the longest time, getting him back felt impossible. Like wishing for a season that had already passed.

Somewhere between the phone calls, the coffee dates, and the walks that lasted longer than they needed to, Aarav became my favorite part of the day again — not a memory, not a ghost, not a chapter I kept rereading. A person. Real, present, mine.

The best part wasn''t the big moments.

It was the ordinary ones.

The way he''d call me just to tell me something completely unimportant. The way he''d send me pictures of dogs he wanted to adopt. The way he''d steal fries from my plate and act shocked when I complained. As if he hadn''t been doing that since college.

> "Writers are supposed to write books, not become one."

> — Aarav

I laughed for five straight minutes. Then kept the note. Obviously.

***

***

One night, after dinner, we ended up on the rooftop. The city glittered beneath us. Aarav was lying beside me, pointing at stars and confidently giving them names that absolutely weren''t correct. "That one is definitely Orion." "Aarav, that''s a plane." He ignored me. As usual. I laughed. And he looked at me. Not the way people normally look at each other. The way someone looks at a miracle they thought they''d lost.

The laughter faded. The world softened. And then he kissed me. Slowly. Carefully. Like he was still afraid I''d disappear. I kissed him back. Because I wasn''t going anywhere.

When we pulled apart, his forehead rested against mine. Neither of us spoke. We didn''t need to. And for the first time since he left... I wasn''t thinking about the past anymore. I was thinking about tomorrow.

Maybe we were going to make it.', 
    13, 
    324, 
    'published', 
    false, 
    now()
  );

  INSERT INTO chapters (story_id, author_id, title, content, chapter_number, word_count, status, is_premium, published_at)
  VALUES (
    v_story_id, 
    v_author_id, 
    'The Life We Got Back', 
    'I used to think if Aarav ever came back, every moment would feel extraordinary. I was wrong. The best parts were never the extraordinary moments. They were the ordinary ones.

Like waking up to six missed calls because he accidentally fell asleep while we were talking. Or random pictures throughout the day. A dog. A sunset. A sandwich. No context. No explanation. Just Aarav being Aarav. When I asked why he sent them, his answer was always the same. "It made me think of you." The annoying thing was... that answer worked every single time.

***

***

One Saturday, my phone kept vibrating. Aarav. Again. I ignored it. Then a message arrived: "Emergency." I called him immediately. "What happened?" "Nothing." I closed my eyes. "Aarav." "I just missed you."

The worst part? I smiled. The absolute worst part? He knew I smiled. "You''re smiling, aren''t you?" "No." "Liar."

Unfortunately... he was correct. As usual.

***

***

A few weeks later, my new book launched. The event hall was packed. I should''ve been nervous. Instead, I kept searching for one person. Aarav. When I finally found him standing near the back, holding flowers he definitely spent too much money on, I felt calmer immediately.

"I''m proud of you." The words were simple. But they meant everything. Because years ago, when I wrote my first unfinished manuscript, Aarav was there. When I published my first book, he wasn''t. And somehow, having him here now healed something I didn''t know was still broken.

***

***

One evening, while walking home, Aarav suddenly grabbed my hand. "What?" He shrugged. "Nothing." "You definitely did that for a reason." "I did." "And?" A small smile. "I just wanted to make sure you were real."

Years ago, I used to imagine what happiness would look like if Aarav ever came back. The reality was much simpler. It looked like shared coffees. Inside jokes. Warm hands. Late-night conversations. And knowing someone would be there tomorrow.

For so long, happiness felt temporary.

Then Aarav came back, and somehow, forever stopped feeling impossible.', 
    14, 
    343, 
    'published', 
    false, 
    now()
  );

  INSERT INTO chapters (story_id, author_id, title, content, chapter_number, word_count, status, is_premium, published_at)
  VALUES (
    v_story_id, 
    v_author_id, 
    'Home', 
    'Maybe home isn''t a place. Maybe it''s a person who makes the world feel quieter.

Aarav slowly became part of my life again. Not in a dramatic way. Not all at once. The way sunlight fills a room. The way a favorite song becomes familiar. The way home stops feeling empty.

One Sunday morning, I woke up to twenty-three missed calls. Twenty-three. Panic immediately took over. I called him back. "Aarav!" "What?" "Why did you call me twenty-three times?" A pause. "Because you weren''t answering." "A normal person would''ve called twice." "That sounds made up." I laughed so hard I almost dropped my phone.

***

***

One evening, Aarav came with me to visit my parents. The entire drive there, he looked calm. Relaxed. Confident. Liar. The second we reached the house, he became nervous. Extremely nervous. By the end of dinner, my mother loved him. My father tolerated him. Which was practically a blessing. On the drive back: "I think your dad hates me slightly less now." "Congratulations." "Thank you." His tone was completely serious. I laughed harder.

***

***

One night, after a long day, we sat on my apartment balcony. The city stretched endlessly beneath us. Aarav rested his head against my shoulder. "As a writer, you''re incredibly dramatic." I gasped. "How dare you." "It''s true." "Take it back." "No." I pushed him. He almost dropped his coffee. Justice.

Then eventually the conversation faded. The comfortable kind of silence remained. The kind that only exists between people who know each other by heart. Aarav reached for my hand. I intertwined my fingers with his automatically. Like I had done a thousand times before. Like I would do a thousand times again.

For years, I thought I wanted my old life back. But I didn''t. Because this wasn''t the old life. This wasn''t the old Aarav. This wasn''t the old me. And somehow... that made it even better.

For the first time in a very long time... I wasn''t missing him anymore. Because he was finally home.', 
    15, 
    339, 
    'published', 
    false, 
    now()
  );

  INSERT INTO chapters (story_id, author_id, title, content, chapter_number, word_count, status, is_premium, published_at)
  VALUES (
    v_story_id, 
    v_author_id, 
    'Forever', 
    'By the time winter arrived, Aarav and I had become one of those couples. The annoying kind. The kind people roll their eyes at. The kind that somehow ends up matching outfits without trying. Honestly? We deserved the judgment.

One Saturday, we drove three hours just to try a café someone recommended online. The coffee was terrible. The sandwiches were worse. Aarav still gave it five stars. "Why?" "Because you laughed the whole time."

***

***

One evening, I was curled up beside him on the couch. His arm around my shoulders. My head resting against his chest. Comfortable. Effortless. Home. Aarav was talking about the future. As usual. About sunlight. About bookshelves. About where my writing desk would go. About how we''d probably end up arguing over furniture. About how he''d eventually win those arguments. Delusional. Completely delusional.

Then he said something. Something simple. Something ordinary. "I think we''d be really happy. A house. A dog. Your books everywhere. My coffee mysteriously disappearing." "By mysteriously, you mean you stealing it." "Details."

The rain continued outside. The room felt warm. Safe. Perfect. And suddenly, I found myself imagining it. The house. The mornings. The years. The life.

I waited for the excitement. For the butterflies. For the rush that used to arrive every time I imagined forever with him. I waited. And waited. And waited.

Nothing came.

Aarav was still talking. Still smiling. Still dreaming out loud. I smiled too. But for some reason... I couldn''t stop staring at the silence inside my chest.

The scary part wasn''t what I felt.

It was what I didn''t.', 
    16, 
    266, 
    'published', 
    false, 
    now()
  );

  INSERT INTO chapters (story_id, author_id, title, content, chapter_number, word_count, status, is_premium, published_at)
  VALUES (
    v_story_id, 
    v_author_id, 
    'The Feeling I Couldn''t Find', 
    'I told myself it was just a bad day.

Everyone has them. Maybe I was tired. Maybe I was stressed. So I ignored it. The silence. The strange feeling. The missing butterflies. Because everything else was perfect. Aarav was perfect. Well. Not perfect. He still stole my fries. Still interrupted me while I was writing. Still forgot where he put his keys every single day. But he was good. Kind. Present. Everything I had once prayed for.

***

***

One evening we went to a bookstore. Aarav held up a book. "You''d like this." "Have you read it?" "No." "Then how do you know I''d like it?" He grinned. "Because I know you." And the scary thing was... he did. He knew how I took my coffee. He knew when I was lying. He knew when I was overwhelmed. He knew me.

And I loved him.

God. I loved him.

That was what made everything so much worse.

***

***

Because every time I looked at him, I kept waiting. Waiting for something. A feeling. A spark. A rush. And every time... nothing happened. Not because I didn''t care. Because I did. More than anyone. But it felt different now. Quieter. Softer. Smaller. Like looking at a photograph instead of standing inside the moment.

That night, Aarav fell asleep beside me. And suddenly I remembered being nineteen. Remembered waiting all day for a single text. Remembered smiling at my phone like an idiot. Remembered my stomach doing backflips whenever he looked at me.

Back then, loving him felt like standing in the middle of a thunderstorm.

Now it felt like sitting beside a fireplace.

Warm. Comfortable. Safe. But not the same.

And for the first time... I wondered if I''d spent years trying to get back a feeling that only existed in memory. I looked down at our intertwined hands. The hands I used to dream about holding again. And quietly... so quietly I almost didn''t hear myself...

"What''s wrong with me?"

Aarav slept peacefully beside me. Unaware. And for the first time since he came back... I was afraid of the answer.

I spent years wondering if he''d ever come back.

I never stopped to wonder what would happen if he did.', 
    17, 
    373, 
    'published', 
    false, 
    now()
  );

  INSERT INTO chapters (story_id, author_id, title, content, chapter_number, word_count, status, is_premium, published_at)
  VALUES (
    v_story_id, 
    v_author_id, 
    'The Conversation I Didn''t Want To Have', 
    'For two weeks, I convinced myself I was overthinking. For two weeks, I blamed stress. Anything that sounded less terrifying than the truth. I tried fixing it. I planned dates. Long drives. Movie nights. I revisited places that once made my heart race. I stood inside memories and waited for them to become feelings. They never did.

***

***

Until Aarav noticed. Of course he noticed. One evening he muted the television, and I knew immediately what was coming. "Rhythm. Talk to me." I smiled automatically — a dangerous habit. "Something''s wrong," he said. I looked away, which answered his question.

"Is it me?" The panic was instant. "No." Too fast. "Then tell me what''s happening." I couldn''t. Because saying it out loud would make it real. And I wasn''t ready for real.

***

***

Then Aarav asked the question. "Do you still love me?" My eyes closed immediately. Because that wasn''t the problem. That had never been the problem. When I looked at him again, my vision was blurry.

"Yes." No hesitation. "Yes."

Then finally I said the thing I''d been terrified to admit. "When you left... I waited. I waited for months. Then years. I waited until waiting hurt too much. So I buried everything. The hope. The dreams. The future. The version of me that couldn''t imagine a life without you."

"And now you''re back. And I love you. I still love you. God, I still love you." Aarav looked shattered. Because he already knew there was a but coming. The kind of but that changes lives.

"But I can''t find her anymore."

"What do you mean?" I shook my head. Crying now. "The girl who waited for you. The girl who got butterflies every time you texted. The girl who would''ve followed you anywhere. The girl who loved you so much she forgot how to love herself."

"She didn''t survive you leaving."

The silence that followed was the saddest silence I''d ever heard. Because for the first time... Aarav understood. This wasn''t rejection. This wasn''t lack of love. This was grief. Years of grief. And grief changes people. Even when love survives.

I thought losing him was the hardest thing I''d ever survive.

I was wrong. The hardest thing was realizing I had.', 
    18, 
    377, 
    'published', 
    false, 
    now()
  );

  INSERT INTO chapters (story_id, author_id, title, content, chapter_number, word_count, status, is_premium, published_at)
  VALUES (
    v_story_id, 
    v_author_id, 
    'The Silence After', 
    'After that... neither of us spoke.

Not immediately. Because what was there left to say? The truth sat between us. Quiet. Heavy. Impossible to ignore.

Eventually, Aarav laughed. A small laugh. A broken one. "So that''s it?" His voice was quiet. Not accusing. Not bitter. Just tired. I closed my eyes. "I don''t know." And that was the worst part. I genuinely didn''t.

***

***

"Do you know what hurts the most?" Aarav''s eyes were red. Not from anger. From trying not to cry. "I came back. I spent years wishing I could come back. And when I finally did..." He couldn''t finish.

I understood. Because I wished the same thing. For years. "No," he shook his head. "I don''t think you do. Because if someone told me two years ago that I''d get everything back... that I''d get you back... and still lose you..."

The room went silent.

Because there was no resentment in his eyes. Only understanding. Painful. Beautiful. Understanding. And somehow... that broke my heart more than anything else.

"You''re not doing this on purpose." I shook my head. "I know." "You''re not trying to hurt me." Another shake. "I know." The tears wouldn''t stop. Because he kept understanding. Even now. Even after everything.

***

***

Then slowly... Aarav reached for my hand. The same hand he''d held for years. The same hand he''d found again. The same hand he might have to let go. I held his. Tightly. Desperately. Because neither of us was ready. Not yet. Not for goodbye.

But somewhere deep down...

I think we both knew.

Love had survived. We hadn''t.

We got our second chance.

The tragedy was that it arrived after we''d already learned how to live without it.', 
    19, 
    288, 
    'published', 
    false, 
    now()
  );

  INSERT INTO chapters (story_id, author_id, title, content, chapter_number, word_count, status, is_premium, published_at)
  VALUES (
    v_story_id, 
    v_author_id, 
    'The Last Honest Conversation', 
    'Aarav stayed for another hour. Maybe two. Neither of us checked the time. "When did you know?" he finally asked. "I don''t know. There wasn''t a moment. It wasn''t like waking up one day and feeling different. It just..."

Faded.

Aarav closed his eyes. Like someone hearing a diagnosis they already suspected. "I hate that word." I laughed through tears. "Me too."

***

***

"If I could go back..." His voice cracked. "I would''ve stayed. I would''ve stayed through everything. The panic attacks. The debt. The fear. All of it. I would''ve chosen you every single time." I started crying again. Not because it wasn''t enough. Because it was. Too late.

Aarav laughed softly. The saddest laugh I''d ever heard. "Look at us." I smiled through tears. "Yeah." "We finally figured everything out." "We finally got honest." "We finally got a second chance." My smile disappeared, and neither of us said why.

***

***

Aarav smiled sadly. "I think nineteen-year-old me would''ve been really happy." The tears came instantly. Because nineteen-year-old me would''ve been too. She would''ve gotten everything she ever wanted. Him. Forever. Us.

For the first time all night, Aarav squeezed my hand. Not desperately. Not hopefully. Gently. Like a goodbye neither of us was ready to say out loud.

Love wasn''t what we lost.

Time was.

Some conversations arrive exactly on time.

Ours arrived two years, three months, and one unrecognizable version of me too late.', 
    20, 
    239, 
    'published', 
    false, 
    now()
  );

  INSERT INTO chapters (story_id, author_id, title, content, chapter_number, word_count, status, is_premium, published_at)
  VALUES (
    v_story_id, 
    v_author_id, 
    'The Goodbye We Never Wanted', 
    'Sometimes love stays. It''s the future that leaves.

After that night, neither of us tried to fix it. Not because we didn''t care. Because we cared too much. For weeks, Aarav and I continued meeting. Coffee. Dinner. Walks. Movies. The same things we''d always done. Only now, there was a sadness beneath everything. Like two people standing on opposite sides of a bridge they knew was collapsing. Still smiling. Still talking. Still pretending there was enough time.

***

***

One evening, we found ourselves back on the rooftop. The same rooftop. The same city lights. The same skyline. The place where I once believed we''d gotten our happy ending. The wind was colder now. Or maybe that was just me.

"I wish I had come back sooner." My heart broke. Because there it was. The one thing neither of us could change. Time. If he''d come back six months later. A year later. Even two years earlier. Maybe we''d be different. Maybe I''d still be her. But life doesn''t work with maybes. It works with what happened. He left. I survived. And survival changed me.

***

***

"I keep thinking about nineteen-year-old us." A smile escaped me. A sad one. "Yeah." "They would''ve made it." The tears came instantly. Because he was right. Nineteen-year-old Rhythm would''ve chosen him. Every single time.

Aarav looked at me. Really looked at me. For the first time in months, there was no hope in his eyes. No fear. No denial. Just acceptance. "Do you think we''ll ever find our way back?" I thought about it. Really thought about it. And somehow... for the first time... I knew the answer.

"No."

Aarav closed his eyes. Not because he was surprised. Because he already knew. "I think we already did. We found our way back to each other. We just couldn''t find our way back to ourselves."

***

***

After a while, Aarav stood up. I knew. Before he said anything. I knew. He looked down at me. The girl he''d loved. The girl who loved him. The girl who couldn''t become her old self again. And somehow... he smiled. A real smile. Not happy. Not sad. Just grateful.

"Thank you." My chest tightened. "For what?" "For loving me." The tears returned immediately. Because after everything... that was still true. I had loved him. God. I had loved him.

Aarav leaned down. Pressed a kiss against my forehead. And then he left. No promises. No dramatic goodbye. No see-you-soon. Just a quiet ending to a story that neither of us wanted to finish.

I watched him walk away until he disappeared from sight. And for the first time... I didn''t run after him. Not because I didn''t want to. Because some people aren''t meant to be chased.

They''re meant to be cherished. And then let go.

We got our second chance. We got our closure. We got our truth.

The only thing we never got back... was us.', 
    21, 
    492, 
    'published', 
    false, 
    now()
  );

  RAISE NOTICE 'Book seeding completed successfully.';
END $$;
