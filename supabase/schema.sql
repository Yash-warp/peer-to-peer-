-- ====================================================================
-- CAMPUS PEER-TO-PEER LENDING WEBSITE - SUPABASE DATABASE SCHEMA
-- ====================================================================
-- Run this complete script in the Supabase SQL Editor.
-- It creates all tables, constraints, indexes, RLS policies,
-- automatic profile creation trigger, and storage bucket configuration.
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. USERS TABLE (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  hostel_block TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  upi_id TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger to automatically create a profile in public.users on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, full_name, hostel_block, phone, upi_id)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'hostel_block', ''),
    COALESCE(new.raw_user_meta_data->>'phone', ''),
    COALESCE(new.raw_user_meta_data->>'upi_id', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = CASE WHEN public.users.full_name = '' THEN EXCLUDED.full_name ELSE public.users.full_name END,
    hostel_block = CASE WHEN public.users.hostel_block = '' THEN EXCLUDED.hostel_block ELSE public.users.hostel_block END,
    phone = CASE WHEN public.users.phone = '' THEN EXCLUDED.phone ELSE public.users.phone END,
    upi_id = CASE WHEN public.users.upi_id = '' OR public.users.upi_id IS NULL THEN EXCLUDED.upi_id ELSE public.users.upi_id END;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT NOT NULL CHECK (category IN ('cycle', 'drafter', 'lab_coat', 'camera', 'electronics', 'sports', 'books', 'other')),
  photo_url TEXT,
  deposit_amount INTEGER NOT NULL DEFAULT 0 CHECK (deposit_amount >= 0),
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'borrowed', 'paused')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  borrower_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  message TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'deposit_paid', 'picked_up', 'returned', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. DEPOSITS TABLE
CREATE TABLE IF NOT EXISTS public.deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL UNIQUE REFERENCES public.requests(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL DEFAULT 0 CHECK (amount >= 0),
  paid_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'paid', 'confirmed', 'refunded')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. RATINGS TABLE
CREATE TABLE IF NOT EXISTS public.ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
  rater_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  ratee_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  stars INTEGER NOT NULL CHECK (stars >= 1 AND stars <= 5),
  comment TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_request_rater UNIQUE (request_id, rater_id)
);

-- INDEXES for high query performance
CREATE INDEX IF NOT EXISTS idx_items_owner ON public.items(owner_id);
CREATE INDEX IF NOT EXISTS idx_items_category ON public.items(category);
CREATE INDEX IF NOT EXISTS idx_items_status ON public.items(status);
CREATE INDEX IF NOT EXISTS idx_requests_item ON public.requests(item_id);
CREATE INDEX IF NOT EXISTS idx_requests_borrower ON public.requests(borrower_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON public.requests(status);
CREATE INDEX IF NOT EXISTS idx_deposits_request ON public.deposits(request_id);
CREATE INDEX IF NOT EXISTS idx_ratings_ratee ON public.ratings(ratee_id);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------------------
-- USERS POLICIES
-- --------------------------------------------------------------------
-- Anyone authenticated can view user profiles (required for item details & reviews)
DROP POLICY IF EXISTS "Public can view basic profiles" ON public.users;
CREATE POLICY "Public can view basic profiles"
  ON public.users FOR SELECT
  USING (true);

-- Users can insert their own profile
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
CREATE POLICY "Users can insert their own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- --------------------------------------------------------------------
-- ITEMS POLICIES
-- --------------------------------------------------------------------
-- Anyone can view available items (and authenticated users can view all)
DROP POLICY IF EXISTS "Items are viewable by all" ON public.items;
CREATE POLICY "Items are viewable by all"
  ON public.items FOR SELECT
  USING (true);

-- Authenticated users can insert their own items
DROP POLICY IF EXISTS "Users can create items" ON public.items;
CREATE POLICY "Users can create items"
  ON public.items FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Owners can update their items, or borrower/owner can update status during borrowing flow
DROP POLICY IF EXISTS "Owners can update their items" ON public.items;
CREATE POLICY "Owners can update their items"
  ON public.items FOR UPDATE
  USING (
    auth.uid() = owner_id
    OR EXISTS (
      SELECT 1 FROM public.requests r
      WHERE r.item_id = public.items.id
      AND (r.borrower_id = auth.uid() OR public.items.owner_id = auth.uid())
    )
  );

-- Owners can delete their items
DROP POLICY IF EXISTS "Owners can delete their items" ON public.items;
CREATE POLICY "Owners can delete their items"
  ON public.items FOR DELETE
  USING (auth.uid() = owner_id);

-- --------------------------------------------------------------------
-- REQUESTS POLICIES
-- --------------------------------------------------------------------
-- Borrower and Item Owner can view requests
DROP POLICY IF EXISTS "Users can view requests they are involved in" ON public.requests;
CREATE POLICY "Users can view requests they are involved in"
  ON public.requests FOR SELECT
  USING (
    auth.uid() = borrower_id
    OR auth.uid() IN (SELECT owner_id FROM public.items WHERE items.id = requests.item_id)
  );

-- Authenticated users can create requests as borrower
DROP POLICY IF EXISTS "Borrowers can create requests" ON public.requests;
CREATE POLICY "Borrowers can create requests"
  ON public.requests FOR INSERT
  WITH CHECK (auth.uid() = borrower_id);

-- Borrower and Owner can update requests (e.g. accept, reject, pay, pickup, return, cancel)
DROP POLICY IF EXISTS "Participants can update requests" ON public.requests;
CREATE POLICY "Participants can update requests"
  ON public.requests FOR UPDATE
  USING (
    auth.uid() = borrower_id
    OR auth.uid() IN (SELECT owner_id FROM public.items WHERE items.id = requests.item_id)
  );

-- --------------------------------------------------------------------
-- DEPOSITS POLICIES
-- --------------------------------------------------------------------
-- Borrower and Owner can view deposits
DROP POLICY IF EXISTS "Participants can view deposits" ON public.deposits;
CREATE POLICY "Participants can view deposits"
  ON public.deposits FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.requests r
      JOIN public.items i ON i.id = r.item_id
      WHERE r.id = deposits.request_id
      AND (r.borrower_id = auth.uid() OR i.owner_id = auth.uid())
    )
  );

