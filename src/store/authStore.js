import { create } from 'zustand';
import { persist }  from 'zustand/middleware';
import api from '../utils/api';

export const useAuthStore = create(
  persist(
    (set) => ({
      user:  null,
      token: null,

      login: async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        set({ user: data.user, token: data.token });
        return data;
      },

      register: async (name, email, password) => {
        const { data } = await api.post('/auth/register', { name, email, password });
        set({ user: data.user, token: data.token });
        return data;
      },

      logout: () => set({ user: null, token: null }),

      refreshUser: async () => {
        const { data } = await api.get('/auth/me');
        set({ user: data.user });
      },

      updateUser: (patch) => set((s) => ({ user: { ...s.user, ...patch } })),
    }),
    { name: 'auth' }
  )
);
