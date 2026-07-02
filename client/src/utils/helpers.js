import { format, formatDistanceToNow, isToday, isTomorrow } from 'date-fns';

export const formatDate = (date) => format(new Date(date), 'MMM d, yyyy');
export const formatTime = (date) => format(new Date(date), 'h:mm a');
export const formatDateTime = (date) => format(new Date(date), 'MMM d, yyyy h:mm a');
export const timeAgo = (date) => formatDistanceToNow(new Date(date), { addSuffix: true });

export const formatSessionDate = (date) => {
  const d = new Date(date);
  if (isToday(d)) return `Today at ${formatTime(d)}`;
  if (isTomorrow(d)) return `Tomorrow at ${formatTime(d)}`;
  return formatDateTime(d);
};

export const getInitials = (name = '') =>
  name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

export const getAvatarColor = (name = '') => {
  const colors = [
    'linear-gradient(135deg, #7C6EFA, #06D6A0)',
    'linear-gradient(135deg, #FF6B6B, #FFB347)',
    'linear-gradient(135deg, #64B5F6, #7C6EFA)',
    'linear-gradient(135deg, #06D6A0, #64B5F6)',
    'linear-gradient(135deg, #FFB347, #FF6B6B)',
  ];
  const idx = name.charCodeAt(0) % colors.length;
  return colors[idx];
};

export const SKILL_CATEGORIES = [
  'Programming & Tech', 'Design & Art', 'Music & Audio', 'Languages',
  'Mathematics', 'Science', 'Writing & Communication', 'Business & Finance',
  'Photography & Video', 'Cooking & Nutrition', 'Sports & Fitness',
  'Academic Support', 'Crafts & DIY', 'Other',
];

export const CATEGORY_ICONS = {
  'Programming & Tech': '💻',
  'Design & Art': '🎨',
  'Music & Audio': '🎵',
  'Languages': '🌍',
  'Mathematics': '📐',
  'Science': '🔬',
  'Writing & Communication': '✍️',
  'Business & Finance': '📊',
  'Photography & Video': '📷',
  'Cooking & Nutrition': '🍳',
  'Sports & Fitness': '💪',
  'Academic Support': '📚',
  'Crafts & DIY': '🔧',
  'Other': '✨',
};

export const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

export const truncate = (str, n = 100) =>
  str?.length > n ? str.substring(0, n) + '...' : str;

export const getStatusColor = (status) => {
  const map = {
    pending: 'warning',
    accepted: 'accent',
    completed: 'info',
    declined: 'danger',
    cancelled: 'danger',
  };
  return map[status] || 'muted';
};
