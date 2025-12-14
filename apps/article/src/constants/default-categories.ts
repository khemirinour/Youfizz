export interface DefaultCategory {
  name: string;
  slug: string;
  description?: string;
  order: number;
  children?: DefaultCategory[];
}

export const DEFAULT_CATEGORIES: DefaultCategory[] = [
  {
    name: 'Électronique',
    slug: 'electronique',
    description: 'Appareils électroniques et gadgets',
    order: 1,
    children: [
      { name: 'Smartphones', slug: 'smartphones', description: 'Téléphones intelligents', order: 1 },
      { name: 'Ordinateurs', slug: 'ordinateurs', description: 'Ordinateurs portables et de bureau', order: 2 },
      { name: 'Tablettes', slug: 'tablettes', description: 'Tablettes tactiles', order: 3 },
      { name: 'Accessoires', slug: 'accessoires-electroniques', description: 'Accessoires électroniques', order: 4 },
    ],
  },
  {
    name: 'Mode & Vêtements',
    slug: 'mode-vetements',
    description: 'Vêtements et accessoires de mode',
    order: 2,
    children: [
      { name: 'Homme', slug: 'vetements-homme', description: 'Vêtements pour hommes', order: 1 },
      { name: 'Femme', slug: 'vetements-femme', description: 'Vêtements pour femmes', order: 2 },
      { name: 'Enfant', slug: 'vetements-enfant', description: 'Vêtements pour enfants', order: 3 },
      { name: 'Accessoires', slug: 'accessoires-mode', description: 'Accessoires de mode', order: 4 },
    ],
  },
  {
    name: 'Maison & Jardin',
    slug: 'maison-jardin',
    description: 'Articles pour la maison et le jardin',
    order: 3,
    children: [
      { name: 'Décoration', slug: 'decoration', description: 'Articles de décoration', order: 1 },
      { name: 'Mobilier', slug: 'mobilier', description: 'Meubles et mobilier', order: 2 },
      { name: 'Jardinage', slug: 'jardinage', description: 'Outils et produits de jardinage', order: 3 },
      { name: 'Cuisine', slug: 'cuisine', description: 'Articles de cuisine', order: 4 },
    ],
  },
  {
    name: 'Sports & Loisirs',
    slug: 'sports-loisirs',
    description: 'Équipements sportifs et articles de loisirs',
    order: 4,
    children: [
      { name: 'Fitness', slug: 'fitness', description: 'Équipements de fitness', order: 1 },
      { name: 'Sports d\'équipe', slug: 'sports-equipe', description: 'Équipements pour sports d\'équipe', order: 2 },
      { name: 'Sports individuels', slug: 'sports-individuels', description: 'Équipements pour sports individuels', order: 3 },
      { name: 'Loisirs créatifs', slug: 'loisirs-creatifs', description: 'Articles pour loisirs créatifs', order: 4 },
    ],
  },
  {
    name: 'Livres & Médias',
    slug: 'livres-medias',
    description: 'Livres, films, musique et médias',
    order: 5,
    children: [
      { name: 'Livres', slug: 'livres', description: 'Livres physiques et numériques', order: 1 },
      { name: 'Films & Séries', slug: 'films-series', description: 'DVD, Blu-ray et streaming', order: 2 },
      { name: 'Musique', slug: 'musique', description: 'CD, vinyles et musique numérique', order: 3 },
      { name: 'Jeux vidéo', slug: 'jeux-video', description: 'Jeux vidéo et consoles', order: 4 },
    ],
  },
  {
    name: 'Santé & Beauté',
    slug: 'sante-beaute',
    description: 'Produits de santé et beauté',
    order: 6,
    children: [
      { name: 'Soins de la peau', slug: 'soins-peau', description: 'Produits de soins pour la peau', order: 1 },
      { name: 'Maquillage', slug: 'maquillage', description: 'Produits de maquillage', order: 2 },
      { name: 'Parfums', slug: 'parfums', description: 'Parfums et eaux de toilette', order: 3 },
      { name: 'Hygiène', slug: 'hygiene', description: 'Produits d\'hygiène personnelle', order: 4 },
    ],
  },
  {
    name: 'Alimentation',
    slug: 'alimentation',
    description: 'Produits alimentaires et boissons',
    order: 7,
    children: [
      { name: 'Épicerie', slug: 'epicerie', description: 'Produits d\'épicerie', order: 1 },
      { name: 'Boissons', slug: 'boissons', description: 'Boissons alcoolisées et non alcoolisées', order: 2 },
      { name: 'Produits frais', slug: 'produits-frais', description: 'Fruits, légumes et produits frais', order: 3 },
      { name: 'Bio & Naturel', slug: 'bio-naturel', description: 'Produits biologiques et naturels', order: 4 },
    ],
  },
  {
    name: 'Automobile',
    slug: 'automobile',
    description: 'Pièces et accessoires automobiles',
    order: 8,
    children: [
      { name: 'Pièces détachées', slug: 'pieces-detachees', description: 'Pièces de rechange', order: 1 },
      { name: 'Accessoires', slug: 'accessoires-auto', description: 'Accessoires automobiles', order: 2 },
      { name: 'Entretien', slug: 'entretien-auto', description: 'Produits d\'entretien', order: 3 },
      { name: 'Pneus & Jantes', slug: 'pneus-jantes', description: 'Pneus et jantes', order: 4 },
    ],
  },
];

