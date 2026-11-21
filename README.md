# Campus Peer-to-Peer Lending Website (MVP)

A complete, production-ready peer-to-peer item lending platform designed specifically for college campuses. Students can list items they own (cycles, drafters, lab coats, cameras, fest gear, books, electronics), other students can request to borrow them, pay a refundable security deposit directly via **manual UPI**, meet on campus to pick the item up, and return it with full deposit refund and peer ratings.

---

## 🎨 Design & Theme

- **Modern Crypto & Fintech Aesthetic**: Near-black navy background (`#060911`), white typography, light cool-slate secondary text, and electric cyan/teal accents.
- **Glassy Cards**: Translucent containers with subtle borders and soft atmospheric drop shadows.
- **Dynamic UPI QR Code**: Instant scannable QR code generator for desktop and laptop users, allowing mobile UPI scanning via GPay, PhonePe, Paytm, or BHIM.

---

## ⚡ Tech Stack

- **Framework**: Next.js 14 (App Router) with TypeScript
- **Styling**: Tailwind CSS (mobile-first, responsive design with rupee `₹` formatting)
- **Backend & Auth**: Supabase (PostgreSQL with Row Level Security, Email Auth, and Storage for item photos)
- **Deployment**: Fully optimized for Vercel

---

## 🏛️ Step 1: Set Your College Email Domain

Open [`src/config/college.ts`](./src/config/college.ts) and change the domain constant to your college's official email domain:

```typescript
// src/config/college.ts
export const COLLEGE_EMAIL_DOMAIN = "mycollege.edu.in"; // <-- Change to your college domain (e.g. iitb.ac.in, pilani.bits-pilani.ac.in, etc.)
```

Any student attempting to sign up with a non-college email (e.g., Gmail, Yahoo) will be rejected with a friendly message.

---

## 📦 Step 2: Supabase Setup (Database & Storage)

1. Go to [https://supabase.com](https://supabase.com) and create a new project.
2. Once your project is created, navigate to **Project Settings** (gear icon) -> **API**:
   - Copy **Project URL**
   - Copy **anon / public** key
3. In the project root, create a file named `.env.local` (or copy `.env.local.example`):
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```
4. Navigate to the **SQL Editor** in your Supabase dashboard.
5. Open [`supabase/schema.sql`](./supabase/schema.sql) in this repository, copy the **entire script**, paste it into the Supabase SQL editor, and click **Run**.
   - This creates:
     - `public.users` (linked to `auth.users` with automatic profile creation trigger)
     - `public.items` (with categories, status check, deposit amount)
     - `public.requests` (the 7-step lending workflow status machine)
     - `public.deposits` (tracks manual UPI deposit statuses)
     - `public.ratings` (1-5 star peer reviews)
     - Row Level Security (RLS) policies for all tables
     - `item-photos` storage bucket with public read and authenticated upload policies
6. In Supabase Dashboard -> **Authentication** -> **URL Configuration**:
   - Set **Site URL** to `http://localhost:3000` (or your Vercel URL).
   - Under **Redirect URLs**, add:
     - `http://localhost:3000/auth/callback`
     - `https://your-production-app.vercel.app/auth/callback`

7. *(Optional)* After signing up your first user account, you can run [`supabase/seed.sql`](./supabase/seed.sql) in the SQL Editor to automatically populate realistic campus items (cycles, drafters, lab coats, cameras, fest PA systems).

---

## 💸 Step 3: Understanding The Borrowing & UPI Flow

Money moves **100% directly between students via personal UPI apps** (Google Pay, PhonePe, Paytm, BHIM). The platform does not take commissions or hold funds:

1. **Request**: Borrower clicks "Request to borrow" on an available item and sends an optional note. Request status = `pending`.
2. **Acceptance**: Owner reviews request under **My items** and clicks **Accept** (status = `accepted`).
3. **UPI Payment**: Borrower sees the owner's UPI ID and deposit amount on **My borrows** (with a deep-link to launch UPI app). Borrower transfers the deposit and clicks **"I have paid"** (request status = `deposit_paid`).
4. **Deposit Confirmation**: Owner checks their UPI app to confirm money received, then clicks **"Confirm deposit received"**.
   - **Privacy feature**: Only now are phone numbers unlocked so both students can coordinate the campus meetup via Call or WhatsApp!
5. **Campus Pickup**: Students meet at hostel gates, library, or canteen. Borrower clicks **"I picked it up"** (item status becomes `borrowed`).
6. **Return & Refund**: Upon return, the owner inspects the item and clicks **"Confirm return and refund deposit"**. The owner sends back the deposit on UPI outside the app. (Item status returns to `available`).
7. **Ratings**: Both borrower and lender receive a prompt to leave a 1-5 star rating and review.

---

## 🚀 Step 4: Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Step 5: Deploying to Vercel

1. Push your repository to GitHub / GitLab / Bitbucket.
2. Go to [https://vercel.com](https://vercel.com) and click **"Add New" -> "Project"**.
3. Import your repository.
4. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon/public key
5. Click **Deploy**.
6. Once deployed, copy your production Vercel URL and add `https://your-production-app.vercel.app/auth/callback` to the **Redirect URLs** in your Supabase Auth settings.

---

## 🛡️ Campus Disclaimer & Disputes

In this MVP, security deposits are handled peer-to-peer on UPI. Disputes regarding physical damage or non-returns are arbitrated by campus student welfare or hostel wardens.

