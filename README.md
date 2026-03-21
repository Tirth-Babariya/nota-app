# ✦ Nota: Your Digital Sanctuary

Nota is a premium, high-performance note-taking application designed for clarity and focus. Built with **Next.js 15**, **Framer Motion**, and **Supabase**, it offers a seamless, real-time experience across all your devices.

![Nota Preview](https://github.com/user-attachments/assets/nota-preview.png)

## 💎 Premium Features

- **Intuitive Design**: A minimalist interface with glassmorphism and smooth, physics-based animations.
- **Real-time Collaboration**: Invite teammates via email to co-edit notes in real-time.
- **Smart Organization**: Instant search, pinning, and tag-based filtering.
- **Dual-Theme**: Seamlessly switch between a deep-space dark mode and a clean, light sanctuary.
- **Universal Sync**: Your notes are always with you, synced instantly via Supabase.
- **Offline-Ready Logic**: Optimistic UI updates ensure your writing flow is never interrupted.

## 🚀 Getting Started

### 1. Project Setup
```bash
# Clone the repository
git clone https://github.com/Tirth-Babariya/Nota.git
cd Nota

# Install dependencies
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory and add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Database Schema (Supabase)
Run the following SQL in your [Supabase SQL Editor](https://app.supabase.com/) to set up the tables and RLS policies:

```sql
-- Notes Table
create table notes (
  id text primary key,
  user_id uuid references auth.users not null,
  title text default '',
  content text default '',
  tag text default 'none',
  pinned boolean default false,
  created_at bigint,
  updated_at bigint
);

-- Shared Access Table
create table shared_notes (
  id uuid primary key default gen_random_uuid(),
  note_id text references notes(id) on delete cascade,
  shared_with_email text not null,
  permission text default 'edit'
);

-- Row Level Security (RLS)
alter table notes enable row level security;

create policy "Users can manage their own notes" on notes
  for all using (auth.uid() = user_id);

create policy "Users can see notes shared with them" on notes
  for select using (
    exists(select 1 from shared_notes where note_id = notes.id and shared_with_email = auth.jwt()->>'email')
  );

create policy "Users can update notes shared with them" on notes
  for update using (
    exists(select 1 from shared_notes where note_id = notes.id and shared_with_email = auth.jwt()->>'email' and permission = 'edit')
  );
```

### 4. Running Locally
```bash
npm run dev
```

## 🛠 Tech Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Database/Auth**: [Supabase](https://supabase.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Styling**: Vanilla CSS + CSS Modules

## 📦 Deployment
Deploy instantly to [Vercel](https://vercel.com/new?utm_source=github&utm_medium=readme&utm_campaign=next-example) or build manually:
```bash
npm run build
```

---
Crafted with ❤️ for creators.
