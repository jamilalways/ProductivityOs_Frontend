import { create } from 'zustand';
import api from '../utils/api';

export const useSkillStore = create((set) => ({
  skills:  [],
  loading: false,

  fetchSkills: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get('/skills');
      set({ skills: data.skills });
    } finally { set({ loading: false }); }
  },

  createSkill: async (body) => {
    const { data } = await api.post('/skills', body);
    set((s) => ({ skills: [...s.skills, data.skill] }));
    return data.skill;
  },

  updateSkill: async (id, patch) => {
    const { data } = await api.patch(`/skills/${id}`, patch);
    set((s) => ({ skills: s.skills.map((sk) => sk._id === id ? data.skill : sk) }));
    return data.skill;
  },

  toggleTopic: async (skillId, topicId) => {
    const { data } = await api.patch(`/skills/${skillId}/topics/${topicId}/toggle`);
    set((s) => ({ skills: s.skills.map((sk) => sk._id === skillId ? data.skill : sk) }));
  },

  deleteTopic: async (skillId, topicId) => {
    const { data } = await api.delete(`/skills/${skillId}/topics/${topicId}`);
    set((s) => ({ skills: s.skills.map((sk) => sk._id === skillId ? data.skill : sk) }));
  },

  deleteSkill: async (id) => {
    await api.delete(`/skills/${id}`);
    set((s) => ({ skills: s.skills.filter((sk) => sk._id !== id) }));
  },

  reorderSkills: async (newSkillsArray) => {
    // Optimistically update the entire skills array in state
    set({ skills: newSkillsArray });
    
    // Map to payload format for backend
    const payload = newSkillsArray.map((sk, index) => ({
      id: sk._id,
      order: index,
      category: sk.category
    }));
    
    await api.patch('/skills/reorder', { skills: payload });
  },
}));
