# DoubtSolver AI 🎓⚡

> A ChatGPT-like study assistant for engineering students, powered by open-source **Llama 3** via **Groq** and **Supabase (Postgres + Auth + Row Level Security)**.

---

## 🌟 Overview

**DoubtSolver AI** is a production-style full-stack study companion built specifically for computer science and engineering undergraduates. It explains complex engineering doubts using an intuitive **3-Tier Tutor Pedagogy**:
1. **Simple Explanation**: Intuitive high-level mental model without jargon.
2. **Step-by-Step Breakdown**: Architectural flow, mathematical derivation, or complexity analysis ($O$).
3. **Short Example**: Runnable, clean code snippet (Python, SQL, C++) with syntax highlighting and instant clipboard copying.

---

## 🚀 Key Features

- **🔐 Isolated Student Auth (Supabase)**: Email/password authentication with Row Level Security (RLS). Every user accesses only their own chats, messages, and bookmarks.
- **⚡ Real-Time Streaming AI (Groq + Llama 3)**: Ultra-fast token streaming powered by open-source Llama 3 models (`llama-3.3-70b-versatile`).
- **🛑 Generation Control**: Interactive **Stop Generating** button and friendly **Retry** handling for network/rate limits.
- **📚 5 Specialized Subject Modes**:
  - **General**: Operating Systems, Computer Networks, Systems Engineering.
  - **Python**: Idiomatic PEP 8, GIL, memory models, generators & decorators.
  - **ML**: Loss functions, gradient descent derivations, backprop & neural architectures.
  - **DSA**: Time/space complexity analysis ($O$), DP patterns, trees & graph algorithms.
  - **DBMS**: Relational normal forms, ACID transactions, B-Tree vs Hash indexing & SQL plans.
- **💬 Full Chat History Management**: Auto-saved in database, new chat sessions, inline rename, and deletion.
- **🔍 Full-Text Doubt Search**: Search across titles and message contents from the sidebar.
- **⭐ Solution Bookmarks**: Bookmark icon on every AI reply to save critical derivations, algorithms, and proofs.
- **📊 Study Analytics Dashboard**:
  - Interactive **Questions per Subject** bar chart with hover tooltips and percentages.
  - Metrics for total doubts solved, active sessions, and bookmarked solutions.
  - Dedicated gallery to filter and review bookmarked solutions before exams.
- **🛡️ Security & Performance**:
  - In-memory rate limiting on `/api/chat` route.
  - Input length validation (max 4,000 characters).
  - Context window bounded to the last 20 messages.
  - Zero technical stack traces shown to users.

---

## 🛠️ Tech Stack

- **Framework**: Next.js (App Router) + TypeScript
- **Styling**: Tailwind CSS (ChatGPT-style dark theme)
- **Database & Auth**: Supabase (PostgreSQL with Row Level Security policies)
- **LLM Engine**: Groq API (`llama-3.3-70b-versatile` / `llama-3.1-8b-instant`)
- **Markdown & Code**: `react-markdown` + `remark-gfm` + custom copy-enabled syntax highlighting
- **Icons**: `lucide-react`

---

## 📁 Project Architecture

