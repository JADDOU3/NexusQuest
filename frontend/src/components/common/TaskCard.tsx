import { Award } from 'lucide-react';
import { DifficultyBadge } from './DifficultyBadge';
import { LanguageBadge } from './LanguageBadge';
import { StatusBadge } from './StatusBadge';
import type { Task } from '../../services/taskService';

interface TaskCardProps {
  task: Task;
  status?: 'completed' | 'in_progress' | null;
  onClick: () => void;
  theme: 'dark' | 'light';
}

export function TaskCard({ task, status, onClick, theme }: TaskCardProps) {
  return (
    <div
      onClick={onClick}
      className={`group rounded-2xl p-5 cursor-pointer transition-all duration-300 border ${
        theme === 'dark'
          ? 'bg-gray-900/50 border-gray-800 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/5'
          : 'bg-white border-gray-200 hover:border-blue-300 shadow-sm hover:shadow-md'
      } ${status === 'completed' ? 'opacity-75' : ''} hover:-translate-y-1`}
    >
      {/* Status Badge */}
      {status && (
        <div className="flex justify-end mb-2">
          <StatusBadge status={status} />
        </div>
      )}

      {/* Title */}
      <h3 className={`font-semibold text-lg mb-2 ${status === 'completed' ? 'line-through opacity-75' : ''}`}>
        {task.title}
      </h3>

      {/* Description */}
      <p className={`text-sm mb-4 line-clamp-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
        {task.description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        <DifficultyBadge difficulty={task.difficulty} />
        <LanguageBadge language={task.language} />
      </div>

      {/* Footer */}
      <div className={`flex items-center justify-between pt-3 border-t ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-yellow-500" />
          <span className="text-sm font-medium">{task.points} pts</span>
        </div>
        <span className="text-xs text-gray-500">
          by {typeof task.createdBy === 'object' ? task.createdBy.name : 'Teacher'}
        </span>
      </div>
    </div>
  );
}
