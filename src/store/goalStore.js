import { create } from 'zustand';
import api from '../utils/api';

export const useGoalStore = create((set) => ({
  goals:   [],
  loading: false,

  fetchGoals: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get('/goals');
      set({ goals: data.goals });
    } finally { set({ loading: false }); }
  },

  createGoal: async (body) => {
    const { data } = await api.post('/goals', body);
    set((s) => ({ goals: [...s.goals, data.goal] }));
    return data.goal;
  },

  updateGoal: async (id, patch) => {
    const { data } = await api.patch(`/goals/${id}`, patch);
    set((s) => ({ goals: s.goals.map((g) => g._id === id ? data.goal : g) }));
    return data.goal;
  },

  deleteGoal: async (id) => {
    await api.delete(`/goals/${id}`);
    set((s) => ({ goals: s.goals.filter((g) => g._id !== id) }));
  },
}));
