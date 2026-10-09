'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DashboardStats, SubjectType } from '@/types';
import { SubjectBarChart } from '@/components/SubjectBarChart';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import {
  MessageSquare,
  Bookmark,
  Sparkles,
  ArrowLeft,
  Trash2,
  ExternalLink,
  BookOpen,
  HelpCircle,
  Database,
  Code2,
  BrainCircuit,
  GitFork,
  Flame,
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();
  const router = useRouter();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeBookmarkTab, setActiveBookmarkTab] = useState<string>('all');
  const [isSeeding, setIsSeeding] = useState(false);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/dashboard', {
        headers: { ...(user?.id ? { 'x-user-id': user.id } : {}) },
      });
      if (!res.ok) throw new Error('Failed to fetch stats');
      const data = await res.json();
      setStats(data.stats);
    } catch {
      showError('Failed to load dashboard statistics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user?.id]);

  const handleRemoveBookmark = async (messageId: string) => {
    try {
      const res = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user?.id ? { 'x-user-id': user.id } : {}) },
        body: JSON.stringify({ messageId }),
      });
      if (!res.ok) throw new Error('Failed to remove bookmark');
      showSuccess('Bookmark removed.');
      fetchStats();
    } catch {
      showError('Failed to remove bookmark.');
    }
  };

  const handleSeedSampleData = async () => {
    setIsSeeding(true);
    try {
      const res = await fetch('/api/seed', {
        method: 'POST',
        headers: { ...(user?.id ? { 'x-user-id': user.id } : {}) },
      });
      if (!res.ok) throw new Error('Seeding failed');
      showSuccess('Sample engineering doubts loaded into your dashboard!');
      await fetchStats();
    } catch {
      showError('Failed to load sample doubts.');
    } finally {
      setIsSeeding(false);
    }
  };

  const filteredBookmarks = (stats?.bookmarkedAnswers || []).filter((b) => {
    if (activeBookmarkTab === 'all') return true;
    return b.subject === activeBookmarkTab;
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <Link
              href="/chat"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Chat</span>
            </Link>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                <span>Student Study Dashboard</span>
              </h1>
              <p className="text-xs text-zinc-400">
                Performance analytics, subject distribution, and bookmarked tutor solutions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSeedSampleData}
              disabled={isSeeding}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/60 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors disabled:opacity-50 cursor-pointer"
              title="Populate your dashboard with engineering starter doubts"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isSeeding ? 'Loading...' : 'Load Sample Doubts'}</span>
            </button>

            <Link
              href="/chat"
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition-colors shadow-md"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Ask New Doubt</span>
            </Link>
          </div>
        </div>

        {/* Metric Cards Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 shadow-md">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs font-medium">Total Doubts Solved</span>
              <HelpCircle className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl md:text-3xl font-bold text-white font-mono">
              {stats?.totalQuestions ?? 0}
            </div>
            <div className="text-[11px] text-zinc-500 mt-1">AI tutor explanations</div>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 shadow-md">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs font-medium">Doubt Sessions</span>
              <MessageSquare className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl md:text-3xl font-bold text-white font-mono">
              {stats?.totalChats ?? 0}
            </div>
            <div className="text-[11px] text-zinc-500 mt-1">Saved study threads</div>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 shadow-md">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs font-medium">Bookmarked Answers</span>
              <Bookmark className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl md:text-3xl font-bold text-white font-mono">
              {stats?.totalBookmarks ?? 0}
            </div>
            <div className="text-[11px] text-zinc-500 mt-1">Curated solutions for exam prep</div>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 shadow-md">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs font-medium">Tutor Pedagogy</span>
              <Flame className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-sm font-semibold text-emerald-300 mt-1">
              3-Tier Engineering Tutor
            </div>
            <div className="text-[11px] text-zinc-500 mt-1">Concept → Steps → Code</div>
          </div>
        </div>

        {/* Subject Distribution Bar Chart */}
        <SubjectBarChart
          data={
            stats?.subjectCounts || {
              General: 0,
              Python: 0,
              ML: 0,
              DSA: 0,
              DBMS: 0,
            }
          }
        />

        {/* Two-Column Section: Recent Chats & Bookmarked Solutions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Chats List */}
          <div className="lg:col-span-1 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                Recent Doubt Sessions
              </h3>
              <Link href="/chat" className="text-xs text-emerald-400 hover:underline">
                View all
              </Link>
            </div>

            {(!stats?.recentChats || stats.recentChats.length === 0) ? (
              <div className="p-6 text-center text-xs text-zinc-500">
                No recent study sessions yet. Start asking doubts in the chat!
              </div>
            ) : (
              <div className="space-y-2">
                {stats.recentChats.map((chat) => (
                  <Link
                    key={chat.id}
                    href="/chat"
                    className="block p-3 rounded-xl bg-zinc-900/90 hover:bg-zinc-800/80 border border-zinc-800 hover:border-zinc-700 transition-all group"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-medium text-zinc-200 group-hover:text-white truncate">
                        {chat.title}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 shrink-0">
                        {chat.subject}
                      </span>
                    </div>
                    <div className="text-[10px] text-zinc-500 font-mono">
                      {new Date(chat.created_at).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Bookmarked Answers Gallery */}
          <div className="lg:col-span-2 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-amber-400" />
                  Bookmarked Solutions for Quick Revision
                </h3>
                <p className="text-xs text-zinc-400">Save key algorithms, proofs, and code snippets</p>
              </div>

              {/* Filter pills */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                {(['all', 'General', 'Python', 'ML', 'DSA', 'DBMS'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveBookmarkTab(tab)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                      activeBookmarkTab === tab
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                    }`}
                  >
                    {tab === 'all' ? 'All' : tab}
                  </button>
                ))}
              </div>
            </div>

            {filteredBookmarks.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-500 bg-zinc-950/40 rounded-xl border border-zinc-800/50">
                <Bookmark className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                <p>No bookmarked answers in this category.</p>
                <p className="mt-1 text-zinc-600">
                  Click the bookmark icon on any AI tutor reply in the chat to save it here.
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[550px] overflow-y-auto pr-1 scrollbar-thin">
                {filteredBookmarks.map((bm) => (
                  <div
                    key={bm.id}
                    className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/80 hover:border-zinc-700/80 transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-zinc-800/60 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold">
                          {bm.subject}
                        </span>
                        <span className="text-xs font-semibold text-zinc-200 truncate">
                          {bm.chat_title}
                        </span>
                      </div>

                      <button
                        onClick={() => handleRemoveBookmark(bm.message_id)}
                        className="text-zinc-500 hover:text-red-400 p-1 rounded transition-colors"
                        title="Remove bookmark"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-xs text-zinc-300 max-h-48 overflow-y-auto pr-2 scrollbar-thin">
                      <MarkdownRenderer content={bm.content} />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1 font-mono">
                      <span>Saved: {new Date(bm.created_at).toLocaleDateString()}</span>
                      <Link
                        href="/chat"
                        className="text-emerald-400 hover:underline flex items-center gap-1 font-sans"
                      >
                        <span>Open in Chat</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
