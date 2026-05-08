export const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export const daysUntil = (deadline) =>
  Math.ceil((new Date(deadline) - new Date()) / 86400000);

export const isOverdue = (deadline) => new Date(deadline) < new Date();

export const todayISO = () => new Date().toISOString().split('T')[0];

export const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
};
