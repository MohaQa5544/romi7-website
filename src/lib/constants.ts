export const SITE = {
  name: "رميح في الرياضيات",
  nameEn: "Romi7 Maths",
  teacherName: "إبراهيم رميح",
  teacherNameEn: "Ibrahim Romih",
  tagline: "الرياضيات للثانوية العامة — المسار العلمي والتكنولوجي",
  description: "منصة الأستاذ إبراهيم رميح لتدريس الرياضيات للصف الثاني عشر — المسار العلمي والتكنولوجي، وفق المنهاج القطري.",
  socials: {
    telegram: "https://t.me/IBRAHIM_ROMIH",
    whatsapp: "https://wa.me/97430303452",
    whatsappDisplay: "+974 3030 3452",
    whatsappPrefilledText: "السلام عليكم أستاذ، لدي سؤال...",
  },
} as const;

export const whatsappLink = (message = SITE.socials.whatsappPrefilledText) =>
  `${SITE.socials.whatsapp}?text=${encodeURIComponent(message)}`;
