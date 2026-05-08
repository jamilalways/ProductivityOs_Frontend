import { create } from 'zustand';
import api from '../utils/api';

export const useHabitStore = create((set) => ({
  habits:  [],
  loading: false,

  fetchHabits: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get('/habits');
      set({ habits: data.habits });
    } finally { set({ loading: false }); }
  },

  createHabit: async (body) => {
    const { data } = await api.post('/habits', body);
    set((s) => ({ habits: [...s.habits, data.habit] }));
    return data.habit;
  },

  checkIn: async (id) => {
    const { data } = await api.post(`/habits/${id}/checkin`);
    set((s) => ({ habits: s.habits.map((h) => h._id === id ? data.habit : h) }));
    return data.habit;
  },

  deleteHabit: async (id) => {
    await api.delete(`/habits/${id}`);
    set((s) => ({ habits: s.habits.filter((h) => h._id !== id) }));
  },
}));
