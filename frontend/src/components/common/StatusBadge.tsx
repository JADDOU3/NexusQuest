import { CheckCircle2, Clock } from 'lucide-react';

interface StatusBadgeProps {
  status: 'completed' | 'in_progress' | 'started';
  className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  if (status === 'completed') {
    return (
      <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400 ${className}`}>
        <CheckCircle2 className="w-3 h-3" /> Completed
      </span>
    );
  }

  return (
    <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 ${className}`}>
      <Clock className="w-3 h-3" /> In Progress
    </span>
  );
}
