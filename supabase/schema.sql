-- DoubtSolver AI Supabase Schema
-- Run this script in the Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)

-- 1. Create Tables
CREATE TABLE IF NOT EXISTS public.chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New Chat',
  subject TEXT NOT NULL DEFAULT 'General' CHECK (subject IN ('General', 'Python', 'ML', 'DSA', 'DBMS')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_user_bookmark UNIQUE (user_id, message_id)
);

-- 2. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_chats_user_id ON public.chats(user_id);
CREATE INDEX IF NOT EXISTS idx_chats_created_at ON public.chats(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON public.messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at ASC);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON public.bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_message_id ON public.bookmarks(message_id);

-- 3. Row Level Security (RLS)
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for Chats
DROP POLICY IF EXISTS "Users can view their own chats" ON public.chats;
CREATE POLICY "Users can view their own chats"
  ON public.chats FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own chats" ON public.chats;
CREATE POLICY "Users can create their own chats"
  ON public.chats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own chats" ON public.chats;
CREATE POLICY "Users can update their own chats"
  ON public.chats FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own chats" ON public.chats;
CREATE POLICY "Users can delete their own chats"
  ON public.chats FOR DELETE
  USING (auth.uid() = user_id);

-- 5. RLS Policies for Messages (scoped by chat ownership)
DROP POLICY IF EXISTS "Users can view messages in their chats" ON public.messages;
CREATE POLICY "Users can view messages in their chats"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chats
      WHERE public.chats.id = public.messages.chat_id
      AND public.chats.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert messages into their chats" ON public.messages;
CREATE POLICY "Users can insert messages into their chats"
  ON public.messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chats
      WHERE public.chats.id = public.messages.chat_id
      AND public.chats.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete messages in their chats" ON public.messages;
CREATE POLICY "Users can delete messages in their chats"
  ON public.messages FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.chats
      WHERE public.chats.id = public.messages.chat_id
      AND public.chats.user_id = auth.uid()
    )
  );

-- 6. RLS Policies for Bookmarks
DROP POLICY IF EXISTS "Users can view their own bookmarks" ON public.bookmarks;
CREATE POLICY "Users can view their own bookmarks"
  ON public.bookmarks FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own bookmarks" ON public.bookmarks;
CREATE POLICY "Users can create their own bookmarks"
  ON public.bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own bookmarks" ON public.bookmarks;
CREATE POLICY "Users can delete their own bookmarks"
  ON public.bookmarks FOR DELETE
  USING (auth.uid() = user_id);

-- 7. Helper Function to seed engineering sample data for any user
CREATE OR REPLACE FUNCTION public.seed_sample_engineering_data(target_user_id UUID)
RETURNS VOID AS $$
DECLARE
  chat_py UUID;
  chat_dsa UUID;
  chat_ml UUID;
  chat_dbms UUID;
  msg_dsa_q UUID;
  msg_dsa_a UUID;
  msg_py_q UUID;
  msg_py_a UUID;
  msg_ml_a UUID;
  msg_dbms_a UUID;
