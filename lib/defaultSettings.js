export const DEFAULT_SETTINGS = {
  siteStatus: 'open', // 'open' | 'pause' | 'closed'
  hero: {
    badge: 'Préparé ce matin à Marseille',
    description: 'Composez votre panier, validez en 1 clic. Livraison au Vieux-Port et alentours.',
    badgeItems: ['100% Naturel', 'Fait maison', 'Livraison Marseille'],
    pauseMessage: 'Nous serons de retour très bientôt. Merci de votre fidélité ! 🌿',
  },
  contact: {
    whatsapp: '33650711629',
    instagram: 'https://instagram.com/jusfraismaison',
    address: '3 Rue Curiol, 13001 Marseille — Vieux-Port',
    phone: '06 50 71 16 29',
  },
  schedule: [
    { day: 'Lundi', hours: '18h — 19h', active: true },
    { day: 'Mercredi', hours: '18h — 19h45', active: true },
    { day: 'Vendredi', hours: '18h — 21h', active: true },
    { day: 'Week-end & jours fériés', hours: '14h — 19h', active: true },
  ],
  formats: [
    { size: '380 ml', price: 5, label: 'Unique', popular: true }
  ],
  benefits: [
    { icon: 'Leaf', title: '100% Naturel', text: "Que des fruits, rien d'autre." },
    { icon: 'Sparkles', title: 'Sans conservateurs', text: 'Préparé pour être bu vite.' },
    { icon: 'Heart', title: 'Préparé le jour même', text: 'Chaque matin, à la main.' },
    { icon: 'Snowflake', title: 'Pressé à froid', text: 'Vitamines & nutriments préservés.' },
    { icon: 'Truck', title: 'Livraison Marseille', text: 'Au Vieux-Port et alentours.' },
    { icon: 'Apple', title: 'Ingrédients frais', text: 'Sélectionnés chaque matin.' },
  ],
  testimonials: [
    { name: 'Sarah M.', text: 'Le Bissap Boost est juste incroyable. Goût authentique, fraîcheur dingue.', rating: 5, area: 'Vieux-Port', active: true },
    { name: 'Karim D.', text: 'Je commande chaque semaine le Fresh Detox. La meilleure routine matin.', rating: 5, area: 'Castellane', active: true },
    { name: 'Léa B.', text: 'Livraison rapide, packaging super propre, et surtout : le goût est là.', rating: 5, area: 'Cours Julien', active: true },
  ],
}
