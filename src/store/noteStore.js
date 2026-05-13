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
    set((s) => {
      const newNotes = [data.note, ...s.notes];
      newNotes.sort((a, b) => {
        if (a.pinned === b.pinned) return new Date(b.date) - new Date(a.date);
        return a.pinned ? -1 : 1;
      });
      return { notes: newNotes };
    });
    return data.note;
  },

  updateNote: async (id, patch) => {
    // Optimistic update for instant UI feedback when pinning
    set((s) => {
      const optimisticNotes = s.notes.map((n) => n._id === id ? { ...n, ...patch } : n);
      optimisticNotes.sort((a, b) => {
        if (a.pinned === b.pinned) return new Date(b.date) - new Date(a.date);
        return a.pinned ? -1 : 1;
      });
      return { notes: optimisticNotes };
    });

    const { data } = await api.patch(`/notes/${id}`, patch);
    
    set((s) => {
      const updatedNotes = s.notes.map((n) => n._id === id ? data.note : n);
      updatedNotes.sort((a, b) => {
        if (a.pinned === b.pinned) return new Date(b.date) - new Date(a.date);
        return a.pinned ? -1 : 1;
      });
      return { notes: updatedNotes };
    });
    return data.note;
  },

  deleteNote: async (id) => {
    await api.delete(`/notes/${id}`);
    set((s) => ({ notes: s.notes.filter((n) => n._id !== id) }));
  },
}));
