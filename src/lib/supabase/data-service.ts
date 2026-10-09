import { Chat, Message, SubjectType, DashboardStats } from '@/types';
import { createClient as createServerClient } from './server';

// Initial sample data for engineering students
const INITIAL_SAMPLE_CHATS: Array<{
  id: string;
  title: string;
  subject: SubjectType;
  created_at: string;
  messages: Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    created_at: string;
    isBookmarked?: boolean;
  }>;
}> = [
  {
    id: 'demo-chat-py',
    title: 'Python List Comprehensions vs Generators',
    subject: 'Python',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    messages: [
      {
        id: 'msg-py-1',
        role: 'user',
        content: 'What is the key difference between list comprehensions and generator expressions in Python memory-wise?',
        created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
      {
        id: 'msg-py-2',
        role: 'assistant',
        content: `### Simple Explanation
A **list comprehension** constructs and stores the entire collection in memory upfront, whereas a **generator expression** produces values on the fly lazily using an iterator.

### Step-by-Step Breakdown
1. **Memory Allocation**:
   - \`[x * 2 for x in range(1000000)]\` immediately allocates substantial RAM to hold 1,000,000 integer pointers.
   - \`(x * 2 for x in range(1000000))\` allocates only a few bytes for the generator state frame.
2. **Evaluation Strategy**:
   - List comprehensions evaluate eagerly upon definition.
   - Generator expressions evaluate lazily when consumed (e.g. by \`next()\` or in a \`for\` loop).
3. **Re-usability**:
   - A list can be indexed, sliced, and iterated repeatedly.
   - A generator is a single-pass stream; once consumed, it is exhausted.

### Short Example
\`\`\`python
import sys

# 1. Eager List Comprehension
nums_list = [i ** 2 for i in range(100_000)]
print(f"List RAM size: {sys.getsizeof(nums_list):,} bytes") # ~824,456 bytes

# 2. Lazy Generator Expression
nums_gen = (i ** 2 for i in range(100_000))
print(f"Gen RAM size:  {sys.getsizeof(nums_gen):,} bytes")   # ~208 bytes
\`\`\`
*Tip: Always prefer generator expressions when processing large log files, database cursors, or one-time data pipelines.*`,
        created_at: new Date(Date.now() - 3600000 * 2 + 10000).toISOString(),
        isBookmarked: true,
      },
    ],
  },
  {
    id: 'demo-chat-dsa',
    title: 'QuickSort vs MergeSort Analysis',
    subject: 'DSA',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    messages: [
      {
        id: 'msg-dsa-1',
        role: 'user',
        content: 'When should I choose QuickSort over MergeSort in engineering systems?',
        created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
      },
      {
        id: 'msg-dsa-2',
        role: 'assistant',
        content: `### Simple Explanation
**QuickSort** is the standard for in-memory array sorting because it works in-place and maximizes CPU cache locality. **MergeSort** is chosen when guaranteed $O(N \\log N)$ worst-case time or algorithm stability is non-negotiable.

### Step-by-Step Breakdown
1. **Time Complexity**:
   - QuickSort: Average $O(N \\log N)$, Worst-case $O(N^2)$ (avoided via randomized or median-of-three pivots).
   - MergeSort: Guaranteed $O(N \\log N)$ across best, average, and worst cases.
2. **Memory Footprint**:
   - QuickSort: In-place, $O(\\log N)$ auxiliary recursive call stack.
   - MergeSort: Out-of-place for arrays, requires $O(N)$ extra memory buffer.
3. **Hardware Locality**:
   - QuickSort visits contiguous memory blocks, resulting in far fewer CPU cache misses.

### Short Example
\`\`\`python
def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)
\`\`\``,
        created_at: new Date(Date.now() - 3600000 * 24 + 10000).toISOString(),
        isBookmarked: true,
      },
    ],
  },
  {
    id: 'demo-chat-ml',
    title: 'Why Cross-Entropy over MSE in Classification',
    subject: 'ML',
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    messages: [
      {
        id: 'msg-ml-1',
        role: 'user',
        content: 'Why is Cross-Entropy Loss preferred over Mean Squared Error for classification models?',
        created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
      },
      {
        id: 'msg-ml-2',
        role: 'assistant',
        content: `### Simple Explanation
When paired with Softmax or Sigmoid activations, MSE causes gradient vanishing when predictions are completely wrong. Cross-Entropy penalizes confident incorrect classifications logarithmically, providing steep gradients for fast backpropagation.

### Step-by-Step Breakdown
1. **Saturation Plateaus**:
   - Sigmoid $\\sigma(z)$ derivatives approach zero as $|z| \\to \\infty$.
   - For MSE, $\\frac{\\partial L_{MSE}}{\\partial z} = (\\hat{y} - y) \\cdot \\sigma'(z)$. If the model predicts $\\hat{y}=0$ when $y=1$, $\\sigma'(z) \\approx 0$, so gradients vanish!
2. **Convexity & Optimization**:
   - Cross-Entropy cancels out the sigmoid derivative: $\\frac{\\partial L_{CE}}{\\partial z} = \\hat{y} - y$.
   - Gradients are directly proportional to error magnitude, keeping optimization fast.

### Short Example
\`\`\`python
import numpy as np

# Cross-entropy calculation for 3 classes
y_true = np.array([1, 0, 0])
y_pred = np.array([0.7, 0.2, 0.1])

# Avoid log(0) with small epsilon
eps = 1e-15
y_pred = np.clip(y_pred, eps, 1 - eps)
loss = -np.sum(y_true * np.log(y_pred))
print(f"Cross-Entropy Loss: {loss:.4f}")
\`\`\``,
        created_at: new Date(Date.now() - 3600000 * 48 + 10000).toISOString(),
        isBookmarked: false,
      },
    ],
  },
  {
    id: 'demo-chat-dbms',
    title: 'B-Tree vs Hash Index Storage Engines',
    subject: 'DBMS',
    created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
    messages: [
      {
        id: 'msg-dbms-1',
        role: 'user',
        content: 'Why do relational databases use B-Trees instead of Hash tables by default for indexes?',
        created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
      },
      {
        id: 'msg-dbms-2',
        role: 'assistant',
        content: `### Simple Explanation
Hash indexes only support point lookups (\`WHERE id = 5\`). **B-Trees** store keys in sorted order, which enables range scans (\`WHERE age BETWEEN 18 AND 25\`), sorting (\`ORDER BY\`), and prefix matching.

### Step-by-Step Breakdown
1. **Sorted Ordering**:
   - Leaf nodes in B+ Trees are linked sequentially, allowing disk sequential scans.
2. **Logarithmic Guarantees**:
   - B-Tree search, insert, and delete are strictly $O(\\log N)$ with shallow tree height (3-4 levels for millions of rows).
3. **Composite Keys**:
   - Supports leftmost-prefix indexing for queries filtering on \`(user_id, timestamp)\`.

### Short Example
\`\`\`sql
-- B-Tree effortlessly handles range scans and sorting:
SELECT order_id, total_amount, order_date
FROM customer_orders
WHERE order_date >= '2026-01-01'
ORDER BY order_date DESC;
\`\`\``,
        created_at: new Date(Date.now() - 3600000 * 72 + 10000).toISOString(),
        isBookmarked: false,
      },
    ],
  },
];

// In-memory store for demo / development fallback
class MockStore {
  private chats: Map<string, Array<{ id: string; title: string; subject: SubjectType; created_at: string; messages: Message[] }>> = new Map();
  private bookmarks: Map<string, Set<string>> = new Map();

  constructor() {
    this.initDefaultUser('demo-user');
  }

  private initDefaultUser(userId: string) {
    if (!this.chats.has(userId)) {
      const cloned = JSON.parse(JSON.stringify(INITIAL_SAMPLE_CHATS));
      this.chats.set(userId, cloned);
      const bSet = new Set<string>();
      bSet.add('msg-py-2');
      bSet.add('msg-dsa-2');
      this.bookmarks.set(userId, bSet);
    }
  }

  getChats(userId: string, search?: string) {
    this.initDefaultUser(userId);
    const userChats = this.chats.get(userId) || [];
    let filtered = [...userChats];
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.messages.some((m) => m.content.toLowerCase().includes(q))
      );
    }
    return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  getChat(userId: string, chatId: string) {
    this.initDefaultUser(userId);
    const userChats = this.chats.get(userId) || [];
    const chat = userChats.find((c) => c.id === chatId);
    if (!chat) return null;
    const bSet = this.bookmarks.get(userId) || new Set();
    return {
      ...chat,
      messages: chat.messages.map((m) => ({
        ...m,
        isBookmarked: bSet.has(m.id),
      })),
    };
  }

  createChat(userId: string, title: string, subject: SubjectType) {
    this.initDefaultUser(userId);
    const userChats = this.chats.get(userId) || [];
    const newChat = {
      id: `chat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: title || 'New Chat',
      subject,
      created_at: new Date().toISOString(),
      messages: [],
    };
    userChats.unshift(newChat);
    return newChat;
  }

  updateChatTitle(userId: string, chatId: string, title: string) {
    this.initDefaultUser(userId);
    const userChats = this.chats.get(userId) || [];
    const chat = userChats.find((c) => c.id === chatId);
    if (chat) {
      chat.title = title;
      return chat;
    }
    return null;
  }

  deleteChat(userId: string, chatId: string) {
    this.initDefaultUser(userId);
    const userChats = this.chats.get(userId) || [];
    const filtered = userChats.filter((c) => c.id !== chatId);
    this.chats.set(userId, filtered);
    return true;
  }

  addMessage(userId: string, chatId: string, role: 'user' | 'assistant', content: string): Message {
    this.initDefaultUser(userId);
    const userChats = this.chats.get(userId) || [];
    let chat = userChats.find((c) => c.id === chatId);
    if (!chat) {
      chat = this.createChat(userId, 'New Doubt', 'General');
    }
    const newMsg: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      chat_id: chat.id,
      role,
      content,
      created_at: new Date().toISOString(),
      isBookmarked: false,
    };
    chat.messages.push(newMsg);

    // Auto-update title if it's the first user message and default title
    if (chat.messages.length === 1 && chat.title === 'New Chat' && role === 'user') {
      chat.title = content.slice(0, 35) + (content.length > 35 ? '...' : '');
    }

    return newMsg;
  }

  toggleBookmark(userId: string, messageId: string) {
    this.initDefaultUser(userId);
    const bSet = this.bookmarks.get(userId) || new Set();
    const isSaved = bSet.has(messageId);
    if (isSaved) {
      bSet.delete(messageId);
      return false;
    } else {
      bSet.add(messageId);
      return true;
    }
  }

  getBookmarks(userId: string) {
    this.initDefaultUser(userId);
    const bSet = this.bookmarks.get(userId) || new Set();
    const userChats = this.chats.get(userId) || [];
    const results: Array<{
      id: string;
      message_id: string;
      chat_id: string;
      chat_title: string;
      subject: SubjectType;
      content: string;
      created_at: string;
    }> = [];

    for (const chat of userChats) {
      for (const msg of chat.messages) {
        if (bSet.has(msg.id)) {
          results.push({
            id: `bm-${msg.id}`,
            message_id: msg.id,
            chat_id: chat.id,
            chat_title: chat.title,
            subject: chat.subject,
            content: msg.content,
            created_at: msg.created_at,
          });
        }
      }
    }
    return results;
  }

  getDashboardStats(userId: string): DashboardStats {
    this.initDefaultUser(userId);
    const userChats = this.chats.get(userId) || [];
    const bSet = this.bookmarks.get(userId) || new Set();

    const subjectCounts: Record<SubjectType, number> = {
      General: 0,
      Python: 0,
      ML: 0,
      DSA: 0,
      DBMS: 0,
    };

    let totalQuestions = 0;
    for (const chat of userChats) {
      const userQuestions = chat.messages.filter((m) => m.role === 'user').length;
      subjectCounts[chat.subject] = (subjectCounts[chat.subject] || 0) + (userQuestions > 0 ? userQuestions : 1);
      totalQuestions += userQuestions;
    }

    const bookmarkedAnswers = this.getBookmarks(userId);

    return {
      subjectCounts,
      totalChats: userChats.length,
      totalQuestions,
      totalBookmarks: bSet.size,
      recentChats: userChats.slice(0, 5).map((c) => ({
        id: c.id,
        user_id: userId,
        title: c.title,
        subject: c.subject,
        created_at: c.created_at,
      })),
      bookmarkedAnswers,
    };
  }

  seedData(userId: string) {
    this.initDefaultUser(userId);
    return true;
  }
}

// Global mock store singleton across requests in development
const globalForMock = global as unknown as { mockStore?: MockStore };
const mockStore = globalForMock.mockStore || new MockStore();
if (process.env.NODE_ENV !== 'production') {
  globalForMock.mockStore = mockStore;
}

/**
 * Data access abstraction layer:
 * Connects to live Supabase Postgres when keys are configured,
 * otherwise safely uses the mockStore so local tests/previews work flawlessly.
 */
export async function getChats(userId: string, search?: string): Promise<Chat[]> {
  const supabase = await createServerClient();
  if (!supabase) {
    const list = mockStore.getChats(userId, search);
    return list.map((c) => ({
      id: c.id,
      user_id: userId,
      title: c.title,
      subject: c.subject,
      created_at: c.created_at,
    }));
  }

  let query = supabase
    .from('chats')
    .select('id, user_id, title, subject, created_at, updated_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (search && search.trim()) {
    query = query.ilike('title', `%${search.trim()}%`);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Supabase getChats error:', error);
    return [];
  }

  return (data as Chat[]) || [];
}

export async function getChatById(userId: string, chatId: string): Promise<Chat | null> {
  const supabase = await createServerClient();
  if (!supabase) {
    const chat = mockStore.getChat(userId, chatId);
    if (!chat) return null;
    return {
      id: chat.id,
      user_id: userId,
      title: chat.title,
      subject: chat.subject,
      created_at: chat.created_at,
      messages: chat.messages,
    };
  }

  const { data: chatData, error: chatErr } = await supabase
    .from('chats')
    .select('id, user_id, title, subject, created_at, updated_at')
    .eq('id', chatId)
    .eq('user_id', userId)
    .single();

  if (chatErr || !chatData) {
    return null;
  }

  // Fetch messages
  const { data: messagesData, error: msgErr } = await supabase
    .from('messages')
    .select('id, chat_id, role, content, created_at')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true });

  if (msgErr) {
    return chatData as Chat;
  }

  // Fetch bookmarks for this user
  const { data: bookmarksData } = await supabase
    .from('bookmarks')
    .select('message_id')
    .eq('user_id', userId);

  const bookmarkedSet = new Set((bookmarksData || []).map((b) => b.message_id));

  const messages: Message[] = (messagesData || []).map((m) => ({
    ...m,
    isBookmarked: bookmarkedSet.has(m.id),
  }));

  return {
    ...(chatData as Chat),
    messages,
  };
}

export async function createChat(userId: string, title: string, subject: SubjectType): Promise<Chat> {
  const supabase = await createServerClient();
  if (!supabase) {
    const mock = mockStore.createChat(userId, title, subject);
    return {
      id: mock.id,
      user_id: userId,
      title: mock.title,
      subject: mock.subject,
      created_at: mock.created_at,
      messages: [],
    };
  }

  const { data, error } = await supabase
    .from('chats')
    .insert([
      {
        user_id: userId,
        title: title || 'New Chat',
        subject: subject || 'General',
      },
    ])
    .select()
    .single();

  if (error || !data) {
    throw new Error('Failed to create chat in Supabase: ' + error?.message);
  }

  return data as Chat;
}

export async function updateChatTitle(userId: string, chatId: string, title: string): Promise<boolean> {
  const supabase = await createServerClient();
  if (!supabase) {
    return !!mockStore.updateChatTitle(userId, chatId, title);
  }

  const { error } = await supabase
    .from('chats')
    .update({ title, updated_at: new Date().toISOString() })
    .eq('id', chatId)
    .eq('user_id', userId);

  return !error;
}

export async function deleteChat(userId: string, chatId: string): Promise<boolean> {
  const supabase = await createServerClient();
  if (!supabase) {
    return mockStore.deleteChat(userId, chatId);
  }

  const { error } = await supabase
    .from('chats')
    .delete()
    .eq('id', chatId)
    .eq('user_id', userId);

  return !error;
}

export async function saveMessage(
  userId: string,
  chatId: string,
  role: 'user' | 'assistant',
  content: string
): Promise<Message> {
  const supabase = await createServerClient();
  if (!supabase) {
    return mockStore.addMessage(userId, chatId, role, content);
  }

  // Ensure user owns this chat
  const { data: chatData, error: chatErr } = await supabase
    .from('chats')
    .select('id, title')
    .eq('id', chatId)
    .eq('user_id', userId)
    .single();

  if (chatErr || !chatData) {
    throw new Error('Chat not found or access denied');
  }

  const { data: msgData, error: msgErr } = await supabase
    .from('messages')
    .insert([
      {
        chat_id: chatId,
        role,
        content,
      },
    ])
    .select()
    .single();

  if (msgErr || !msgData) {
    throw new Error('Failed to insert message into Supabase: ' + msgErr?.message);
  }

  // Auto update title if first message
  if (role === 'user' && (chatData.title === 'New Chat' || !chatData.title)) {
    const autoTitle = content.slice(0, 35) + (content.length > 35 ? '...' : '');
    await supabase.from('chats').update({ title: autoTitle }).eq('id', chatId);
  }

  return {
    ...msgData,
    isBookmarked: false,
  };
}

export async function toggleBookmark(userId: string, messageId: string): Promise<{ bookmarked: boolean }> {
  const supabase = await createServerClient();
  if (!supabase) {
    const bookmarked = mockStore.toggleBookmark(userId, messageId);
    return { bookmarked };
  }

  // Check if bookmark exists
  const { data: existing } = await supabase
    .from('bookmarks')
    .select('id')
    .eq('user_id', userId)
    .eq('message_id', messageId)
    .maybeSingle();

  if (existing) {
    await supabase.from('bookmarks').delete().eq('id', existing.id);
    return { bookmarked: false };
  } else {
    await supabase.from('bookmarks').insert([
      {
        user_id: userId,
        message_id: messageId,
      },
    ]);
    return { bookmarked: true };
  }
}

export async function getBookmarks(userId: string) {
  const supabase = await createServerClient();
  if (!supabase) {
    return mockStore.getBookmarks(userId);
  }

  const { data, error } = await supabase
    .from('bookmarks')
    .select(`
      id,
      message_id,
      created_at,
      messages:message_id (
        id,
        content,
        chat_id,
        chats:chat_id (
          id,
          title,
          subject
        )
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error || !data) {
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.map((b: any) => ({
    id: b.id,
    message_id: b.message_id,
    chat_id: b.messages?.chat_id || '',
    chat_title: b.messages?.chats?.title || 'Engineering Chat',
    subject: (b.messages?.chats?.subject || 'General') as SubjectType,
    content: b.messages?.content || '',
    created_at: b.created_at,
  }));
}

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const supabase = await createServerClient();
  if (!supabase) {
    return mockStore.getDashboardStats(userId);
  }

  const [chatsRes, bookmarksRes] = await Promise.all([
    supabase
      .from('chats')
      .select('id, title, subject, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
    getBookmarks(userId),
  ]);

  const chats = chatsRes.data || [];
  const subjectCounts: Record<SubjectType, number> = {
    General: 0,
    Python: 0,
    ML: 0,
    DSA: 0,
    DBMS: 0,
  };

  for (const c of chats) {
    const s = (c.subject as SubjectType) || 'General';
    subjectCounts[s] = (subjectCounts[s] || 0) + 1;
  }

  return {
    subjectCounts,
    totalChats: chats.length,
    totalQuestions: chats.length * 2, // Approximate or count from messages
    totalBookmarks: bookmarksRes.length,
    recentChats: chats.slice(0, 5) as Chat[],
    bookmarkedAnswers: bookmarksRes,
  };
}

export async function seedUserData(userId: string) {
  const supabase = await createServerClient();
  if (!supabase) {
    return mockStore.seedData(userId);
  }

  // Trigger RPC or insert starter rows
  const { error } = await supabase.rpc('seed_sample_engineering_data', {
    target_user_id: userId,
  });

  return !error;
}
