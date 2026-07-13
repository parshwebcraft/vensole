/*
# Database Functions and Triggers

## Description
Create database functions for analytics, view counting, and notification creation.

## New Functions
- increment_story_views: Increment story view count safely
- update_chapter_read: Update chapter read count
- create_chapter_notification: Notify followers of new chapters
*/
CREATE OR REPLACE FUNCTION increment_story_views(story_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE stories SET view_count = view_count + 1 WHERE id = story_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_chapter_read(chapter_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE chapters
  SET read_count = read_count + 1
  WHERE id = chapter_id;

  UPDATE stories
  SET read_count = read_count + 1
  WHERE id = (SELECT story_id FROM chapters WHERE id = chapter_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update story chapter_count when chapters are added/removed
CREATE OR REPLACE FUNCTION update_story_chapter_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE stories
    SET chapter_count = chapter_count + 1
    WHERE id = NEW.story_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE stories
    SET chapter_count = GREATEST(chapter_count - 1, 0)
    WHERE id = OLD.story_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_chapter_count ON chapters;
CREATE TRIGGER trigger_update_chapter_count
  AFTER INSERT OR DELETE ON chapters
  FOR EACH ROW EXECUTE FUNCTION update_story_chapter_count();

-- Trigger to update story word_count when chapters are updated
CREATE OR REPLACE FUNCTION update_story_word_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE stories
  SET word_count = (
    SELECT COALESCE(SUM(word_count), 0)
    FROM chapters
    WHERE story_id = NEW.story_id AND status = 'published'
  )
  WHERE id = NEW.story_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_word_count ON chapters;
CREATE TRIGGER trigger_update_word_count
  AFTER INSERT OR UPDATE OF word_count ON chapters
  FOR EACH ROW EXECUTE FUNCTION update_story_word_count();

-- Function to create notifications for chapter followers
CREATE OR REPLACE FUNCTION notify_followers_new_chapter()
RETURNS TRIGGER AS $$
DECLARE
  story_record record;
  author_record record;
BEGIN
  IF NEW.status = 'published' AND (OLD.status IS NULL OR OLD.status = 'draft') THEN
    -- Get story and author info
    SELECT s.*, p.username as author_name
    INTO story_record
    FROM stories s
    JOIN profiles p ON p.user_id = s.user_id
    WHERE s.id = NEW.story_id;

    IF FOUND THEN
      -- Notify all followers of the story author
      INSERT INTO notifications (user_id, type, title, content, data)
      SELECT
        f.follower_id,
        'new_chapter',
        'New chapter: ' || NEW.title,
        story_record.author_name || ' published a new chapter in "' || story_record.title || '"',
        jsonb_build_object('story_id', NEW.story_id, 'chapter_id', NEW.id)
      FROM follows f
      WHERE f.following_id = story_record.user_id
      AND f.follower_id != story_record.user_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_notify_new_chapter ON chapters;
CREATE TRIGGER trigger_notify_new_chapter
  AFTER UPDATE OF status ON chapters
  FOR EACH ROW EXECUTE FUNCTION notify_followers_new_chapter();
