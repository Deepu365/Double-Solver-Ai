'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Chat, SubjectType } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import {
  Plus,
  Search,
  MessageSquare,
  LayoutDashboard,
  LogOut,
  Edit2,
  Trash2,
  Check,
  X,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  BookOpen,
} from 'lucide-react';

interface SidebarProps {
  chats: Chat[];
  currentChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  onChatRenamed: (chatId: string, newTitle: string) => void;
  onChatDeleted: (chatId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
  isLoading?: boolean;
}

const SUBJECT_BADGES: Record<SubjectType, { label: string; cls: string }> = {
  General: { label: 'General', cls: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  Python: { label: 'Py', cls: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  ML: { label: 'ML', cls: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
  DSA: { label: 'DSA', cls: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  DBMS: { label: 'DBMS', cls: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
};

export function Sidebar({
  chats,
  currentChatId,
  onSelectChat,
  onNewChat,
  onChatRenamed,
  onChatDeleted,
  searchQuery,
  onSearchChange,
  isOpen,
  onToggleOpen,
  isLoading = false,
}: SidebarProps) {
  const { user, signOut, isConfigured } = useAuth();
  const { showSuccess, showError } = useToast();
  const router = useRouter();

  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [deletingChatId, setDeletingChatId] = useState<string | null>(null);

  const startEditing = (chat: Chat, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChatId(chat.id);
    setEditingTitle(chat.title);
  };

  const cancelEditing = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingChatId(null);
    setEditingTitle('');
  };

  const handleSaveRename = async (chatId: string, e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!editingTitle.trim()) return;

    try {
      const res = await fetch(`/api/chats/${chatId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(user?.id ? { 'x-user-id': user.id } : {}),
        },
        body: JSON.stringify({ title: editingTitle.trim() }),
      });

      if (!res.ok) throw new Error('Rename failed');

      onChatRenamed(chatId, editingTitle.trim());
      setEditingChatId(null);
      showSuccess('Chat renamed successfully.');
    } catch {
      showError('Could not rename chat. Please try again.');
    }
  };

  const confirmDelete = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/chats/${chatId}`, {
        method: 'DELETE',
        headers: {
          ...(user?.id ? { 'x-user-id': user.id } : {}),
        },
      });

      if (!res.ok) throw new Error('Delete failed');

      onChatDeleted(chatId);
      setDeletingChatId(null);
      showSuccess('Chat deleted.');
    } catch {
      showError('Could not delete chat. Please try again.');
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onToggleOpen}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-30 md:hidden"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 flex flex-col w-72 bg-zinc-950 border-r border-zinc-800/80 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800/80">
          <Link href="/chat" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4 text-zinc-950 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                DoubtSolver
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 ml-1.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 font-semibold">
                AI
              </span>
            </div>
          </Link>

          <button
            onClick={onToggleOpen}
            className="md:hidden p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Controls: New Chat + Search */}
        <div className="p-3 space-y-2 border-b border-zinc-800/60">
          <button
            onClick={onNewChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-medium text-sm transition-all duration-150 shadow-md shadow-emerald-950/50 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Doubt Session</span>
          </button>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search past chats..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-8.5 pr-8 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Chat History List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
          <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            Doubt History
          </div>

          {isLoading ? (
            <div className="p-4 text-center text-xs text-zinc-500">Loading your chats...</div>
          ) : chats.length === 0 ? (
            <div className="p-4 text-center text-xs text-zinc-500 leading-relaxed">
              {searchQuery ? 'No matching doubts found.' : 'No doubt sessions yet. Start asking any engineering question!'}
            </div>
          ) : (
            chats.map((chat) => {
              const isActive = currentChatId === chat.id;
              const isEditing = editingChatId === chat.id;
              const isDeleting = deletingChatId === chat.id;
              const badge = SUBJECT_BADGES[chat.subject] || SUBJECT_BADGES.General;

              if (isEditing) {
                return (
                  <div
                    key={chat.id}
                    className="p-1.5 rounded-lg bg-zinc-900 border border-emerald-500/50 flex items-center gap-1.5"
                  >
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveRename(chat.id);
                        if (e.key === 'Escape') cancelEditing();
                      }}
                      autoFocus
                      className="flex-1 bg-zinc-950 text-xs text-white px-2 py-1 rounded border border-zinc-700 focus:outline-none"
                    />
                    <button
                      onClick={(e) => handleSaveRename(chat.id, e)}
                      className="p-1 text-emerald-400 hover:text-emerald-300"
                      title="Save"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="p-1 text-zinc-400 hover:text-zinc-200"
                      title="Cancel"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                );
              }

              if (isDeleting) {
                return (
                  <div
                    key={chat.id}
                    className="p-2 rounded-lg bg-red-950/40 border border-red-800/60 flex items-center justify-between text-xs text-red-200"
                  >
                    <span>Delete chat?</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => confirmDelete(chat.id, e)}
                        className="px-2 py-0.5 bg-red-700 hover:bg-red-600 text-white rounded font-medium"
                      >
                        Yes
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingChatId(null);
                        }}
                        className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded"
                      >
                        No
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={chat.id}
                  onClick={() => onSelectChat(chat.id)}
                  className={`group relative flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs cursor-pointer transition-all duration-150 ${
                    isActive
                      ? 'bg-zinc-800/90 text-white font-medium border border-zinc-700/60 shadow-sm'
                      : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2 overflow-hidden flex-1">
                    <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-emerald-400' : 'text-zinc-500'}`} />
                    <span className="truncate flex-1">{chat.title}</span>
                  </div>

                  {/* Subject Tag */}
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded border shrink-0 ${badge.cls}`}
                  >
                    {badge.label}
                  </span>

                  {/* Hover Actions: Rename & Delete */}
                  <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity shrink-0">
                    <button
                      onClick={(e) => startEditing(chat, e)}
                      className="p-1 hover:text-white text-zinc-400 transition-colors"
                      title="Rename"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingChatId(chat.id);
                      }}
                      className="p-1 hover:text-red-400 text-zinc-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Navigation: Dashboard, User & Logout */}
        <div className="p-3 border-t border-zinc-800/80 space-y-1 bg-zinc-950/60">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-all"
          >
            <LayoutDashboard className="w-4 h-4 text-emerald-400" />
            <span>Student Dashboard</span>
          </Link>

          <div className="pt-2 mt-2 border-t border-zinc-900 flex items-center justify-between text-xs px-2">
            <div className="overflow-hidden">
              <p className="text-zinc-300 font-medium truncate max-w-[140px]">
                {user?.email || 'Engineering Student'}
              </p>
              <p className="text-[10px] text-zinc-500">
                {isConfigured ? 'Supabase Postgres' : 'Demo Preview'}
              </p>
            </div>
            <button
              onClick={() => signOut()}
              className="p-1.5 text-zinc-400 hover:text-red-400 rounded-lg hover:bg-zinc-900 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
