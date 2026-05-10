export interface Profession {
  slug: string;
  ru: string;
  en: string;
  letter: string;
  color: string;
}

export const PROFESSIONS: Profession[] = [
  { slug: 'marketer',   ru: 'Маркетолог',     en: 'Marketer',    letter: 'M', color: '#3B82F6' },
  { slug: 'designer',   ru: 'Дизайнер',       en: 'Designer',    letter: 'D', color: '#7C3AED' },
  { slug: 'copywriter', ru: 'Копирайтер',     en: 'Copywriter',  letter: 'C', color: '#EC4899' },
  { slug: 'smm',        ru: 'SMM',            en: 'SMM',         letter: 'S', color: '#F59E0B' },
  { slug: 'product',    ru: 'Продакт',        en: 'Product',     letter: 'P', color: '#10B981' },
  { slug: 'freelancer', ru: 'Фрилансер',      en: 'Freelancer',  letter: 'F', color: '#06B6D4' },
  { slug: 'nocode',     ru: 'NoCode-билдер',  en: 'NoCode',      letter: 'N', color: '#EF4444' },
];

export function getProfessionBySlug(slug: string): Profession | undefined {
  return PROFESSIONS.find((p) => p.slug === slug);
}
