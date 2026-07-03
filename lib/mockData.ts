import { Sport } from './types';

// Pure helper functions - no demo/mock data at all
export function getSportEmoji(sport: Sport): string {
  const map: Record<Sport, string> = {
    Badminton: '🏸', Football: '⚽', Cricket: '🏏', Volleyball: '🏐',
    Basketball: '🏀', Tennis: '🎾', Pickleball: '🏓', 'Table Tennis': '🏓',
    Running: '🏃', Cycling: '🚴', Swimming: '🏊', Yoga: '🧘',
    Dancing: '💃', Boxing: '🥊', 'Martial Arts': '🥋', Gym: '🏋️',
    Athletics: '🏃', Skating: '⛸️', Chess: '♟️', Kabaddi: '🤼',
  };
  return map[sport] || '🏅';
}

export function formatTime(time: string): string {
  if (!time) return '';
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${period}`;
}

export function getRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays < 7) return `In ${diffDays} days`;
  return date.toLocaleDateString();
}
