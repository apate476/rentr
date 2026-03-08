-- ============================================================
-- Rentr — Community Features Schema
-- Adds community posts, comments, and upvotes for city-based discussions
-- ============================================================

-- ============================================================
-- COMMUNITY POSTS
-- Discussion posts for city-based renter communities
-- ============================================================
CREATE TABLE public.community_posts (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  city          TEXT NOT NULL,
  state         TEXT NOT NULL,
  title         TEXT NOT NULL CHECK (char_length(title) BETWEEN 10 AND 200),
  body          TEXT NOT NULL CHECK (char_length(body) BETWEEN 50 AND 5000),
  category      TEXT NOT NULL CHECK (category IN ('roommates', 'recommendations', 'landlord-warnings', 'housing-advice', 'general')),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  upvote_count  INT NOT NULL DEFAULT 0,
  comment_count INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for city feed queries
CREATE INDEX community_posts_city_idx ON public.community_posts (city, state, created_at DESC);

-- Index for category filtering
CREATE INDEX community_posts_category_idx ON public.community_posts (category, created_at DESC);

-- Index for user's posts
CREATE INDEX community_posts_user_idx ON public.community_posts (user_id, created_at DESC);

-- ============================================================
-- COMMUNITY COMMENTS
-- Comments on community posts
-- ============================================================
CREATE TABLE public.community_comments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id     UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body        TEXT NOT NULL CHECK (char_length(body) BETWEEN 10 AND 1000),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fetching comments by post
CREATE INDEX community_comments_post_idx ON public.community_comments (post_id, created_at ASC);

-- ============================================================
-- COMMUNITY UPVOTES
-- One upvote per user per post
-- ============================================================
CREATE TABLE public.community_upvotes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id     UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, post_id)
);

-- Index for checking if user upvoted
CREATE INDEX community_upvotes_user_post_idx ON public.community_upvotes (user_id, post_id);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Trigger: keep upvote_count on posts in sync
CREATE OR REPLACE FUNCTION public.update_post_upvote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_posts SET upvote_count = upvote_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_posts SET upvote_count = upvote_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_community_upvote_change
  AFTER INSERT OR DELETE ON public.community_upvotes
  FOR EACH ROW EXECUTE FUNCTION public.update_post_upvote_count();

-- Trigger: keep comment_count on posts in sync
CREATE OR REPLACE FUNCTION public.update_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_posts SET comment_count = comment_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_community_comment_change
  AFTER INSERT OR DELETE ON public.community_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_post_comment_count();

-- Trigger: update updated_at on post update
CREATE OR REPLACE FUNCTION public.update_post_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_community_post_update
  BEFORE UPDATE ON public.community_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_post_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.community_posts     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comments  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_upvotes   ENABLE ROW LEVEL SECURITY;

-- COMMUNITY POSTS
CREATE POLICY "community_posts: public read"
  ON public.community_posts FOR SELECT
  USING (TRUE);

CREATE POLICY "community_posts: auth insert"
  ON public.community_posts FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND auth.uid() = user_id
    AND (
      SELECT email_confirmed_at IS NOT NULL
      FROM auth.users
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "community_posts: own update"
  ON public.community_posts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "community_posts: own delete"
  ON public.community_posts FOR DELETE
  USING (auth.uid() = user_id);

-- COMMUNITY COMMENTS
CREATE POLICY "community_comments: public read"
  ON public.community_comments FOR SELECT
  USING (TRUE);

CREATE POLICY "community_comments: auth insert"
  ON public.community_comments FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND auth.uid() = user_id
    AND (
      SELECT email_confirmed_at IS NOT NULL
      FROM auth.users
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "community_comments: own delete"
  ON public.community_comments FOR DELETE
  USING (auth.uid() = user_id);

-- COMMUNITY UPVOTES
CREATE POLICY "community_upvotes: auth read"
  ON public.community_upvotes FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "community_upvotes: auth insert"
  ON public.community_upvotes FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "community_upvotes: own delete"
  ON public.community_upvotes FOR DELETE
  USING (auth.uid() = user_id);
