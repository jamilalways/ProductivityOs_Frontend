export const XP_PER_LEVEL   = 200;
export const calcLevel      = (xp) => Math.floor(xp / XP_PER_LEVEL) + 1;
export const xpIntoLevel    = (xp) => xp % XP_PER_LEVEL;
export const xpToNext       = (xp) => XP_PER_LEVEL - xpIntoLevel(xp);
export const levelProgress  = (xp) => (xpIntoLevel(xp) / XP_PER_LEVEL) * 100;

export const LEVEL_TITLES = [
  '', '🌱 Beginner','📘 Learner','🔨 Builder','⚙️ Developer',
  '🎯 Engineer','🚀 Expert','👑 Master','🌟 Legend','💎 Grandmaster','⚡ Deity',
];
export const levelTitle = (lvl) => LEVEL_TITLES[Math.min(lvl, 10)] || '⚡ Deity';
