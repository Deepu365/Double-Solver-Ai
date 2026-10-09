'use client';

import React, { useState } from 'react';
import { SubjectType } from '@/types';
import { Sparkles, Code2, BrainCircuit, GitFork, Database } from 'lucide-react';

interface SubjectBarChartProps {
  data: Record<SubjectType, number>;
}

const SUBJECT_THEMES: Record<
  SubjectType,
  { label: string; color: string; hoverColor: string; bgGradient: string; icon: React.ComponentType<{ className?: string }> }
> = {
  General: {
    label: 'General',
    color: '#3b82f6',
    hoverColor: '#60a5fa',
    bgGradient: 'from-blue-600 to-indigo-600',
    icon: Sparkles,
  },
  Python: {
    label: 'Python',
    color: '#f59e0b',
    hoverColor: '#fbbf24',
    bgGradient: 'from-amber-500 to-yellow-600',
    icon: Code2,
  },
  ML: {
    label: 'Machine Learning',
    color: '#a855f7',
    hoverColor: '#c084fc',
    bgGradient: 'from-purple-600 to-pink-600',
    icon: BrainCircuit,
  },
  DSA: {
    label: 'DSA',
    color: '#10b981',
    hoverColor: '#34d399',
    bgGradient: 'from-emerald-600 to-teal-600',
    icon: GitFork,
  },
  DBMS: {
    label: 'DBMS',
    color: '#06b6d4',
    hoverColor: '#22d3ee',
    bgGradient: 'from-cyan-600 to-sky-600',
    icon: Database,
  },
};

export function SubjectBarChart({ data }: SubjectBarChartProps) {
  const [hoveredSubject, setHoveredSubject] = useState<SubjectType | null>(null);

  const subjects: SubjectType[] = ['General', 'Python', 'ML', 'DSA', 'DBMS'];
  const values = subjects.map((s) => data[s] || 0);
  const maxVal = Math.max(...values, 1);
  const total = values.reduce((sum, v) => sum + v, 0);

  return (
    <div className="w-full bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <h3 className="text-base font-semibold text-white">Questions per Subject</h3>
          <p className="text-xs text-zinc-400">Distribution of engineering study sessions and doubts solved</p>
        </div>
        <div className="text-xs text-zinc-400 bg-zinc-800/60 px-3 py-1.5 rounded-lg border border-zinc-700/40 font-mono">
          Total Doubts: <span className="text-emerald-400 font-bold">{total}</span>
        </div>
      </div>

      {/* Bar Chart Container */}
      <div className="relative pt-6 pb-2">
        <div className="h-48 flex items-end justify-between gap-3 sm:gap-6 px-2 border-b border-zinc-800/80">
          {subjects.map((subject) => {
            const count = data[subject] || 0;
            const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
            const barHeightPercent = Math.max(8, Math.round((count / maxVal) * 100));
            const theme = SUBJECT_THEMES[subject];
            const Icon = theme.icon;
            const isHovered = hoveredSubject === subject;

            return (
              <div
                key={subject}
                className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
                onMouseEnter={() => setHoveredSubject(subject)}
                onMouseLeave={() => setHoveredSubject(null)}
              >
                {/* Floating Tooltip */}
                {isHovered && (
                  <div className="absolute -top-12 z-20 px-3 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg shadow-xl text-center pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                    <div className="text-xs font-semibold text-white">{theme.label}</div>
                    <div className="text-[11px] text-zinc-300 font-mono">
                      {count} questions ({percentage}%)
                    </div>
                  </div>
                )}

                {/* Question Count Label above bar */}
                <span className="text-xs font-mono font-medium text-zinc-400 group-hover:text-white transition-colors mb-2">
                  {count}
                </span>

                {/* Animated Bar */}
                <div className="w-full max-w-[48px] bg-zinc-800/40 rounded-t-lg overflow-hidden flex items-end">
                  <div
                    style={{ height: `${barHeightPercent}%` }}
                    className={`w-full rounded-t-lg bg-gradient-to-t ${theme.bgGradient} transition-all duration-300 ease-out group-hover:brightness-110 shadow-sm`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* X-Axis Labels */}
        <div className="flex justify-between gap-3 sm:gap-6 px-2 mt-3">
          {subjects.map((subject) => {
            const theme = SUBJECT_THEMES[subject];
            const Icon = theme.icon;
            return (
              <div key={subject} className="flex-1 flex flex-col items-center gap-1 text-center">
                <Icon className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-200" />
                <span className="text-xs font-medium text-zinc-300 truncate max-w-[64px]">
                  {subject}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
