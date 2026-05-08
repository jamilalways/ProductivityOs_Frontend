import { create } from 'zustand';
import api from '../utils/api';

export const useNoteStore = create((set) => ({
  notes:   [],
  loading: false,

  fetchNotes: async (params = {}) => {
    set({ loading: true });
    try {
      const { data } = await api.get('/notes', { params });
      set({ notes: data.notes });
    } finally { set({ loading: false }); }
  },

  createNote: async (body) => {
    const { data } = await api.post('/notes', body);
    set((s) => ({ notes: [data.note, ...s.notes] }));
    return data.note;
  },

  updateNote: async (id, patch) => {
    const { data } = await api.patch(`/notes/${id}`, patch);
    set((s) => ({ notes: s.notes.map((n) => n._id === id ? data.note : n) }));
    return data.note;
  },

  deleteNote: async (id) => {
    await api.delete(`/notes/${id}`);
    set((s) => ({ notes: s.notes.filter((n) => n._id !== id) }));
  },
}));
