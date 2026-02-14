# Smart Bookmark Manager 📑✨

A premium, real-time bookmark management system built with **Next.js 15** and **Supabase**. Designed with a sophisticated monochromatic glassmorphic aesthetic for a modern and productive workspace.

## 🚀 Key Features

- **Real-time Sync**: Instant updates across all devices using Supabase Realtime (INSERT, UPDATE, DELETE).
- **Monochrome Design**: Sophisticated black & white UI with glassmorphism, `backdrop-blur` effects, and smooth `framer-motion` animations.
- **Smart Categorization**: Organise bookmarks into categories like Work, Reading, Tech, Finance, etc.
- **Advanced Search**: Instant filtering by title, URL, or description.
- **Favicon Auto-Discovery**: Automatically fetches high-quality favicons for your saved links.
- **Favorites System**: Quick-access mark for your most important bookmarks.
- **Secure Authentication**: Powerded by Supabase Auth with a sleek, minimalist login interface.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Backend/Database**: [Supabase](https://supabase.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Font**: Geist Sans (Next/Font)

## 📦 Getting Started

### 1. Prerequisites

- Node.js 18.x or later
- A Supabase project

### 2. Environment Variables

Create a `.env.local` file in the root directory and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Setup

Run the following SQL in your Supabase SQL Editor to set up the `bookmarks` table and Realtime:

```sql
-- Create bookmarks table
create table public.bookmarks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  url text not null,
  category text default 'Reading',
  description text,
  is_favorite boolean default false,
  favicon_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.bookmarks enable row level security;

-- Policies
create policy "Users can view their own bookmarks" on bookmarks for select using (auth.uid() = user_id);
create policy "Users can insert their own bookmarks" on bookmarks for insert with check (auth.uid() = user_id);
create policy "Users can update their own bookmarks" on bookmarks for update using (auth.uid() = user_id);
create policy "Users can delete their own bookmarks" on bookmarks for delete using (auth.uid() = user_id);

-- Enable Realtime
alter table bookmarks replica identity full;
alter publication supabase_realtime add table bookmarks;
```

### 4. Installation

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app in action.

## 🎨 Design Philosophy

The app follows a **Monochromatic Premium** design language. It focuses on:
- **Clarity**: High contrast elements and breathable spacing.
- **Motion**: Subtle breading animations for a "living" interface.
- **Depth**: Multi-layered surfaces using backdrop blurs and floating orbs (black/white).

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
