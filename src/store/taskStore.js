import { create } from 'zustand';
import api from '../utils/api';

export const useTaskStore = create((set) => ({
  tasks:   [],
  loading: false,

  fetchTasks: async (params = {}) => {
    set({ loading: true });
    try {
      const { data } = await api.get('/tasks', { params });
      set({ tasks: data.tasks });
    } finally { set({ loading: false }); }
  },

  createTask: async (body) => {
    const { data } = await api.post('/tasks', body);
    set((s) => ({ tasks: [...s.tasks, data.task] }));
    return data.task;
  },

  updateTask: async (id, patch) => {
    const { data } = await api.patch(`/tasks/${id}`, patch);
    set((s) => ({ tasks: s.tasks.map((t) => t._id === id ? data.task : t) }));
    return data.task;
  },

  deleteTask: async (id) => {
    await api.delete(`/tasks/${id}`);
    set((s) => ({ tasks: s.tasks.filter((t) => t._id !== id) }));
  },

  reorderTasks: async (taskIds) => {
    await api.patch('/tasks/reorder', { taskIds });
  },
}));
