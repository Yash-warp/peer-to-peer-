-- ====================================================================
-- OPTIONAL SAMPLE SEED DATA FOR TESTING
-- ====================================================================
-- Run this AFTER creating at least one test user via the signup page.
-- This script associates sample campus items with an existing user in public.users.
-- ====================================================================

DO $$
DECLARE
  sample_owner_id UUID;
BEGIN
  -- Grab the first registered user to act as the sample item owner
  SELECT id INTO sample_owner_id FROM public.users LIMIT 1;

  IF sample_owner_id IS NOT NULL THEN
    -- 1. Cycles
    INSERT INTO public.items (owner_id, title, description, category, deposit_amount, status)
    VALUES (
      sample_owner_id,
      'Hero Sprint Pro 21-Speed Gear Bicycle',
      'Excellent condition mountain cycle with front suspension, mudguards, and a combination lock. Great for weekend market trips or commuting across campus. Pick up from Block B bicycle stand.',
      'cycle',
      500,
      'available'
    );

    -- 2. Drafter
    INSERT INTO public.items (owner_id, title, description, category, deposit_amount, status)
    VALUES (
      sample_owner_id,
      'Omega Mini Drafter with Board Clips & Scale',
      'Standard engineering drawing mini-drafter in durable hard case. Arms move smoothly with zero parallax error. Essential for 1st-year engineering graphics practicals and submissions.',
      'drafter',
      200,
      'available'
    );

    -- 3. Lab Coat
    INSERT INTO public.items (owner_id, title, description, category, deposit_amount, status)
    VALUES (
      sample_owner_id,
      'White Pure Cotton Lab Coat (Size 40 / L)',
      'Clean, washed chemistry/biotech lab coat with three deep pockets and full sleeves. Ideal for mid-term practicals if you forgot yours at home.',
      'lab_coat',
      100,
      'available'
    );

    -- 4. DSLR Camera
    INSERT INTO public.items (owner_id, title, description, category, deposit_amount, status)
    VALUES (
      sample_owner_id,
      'Nikon D5600 DSLR with 18-55mm VR Lens & Bag',
      '24.2 MP DSLR camera with two 64GB high-speed SD cards and dual rechargeable batteries. Ideal for cultural fest photography, society events, and convocation shoots.',
      'camera',
      1500,
      'available'
    );

    -- 5. Electronics
    INSERT INTO public.items (owner_id, title, description, category, deposit_amount, status)
    VALUES (
      sample_owner_id,
      'Arduino Uno Rev3 Starter Kit with Sensors',
      'Complete robotics starter kit including breadboard, jumper wires, ultrasonic distance sensor, motor driver, and LEDs for hackathons and lab mini-projects.',
      'electronics',
      300,
      'available'
    );

    -- 6. Sports
    INSERT INTO public.items (owner_id, title, description, category, deposit_amount, status)
    VALUES (
      sample_owner_id,
      'Yonex Carbonex Badminton Racket Pair with Shuttle Box',
      'Dual graphite racquets strung with BG65 at 24 lbs tension. Includes padded carry bag and a tube of Mavis 350 nylon shuttles. Meet at student activity center.',
      'sports',
      250,
      'available'
    );

    -- 7. Books
    INSERT INTO public.items (owner_id, title, description, category, deposit_amount, status)
    VALUES (
      sample_owner_id,
      'Higher Engineering Mathematics by B.S. Grewal (44th Edition)',
      'Essential reference textbook for engineering mathematics semesters 1 and 2. Crisp pages with highlighted formulas and solved question papers.',
      'books',
      150,
      'available'
    );

    -- 8. Fest Equipment
    INSERT INTO public.items (owner_id, title, description, category, deposit_amount, status)
    VALUES (
      sample_owner_id,
      'JBL Portable Wireless PA Speaker with Handheld Mic',
      'Heavy-duty 100W portable Bluetooth speaker with wireless microphone. Ideal for street plays (Nukkad Natak), hostel wing meetings, and fest prep practice.',
      'other',
      800,
      'available'
    );

    RAISE NOTICE 'Sample items successfully seeded for owner %!', sample_owner_id;
  ELSE
    RAISE NOTICE 'No user found in public.users. Please sign up at least one account via /signup first, then re-run this seed script.';
  END IF;
END $$;

