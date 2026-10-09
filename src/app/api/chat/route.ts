import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/rate-limit';
import {
  validateUserInput,
  prepareContextMessages,
  streamGroqCompletion,
  LLMError,
} from '@/lib/llm';
import {
  saveMessage,
  getChatById,
  createChat,
} from '@/lib/supabase/data-service';
import { SubjectType } from '@/types';

// Dynamic, subject-tailored generator when GROQ_API_KEY is not yet added in environment
function createDemoStream(query: string, subject: SubjectType): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const qLower = query.toLowerCase();

  let explanation = '';
  let steps = '';
  let codeSnippet = '';
  let lang = 'python';

  if (subject === 'Python') {
    lang = 'python';
    if (qLower.includes('decorator')) {
      explanation = `In Python, a **decorator** is a callable object (function or class) that takes another function as an argument and extends or modifies its behavior without directly modifying its source code.`;
      steps = `1. **First-Class Functions**: In Python, functions are first-class citizens; they can be passed as arguments, assigned to variables, and returned from functions.\n2. **Closures**: Decorators utilize closures to remember and access the wrapped function even after the outer scope has returned.\n3. **Syntax Sugar**: The \`@decorator_name\` syntax is syntactic sugar for \`func = decorator_name(func)\`.`;
      codeSnippet = `def audit_log(func):
    def wrapper(*args, **kwargs):
        print(f"Calling: {func.__name__} with args={args}")
        result = func(*args, **kwargs)
        print(f"Finished: {func.__name__}")
        return result
    return wrapper

@audit_log
def calculate_grade(marks: list[int]) -> float:
    return sum(marks) / len(marks)

print("Average:", calculate_grade([85, 92, 78]))`;
    } else if (qLower.includes('list') || qLower.includes('generator')) {
      explanation = `**List comprehensions** allocate the complete array into RAM memory at once, while **generators** yield one item lazily at a time.`;
      steps = `1. **Memory**: A generator expression uses a fixed tiny frame size (~200 bytes) regardless of item count.\n2. **Evaluation**: List comprehensions compute eagerly; generator expressions compute on-demand via \`next()\`.\n3. **Syntax**: Square brackets \`[x for x in data]\` vs parentheses \`(x for x in data)\`.`;
      codeSnippet = `import sys

data_list = [x**2 for x in range(10_000)]
data_gen = (x**2 for x in range(10_000))

print("List memory (bytes):", sys.getsizeof(data_list)) # ~85 KB
print("Generator memory (bytes):", sys.getsizeof(data_gen)) # ~200 Bytes`;
    } else {
      explanation = `In **Python**, **${query}** is handled using Python's object model and dynamic typing semantics.`;
      steps = `1. **Memory & Binding**: Names in Python are references bound to objects allocated on the heap.\n2. **Execution Flow**: The Python virtual machine (PVM) interprets bytecode instructions sequentially.\n3. **Best Practices**: Follow PEP 8 guidelines, use type hints, and leverage standard library modules.`;
      codeSnippet = `# Python Solution for: ${query}
def demonstrate_concept(items: list) -> dict:
    processed = [str(item).strip() for item in items if item]
    return {"total": len(processed), "data": processed}

sample_data = ["Engineering", "Python", "Tutor"]
print(demonstrate_concept(sample_data))`;
    }
  } else if (subject === 'DSA') {
    lang = 'python';
    if (qLower.includes('sort')) {
      explanation = `Sorting algorithms organize an array into order. **QuickSort** partitions around a pivot in $O(N \\log N)$ average time, while **MergeSort** recursively divides the array in guaranteed $O(N \\log N)$ time.`;
      steps = `1. **Divide & Conquer**: Break the problem into sub-problems until base cases (arrays of size 0 or 1) are reached.\n2. **Time Complexity**: Average case $O(N \\log N)$, worst-case $O(N^2)$ for QuickSort; guaranteed $O(N \\log N)$ for MergeSort.\n3. **Space Complexity**: QuickSort is in-place ($O(\\log N)$ recursion stack); MergeSort requires $O(N)$ extra buffer memory.`;
      codeSnippet = `def binary_search(arr: list[int], target: int) -> int:
    low, high = 0, len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1

# Array must be sorted for O(log N) search
sorted_arr = [10, 23, 35, 48, 62, 79, 91]
print("Index found at:", binary_search(sorted_arr, 48))`;
    } else if (qLower.includes('tree') || qLower.includes('graph')) {
      explanation = `Hierarchical data structures like **Trees and Graphs** represent non-linear relationships using vertices (nodes) connected by edges.`;
      steps = `1. **Traversal Techniques**: Depth-First Search (DFS using stack/recursion) and Breadth-First Search (BFS using queue).\n2. **Time Complexity**: $O(V + E)$ where $V$ is vertices and $E$ is edges.\n3. **Applications**: Routing protocols, shortest path algorithms (Dijkstra), and dependency resolution (topological sort).`;
      codeSnippet = `from collections import deque

def bfs_traversal(graph: dict, start_node: str) -> list:
    visited = set([start_node])
    queue = deque([start_node])
    order = []

    while queue:
        vertex = queue.popleft()
        order.append(vertex)
        for neighbor in graph.get(vertex, []):
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
    return order

network = {'A': ['B', 'C'], 'B': ['D'], 'C': ['E'], 'D': [], 'E': []}
print("BFS Order:", bfs_traversal(network, 'A'))`;
    } else {
      explanation = `When solving algorithmic problems related to **${query}**, the key is identifying optimal time and space complexity boundaries.`;
      steps = `1. **Identify the Pattern**: Check if two-pointer, sliding window, hash table, or dynamic programming applies.\n2. **Analyze Invariants**: Formulate loop invariants to ensure correctness across boundary cases (empty input, single element, duplicates).\n3. **Complexity Analysis**: Calculate asymptotic time complexity ($O$) and space complexity ($O$).`;
      codeSnippet = `# Algorithmic approach for: ${query}
def optimal_solution(arr: list[int]) -> int:
    seen = set()
    for num in arr:
        if num in seen:
            return num
        seen.add(num)
    return -1

print("First Duplicate:", optimal_solution([2, 5, 1, 2, 3, 5]))`;
    }
  } else if (subject === 'ML') {
    lang = 'python';
    explanation = `In Machine Learning, **${query}** addresses model optimization, generalization, or probabilistic mapping from features to target labels.`;
    steps = `1. **Formulation**: Define the objective function (loss function $L(\\theta)$) measuring the discrepancy between prediction and ground truth.\n2. **Optimization**: Compute gradients $\\nabla_\\theta L$ with backpropagation and update parameters: $\\theta \\leftarrow \\theta - \\alpha \\nabla L$.\n3. **Generalization**: Mitigate overfitting using regularization ($L_1$, $L_2$, Dropout) and cross-validation.`;
    codeSnippet = `import numpy as np

# Simple Gradient Descent step for MSE loss
def gradient_descent_step(w: float, b: float, X: np.ndarray, y: np.ndarray, lr: float = 0.01):
    N = len(y)
    y_pred = w * X + b
    # Derivatives
    dw = (-2 / N) * np.sum(X * (y - y_pred))
    db = (-2 / N) * np.sum(y - y_pred)
    # Update weights
    w -= lr * dw
    b -= lr * db
    return w, b

X = np.array([1, 2, 3, 4])
y = np.array([2, 4, 6, 8])
print("Updated weights:", gradient_descent_step(0.0, 0.0, X, y))`;
  } else if (subject === 'DBMS') {
    lang = 'sql';
    explanation = `In Database Systems, **${query}** relates to relational algebra, storage organization, indexing, and transaction integrity (ACID).`;
    steps = `1. **Storage Structure**: Tables are stored on 8KB/16KB disk pages. Queries minimize random I/O using indexes.\n2. **Concurrency Control**: Two-Phase Locking (2PL) and Multi-Version Concurrency Control (MVCC) ensure isolation.\n3. **Normalization**: Eliminates data anomalies (Insertion, Deletion, Update anomalies) by decomposing schemas into 3NF or BCNF.`;
    codeSnippet = `-- SQL Query related to: ${query}
-- 1. Create indexed engineering table
CREATE TABLE student_grades (
    student_id UUID PRIMARY KEY,
    course_code VARCHAR(10) NOT NULL,
    marks INT CHECK (marks >= 0 AND marks <= 100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create B-Tree index for fast range filtering
CREATE INDEX idx_student_marks ON student_grades(course_code, marks DESC);

-- 3. Query execution plan
EXPLAIN ANALYZE
SELECT student_id, marks
FROM student_grades
WHERE course_code = 'CS301' AND marks >= 80;`;
  } else {
    lang = 'python';
    explanation = `**${query}** is a core foundational engineering concept in computing systems.`;
    steps = `1. **System Architecture**: High-level components interact through defined interfaces and communication protocols.\n2. **Resource Allocation**: CPU scheduling, memory management, and I/O bus bandwidth constrain throughput.\n3. **Failure Handling**: Fault-tolerant systems implement retries, timeouts, and state recovery.`;
    codeSnippet = `# Engineering Demonstration: ${query}
def demonstrate_system(input_val: str) -> str:
    return f"Processed query: {input_val} successfully."

print(demonstrate_system("${query.slice(0, 40)}"))`;
  }

  const demoContent = `> ℹ️ **Preview Mode**: Groq API Key is not yet configured in environment variables. 
> To enable full open-source **Llama 3.3 70B** for *any question and topic*, add your free \`GROQ_API_KEY\` to your environment variables!

### Simple Explanation
${explanation}

### Step-by-Step Breakdown
${steps}

### Short Example
\`\`\`${lang}
${codeSnippet}
\`\`\``;

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const words = demoContent.split(' ');
      for (const word of words) {
        controller.enqueue(encoder.encode(word + ' '));
        // Small delay to simulate realistic streaming
        await new Promise((r) => setTimeout(r, 20));
      }
      controller.close();
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user
    const authUser = await getAuthenticatedUser();
    // Support fallback for demo user or header identification
    const clientUserId = req.headers.get('x-user-id');
    const userId = authUser?.id || clientUserId || 'demo-user';

    // 2. Apply Rate Limiting (20 requests per minute per user/IP)
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || userId;
    const rateLimit = checkRateLimit(ip, 25, 60000);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded. Please wait a moment before sending more doubts.',
          retryAfterMs: rateLimit.resetInMs,
          isRetryable: true,
        },
        { status: 429 }
      );
    }

    // 3. Parse and validate payload
    const body = await req.json();
    const { message, subject = 'General' } = body;
    let { chatId } = body;

    let validatedMessage: string;
    try {
      validatedMessage = validateUserInput(message);
    } catch (valErr: unknown) {
      const err = valErr as LLMError;
      return NextResponse.json(
        { error: err.message, isRetryable: false },
        { status: err.statusCode || 400 }
      );
    }

    // 4. Validate or create chat
    let chat = chatId ? await getChatById(userId, chatId) : null;
    if (!chat) {
      const initialTitle = validatedMessage.slice(0, 35) + (validatedMessage.length > 35 ? '...' : '');
      chat = await createChat(userId, initialTitle, subject as SubjectType);
      chatId = chat.id;
    }

    // 5. Persist user message in DB
    await saveMessage(userId, chatId, 'user', validatedMessage);

    // 6. Gather context (last 20 messages)
    const recentMessages = (chat.messages || []).map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));
    recentMessages.push({ role: 'user', content: validatedMessage });

    const contextMessages = prepareContextMessages(recentMessages, (subject || chat.subject) as SubjectType);

    // 7. Obtain stream from Groq or Demo fallback
    let stream: ReadableStream<Uint8Array>;
    const clientKey = req.headers.get('x-groq-key');
    const effectiveKey = clientKey || process.env.GROQ_API_KEY;

    if (!effectiveKey) {
      stream = createDemoStream(validatedMessage, subject as SubjectType);
    } else {
      try {
        stream = await streamGroqCompletion(contextMessages, undefined, effectiveKey);
      } catch (llmErr: unknown) {
        const err = llmErr as LLMError;
        // If key is invalid or unauthorized, fall back gracefully to topic-aware tutor with helpful note
        if (err.statusCode === 401 || err.statusCode === 403) {
          stream = createDemoStream(validatedMessage, subject as SubjectType);
        } else {
          return NextResponse.json(
            {
              error: err.message || 'Error communicating with Groq AI service.',
              isRetryable: err.isRetryable ?? true,
            },
            { status: err.statusCode || 500 }
          );
        }
      }
    }

    // 8. Stream response to client while accumulating full text for DB save
    const [clientStream, saveStream] = stream.tee();

    // Async task to accumulate assistant response and save to DB
    (async () => {
      try {
        const reader = saveStream.getReader();
        const decoder = new TextDecoder();
        let completeResponse = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          completeResponse += decoder.decode(value, { stream: true });
        }

        if (completeResponse.trim()) {
          await saveMessage(userId, chatId, 'assistant', completeResponse.trim());
        }
      } catch (saveErr) {
        console.error('Failed to save streamed assistant message to database:', saveErr);
      }
    })();

    // 9. Return streaming response with chatId in header
    return new Response(clientStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'X-Chat-Id': chatId,
      },
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error in /api/chat:', err);
    return NextResponse.json(
      {
        error: 'An unexpected server error occurred while processing your doubt.',
        isRetryable: true,
      },
      { status: 500 }
    );
  }
}
