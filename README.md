# 📝 Nota — Premium Notes App

A beautiful, cross-device note-taking app with Google login and real-time Supabase sync. Dark & light theme. No frameworks, just a single HTML file.

![Dark Theme](https://img.shields.io/badge/theme-dark%20%2F%20light-black?style=flat-square)
![Supabase](https://img.shields.io/badge/backend-supabase-3ECF8E?style=flat-square&logo=supabase)
![Auth](https://img.shields.io/badge/auth-google%20oauth-4285F4?style=flat-square&logo=google)
![Deploy](https://img.shields.io/badge/deploy-github%20pages-222?style=flat-square&logo=github)

---

## ✨ Features

- **Full CRUD** — Create, edit, delete notes instantly
- **Cross-device sync** — Sign in with Google, access your notes from any device
- **Real-time** — Changes sync live across open tabs and devices
- **Dual theme** — Beautiful dark and light modes with one click
- **Tags** — Label notes as `work`, `personal`, `idea`, or `urgent`
- **Pin notes** — Keep important notes at the top
- **Smart search** — Filter notes by title or content instantly
- **Auto-save** — Notes save automatically as you type (1.5s debounce)
- **Word count** — Live word counter in the editor
- **Keyboard shortcuts** — `Ctrl+S` to save, `Ctrl+N` for new note
- **Row-level security** — Only you can see your notes, enforced at the database level

---

## 🚀 Live Demo

> `https://YOUR-USERNAME.github.io/nota-app`

---

## 🛠️ Setup Guide

### Step 1 — Fork & deploy to GitHub Pages

1. Upload `index.html` to a new GitHub repository
2. Go to **Settings → Pages**
3. Set Branch to `main`, folder to `/root` → **Save**
4. Your app will be live at `https://YOUR-USERNAME.github.io/REPO-NAME`

---

### Step 2 — Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free project
2. Open the **SQL Editor** and run:

```sql
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

-- Enable Row Level Security
alter table notes enable row level security;

create policy "Users own their notes" on notes
  for all using (auth.uid() = user_id);
```

---

### Step 3 — Enable Google OAuth

**Get Google credentials:**

1. Go to [console.cloud.google.com](https://console.cloud.google.com) → New Project
2. **APIs & Services → OAuth consent screen** → External → fill in app name & email
3. **APIs & Services → Credentials → Create Credentials → OAuth Client ID**
   - Type: **Web application**
   - Authorized redirect URIs: add your Supabase callback URL (next step)
4. Copy the **Client ID** and **Client Secret**

**Enable in Supabase:**

1. Go to **Authentication → Providers → Google** → Enable
2. Copy the **Callback URL** shown (looks like `https://xxxx.supabase.co/auth/v1/callback`)
3. Paste that callback URL into Google Console → Authorized redirect URIs
4. Paste Client ID & Client Secret into Supabase → **Save**

---

### Step 4 — Configure Redirect URLs

In Supabase → **Authentication → URL Configuration**:

| Field | Value |
|---|---|
| Site URL | `https://YOUR-USERNAME.github.io/nota-app` |
| Redirect URLs | `https://YOUR-USERNAME.github.io/nota-app` |

---

### Step 5 — Get your API credentials

In Supabase → **Project Settings → API**, copy:

- **Project URL** → looks like `https://xxxxxxxxxxxx.supabase.co`
- **anon / public key** → long JWT string starting with `eyJ...`

Paste both into the Nota setup screen when you open the app for the first time.

---

## ✅ Setup Checklist

- [ ] `index.html` uploaded to GitHub repo
- [ ] GitHub Pages enabled
- [ ] SQL table + RLS policy created in Supabase
- [ ] Google OAuth consent screen configured
- [ ] Supabase callback URL added to Google Console
- [ ] Google Client ID + Secret saved in Supabase
- [ ] Site URL + Redirect URL set in Supabase Auth settings
- [ ] Supabase Project URL + anon key entered in app setup screen

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl + S` | Save & sync note |
| `Ctrl + N` | Create new note |
| `Escape` | Close modal |

---

## 🔐 Security

- Notes are protected by **Row Level Security (RLS)** in Supabase — users can only read and write their own notes
- Google OAuth is handled entirely by Supabase — no passwords stored anywhere
- Your Supabase credentials are stored only in your browser's `localStorage`

---

## 📁 Project Structure

```
index.html   ← entire app (HTML + CSS + JS, single file)
README.md    ← this file
```

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla HTML, CSS, JavaScript |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth + Google OAuth |
| Realtime | Supabase Realtime (WebSockets) |
| Hosting | GitHub Pages |
| Fonts | Google Fonts (Playfair Display, DM Sans, DM Mono) |

---

## 📄 License

MIT — free to use, modify, and distribute.