```
doubtsolver-ai/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── bookmarks/      # GET, POST bookmarks
│   │   │   ├── chat/           # POST streaming AI completion & DB persistence
│   │   │   ├── chats/          # GET list, POST new chat
│   │   │   │   └── [id]/       # GET details, PATCH rename, DELETE chat
│   │   │   ├── config/         # GET public configuration status
│   │   │   ├── dashboard/      # GET subject metrics and analytics
│   │   │   └── seed/           # POST sample engineering doubts
│   │   ├── chat/               # ChatGPT-style workspace
│   │   ├── dashboard/          # Analytics & bookmarked solutions
│   │   ├── login/              # Student login
│   │   ├── signup/             # Student registration
│   │   ├── globals.css         # Dark theme styling & scrollbars
│   │   ├── layout.tsx          # Root layout & providers
│   │   └── page.tsx            # Modern landing page
│   ├── components/
│   │   ├── MarkdownRenderer.tsx# Markdown + copyable code blocks
│   │   ├── Sidebar.tsx         # Responsive history sidebar + search
│   │   ├── SubjectBarChart.tsx # Responsive SVG subject distribution chart
│   │   └── SubjectSelector.tsx # 5 subject mode toggle pills
│   ├── context/
│   │   ├── AuthContext.tsx     # Supabase Auth state & guest demo session
│   │   └── ToastContext.tsx    # Toast notifications
│   ├── lib/
│   │   ├── llm.ts              # Unified Groq Llama 3 logic & system prompts
│   │   ├── rate-limit.ts       # In-memory rate limiter
│   │   └── supabase/
│   │       ├── client.ts       # Browser Supabase client
│   │       ├── server.ts       # Server Supabase client
│   │       ├── admin.ts        # Admin client
│   │       └── data-service.ts # Postgres RLS query & fallback store
│   └── types/
│       └── index.ts            # TypeScript interfaces
├── supabase/
│   └── schema.sql              # Postgres tables, RLS policies & sample data RPC
├── .env.example                # Template of environment variables
└── README.md
```

---

## 🔑 Environment Variables Setup

Create a `.env.local` file in the project root:

```env
# 1. Groq API (Free open-source LLM)
GROQ_API_KEY=gsk_your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile

# 2. Supabase Database & Auth (Free tier)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
```

### Where to Find Each Key:
1. **`GROQ_API_KEY`**:
   - Go to [console.groq.com](https://console.groq.com)
   - Sign up or log in (100% free)
   - Navigate to **API Keys** -> click **Create API Key**
   - Copy the key starting with `gsk_`
2. **`GROQ_MODEL`**:
   - Default: `llama-3.3-70b-versatile` (or `llama-3.1-8b-instant`)
3. **`NEXT_PUBLIC_SUPABASE_URL`** & **`NEXT_PUBLIC_SUPABASE_ANON_KEY`**:
   - Go to [supabase.com](https://supabase.com)
   - Create a free project (e.g., `doubtsolver-db`)
   - Go to **Project Settings** -> **API**
   - Copy **Project URL** (`NEXT_PUBLIC_SUPABASE_URL`)
   - Copy `anon` `public` key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)
4. **`SUPABASE_SERVICE_ROLE_KEY`** (Server-only):
   - In the same **API** settings tab, copy the `service_role` secret key.

---

## 🗄️ Database Setup (Supabase SQL)

1. Open your Supabase Dashboard -> **SQL Editor**.
2. Click **New Query**.
3. Copy the entire contents of [`supabase/schema.sql`](./supabase/schema.sql) and paste it into the query editor.
4. Click **Run**.
5. All three tables (`chats`, `messages`, `bookmarks`), indexes, RLS policies, and the `seed_sample_engineering_data` RPC are automatically configured.

---

## 💻 Running Locally

```bash
# 1. Clone repository
git clone https://github.com/your-username/doubtsolver-ai.git
cd doubtsolver-ai

# 2. Install dependencies
npm install

# 3. Create .env.local and add your keys
cp .env.example .env.local

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Deploy to Vercel (Public Link)

1. Push your code to a private or public GitHub repository.
2. Go to [vercel.com](https://vercel.com) and log in.
3. Click **Add New** -> **Project** and import your `doubtsolver-ai` repository.
4. In the **Environment Variables** section, add:
   - `GROQ_API_KEY`
   - `GROQ_MODEL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
5. Click **Deploy**. Your app will be live at `https://your-project.vercel.app` in ~1 minute!

---

## 🔒 Safe GitHub Push Checklist

Before pushing to Git:
1. Ensure `.env` and `.env.local` are listed in `.gitignore` (verified).
2. Never commit actual secret keys or credentials.
3. Push to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: DoubtSolver AI production release"
   git branch -M main
   git remote add origin https://github.com/<your-username>/doubtsolver-ai.git
   git push -u origin main
   ```
