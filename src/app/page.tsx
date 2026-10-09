'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { SubjectType, Message, Chat, DashboardStats } from '@/types';
import { Sidebar } from '@/components/Sidebar';
import { SubjectSelector } from '@/components/SubjectSelector';
import { SubjectBarChart } from '@/components/SubjectBarChart';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import {
  Send,
  Square,
  RefreshCw,
  Bookmark,
  BookmarkCheck,
  Menu,
  Sparkles,
  Bot,
  User,
  AlertTriangle,
  Lightbulb,
  LayoutDashboard,
  MessageSquare,
  HelpCircle,
  Flame,
  Trash2,
  ExternalLink,
  X,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';

const STARTER_PROMPTS: Record<SubjectType, string[]> = {
  General: [
    'How does Virtual Memory and Paging work in modern OS?',
    'Explain the TCP 3-Way Handshake with state transitions',
    'What is the difference between process and thread memory layout?',
    'Explain how Git stores files as content-addressable objects',
  ],
  Python: [
    'Explain Python Global Interpreter Lock (GIL) and concurrency',
    'When to use generators vs list comprehensions for memory efficiency?',
    'How do Python decorators work under the hood with closures?',
    'Explain shallow copy vs deep copy with mutable objects',
  ],
  ML: [
    'Why is Cross-Entropy preferred over MSE for classification models?',
    'Explain Backpropagation using the chain rule step-by-step',
    'What is the difference between L1 (Lasso) and L2 (Ridge) regularization?',
    'Explain the Self-Attention mechanism in Transformer networks',
  ],
  DSA: [
    'When should I choose QuickSort over MergeSort in engineering systems?',
    'How do I systematically identify Dynamic Programming patterns?',
    'Explain Dijkstra algorithm with priority queue time complexity',
    'How to detect and break a cycle in a singly linked list (Floyd algorithm)?',
  ],
  DBMS: [
    'Why do relational databases use B+ Trees instead of Hash indexing?',
    'Explain ACID properties with practical banking transaction examples',
    'What is the practical difference between 3NF and BCNF normalization?',
    'How does Write-Ahead Logging (WAL) protect against system crashes?',
  ],
};

export default function UnifiedAppPage() {
  const { user } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();

  // Active view: 'chat' | 'dashboard'
  const [activeTab, setActiveTab] = useState<'chat' | 'dashboard'>('chat');

  // Chat states
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [subject, setSubject] = useState<SubjectType>('General');
  const [input, setInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoadingChats, setIsLoadingChats] = useState(true);

  // Streaming states
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [errorMessage, setErrorMessage] = useState<{ text: string; isRetryable: boolean } | null>(null);
  const [lastPrompt, setLastPrompt] = useState<string>('');

  // Config & API Key states
  const [hasGroqKey, setHasGroqKey] = useState<boolean>(true);
  const [showKeyModal, setShowKeyModal] = useState<boolean>(false);
  const [customApiKey, setCustomApiKey] = useState<string>('');
  const [isDismissedBanner, setIsDismissedBanner] = useState<boolean>(false);

  // Dashboard states
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState<boolean>(false);
  const [activeBookmarkCategory, setActiveBookmarkCategory] = useState<string>('all');
  const [isSeeding, setIsSeeding] = useState<boolean>(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-scroll handler
  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'auto',
    });
  }, []);

  useEffect(() => {
    if (activeTab === 'chat') {
      scrollToBottom(true);
    }
  }, [messages, streamingText, scrollToBottom, activeTab]);

  // Check backend config
  useEffect(() => {
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.hasGroqKey === 'boolean') {
          setHasGroqKey(data.hasGroqKey);
        }
      })
      .catch(() => {});

    // Check localStorage for saved custom key
    const saved = localStorage.getItem('doubtsolver_custom_groq_key');
    if (saved) {
      setCustomApiKey(saved);
      setHasGroqKey(true);
    }
  }, []);

  // Load chat history
  const loadChats = useCallback(
    async (query = '') => {
      setIsLoadingChats(true);
      try {
        const url = query ? `/api/chats?q=${encodeURIComponent(query)}` : '/api/chats';
        const res = await fetch(url, {
          headers: { ...(user?.id ? { 'x-user-id': user.id } : {}) },
        });
        if (!res.ok) throw new Error('Failed to load chats');
        const data = await res.json();
        setChats(data.chats || []);
      } catch {
        showError('Could not load chat history.');
      } finally {
        setIsLoadingChats(false);
      }
    },
    [user?.id, showError]
  );

  useEffect(() => {
    loadChats(searchQuery);
  }, [loadChats, searchQuery]);

  // Load dashboard stats
  const fetchDashboardStats = useCallback(async () => {
    setIsLoadingDashboard(true);
    try {
      const res = await fetch('/api/dashboard', {
        headers: { ...(user?.id ? { 'x-user-id': user.id } : {}) },
      });
      if (!res.ok) throw new Error('Failed to fetch stats');
      const data = await res.json();
      setDashboardStats(data.stats);
    } catch {
      showError('Failed to load dashboard statistics.');
    } finally {
      setIsLoadingDashboard(false);
    }
  }, [user?.id, showError]);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchDashboardStats();
    }
  }, [activeTab, fetchDashboardStats]);

  // Select chat from history
  const selectChat = async (chatId: string) => {
    if (isStreaming) {
      showInfo('Please wait for the current explanation to finish.');
      return;
    }

    setActiveTab('chat');
    setCurrentChatId(chatId);
    setErrorMessage(null);
    setIsSidebarOpen(false);

    try {
      const res = await fetch(`/api/chats/${chatId}`, {
        headers: { ...(user?.id ? { 'x-user-id': user.id } : {}) },
      });
      if (!res.ok) throw new Error('Failed to load chat');
      const data = await res.json();
      setMessages(data.chat?.messages || []);
      if (data.chat?.subject) {
        setSubject(data.chat.subject);
      }
    } catch {
      showError('Could not load messages.');
    }
  };

  // Start new chat
  const handleNewChat = () => {
    if (isStreaming) {
      showInfo('Please finish or stop current generation first.');
      return;
    }
    setActiveTab('chat');
    setCurrentChatId(null);
    setMessages([]);
    setStreamingText('');
    setErrorMessage(null);
    setInput('');
    setIsSidebarOpen(false);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Submit Doubt Question
  const handleSendDoubt = async (queryText?: string) => {
    const textToSend = (queryText || input).trim();
    if (!textToSend || isStreaming) return;

    setActiveTab('chat');
    setErrorMessage(null);
    setLastPrompt(textToSend);
    setInput('');

    // Optimistic user message
    const tempUserMsg: Message = {
      id: `temp-${Date.now()}`,
      chat_id: currentChatId || '',
      role: 'user',
      content: textToSend,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUserMsg]);
    setIsStreaming(true);
    setStreamingText('');

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (user?.id) headers['x-user-id'] = user.id;
      if (customApiKey) headers['x-groq-key'] = customApiKey;

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          chatId: currentChatId,
          message: textToSend,
          subject,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.error ||
            (res.status === 429
              ? 'Rate limit reached. Please wait a few seconds and click Retry.'
              : 'Our AI tutor encountered a temporary error.')
        );
      }

      const returnedChatId = res.headers.get('X-Chat-Id');
      if (returnedChatId && !currentChatId) {
        setCurrentChatId(returnedChatId);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No response stream');

      const decoder = new TextDecoder();
      let fullAssistantText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullAssistantText += chunk;
        setStreamingText((prev) => prev + chunk);
      }

      if (fullAssistantText.trim()) {
        const newAssistantMsg: Message = {
          id: `msg-${Date.now()}`,
          chat_id: returnedChatId || currentChatId || '',
          role: 'assistant',
          content: fullAssistantText.trim(),
          created_at: new Date().toISOString(),
          isBookmarked: false,
        };
        setMessages((prev) => [...prev, newAssistantMsg]);
      }

      setStreamingText('');
      loadChats(searchQuery);
    } catch (err: unknown) {
      const error = err as { name?: string; message?: string };
      if (error?.name === 'AbortError') {
        if (streamingText.trim()) {
          const partialMsg: Message = {
            id: `msg-${Date.now()}`,
            chat_id: currentChatId || '',
            role: 'assistant',
            content: streamingText.trim() + '\n\n*(Explanation stopped by user)*',
            created_at: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, partialMsg]);
        }
        setStreamingText('');
        showInfo('Explanation stopped.');
      } else {
        setErrorMessage({
          text: error.message || 'Could not complete the explanation. Please retry.',
          isRetryable: true,
        });
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const handleStopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleToggleBookmark = async (messageId: string) => {
    try {
      const res = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user?.id ? { 'x-user-id': user.id } : {}),
        },
        body: JSON.stringify({ messageId }),
      });

      if (!res.ok) throw new Error('Bookmark toggle failed');
      const data = await res.json();

      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, isBookmarked: data.bookmarked } : m))
      );

      if (data.bookmarked) {
        showSuccess('Solution saved to Bookmarks!');
      } else {
        showInfo('Bookmark removed.');
      }
    } catch {
      showError('Failed to update bookmark.');
    }
  };

  const handleRemoveBookmarkFromDashboard = async (messageId: string) => {
    try {
      const res = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user?.id ? { 'x-user-id': user.id } : {}),
        },
        body: JSON.stringify({ messageId }),
      });
      if (!res.ok) throw new Error('Failed to remove bookmark');
      showSuccess('Bookmark removed.');
      fetchDashboardStats();
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
      showSuccess('Sample engineering doubts loaded!');
      await fetchDashboardStats();
      await loadChats();
    } catch {
      showError('Failed to load sample doubts.');
    } finally {
      setIsSeeding(false);
    }
  };

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customApiKey.trim()) return;
    localStorage.setItem('doubtsolver_custom_groq_key', customApiKey.trim());
    setHasGroqKey(true);
    setShowKeyModal(false);
    showSuccess('Groq API Key saved for this browser!');
  };

  const handleClearApiKey = () => {
    localStorage.removeItem('doubtsolver_custom_groq_key');
    setCustomApiKey('');
    setShowKeyModal(false);
    showInfo('Custom API key removed.');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendDoubt();
    }
  };

  const filteredBookmarks = (dashboardStats?.bookmarkedAnswers || []).filter((b) => {
    if (activeBookmarkCategory === 'all') return true;
    return b.subject === activeBookmarkCategory;
  });

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100 font-sans">
      {/* Unified History Sidebar */}
      <Sidebar
        chats={chats}
        currentChatId={currentChatId}
        onSelectChat={selectChat}
        onNewChat={handleNewChat}
        onChatRenamed={(id, newTitle) => {
          setChats((prev) => prev.map((c) => (c.id === id ? { ...c, title: newTitle } : c)));
        }}
        onChatDeleted={(id) => {
          setChats((prev) => prev.filter((c) => c.id !== id));
          if (currentChatId === id) {
            handleNewChat();
          }
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isOpen={isSidebarOpen}
        onToggleOpen={() => setIsSidebarOpen((prev) => !prev)}
        isLoading={isLoadingChats}
      />

      {/* Main Studio View (Everything on localhost:3000) */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Header Bar */}
        <header className="flex items-center justify-between px-3 md:px-6 py-2.5 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md z-10 gap-2">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
              title="Open chat history"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Quick 1-Click Tab Switcher: Chat <-> Dashboard */}
            <div className="flex items-center bg-zinc-900 border border-zinc-800 p-0.5 rounded-xl">
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'chat'
                    ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>AI Tutor Chat</span>
              </button>

              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard & Stats</span>
              </button>
            </div>
          </div>

          {/* Right Controls: Subject pills or API key settings */}
          <div className="flex items-center gap-2">
            {activeTab === 'chat' ? (
              <SubjectSelector
                currentSubject={subject}
                onSelectSubject={(newSub) => {
                  setSubject(newSub);
                  showInfo(`Subject mode switched to ${newSub}.`);
                }}
                disabled={isStreaming}
              />
            ) : (
              <button
                onClick={handleSeedSampleData}
                disabled={isSeeding}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-emerald-400 font-medium transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isSeeding ? 'Loading...' : 'Sample Doubts'}</span>
              </button>
            )}

            {/* Prominent Glowing API Key Settings Button */}
            <button
              onClick={() => setShowKeyModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600/30 to-teal-600/30 hover:from-emerald-600/50 hover:to-teal-600/50 border border-emerald-500/60 text-emerald-300 hover:text-white text-xs font-semibold transition-all shadow-md cursor-pointer shrink-0"
              title="Click here to enter Groq API Key"
            >
              <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
              <span>🔑 Groq API Key</span>
            </button>
          </div>
        </header>

        {/* Highly Visible API Key Banner */}
        <div className="bg-gradient-to-r from-emerald-950/90 via-zinc-900/95 to-teal-950/90 border-b border-emerald-500/40 px-4 py-2.5 text-xs text-emerald-200 flex flex-wrap items-center justify-between gap-2 shadow-lg">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 animate-pulse" />
            <span>
              <strong>🔑 Groq API Key:</strong> {hasGroqKey ? 'Live Llama 3.3 70B is Active!' : 'మీ Groq API Key ని ఇక్కడ ఎంటర్ చేయండి — Llama 3.3 70B యాక్టివేట్ అవుతుంది!'}
            </span>
          </div>
          <button
            onClick={() => setShowKeyModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-lg text-xs transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5 text-zinc-950 stroke-[2.5]" />
            <span>{hasGroqKey ? 'Change API Key' : '👉 Click Here to Enter Key'}</span>
          </button>
        </div>

        {/* ========================================================
            TAB 1: AI TUTOR CHAT INTERFACE
           ======================================================== */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6 scrollbar-thin">
              {/* Empty / Welcome State */}
              {messages.length === 0 && !isStreaming && (
                <div className="max-w-2xl mx-auto my-auto py-8 text-center flex flex-col items-center justify-center animate-in fade-in duration-300">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center mb-5 shadow-xl shadow-emerald-950/40">
                    <Bot className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    What engineering doubt can I resolve today?
                  </h2>
                  <p className="text-sm text-zinc-400 max-w-lg mb-4 leading-relaxed">
                    Select your subject mode above and ask any doubt. Get answers structured in
                    <span className="text-emerald-300 font-medium"> Simple Explanations</span>,
                    <span className="text-emerald-300 font-medium"> Step-by-Step Logic</span>, and
                    <span className="text-emerald-300 font-medium"> Runnable Code</span>.
                  </p>

                  {/* Prominent API Key setup card */}
                  <div className="mb-6 p-3 rounded-xl bg-zinc-900/90 border border-emerald-500/40 flex items-center justify-between max-w-md w-full shadow-lg">
                    <div className="text-left text-xs">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <KeyRound className="w-4 h-4 text-emerald-400" />
                        <span>Groq API Key (Llama 3.3 70B)</span>
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">
                        {hasGroqKey ? '✅ Key is Configured & Active' : 'Free key from console.groq.com/keys'}
                      </div>
                    </div>
                    <button
                      onClick={() => setShowKeyModal(true)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition-all cursor-pointer"
                    >
                      {hasGroqKey ? 'Manage Key' : 'Enter Key 🔑'}
                    </button>
                  </div>

                  {/* Starter Doubt Suggestions */}
                  <div className="w-full text-left">
                    <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                      Recommended Doubts for <span className="text-white font-bold">{subject}</span>:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {(STARTER_PROMPTS[subject] || STARTER_PROMPTS.General).map((prompt, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendDoubt(prompt)}
                          className="text-left p-3.5 rounded-xl bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800/80 hover:border-zinc-700 text-xs text-zinc-300 hover:text-white transition-all duration-150 group cursor-pointer shadow-sm active:scale-[0.99]"
                        >
                          <span className="line-clamp-2 leading-relaxed">{prompt}</span>
                          <span className="text-[10px] text-emerald-400 font-mono mt-1.5 block opacity-0 group-hover:opacity-100 transition-opacity">
                            Ask this doubt &rarr;
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Message Thread */}
              {messages.map((msg) => {
                const isUser = msg.role === 'user';

                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 md:gap-4 max-w-4xl mx-auto ${
                      isUser ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {!isUser && (
                      <div className="w-8 h-8 rounded-xl bg-emerald-950/80 border border-emerald-700/60 flex items-center justify-center shrink-0 mt-1 shadow-md">
                        <Bot className="w-4 h-4 text-emerald-400" />
                      </div>
                    )}

                    <div
                      className={`relative group rounded-2xl p-4 md:p-5 transition-all max-w-[88%] md:max-w-[80%] ${
                        isUser
                          ? 'bg-emerald-700/25 border border-emerald-600/40 text-zinc-100 shadow-md'
                          : 'bg-zinc-900/80 border border-zinc-800/90 text-zinc-200 shadow-lg'
                      }`}
                    >
                      {isUser ? (
                        <p className="whitespace-pre-wrap leading-relaxed text-sm md:text-[15px]">
                          {msg.content}
                        </p>
                      ) : (
                        <div>
                          <MarkdownRenderer content={msg.content} />

                          {/* Bookmark button on EVERY AI reply */}
                          <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-400">
                            <button
                              onClick={() => handleToggleBookmark(msg.id)}
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors border cursor-pointer ${
                                msg.isBookmarked
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-medium'
                                  : 'hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border-transparent'
                              }`}
                              title={msg.isBookmarked ? 'Remove Bookmark' : 'Bookmark this solution'}
                            >
                              {msg.isBookmarked ? (
                                <>
                                  <BookmarkCheck className="w-3.5 h-3.5 text-amber-400" />
                                  <span>Bookmarked</span>
                                </>
                              ) : (
                                <>
                                  <Bookmark className="w-3.5 h-3.5" />
                                  <span>Bookmark Solution</span>
                                </>
                              )}
                            </button>

                            <span className="text-[10px] text-zinc-500 font-mono">
                              {new Date(msg.created_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {isUser && (
                      <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0 mt-1">
                        <User className="w-4 h-4 text-zinc-300" />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Active Streaming Response */}
              {isStreaming && (
                <div className="flex gap-3 md:gap-4 max-w-4xl mx-auto justify-start">
                  <div className="w-8 h-8 rounded-xl bg-emerald-950/80 border border-emerald-700/60 flex items-center justify-center shrink-0 mt-1 shadow-md">
                    <Bot className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="relative rounded-2xl p-4 md:p-5 bg-zinc-900/80 border border-zinc-800/90 text-zinc-200 shadow-lg max-w-[88%] md:max-w-[80%] flex-1">
                    {streamingText ? (
                      <MarkdownRenderer content={streamingText} />
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-zinc-400 py-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        <span>Formulating engineering tutor solution...</span>
                      </div>
                    )}
                    {/* Typing Indicator */}
                    <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-zinc-800/40">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.4s]" />
                      <span className="text-[11px] text-zinc-500 ml-2 font-mono">Streaming response...</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Friendly Error Box with Retry */}
              {errorMessage && (
                <div className="max-w-xl mx-auto p-4 rounded-xl bg-red-950/40 border border-red-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-red-200">
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                    <span>{errorMessage.text}</span>
                  </div>
                  {errorMessage.isRetryable && lastPrompt && (
                    <button
                      onClick={() => handleSendDoubt(lastPrompt)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-800/80 hover:bg-red-700 text-white font-medium shrink-0 transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Retry</span>
                    </button>
                  )}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Floating Stop Generating Button */}
            {isStreaming && (
              <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20">
                <button
                  onClick={handleStopGenerating}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/90 border border-zinc-700 text-zinc-200 hover:text-white shadow-xl hover:bg-zinc-800 transition-all text-xs font-semibold backdrop-blur-md cursor-pointer active:scale-95"
                >
                  <Square className="w-3.5 h-3.5 text-red-400 fill-current" />
                  <span>Stop Generating</span>
                </button>
              </div>
            )}

            {/* Input Bar */}
            <div className="p-4 border-t border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md">
              <div className="max-w-4xl mx-auto">
                <div className="relative rounded-2xl bg-zinc-900 border border-zinc-800 focus-within:border-zinc-700 shadow-2xl transition-all">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Ask any doubt in ${subject} (e.g. explain time complexity, memory models, algorithms)...`}
                    disabled={isStreaming}
                    rows={2}
                    maxLength={4000}
                    className="w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-500 px-4 pt-3.5 pb-10 focus:outline-none resize-none leading-relaxed disabled:opacity-50"
                  />

                  {/* Bottom info inside input */}
                  <div className="absolute bottom-2 left-4 right-3 flex items-center justify-between text-xs text-zinc-500">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px]">{input.length}/4000</span>
                      <span className="hidden sm:inline text-[11px] text-zinc-600">
                        • Enter to send, Shift+Enter for newline
                      </span>
                    </div>

                    <button
                      onClick={() => handleSendDoubt()}
                      disabled={!input.trim() || isStreaming}
                      className={`p-2 rounded-xl transition-all duration-150 ${
                        input.trim() && !isStreaming
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-md'
                          : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                      }`}
                      title="Send Doubt"
                    >
                      <Send className="w-4 h-4 stroke-[2.2]" />
                    </button>
                  </div>
                </div>

                <div className="text-center mt-2 text-[11px] text-zinc-500">
                  DoubtSolver AI • Llama 3 via Groq • Context limited to last 20 messages
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: DASHBOARD & BOOKMARKS (IN THE SAME VIEW)
           ======================================================== */}
        {activeTab === 'dashboard' && (
          <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scrollbar-thin">
            <div className="max-w-5xl mx-auto space-y-6">
              {/* Metric Cards Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 shadow-md">
                  <div className="flex items-center justify-between text-zinc-400 mb-2">
                    <span className="text-xs font-medium">Total Doubts Solved</span>
                    <HelpCircle className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-white font-mono">
                    {dashboardStats?.totalQuestions ?? 0}
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-1">AI tutor explanations</div>
                </div>

                <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 shadow-md">
                  <div className="flex items-center justify-between text-zinc-400 mb-2">
                    <span className="text-xs font-medium">Doubt Sessions</span>
                    <MessageSquare className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-white font-mono">
                    {dashboardStats?.totalChats ?? chats.length}
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-1">Saved study threads</div>
                </div>

                <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 shadow-md">
                  <div className="flex items-center justify-between text-zinc-400 mb-2">
                    <span className="text-xs font-medium">Bookmarked Answers</span>
                    <Bookmark className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-white font-mono">
                    {dashboardStats?.totalBookmarks ?? 0}
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-1">Solutions saved for revision</div>
                </div>

                <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 shadow-md">
                  <div className="flex items-center justify-between text-zinc-400 mb-2">
                    <span className="text-xs font-medium">Tutor Style</span>
                    <Flame className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="text-sm font-semibold text-emerald-300 mt-1">
                    3-Tier Pedagogy
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-1">Concept → Steps → Code</div>
                </div>
              </div>

              {/* Questions per Subject Bar Chart */}
              <SubjectBarChart
                data={
                  dashboardStats?.subjectCounts || {
                    General: 0,
                    Python: 0,
                    ML: 0,
                    DSA: 0,
                    DBMS: 0,
                  }
                }
              />

              {/* Bookmarked Answers Revision Gallery */}
              <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                  <div>
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Bookmark className="w-4 h-4 text-amber-400" />
                      Bookmarked Solutions for Quick Revision
                    </h3>
                    <p className="text-xs text-zinc-400">Review algorithms, formulas, and code snippets</p>
                  </div>

                  {/* Subject filter tabs */}
                  <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                    {(['all', 'General', 'Python', 'ML', 'DSA', 'DBMS'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveBookmarkCategory(tab)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                          activeBookmarkCategory === tab
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
                    <p>No bookmarked solutions in this category yet.</p>
                    <p className="mt-1 text-zinc-600">
                      Click the bookmark icon under any AI tutor reply in the chat to save it here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin">
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
                            onClick={() => handleRemoveBookmarkFromDashboard(bm.message_id)}
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
                          <button
                            onClick={() => {
                              setActiveTab('chat');
                              if (bm.chat_id) selectChat(bm.chat_id);
                            }}
                            className="text-emerald-400 hover:underline flex items-center gap-1 font-sans text-xs"
                          >
                            <span>Open in Chat</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal: Add or Manage Groq API Key */}
        {showKeyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-base font-bold text-white">Groq API Key Setup</h3>
                </div>
                <button
                  onClick={() => setShowKeyModal(false)}
                  className="text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed">
                Connect directly to open-source <strong className="text-zinc-200">Llama 3.3 70B</strong>.
                You can get a 100% free API key from{' '}
                <a
                  href="https://console.groq.com/keys"
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-400 underline font-medium"
                >
                  console.groq.com/keys
                </a>
                .
              </p>

              <form onSubmit={handleSaveApiKey} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Groq API Key (starts with gsk_...)
                  </label>
                  <input
                    type="password"
                    value={customApiKey}
                    onChange={(e) => setCustomApiKey(e.target.value)}
                    placeholder="gsk_..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors shadow-md flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save Key</span>
                  </button>
                  {customApiKey && (
                    <button
                      type="button"
                      onClick={handleClearApiKey}
                      className="py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
