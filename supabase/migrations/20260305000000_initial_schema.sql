-- ============================================================
-- Rentr — Initial Schema
-- Run this in Supabase SQL Editor on both rentr-dev and rentr-prod
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES
-- Extends auth.users. Created automatically on signup via trigger.
-- ============================================================
CREATE TABLE public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name  TEXT,
  is_premium    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- PROPERTIES
-- Each unique address is one property.
-- Created by the first user to submit a review for that address.
-- ============================================================
CREATE TABLE public.properties (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  address       TEXT NOT NULL,
  city          TEXT NOT NULL,
  state         TEXT NOT NULL,
  zip           TEXT,
  country       TEXT NOT NULL DEFAULT 'US',
  lat           DOUBLE PRECISION NOT NULL,
  lng           DOUBLE PRECISION NOT NULL,
  created_by    UUID NOT NULL REFERENCES auth.users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  property_type TEXT CHECK (property_type IN ('apartment', 'condo', 'house', 'townhouse', 'other')),
  -- Aggregate columns updated via trigger on review insert/delete
  review_count      INT NOT NULL DEFAULT 0,
  avg_overall       NUMERIC(3,2),
  avg_value         NUMERIC(3,2),
  avg_landlord      NUMERIC(3,2),
  avg_noise         NUMERIC(3,2),
  avg_pests         NUMERIC(3,2),
  avg_safety        NUMERIC(3,2),
  avg_parking       NUMERIC(3,2),
  avg_pets          NUMERIC(3,2),
  avg_neighborhood  NUMERIC(3,2)
);

-- Index for map bounding box queries
CREATE INDEX properties_location_idx ON public.properties (lat, lng);

-- Index for full-text address search
CREATE INDEX properties_address_idx ON public.properties
  USING GIN (to_tsvector('english', address || ' ' || city || ' ' || state));

-- ============================================================
-- REVIEWS
-- One review per user per property.
-- user_id is stored but NEVER returned in public API responses.
-- ============================================================
CREATE TABLE public.reviews (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id     UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Scores (1-5, all required)
  score_overall      SMALLINT NOT NULL CHECK (score_overall BETWEEN 1 AND 5),
  score_value        SMALLINT NOT NULL CHECK (score_value BETWEEN 1 AND 5),
  score_landlord     SMALLINT NOT NULL CHECK (score_landlord BETWEEN 1 AND 5),
  score_noise        SMALLINT NOT NULL CHECK (score_noise BETWEEN 1 AND 5),
  score_pests        SMALLINT NOT NULL CHECK (score_pests BETWEEN 1 AND 5),
  score_safety       SMALLINT NOT NULL CHECK (score_safety BETWEEN 1 AND 5),
  score_parking      SMALLINT NOT NULL CHECK (score_parking BETWEEN 1 AND 5),
  score_pets         SMALLINT NOT NULL CHECK (score_pets BETWEEN 1 AND 5),
  score_neighborhood SMALLINT NOT NULL CHECK (score_neighborhood BETWEEN 1 AND 5),
  -- Review content
  body              TEXT NOT NULL CHECK (char_length(body) BETWEEN 50 AND 2000),
  rent_amount       INT CHECK (rent_amount > 0),
  move_in_year      SMALLINT,
  move_out_year     SMALLINT,
  lease_type        TEXT CHECK (lease_type IN ('month-to-month', '1-year', '2-year', 'other')),
  would_rent_again  BOOLEAN,
  -- Metadata
  helpful_count   INT NOT NULL DEFAULT 0,
  comment_count   INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- One review per user per property
  UNIQUE (user_id, property_id)
);

-- Index for fetching reviews by property, newest first
CREATE INDEX reviews_property_idx ON public.reviews (property_id, created_at DESC);

-- Trigger: recalculate property aggregate scores on review insert or delete
CREATE OR REPLACE FUNCTION public.update_property_aggregates()
RETURNS TRIGGER AS $$
DECLARE
  pid UUID;
