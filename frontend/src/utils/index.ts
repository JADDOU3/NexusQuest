// Central export for all utility functions

// Style utilities
export { getDifficultyColor, getLanguageColor, getQuizStatusColor } from './styleHelpers';

// Date utilities
export { formatDateTime, getTimeAgo, formatDate } from './dateHelpers';

// Time utilities
export { formatRelativeTime, getTimeDifference } from './timeHelpers';

// Color utilities
export { getCategoryColor, getDifficultyColorForTutorial } from './colorHelpers';

// Array utilities
export { groupBy, sortByDate } from './arrayHelpers';

// Storage utilities
export { getUnreadMessages, setUnreadMessages, incrementUnreadCount, clearUnreadCount } from './storageHelpers';

// API utilities
export { getAuthHeaders, getApiUrl, apiRequest, handleApiResponse } from './apiHelpers';

// User utilities
export { fetchUserAvatar, fetchCurrentUser } from './userHelpers';
