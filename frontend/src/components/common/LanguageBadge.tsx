import { getLanguageColor } from '../../utils/styleHelpers';

interface LanguageBadgeProps {
  language: string;
  className?: string;
}

export function LanguageBadge({ language, className = '' }: LanguageBadgeProps) {
  return (
    <span className={`text-xs px-2 py-1 rounded-full ${getLanguageColor(language)} ${className}`}>
      {language}
    </span>
  );
}