BEGIN
  -- 1. Python Chat
  INSERT INTO public.chats (user_id, title, subject)
  VALUES (target_user_id, 'Python List Comprehensions vs Generators', 'Python')
  RETURNING id INTO chat_py;

  INSERT INTO public.messages (chat_id, role, content)
  VALUES (chat_py, 'user', 'What is the key difference between list comprehensions and generator expressions in Python memory-wise?')
  RETURNING id INTO msg_py_q;

  INSERT INTO public.messages (chat_id, role, content)
  VALUES (chat_py, 'assistant', '### Simple Explanation
A **list comprehension** constructs and stores the entire list in RAM immediately, while a **generator expression** produces items lazily on demand one by one using an iterator protocol.

### Step-by-Step Breakdown
1. **Memory Allocation**:
   - `[x * 2 for x in range(1000000)]` allocates megabytes for a million integers.
   - `(x * 2 for x in range(1000000))` allocates only bytes for the generator object.
2. **Iteration**:
   - Generators yield values via `next()` when looped.
   - Once consumed, a generator cannot be re-read without re-instantiating.

### Short Example
```python
import sys

# List: consumes full memory upfront
list_comp = [x**2 for x in range(10000)]
print("List bytes:", sys.getsizeof(list_comp)) # ~85,176 bytes

# Generator: constant memory
gen_exp = (x**2 for x in range(10000))
print("Gen bytes:", sys.getsizeof(gen_exp))   # ~200 bytes
```
*Tip: Always prefer generator expressions when processing streams, large files, or one-pass transformations.*')
  RETURNING id INTO msg_py_a;

  -- 2. DSA Chat
  INSERT INTO public.chats (user_id, title, subject)
  VALUES (target_user_id, 'QuickSort vs MergeSort Analysis', 'DSA')
  RETURNING id INTO chat_dsa;

  INSERT INTO public.messages (chat_id, role, content)
  VALUES (chat_dsa, 'user', 'When should I choose QuickSort over MergeSort in engineering systems?')
  RETURNING id INTO msg_dsa_q;

  INSERT INTO public.messages (chat_id, role, content)
  VALUES (chat_dsa, 'assistant', '### Simple Explanation
**QuickSort** is preferred for in-place array sorting where memory cache locality is crucial. **MergeSort** is guaranteed $O(N \log N)$ and stable, making it ideal for linked lists or external sorting on disk.

### Step-by-Step Comparison
1. **Time Complexity**:
   - QuickSort: Average $O(N \log N)$, Worst-case $O(N^2)$ (mitigated by randomized pivot).
   - MergeSort: Guaranteed $O(N \log N)$ in all cases.
2. **Space Complexity**:
   - QuickSort: $O(\log N)$ auxiliary stack space (in-place).
   - MergeSort: $O(N)$ auxiliary buffer array.
3. **Cache Locality**:
   - QuickSort has excellent CPU cache hit rates because partitions operate on contiguous sub-arrays.

### Short Example (In-place QuickSort Pivot)
```python
def partition(arr, low, high):
    pivot = arr[high]
    i = low - 1
    for j in range(low, high):
        if arr[j] <= pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
    arr[i + 1], arr[high] = arr[high], arr[i + 1]
    return i + 1
```')
  RETURNING id INTO msg_dsa_a;

  -- 3. Machine Learning Chat
  INSERT INTO public.chats (user_id, title, subject)
  VALUES (target_user_id, 'Cross-Entropy Loss Intuition', 'ML')
  RETURNING id INTO chat_ml;

  INSERT INTO public.messages (chat_id, role, content)
  VALUES (chat_ml, 'user', 'Why do we use Cross-Entropy instead of Mean Squared Error (MSE) for classification?')
  RETURNING id INTO msg_ml_a;

  INSERT INTO public.messages (chat_id, role, content)
  VALUES (chat_ml, 'assistant', '### Simple Explanation
When coupled with Softmax or Sigmoid activations, **MSE** causes gradient vanishing for misclassified predictions due to flat saturation plateaus. **Cross-Entropy Loss** penalizes confident wrong predictions logarithmically, preserving steep gradients for fast backpropagation.

### Step-by-Step
1. Softmax output $p = \sigma(z)$.
2. Derivative of MSE loss $\frac{\partial L_{MSE}}{\partial z} \propto p(1-p)(p-y)$. If $p \to 0$ and $y=1$, gradient is nearly 0 (learning stalls!).
3. Derivative of Cross-Entropy $\frac{\partial L_{CE}}{\partial z} = p - y$. Gradient is directly proportional to prediction error.

### Formula
$$L_{CE} = -\sum_{i} y_i \log(p_i)$$')
  RETURNING id INTO msg_ml_a;

  -- 4. DBMS Chat
  INSERT INTO public.chats (user_id, title, subject)
  VALUES (target_user_id, 'B-Tree vs Hash Index in Postgres', 'DBMS')
  RETURNING id INTO chat_dbms;

  INSERT INTO public.messages (chat_id, role, content)
  VALUES (chat_dbms, 'user', 'Why is B-Tree the default index type in databases instead of Hash tables?')
  RETURNING id INTO msg_dbms_a;

  INSERT INTO public.messages (chat_id, role, content)
  VALUES (chat_dbms, 'assistant', '### Simple Explanation
Hash indexes only support exact match lookups (`=`). **B-Trees** maintain sorted order, enabling range scans (`BETWEEN`, `<`, `>`), sorting (`ORDER BY`), prefix matching (`LIKE ''abc%''`), and min/max queries in $O(\log N)$.

### Step-by-Step
1. **Range Queries**: B-Tree leaves form a doubly linked list, allowing contiguous disk block reads. Hash indexes scatter keys unpredictably.
2. **Space Efficiency**: B-Trees minimize disk I/O with high branching factor (fanout > 100).
3. **Multi-column Composite Keys**: Leftmost prefix indexing works naturally with B-Trees.

### Short Example
```sql
-- Uses B-Tree index for range scan:
SELECT student_id, cgpa FROM students WHERE cgpa >= 8.5 ORDER BY cgpa DESC;
```')
  RETURNING id INTO msg_dbms_a;

  -- Bookmark the DSA & Python answers for immediate dashboard showcase
  INSERT INTO public.bookmarks (user_id, message_id)
  VALUES (target_user_id, msg_py_a)
  ON CONFLICT DO NOTHING;

  INSERT INTO public.bookmarks (user_id, message_id)
  VALUES (target_user_id, msg_dsa_a)
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
