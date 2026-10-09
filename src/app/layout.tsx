import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';

export const metadata: Metadata = {
  title: 'DoubtSolver AI - Engineering Study Assistant',
  description:
    'A ChatGPT-like study assistant for engineering students, powered by open-source Llama 3 via Groq. Features subject-specific tutoring, step-by-step explanations, code generation, and analytics.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full bg-zinc-950 text-zinc-100">
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100 antialiased selection:bg-emerald-900 selection:text-emerald-100">
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