BEGIN
  pid := COALESCE(NEW.property_id, OLD.property_id);
  UPDATE public.properties
  SET
    review_count     = (SELECT COUNT(*)                   FROM public.reviews WHERE property_id = pid),
    avg_overall      = (SELECT AVG(score_overall)         FROM public.reviews WHERE property_id = pid),
    avg_value        = (SELECT AVG(score_value)           FROM public.reviews WHERE property_id = pid),
    avg_landlord     = (SELECT AVG(score_landlord)        FROM public.reviews WHERE property_id = pid),
    avg_noise        = (SELECT AVG(score_noise)           FROM public.reviews WHERE property_id = pid),
    avg_pests        = (SELECT AVG(score_pests)           FROM public.reviews WHERE property_id = pid),
    avg_safety       = (SELECT AVG(score_safety)          FROM public.reviews WHERE property_id = pid),
    avg_parking      = (SELECT AVG(score_parking)         FROM public.reviews WHERE property_id = pid),
    avg_pets         = (SELECT AVG(score_pets)            FROM public.reviews WHERE property_id = pid),
    avg_neighborhood = (SELECT AVG(score_neighborhood)    FROM public.reviews WHERE property_id = pid)
  WHERE id = pid;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_review_change
  AFTER INSERT OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_property_aggregates();

-- ============================================================
-- REVIEW PHOTOS
-- Up to 5 photos per review, stored in Supabase Storage.
-- ============================================================
CREATE TABLE public.review_photos (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id   UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  storage_url TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- REVIEW COMMENTS
-- Optional threaded comments on reviews. Public read, auth write.
-- ============================================================
CREATE TABLE public.review_comments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id   UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body        TEXT NOT NULL CHECK (char_length(body) BETWEEN 10 AND 500),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fetching comments by review
CREATE INDEX review_comments_review_idx ON public.review_comments (review_id, created_at ASC);

-- Trigger: keep comment_count on reviews in sync
CREATE OR REPLACE FUNCTION public.update_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.reviews SET comment_count = comment_count + 1 WHERE id = NEW.review_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.reviews SET comment_count = comment_count - 1 WHERE id = OLD.review_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_comment_change
  AFTER INSERT OR DELETE ON public.review_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_comment_count();

-- ============================================================
-- HELPFUL VOTES
-- One vote per user per review.
-- ============================================================
CREATE TABLE public.helpful_votes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id   UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, review_id)
);

-- Trigger: keep helpful_count on reviews in sync
CREATE OR REPLACE FUNCTION public.update_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.reviews SET helpful_count = helpful_count + 1 WHERE id = NEW.review_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.reviews SET helpful_count = helpful_count - 1 WHERE id = OLD.review_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_helpful_vote_change
  AFTER INSERT OR DELETE ON public.helpful_votes
  FOR EACH ROW EXECUTE FUNCTION public.update_helpful_count();

-- ============================================================
-- SAVED PROPERTIES
-- User bookmarks. Used for V2 email alerts.
-- ============================================================
CREATE TABLE public.saved_properties (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, property_id)
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_photos    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_comments  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.helpful_votes    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_properties ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "profiles: own read"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles: own update"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- PROPERTIES
CREATE POLICY "properties: public read"
  ON public.properties FOR SELECT
  USING (TRUE);

CREATE POLICY "properties: auth insert"
  ON public.properties FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = created_by);

-- REVIEWS
CREATE POLICY "reviews: public read"
  ON public.reviews FOR SELECT
  USING (TRUE);

CREATE POLICY "reviews: verified insert"
  ON public.reviews FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND auth.uid() = user_id
    AND (
      SELECT email_confirmed_at IS NOT NULL
      FROM auth.users
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "reviews: own delete"
  ON public.reviews FOR DELETE
  USING (auth.uid() = user_id);

-- REVIEW PHOTOS
CREATE POLICY "review_photos: public read"
  ON public.review_photos FOR SELECT
  USING (TRUE);

CREATE POLICY "review_photos: auth insert"
  ON public.review_photos FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.reviews
      WHERE id = review_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "review_photos: own delete"
  ON public.review_photos FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.reviews
      WHERE id = review_id AND user_id = auth.uid()
    )
  );

-- REVIEW COMMENTS
CREATE POLICY "review_comments: public read"
  ON public.review_comments FOR SELECT
  USING (TRUE);

CREATE POLICY "review_comments: auth insert"
  ON public.review_comments FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "review_comments: own delete"
  ON public.review_comments FOR DELETE
  USING (auth.uid() = user_id);

-- HELPFUL VOTES
CREATE POLICY "helpful_votes: auth read"
  ON public.helpful_votes FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "helpful_votes: auth insert"
  ON public.helpful_votes FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "helpful_votes: own delete"
  ON public.helpful_votes FOR DELETE
  USING (auth.uid() = user_id);

-- SAVED PROPERTIES
CREATE POLICY "saved_properties: own read"
  ON public.saved_properties FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "saved_properties: own insert"
  ON public.saved_properties FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "saved_properties: own delete"
  ON public.saved_properties FOR DELETE
  USING (auth.uid() = user_id);
