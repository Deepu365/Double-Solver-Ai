'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  Sparkles,
  ArrowRight,
  Code2,
  BrainCircuit,
  GitFork,
  Database,
  CheckCircle2,
  Cpu,
  Bookmark,
  BarChart3,
  Search,
} from 'lucide-react';

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-emerald-900 selection:text-emerald-100">
      {/* Navigation Bar */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/70 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Sparkles className="w-4 h-4 text-zinc-950 stroke-[2.5]" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white">
              DoubtSolver <span className="text-emerald-400">AI</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <Link
                href="/chat"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors shadow-md shadow-emerald-950"
              >
                <span>Open Chat</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-white transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors shadow-md shadow-emerald-950"
                >
                  Sign up free
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center items-center px-4 py-16 md:py-24 max-w-5xl mx-auto text-center">
        {/* Top Announcement Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300 mb-8 shadow-sm">
          <Cpu className="w-3.5 h-3.5 text-emerald-400" />
          <span>Powered by open-source Llama 3 via Groq</span>
          <span className="text-emerald-400 font-bold">• Ultra Fast Streaming</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white max-w-3xl leading-[1.15]">
          The AI Study Assistant for{' '}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            Engineering Students
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-zinc-400 max-w-2xl leading-relaxed">
          Tackle tricky concepts in Python, Machine Learning, DSA, and DBMS. DoubtSolver AI explains every doubt using a 3-tier tutor method:
          <span className="text-zinc-200 font-medium"> Simple Explanation</span>,
          <span className="text-zinc-200 font-medium"> Step-by-Step Logic</span>, and
          <span className="text-zinc-200 font-medium"> Working Code</span>.
        </p>

        {/* Primary Call to Action */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/chat"
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all shadow-xl shadow-emerald-950/80 active:scale-98 cursor-pointer"
          >
            <span>Start Solving Doubts Free</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800/80 border border-zinc-800 text-zinc-300 hover:text-white font-medium text-sm transition-all"
          >
            Login with Supabase
          </Link>
        </div>

        {/* 5 Subject Modes Showcase */}
        <div className="mt-20 w-full">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-6">
            Specialized Tutor Personas Tailored for Engineering
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 text-left">
            <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-blue-500/50 transition-all">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center mb-3">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white">General Eng</h3>
              <p className="text-xs text-zinc-400 mt-1">
                OS concepts, computer networks, systems architecture & core foundations.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-amber-500/50 transition-all">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3">
                <Code2 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white">Python Tutor</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Idiomatic Pythonic code, memory footprint, GIL, decorators & generators.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-purple-500/50 transition-all">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center mb-3">
                <BrainCircuit className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white">Machine Learning</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Loss functions, gradient descent derivations, backprop & deep learning math.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-emerald-500/50 transition-all">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
                <GitFork className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white">DSA Coach</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Time/space complexity analysis ($O$), DP paradigms, trees, and interview graphs.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-cyan-500/50 transition-all">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-3">
                <Database className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white">DBMS Engine</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Relational normal forms, ACID isolation, B-Tree vs Hash indexing & SQL plans.
              </p>
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-16 w-full grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80">
            <Bookmark className="w-6 h-6 text-amber-400 mb-3" />
            <h4 className="text-sm font-semibold text-white">Bookmark Key Solutions</h4>
            <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
              Pin any AI tutor response directly to your exam prep gallery for instant revision before midterms and interviews.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80">
            <Search className="w-6 h-6 text-emerald-400 mb-3" />
            <h4 className="text-sm font-semibold text-white">Full-Text Doubt Search</h4>
            <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
              Instantly search through all your past doubt sessions. Rename, organize, and delete study threads anytime.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80">
            <BarChart3 className="w-6 h-6 text-blue-400 mb-3" />
            <h4 className="text-sm font-semibold text-white">Analytics Dashboard</h4>
            <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
              Track your question volume across subjects with interactive bar charts and performance distribution metrics.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 py-8 text-center text-xs text-zinc-500">
        <p>DoubtSolver AI • Production-grade Engineering Study Assistant</p>
        <p className="mt-1">
          Next.js App Router • Supabase Postgres RLS • Groq Llama 3 • Tailwind CSS
        </p>
      </footer>
    </div>
  );
}
