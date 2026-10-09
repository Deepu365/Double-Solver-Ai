'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  Code2,
  BrainCircuit,
  GitFork,
  Database,
  Cpu,
  Bookmark,
  BarChart3,
  Search,
  CheckCircle2,
  Zap,
  Terminal,
  ShieldCheck,
  ChevronRight,
  Copy,
  Check,
} from 'lucide-react';

export default function LandingPage() {
  const [copied, setCopied] = React.useState(false);

  const handleCopySample = () => {
    navigator.clipboard.writeText(`def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-emerald-900 selection:text-emerald-100 overflow-x-hidden">
      {/* ========================================================
          1. NAVIGATION BAR
         ======================================================== */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4 text-zinc-950 stroke-[2.5]" />
            </div>
            <div className="flex items-center">
              <span className="font-bold text-lg tracking-tight text-white">
                DoubtSolver
              </span>
              <span className="text-xs font-mono font-bold uppercase ml-1 px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                AI
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-zinc-400">
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#subjects" className="hover:text-white transition-colors">
              Subject Modes
            </a>
            <a href="#pedagogy" className="hover:text-white transition-colors">
              Tutor Method
            </a>
            <Link href="/dashboard" className="hover:text-white transition-colors">
              Dashboard
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-300 hover:text-white transition-colors"
            >
              <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Dashboard</span>
            </Link>

            {/* Primary Action Button */}
            <Link
              href="/chat"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-semibold text-xs transition-all shadow-md shadow-emerald-950/60 cursor-pointer"
            >
              <span>Start Solving Doubts</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ========================================================
          2. HERO SECTION
         ======================================================== */}
      <section className="relative px-4 pt-16 pb-20 md:pt-24 md:pb-28 max-w-6xl mx-auto w-full text-center">
        {/* Subtle background glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Announcement Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 text-xs font-mono text-zinc-300 mb-8 shadow-sm">
          <Cpu className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>Powered by Open-Source Llama 3 via Groq</span>
          <span className="text-emerald-400 font-semibold">• Ultra-Fast Streaming</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.12]">
          The 24/7 AI Study Assistant for{' '}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            Engineering Students
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="mt-6 text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Tackle demanding doubts in Python, Data Structures & Algorithms, Machine Learning, DBMS, and Systems Architecture with a proven 3-tier tutor approach:
          <span className="text-zinc-200 font-medium"> Simple Explanation</span>,
          <span className="text-zinc-200 font-medium"> Step-by-Step Logic</span>, and
          <span className="text-zinc-200 font-medium"> Runnable Code</span>.
        </p>

        {/* Call-to-action buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/chat"
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-xl shadow-emerald-950/80 active:scale-98 cursor-pointer"
          >
            <span>Start Solving Doubts</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </Link>

          <Link
            href="/dashboard"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800/80 border border-zinc-800 text-zinc-300 hover:text-white font-medium text-sm transition-all"
          >
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <span>Open Student Dashboard</span>
          </Link>
        </div>

        {/* Quick Highlights Row */}
        <div className="mt-12 pt-8 border-t border-zinc-800/60 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto text-center text-xs text-zinc-400">
          <div>
            <div className="text-lg font-bold text-white font-mono">5 Domains</div>
            <div className="text-[11px] text-zinc-500 mt-0.5">Specialized Tutoring</div>
          </div>
          <div>
            <div className="text-lg font-bold text-emerald-400 font-mono">&lt; 0.5s</div>
            <div className="text-[11px] text-zinc-500 mt-0.5">Instant Streaming</div>
          </div>
          <div>
            <div className="text-lg font-bold text-white font-mono">3-Tier Method</div>
            <div className="text-[11px] text-zinc-500 mt-0.5">Concept → Steps → Code</div>
          </div>
          <div>
            <div className="text-lg font-bold text-emerald-400 font-mono">100% Free</div>
            <div className="text-[11px] text-zinc-500 mt-0.5">Open-Source LLMs</div>
          </div>
        </div>
      </section>

      {/* ========================================================
          3. LIVE TUTOR DEMO PREVIEW (MOCK CHAT)
         ======================================================== */}
      <section className="px-4 py-12 max-w-4xl mx-auto w-full">
        <div className="rounded-2xl border border-zinc-800/90 bg-zinc-900/60 shadow-2xl overflow-hidden backdrop-blur-md">
          {/* Mock Window Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-950/70 text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              <span className="font-mono text-[11px] text-zinc-500 ml-2">
                DoubtSolver AI • Mode: DSA
              </span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
              Interactive Preview
            </span>
          </div>

          {/* Mock Chat Body */}
          <div className="p-5 sm:p-7 space-y-5 text-left text-sm">
            {/* User message */}
            <div className="flex justify-end">
              <div className="bg-emerald-700/25 border border-emerald-600/40 text-zinc-100 rounded-2xl p-3.5 max-w-[85%] text-xs sm:text-sm">
                When should I choose QuickSort over MergeSort in engineering systems?
              </div>
            </div>

            {/* AI Assistant response */}
            <div className="bg-zinc-950/80 border border-zinc-800/90 rounded-2xl p-5 text-zinc-200 text-xs sm:text-sm space-y-3 leading-relaxed">
              <div className="flex items-center gap-2 pb-2 border-b border-zinc-800/60">
                <div className="w-6 h-6 rounded-lg bg-emerald-950 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <span className="font-bold text-white text-xs">DoubtSolver AI Tutor</span>
              </div>

              <h4 className="font-semibold text-emerald-300 text-sm">
                ### Simple Explanation
              </h4>
              <p className="text-zinc-300">
                <strong>QuickSort</strong> is preferred for in-place array sorting where memory cache locality is crucial. <strong>MergeSort</strong> is chosen when guaranteed $O(N \log N)$ worst-case time or algorithm stability is non-negotiable.
              </p>

              <h4 className="font-semibold text-emerald-300 text-sm pt-2">
                ### Step-by-Step Breakdown
              </h4>
              <ul className="list-disc pl-5 space-y-1 text-zinc-300">
                <li><strong>Time Complexity:</strong> QuickSort averages $O(N \log N)$ (with rare $O(N^2)$ avoided via random pivot); MergeSort is guaranteed $O(N \log N)$ in all cases.</li>
                <li><strong>Memory Footprint:</strong> QuickSort sorts in-place with $O(\log N)$ recursion stack; MergeSort requires $O(N)$ auxiliary buffer array.</li>
                <li><strong>Hardware Locality:</strong> QuickSort visits contiguous cache lines, minimizing CPU cache misses.</li>
              </ul>

              <h4 className="font-semibold text-emerald-300 text-sm pt-2">
                ### Short Example (Python)
              </h4>
              <div className="relative rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden font-mono text-xs text-zinc-200 group">
                <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900 border-b border-zinc-800 text-[11px] text-zinc-400">
                  <span className="text-emerald-400 uppercase font-semibold">python</span>
                  <button
                    onClick={handleCopySample}
                    className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-3 overflow-x-auto text-[11px] leading-relaxed">
{`def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)`}
                </pre>
              </div>

              <div className="pt-3 flex items-center justify-between text-xs text-zinc-500 border-t border-zinc-900">
                <span className="text-[11px] text-emerald-400 font-medium">
                  ✓ Syntax Highlighted • Step-by-Step Proofs
                </span>
                <Link
                  href="/chat"
                  className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                >
                  <span>Try in Chat</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          4. 5 SPECIALIZED SUBJECT MODES SECTION
         ======================================================== */}
      <section id="subjects" className="px-4 py-16 max-w-6xl mx-auto w-full text-center">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-2">
          Specialized Personas
        </h2>
        <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
          Tuned for Core Computer Science & Engineering
        </h3>
        <p className="text-sm text-zinc-400 max-w-xl mx-auto mb-12 leading-relaxed">
          Switch modes on the fly. Each subject alters the AI system prompt to guide you through domain-specific fundamentals.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-left">
          {/* General Engineering */}
          <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-blue-500/50 transition-all flex flex-col justify-between group">
            <div>
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-3">
                <Sparkles className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                General Eng
              </h4>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                Operating systems, virtual memory, paging, TCP/IP handshakes, and computer architecture.
              </p>
            </div>
            <Link
              href="/chat"
              className="mt-4 text-[11px] font-semibold text-blue-400 flex items-center gap-1 hover:underline"
            >
              <span>Solve doubts</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Python */}
          <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-amber-500/50 transition-all flex flex-col justify-between group">
            <div>
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3">
                <Code2 className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                Python Tutor
              </h4>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                Idiomatic PEP 8, Global Interpreter Lock (GIL), generators, decorators, and memory optimization.
              </p>
            </div>
            <Link
              href="/chat"
              className="mt-4 text-[11px] font-semibold text-amber-400 flex items-center gap-1 hover:underline"
            >
              <span>Solve doubts</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Machine Learning */}
          <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-purple-500/50 transition-all flex flex-col justify-between group">
            <div>
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-3">
                <BrainCircuit className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                Machine Learning
              </h4>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                Loss functions, backprop mathematical derivations, gradient descent, and neural net designs.
              </p>
            </div>
            <Link
              href="/chat"
              className="mt-4 text-[11px] font-semibold text-purple-400 flex items-center gap-1 hover:underline"
            >
              <span>Solve doubts</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {/* DSA */}
          <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-emerald-500/50 transition-all flex flex-col justify-between group">
            <div>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
                <GitFork className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                DSA Coach
              </h4>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                Asymptotic complexity ($O$), dynamic programming, graph traversals, and coding interview prep.
              </p>
            </div>
            <Link
              href="/chat"
              className="mt-4 text-[11px] font-semibold text-emerald-400 flex items-center gap-1 hover:underline"
            >
              <span>Solve doubts</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {/* DBMS */}
          <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-cyan-500/50 transition-all flex flex-col justify-between group">
            <div>
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-3">
                <Database className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                DBMS Engine
              </h4>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                Relational normal forms (1NF-BCNF), ACID transactions, B-Tree vs Hash index, and SQL plans.
              </p>
            </div>
            <Link
              href="/chat"
              className="mt-4 text-[11px] font-semibold text-cyan-400 flex items-center gap-1 hover:underline"
            >
              <span>Solve doubts</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================
          5. 3-TIER TUTOR PEDAGOGY SECTION
         ======================================================== */}
      <section id="pedagogy" className="px-4 py-16 bg-zinc-900/30 border-y border-zinc-800/80">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-2">
            The Pedagogy
          </h2>
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            How DoubtSolver AI Explains Concepts
          </h3>
          <p className="text-sm text-zinc-400 max-w-xl mx-auto mb-12">
            No wall of text. Every answer is cleanly structured to build intuition first, prove correctness next, and provide runnable code last.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 shadow-lg">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold font-mono text-sm mb-4">
                01
              </div>
              <h4 className="text-base font-bold text-white">Simple Explanation</h4>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                An intuitive mental model that connects the engineering concept to real-world analogies before diving into complex equations.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 shadow-lg">
              <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold font-mono text-sm mb-4">
                02
              </div>
              <h4 className="text-base font-bold text-white">Step-by-Step Breakdown</h4>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                Step-by-step mathematical derivation, asymptotic analysis ($O$), edge case boundaries, and system design tradeoffs.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 shadow-lg">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold font-mono text-sm mb-4">
                03
              </div>
              <h4 className="text-base font-bold text-white">Short Practical Example</h4>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                Complete, runnable code snippet with type annotations, comments, and a 1-click clipboard copy button.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          6. FEATURES GRID
         ======================================================== */}
      <section id="features" className="px-4 py-16 max-w-6xl mx-auto w-full text-center">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-2">
          Built For Productivity
        </h2>
        <h3 className="text-2xl sm:text-3xl font-bold text-white mb-12">
          Everything You Need to Ace Exams & Interviews
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80">
            <Bookmark className="w-6 h-6 text-amber-400 mb-3" />
            <h4 className="text-sm font-bold text-white">Solution Bookmarking</h4>
            <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
              Bookmark any AI reply with one click. Curate your personal formula sheet and code bank for midterm revision.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80">
            <Search className="w-6 h-6 text-emerald-400 mb-3" />
            <h4 className="text-sm font-bold text-white">Full-Text Search</h4>
            <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
              Search across past doubts by topic or keyword. Rename study threads, organize sessions, and delete old chats.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80">
            <BarChart3 className="w-6 h-6 text-blue-400 mb-3" />
            <h4 className="text-sm font-bold text-white">Student Dashboard</h4>
            <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
              Track your doubt breakdown across Python, DSA, ML, DBMS, and General Engineering with interactive bar charts.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80">
            <Zap className="w-6 h-6 text-yellow-400 mb-3" />
            <h4 className="text-sm font-bold text-white">Generation Control</h4>
            <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
              Stop generating mid-sentence if you already found what you needed, or hit Retry with automatic rate-limit backoff.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80">
            <Terminal className="w-6 h-6 text-teal-400 mb-3" />
            <h4 className="text-sm font-bold text-white">Syntax Highlighting</h4>
            <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
              Fenced code blocks with language badges, clean dark-mode typography, and instant copy feedback.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80">
            <ShieldCheck className="w-6 h-6 text-emerald-400 mb-3" />
            <h4 className="text-sm font-bold text-white">Postgres RLS Privacy</h4>
            <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
              Row Level Security ensures your chats, messages, and bookmarks are isolated exclusively to your student account.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================
          7. BOTTOM CALL TO ACTION
         ======================================================== */}
      <section className="px-4 py-16 text-center max-w-4xl mx-auto w-full">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-zinc-900 to-zinc-950 border border-emerald-500/30 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
            Ready to master your engineering doubts?
          </h3>
          <p className="mt-3 text-sm text-zinc-400 max-w-lg mx-auto leading-relaxed">
            Join students studying Python, Algorithms, Machine Learning, and Database Systems with instant AI tutor support.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/chat"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-xl shadow-emerald-950/80 active:scale-98 cursor-pointer"
            >
              <span>Start Solving Doubts</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </Link>

            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-sm font-medium transition-all"
            >
              View Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================
          8. FOOTER
         ======================================================== */}
      <footer className="border-t border-zinc-800/80 py-8 px-4 text-center text-xs text-zinc-500 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <span className="font-semibold text-zinc-300">DoubtSolver AI</span>
            <span>— The Engineering Study Assistant</span>
          </div>

          <div className="flex items-center gap-4 text-zinc-400">
            <Link href="/chat" className="hover:text-white transition-colors">
              Chat
            </Link>
            <Link href="/dashboard" className="hover:text-white transition-colors">
              Dashboard
            </Link>
            <Link href="/login" className="hover:text-white transition-colors">
              Login
            </Link>
          </div>
        </div>
        <p className="mt-4 text-zinc-600">
          Built with Next.js App Router, Tailwind CSS, Supabase Postgres RLS, and Groq open-source Llama 3 models.
        </p>
      </footer>
    </div>
  );
}
