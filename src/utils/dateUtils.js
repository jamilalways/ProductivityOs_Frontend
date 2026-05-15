export const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export const daysUntil = (deadline) =>
  Math.ceil((new Date(deadline) - new Date()) / 86400000);

export const isOverdue = (deadline) => new Date(deadline) < new Date();

export const todayISO = () => new Date().toISOString().split('T')[0];

export const greeting = () => {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'Good morning';
  if (h >= 12 && h < 17) return 'Good afternoon';
  if (h >= 17 && h < 21) return 'Good evening';
  return 'Good night';
};
