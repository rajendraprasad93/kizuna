import { type ReactNode } from 'react';

type Color = 'blue' | 'green' | 'amber' | 'red' | 'slate' | 'emerald' | 'orange' | 'purple';

interface BadgeProps {
  children: ReactNode;
  color?: Color;
  className?: string;
}

const colors: Record<Color, string> = {
  blue: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  green: 'bg-green-50 text-green-700 ring-green-600/20',
  amber: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  red: 'bg-red-50 text-red-700 ring-red-600/20',
  slate: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  orange: 'bg-orange-50 text-orange-700 ring-orange-600/20',
  purple: 'bg-purple-50 text-purple-700 ring-purple-600/20',
};

export function Badge({ children, color = 'slate', className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${colors[color]} ${className}`}>
      {children}
    </span>
  );
}

import type { ReportStatus } from '@/types';

const statusConfig: Record<ReportStatus, { label: string; color: Color }> = {
  submitted: { label: 'Submitted', color: 'slate' },
  analyzing: { label: 'AI Analyzing', color: 'amber' },
  analyzed: { label: 'Analyzed', color: 'blue' },
  assigned: { label: 'Assigned', color: 'blue' },
  in_progress: { label: 'In Progress', color: 'orange' },
  resolved: { label: 'Resolved', color: 'emerald' },
  rejected: { label: 'Rejected', color: 'red' },
  closed: { label: 'Closed', color: 'slate' },
};

export function StatusBadge({ status }: { status: ReportStatus }) {
  const cfg = statusConfig[status];
  return (
    <Badge color={cfg.color}>
      {status === 'analyzing' && (
        <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {cfg.label}
    </Badge>
  );
}
