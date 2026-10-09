'use client';

import React from 'react';
import { SubjectType } from '@/types';
import { Sparkles, Code2, BrainCircuit, GitFork, Database } from 'lucide-react';

interface SubjectSelectorProps {
  currentSubject: SubjectType;
  onSelectSubject: (subject: SubjectType) => void;
  disabled?: boolean;
}

export const SUBJECT_OPTIONS: Array<{
  id: SubjectType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  tagline: string;
  activeColor: string;
}> = [
  {
    id: 'General',
    label: 'General Eng',
    icon: Sparkles,
    tagline: 'Engineering concepts & academic doubts',
    activeColor: 'bg-blue-600/20 text-blue-300 border-blue-500/50',
  },
  {
    id: 'Python',
    label: 'Python',
    icon: Code2,
    tagline: 'Pythonic idioms, GIL, generators & OOP',
    activeColor: 'bg-amber-600/20 text-amber-300 border-amber-500/50',
  },
  {
    id: 'ML',
    label: 'ML / AI',
    icon: BrainCircuit,
    tagline: 'Loss functions, math intuition & neural nets',
    activeColor: 'bg-purple-600/20 text-purple-300 border-purple-500/50',
  },
  {
    id: 'DSA',
    label: 'DSA',
    icon: GitFork,
    tagline: 'Time/space complexities, trees, graphs & DP',
    activeColor: 'bg-emerald-600/20 text-emerald-300 border-emerald-500/50',
  },
  {
    id: 'DBMS',
    label: 'DBMS',
    icon: Database,
    tagline: 'SQL, B-Trees, normalization & transactions',
    activeColor: 'bg-cyan-600/20 text-cyan-300 border-cyan-500/50',
  },
];

export function SubjectSelector({
  currentSubject,
  onSelectSubject,
  disabled = false,
}: SubjectSelectorProps) {
  return (
    <div className="flex items-center gap-1.5 p-1 bg-zinc-900/90 border border-zinc-800/80 rounded-xl overflow-x-auto max-w-full scrollbar-none">
      {SUBJECT_OPTIONS.map((sub) => {
        const Icon = sub.icon;
        const isActive = currentSubject === sub.id;

        return (
          <button
            key={sub.id}
            onClick={() => onSelectSubject(sub.id)}
            disabled={disabled}
            title={sub.tagline}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-150 border ${
              isActive
                ? `${sub.activeColor} shadow-sm font-semibold`
                : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? 'opacity-100' : 'opacity-70'}`} />
            <span>{sub.label}</span>
          </button>
        );
      })}
    </div>
  );
}
