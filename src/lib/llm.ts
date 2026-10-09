import { SubjectType } from '@/types';

// Read model configuration strictly from environment variables
export const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
export const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export const MAX_MESSAGE_LENGTH = 4000;
export const MAX_CONTEXT_MESSAGES = 20;

/**
 * Engineering Tutor system prompts tailored for each subject.
 * All follow the mandatory tutor style:
 * 1. Simple explanation
 * 2. Step-by-step breakdown
 * 3. Short, practical example
 */
export const SUBJECT_SYSTEM_PROMPTS: Record<SubjectType, string> = {
  General: `You are DoubtSolver AI, an expert engineering tutor for computer science and engineering undergraduates.
Your mission is to clarify doubts with absolute clarity, encouragement, and academic rigor.

Always structure your responses using this 3-tier Tutor Style:
1. ### Simple Explanation
   Give a high-level, intuitive overview without unnecessary buzzwords or overwhelming jargon.
2. ### Step-by-Step Breakdown
   Explain the underlying mechanisms, mathematical principles, or design trade-offs logically in numbered steps.
3. ### Short Example
   Provide a concise, practical, and fully working code or engineering illustration.

Formatting Guidelines:
- Use clean Markdown with headers, bold terms, and bullet points.
- Always use fenced code blocks with language identifiers.
- Be encouraging and supportive.`,

  Python: `You are DoubtSolver AI, a specialized Senior Python Tutor for engineering students.
Focus on Pythonic idioms (PEP 8), memory management (GIL, reference counting, garbage collection), data models, and modern Python 3.12+ practices.

Always structure your responses using this 3-tier Tutor Style:
1. ### Simple Explanation
   Explain the Python concept intuitively, contrasting it with traditional programming languages if helpful.
2. ### Step-by-Step Breakdown
   Detail how Python executes it under the hood (bytecode, frame stack, memory allocation, or generator mechanics).
3. ### Short Example
   Provide clean, runnable Python code with type annotations, docstrings, and comments highlighting best practices.`,

  ML: `You are DoubtSolver AI, a Machine Learning and Deep Learning research tutor for engineering students.
Help students grasp mathematical intuition, cost functions, gradient descent, neural network architectures, and statistical foundations.

Always structure your responses using this 3-tier Tutor Style:
1. ### Simple Explanation
   Explain the ML intuition using real-world analogies before introducing heavy formulas.
2. ### Step-by-Step Breakdown
   Break down the mathematical formulation, algorithmic workflow, and practical hyperparameter considerations.
3. ### Short Example
   Provide a concise NumPy, PyTorch, or Scikit-Learn code snippet or a clean mathematical breakdown demonstrating the concept.`,

  DSA: `You are DoubtSolver AI, a competitive programming and Data Structures & Algorithms (DSA) coach.
Help engineering students analyze algorithmic paradigms (greedy, dynamic programming, divide-and-conquer, graph theory) and ace technical interviews.

Always structure your responses using this 3-tier Tutor Style:
1. ### Simple Explanation
   Explain the core intuition and pattern recognition (e.g. why two-pointer or sliding window applies).
2. ### Step-by-Step Breakdown
   Explain the algorithm algorithmically, followed by rigorous Time Complexity ($O$) and Space Complexity ($O$) analysis.
3. ### Short Example
   Provide an optimal, bug-free implementation in Python or C++ with comments covering edge cases.`,

  DBMS: `You are DoubtSolver AI, a Database Management Systems & Storage Engine tutor.
Guide engineering students through relational design, normal forms (1NF-BCNF), ACID properties, indexing (B+ Tree vs Hash), execution plans, and transaction concurrency.

Always structure your responses using this 3-tier Tutor Style:
1. ### Simple Explanation
   Provide an intuitive mental model of the database concept and the engineering problem it solves.
2. ### Step-by-Step Breakdown
   Break down disk I/O, lock manager, log sequence numbers (WAL), or query optimization steps.
3. ### Short Example
   Provide production-grade SQL (DDL/DML) or schema design with EXPLAIN ANALYZE notes.`,
};

export interface ChatCompletionMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class LLMError extends Error {
  statusCode: number;
  isRetryable: boolean;