-- Owner or borrower can insert deposit records tied to their requests
DROP POLICY IF EXISTS "Participants can insert deposits" ON public.deposits;
CREATE POLICY "Participants can insert deposits"
  ON public.deposits FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.requests r
      JOIN public.items i ON i.id = r.item_id
      WHERE r.id = deposits.request_id
      AND (r.borrower_id = auth.uid() OR i.owner_id = auth.uid())
    )
  );

-- Borrower and Owner can update deposits (marking paid, confirming, refunding)
DROP POLICY IF EXISTS "Participants can update deposits" ON public.deposits;
CREATE POLICY "Participants can update deposits"
  ON public.deposits FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.requests r
      JOIN public.items i ON i.id = r.item_id
      WHERE r.id = deposits.request_id
      AND (r.borrower_id = auth.uid() OR i.owner_id = auth.uid())
    )
  );

-- --------------------------------------------------------------------
-- RATINGS POLICIES
-- --------------------------------------------------------------------
-- Anyone can read ratings (to display user average stars and reviews)
DROP POLICY IF EXISTS "Ratings are viewable by all" ON public.ratings;
CREATE POLICY "Ratings are viewable by all"
  ON public.ratings FOR SELECT
  USING (true);

-- Rater can insert their rating for requests they were involved in
DROP POLICY IF EXISTS "Participants can insert ratings" ON public.ratings;
CREATE POLICY "Participants can insert ratings"
  ON public.ratings FOR INSERT
  WITH CHECK (
    auth.uid() = rater_id
    AND EXISTS (
      SELECT 1 FROM public.requests r
      JOIN public.items i ON i.id = r.item_id
      WHERE r.id = ratings.request_id
      AND (
        (r.borrower_id = auth.uid() AND ratings.ratee_id = i.owner_id)
        OR
        (i.owner_id = auth.uid() AND ratings.ratee_id = r.borrower_id)
      )
    )
  );

-- --------------------------------------------------------------------
-- STORAGE BUCKET CONFIGURATION FOR ITEM PHOTOS
-- --------------------------------------------------------------------
-- Create 'item-photos' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('item-photos', 'item-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Allow public read access to item photos
DROP POLICY IF EXISTS "Public can view item photos" ON storage.objects;
CREATE POLICY "Public can view item photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'item-photos');

-- Allow authenticated users to upload item photos
DROP POLICY IF EXISTS "Authenticated users can upload item photos" ON storage.objects;
CREATE POLICY "Authenticated users can upload item photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'item-photos');

-- Allow uploaders to update and delete their own photos
DROP POLICY IF EXISTS "Users can update their item photos" ON storage.objects;
CREATE POLICY "Users can update their item photos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'item-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users can delete their item photos" ON storage.objects;
CREATE POLICY "Users can delete their item photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'item-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

