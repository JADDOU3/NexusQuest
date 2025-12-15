import { getDifficultyColor } from '../../utils/styleHelpers';

interface DifficultyBadgeProps {
  difficulty: string;
  className?: string;
}

export function DifficultyBadge({ difficulty, className = '' }: DifficultyBadgeProps) {
  return (
    <span className={`text-xs px-2 py-1 rounded-full border ${getDifficultyColor(difficulty)} ${className}`}>
      {difficulty}
    </span>
  );
}