  constructor(message: string, statusCode: number = 500, isRetryable: boolean = true) {
    super(message);
    this.name = 'LLMError';
    this.statusCode = statusCode;
    this.isRetryable = isRetryable;
  }
}

/**
 * Validates message length and sanitizes input.
 */
export function validateUserInput(content: string): string {
  if (!content || typeof content !== 'string') {
    throw new LLMError('Message cannot be empty.', 400, false);
  }

  const trimmed = content.trim();
  if (trimmed.length === 0) {
    throw new LLMError('Message cannot be empty.', 400, false);
  }

  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    throw new LLMError(
      `Message exceeds maximum allowed length of ${MAX_MESSAGE_LENGTH} characters.`,
      400,
      false
    );
  }

  return trimmed;
}

/**
 * Trims context history to the last 20 messages.
 */
export function prepareContextMessages(
  history: Array<{ role: 'user' | 'assistant'; content: string }>,
  subject: SubjectType = 'General'
): ChatCompletionMessage[] {
  const systemPrompt = SUBJECT_SYSTEM_PROMPTS[subject] || SUBJECT_SYSTEM_PROMPTS.General;

  // Enforce context window limit of last 20 messages
  const recentHistory = history.slice(-MAX_CONTEXT_MESSAGES);

  return [
    { role: 'system', content: systemPrompt },
    ...recentHistory.map((m) => ({
      role: m.role,
      content: m.content.slice(0, MAX_MESSAGE_LENGTH),
    })),
  ];
}

/**
 * Stream chat completions from Groq API using open-source Llama 3 models.
 * Yields text tokens through a ReadableStream.
 */
export async function streamGroqCompletion(
  messages: ChatCompletionMessage[],
  signal?: AbortSignal,
  apiKeyOverride?: string
): Promise<ReadableStream<Uint8Array>> {
  const apiKey = apiKeyOverride || process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new LLMError(
      'Groq API key is not configured. Please add GROQ_API_KEY to your environment variables.',
      503,
      false
    );
  }

  let response: Response;
  try {
    response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages,
        temperature: 0.6,
        max_tokens: 3000,
        stream: true,
      }),
      signal,
    });
  } catch (err: unknown) {
    const error = err as { name?: string; message?: string };
    if (error?.name === 'AbortError') {
      throw new LLMError('Generation stopped by user.', 499, false);
    }
    throw new LLMError(
      'Network error connecting to Groq AI service. Please check your internet connection and try again.',
      503,
      true
    );
  }

  if (!response.ok) {
    let errorDetail = '';
    try {
      const errJson = await response.json();
      errorDetail = errJson.error?.message || response.statusText;
    } catch {
      errorDetail = response.statusText;
    }

    if (response.status === 429) {
      throw new LLMError(
        'Groq rate limit reached. The AI service is experiencing high demand—please wait a few seconds and click Retry.',
        429,
        true
      );
    }

    if (response.status === 401 || response.status === 403) {
      throw new LLMError(
        'Authentication failed with Groq. Please verify that your GROQ_API_KEY is valid.',
        401,
        false
      );
    }

    throw new LLMError(
      `AI Service error (${response.status}): ${errorDetail || 'Unable to generate response.'}`,
      response.status,
      true
    );
  }

  const responseBody = response.body;
  if (!responseBody) {
    throw new LLMError('AI service returned an empty response body.', 500, true);
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const reader = responseBody.getReader();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith(':')) continue;

            if (trimmed === 'data: [DONE]') {
              controller.close();
              return;
            }

            if (trimmed.startsWith('data: ')) {
              try {
                const data = JSON.parse(trimmed.slice(6));
                const contentChunk = data.choices?.[0]?.delta?.content;
                if (contentChunk) {
                  controller.enqueue(encoder.encode(contentChunk));
                }
              } catch {
                // Ignore partial JSON chunks until complete
              }
            }
          }
        }

        controller.close();
      } catch (err: unknown) {
        const error = err as { name?: string };
        if (error?.name === 'AbortError') {
          controller.close();
          return;
        }
        controller.error(err);
      } finally {
        reader.releaseLock();
      }
    },
  });
}
