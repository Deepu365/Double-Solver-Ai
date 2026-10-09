'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SubjectType, Message, Chat } from '@/types';
import { Sidebar } from '@/components/Sidebar';
import { SubjectSelector, SUBJECT_OPTIONS } from '@/components/SubjectSelector';
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
  ArrowDown,
  AlertTriangle,
  Lightbulb,
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

export default function ChatPage() {
  const { user } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();

  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [subject, setSubject] = useState<SubjectType>('General');
  const [input, setInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // Streaming states
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [errorMessage, setErrorMessage] = useState<{ text: string; isRetryable: boolean } | null>(null);
  const [lastPrompt, setLastPrompt] = useState<string>('');
  const [hasGroqKey, setHasGroqKey] = useState<boolean>(true);

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Check config status on mount
  useEffect(() => {
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.hasGroqKey === 'boolean') {
          setHasGroqKey(data.hasGroqKey);
        }
      })
      .catch(() => {});
  }, []);

  // Auto-scroll handler
  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'auto',
    });
  }, []);

  useEffect(() => {
    scrollToBottom(true);
  }, [messages, streamingText, scrollToBottom]);

  // Load chat history
  const loadChats = useCallback(async (query = '') => {
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
  }, [user?.id, showError]);

  useEffect(() => {
    loadChats(searchQuery);
  }, [loadChats, searchQuery]);

  // Load messages for selected chat
  const selectChat = async (chatId: string) => {
    if (isStreaming) {
      showInfo('Please stop or wait for the current explanation to finish.');
      return;
    }

    setCurrentChatId(chatId);
    setIsLoadingMessages(true);
    setErrorMessage(null);
    setIsSidebarOpen(false); // Close mobile sidebar

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
      showError('Could not load messages for this doubt.');
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // Create new session
  const handleNewChat = () => {
    if (isStreaming) {
      showInfo('Please finish or stop the current generation first.');
      return;
    }
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

    // Prepare AbortController
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user?.id ? { 'x-user-id': user.id } : {}),
        },
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
              ? 'Rate limit exceeded. Please wait a few seconds and click Retry.'
              : 'Our AI tutor service encountered a temporary error.')
        );
      }

      // Check header for newly created chatId
      const returnedChatId = res.headers.get('X-Chat-Id');
      if (returnedChatId && !currentChatId) {
        setCurrentChatId(returnedChatId);
      }

      // Read streaming text
      const reader = res.body?.getReader();
      if (!reader) throw new Error('No stream response from server');

      const decoder = new TextDecoder();
      let fullAssistantText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullAssistantText += chunk;
        setStreamingText((prev) => prev + chunk);
      }

      // Finalize assistant message
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
      // Reload sidebar to show updated title or new chat
      loadChats(searchQuery);
    } catch (err: unknown) {
      const error = err as { name?: string; message?: string };
      if (error?.name === 'AbortError') {
        // User stopped generation: save partial text if exists
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
          text: error.message || 'We could not complete the explanation. Please try again.',
          isRetryable: true,
        });
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  // Stop Generation
  const handleStopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  // Toggle Bookmark on AI reply
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
        showSuccess('Doubt solution saved to Bookmarks!');
      } else {
        showInfo('Bookmark removed.');
      }
    } catch {
      showError('Failed to update bookmark.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendDoubt();
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100 font-sans">
      {/* History Sidebar */}
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

      {/* Main Chat Workspace */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md z-10 gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
              title="Open chat history"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex flex-col">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                DoubtSolver AI Tutor
              </span>
              <span className="text-[11px] text-zinc-400 hidden sm:inline">
                Simple Explanation • Step-by-Step • Short Example
              </span>
            </div>
          </div>

          {/* Subject Mode Selector */}
          <div className="flex items-center gap-2">
            <SubjectSelector
              currentSubject={subject}
              onSelectSubject={(newSub) => {
                setSubject(newSub);
                showInfo(`Subject mode switched to ${newSub}.`);
              }}
              disabled={isStreaming}
            />
          </div>
        </header>

        {/* Demo Mode Notice if GROQ_API_KEY is not configured */}
        {!hasGroqKey && (
          <div className="bg-amber-950/40 border-b border-amber-800/50 px-4 py-2 text-xs text-amber-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Demo Mode Active:</strong> Live Groq API key is not yet set in <code className="bg-amber-900/60 px-1 py-0.5 rounded font-mono text-[11px]">.env.local</code>. Add your free <code className="bg-amber-900/60 px-1 py-0.5 rounded font-mono text-[11px]">GROQ_API_KEY</code> to enable full open-source Llama 3 for every question.
              </span>
            </div>
          </div>
        )}

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
              <p className="text-sm text-zinc-400 max-w-lg mb-8 leading-relaxed">
                Choose your subject mode and ask any question. Get answers structured in
                <span className="text-emerald-300 font-medium"> Simple Explanations</span>,
                <span className="text-emerald-300 font-medium"> Step-by-Step Logic</span>, and
                <span className="text-emerald-300 font-medium"> Runnable Code</span>.
              </p>

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
                          title={msg.isBookmarked ? 'Remove Bookmark' : 'Bookmark this answer'}
                        >
                          {msg.isBookmarked ? (
                            <>
                              <BookmarkCheck className="w-3.5 h-3.5 text-amber-400" />
                              <span>Bookmarked</span>
                            </>
                          ) : (
                            <>
                              <Bookmark className="w-3.5 h-3.5" />
                              <span>Bookmark Answer</span>
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
                    <span>DoubtSolver AI is formulating the explanation...</span>
                  </div>
                )}
                {/* Typing Indicator dots */}
                <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-zinc-800/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[11px] text-zinc-500 ml-2 font-mono">Streaming tutor response...</span>
                </div>
              </div>
            </div>
          )}

          {/* Friendly Error Box with Retry Button */}
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

        {/* Floating "Stop Generating" Button while Streaming */}
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

        {/* Input Bar Area */}
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

              {/* Bottom bar of the input box */}
              <div className="absolute bottom-2 left-4 right-3 flex items-center justify-between text-xs text-zinc-500">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px]">
                    {input.length}/4000
                  </span>
                  <span className="hidden sm:inline text-[11px] text-zinc-600">• Press Enter to send, Shift+Enter for new line</span>
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
              Powered by open-source Llama 3 via Groq • Context limited to last 20 messages
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
