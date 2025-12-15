# Frontend Component Structure

## Overview
The frontend has been restructured to follow proper component architecture with reusable components and shared utilities.

## Directory Structure

```
frontend/src/
├── components/
│   ├── common/              # Reusable UI components
│   │   ├── DifficultyBadge.tsx
│   │   ├── LanguageBadge.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── TaskCard.tsx
│   │   ├── QuizCard.tsx
│   │   ├── SearchAndFilter.tsx
│   │   ├── PageHeader.tsx
│   │   └── index.ts
│   ├── profile/             # Profile-specific components
│   ├── teacher/             # Teacher-specific components
│   └── ui/                  # Base UI components
├── utils/
│   └── styleHelpers.ts      # Shared styling utilities
└── pages/                   # Page components (use common components)
```

## Shared Utilities (`utils/styleHelpers.ts`)

### Functions:
- `getDifficultyColor(difficulty: string)` - Returns Tailwind classes for difficulty badges
- `getLanguageColor(language: string)` - Returns Tailwind classes for language badges
- `getQuizStatusColor(status: string)` - Returns Tailwind classes for quiz status
- `formatDateTime(dateStr: string)` - Formats dates consistently

## Common Components (`components/common/`)

### 1. **DifficultyBadge**
Displays difficulty level with consistent styling.
```tsx
<DifficultyBadge difficulty="easy" />
```

### 2. **LanguageBadge**
Displays programming language with consistent styling.
```tsx
<LanguageBadge language="python" />
```

### 3. **StatusBadge**
Displays task/quiz completion status.
```tsx
<StatusBadge status="completed" />
```

### 4. **TaskCard**
Complete task card with all information and interactions.
```tsx
<TaskCard
  task={task}
  status={status}
  onClick={() => navigate(`/task/${task._id}`)}
  theme={theme}
/>
```

### 5. **QuizCard**
Complete quiz card with all information, grades, and status.
```tsx
<QuizCard
  quiz={quiz}
  onClick={() => navigate(`/quiz/${quiz._id}`)}
  theme={theme}
/>
```

### 6. **SearchAndFilter**
Unified search and filter component for tasks/quizzes.
```tsx
<SearchAndFilter
  searchQuery={searchQuery}
  onSearchChange={setSearchQuery}
  difficultyFilter={difficultyFilter}
  onDifficultyChange={setDifficultyFilter}
  languageFilter={languageFilter}
  onLanguageChange={setLanguageFilter}
  hideCompleted={hideCompleted}
  onHideCompletedChange={setHideCompleted}
  theme={theme}
/>
```

### 7. **PageHeader**
Consistent page header with back button, icon, title, and actions.
```tsx
<PageHeader
  title="Browse Tasks"
  icon={<BookOpen className="w-5 h-5 text-white" />}
  iconGradient="bg-gradient-to-br from-blue-500 to-indigo-600"
  subtitle="50 tasks available"
  theme={theme}
  actions={<Button>Custom Action</Button>}
/>
```

## Refactored Pages

### TasksPage
- Uses `TaskCard` for rendering tasks
- Uses `SearchAndFilter` for filtering
- Uses `PageHeader` for consistent header
- No duplicate helper functions

### QuizzesPage
- Uses `QuizCard` for rendering quizzes
- Uses `PageHeader` for consistent header
- No duplicate helper functions

### TeacherDashboard
- Imports shared utilities from `styleHelpers.ts`
- No duplicate `getDifficultyColor`, `getQuizStatusColor`, or `formatDateTime`

## Benefits

1. **No Code Duplication**: Helper functions and styling logic are centralized
2. **Consistent UI**: All cards, badges, and headers use the same components
3. **Easy Maintenance**: Changes to styling or behavior only need to be made once
4. **Better Testing**: Components can be tested independently
5. **Reusability**: Components can be used across different pages
6. **Type Safety**: All components are fully typed with TypeScript

## Usage Guidelines

1. **Always use common components** instead of inline JSX for cards, badges, and filters
2. **Import utilities** from `styleHelpers.ts` for consistent styling
3. **Keep pages clean** - they should primarily compose components, not define UI
4. **Add new common components** when you find repeated patterns across pages
5. **Update this document** when adding new shared components

## Migration Checklist

✅ Created `utils/styleHelpers.ts` with shared utilities
✅ Created common components (TaskCard, QuizCard, badges, etc.)
✅ Refactored TasksPage to use common components
✅ Refactored QuizzesPage to use common components  
✅ Refactored TeacherDashboard to use shared utilities
✅ Removed all duplicate helper functions
✅ All components properly typed with TypeScript
