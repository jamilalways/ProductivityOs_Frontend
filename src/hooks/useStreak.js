import { useAuthStore } from '../store/authStore';

export const useStreak = () => {
  const { user } = useAuthStore();

  const streak        = user?.streak        ?? 0;
  const longestStreak = user?.longestStreak ?? 0;
  const isOnStreak    = streak > 0;
  const isMilestone   = streak > 0 && streak % 7 === 0; // every week

  return { streak, longestStreak, isOnStreak, isMilestone };
};
