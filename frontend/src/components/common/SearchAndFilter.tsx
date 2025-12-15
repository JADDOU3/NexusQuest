import { Search, Filter } from 'lucide-react';

interface SearchAndFilterProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  difficultyFilter?: string;
  onDifficultyChange?: (value: string) => void;
  languageFilter?: string;
  onLanguageChange?: (value: string) => void;
  hideCompleted?: boolean;
  onHideCompletedChange?: (value: boolean) => void;
  theme: 'dark' | 'light';
}

export function SearchAndFilter({
  searchQuery,
  onSearchChange,
  difficultyFilter,
  onDifficultyChange,
  languageFilter,
  onLanguageChange,
  hideCompleted,
  onHideCompletedChange,
  theme
}: SearchAndFilterProps) {
  const selectClass = `px-3 py-2 rounded-lg border ${
    theme === 'dark'
      ? 'bg-gray-800 border-gray-700 text-white'
      : 'bg-white border-gray-300 text-gray-900'
  } outline-none`;

  return (
    <div className={`rounded-2xl p-5 mb-8 transition-all duration-300 ${theme === 'dark' ? 'bg-gray-900/50 border-gray-800 hover:border-gray-700' : 'bg-white hover:shadow-md'} border ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200 shadow-sm'}`}>
      <div className="flex flex-wrap gap-4 items-center">
        {/* Search */}
        <div className="flex-1 min-w-[250px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
            } outline-none focus:ring-2 focus:ring-blue-500/50`}
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-gray-500" />
          
          {onDifficultyChange && (
            <select 
              value={difficultyFilter} 
              onChange={e => onDifficultyChange(e.target.value)} 
              className={selectClass}
            >
              <option value="">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          )}
          
          {onLanguageChange && (
            <select 
              value={languageFilter} 
              onChange={e => onLanguageChange(e.target.value)} 
              className={selectClass}
            >
              <option value="">All Languages</option>
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
            </select>
          )}
          
          {onHideCompletedChange !== undefined && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hideCompleted}
                onChange={e => onHideCompletedChange(e.target.checked)}
                className="w-4 h-4 rounded border-gray-600 text-blue-500 focus:ring-blue-500/50"
              />
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Hide completed</span>
            </label>
          )}
        </div>
      </div>
    </div>
  );
}
