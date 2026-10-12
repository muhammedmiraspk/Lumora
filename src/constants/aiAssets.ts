export interface CreativeAsset {
  id: string;
  title: string;
  category: 'backgrounds' | 'skies' | 'light_leaks' | 'lens_flares' | 'fog_smoke' | 'bokeh' | 'shadows' | 'product_podiums';
  thumbnailUrl: string;
  assetUrl: string;
  defaultBlendMode: 'source-over' | 'screen' | 'overlay' | 'soft-light' | 'multiply';
  defaultOpacity: number;
  description: string;
}

export const CREATIVE_CATEGORIES = [
  { id: 'all', label: 'All Assets' },
  { id: 'backgrounds', label: 'Pro Backdrops' },
  { id: 'skies', label: 'Skies' },
  { id: 'light_leaks', label: 'Light Leaks' },
  { id: 'lens_flares', label: 'Lens Flares' },
  { id: 'fog_smoke', label: 'Fog & Mist' },
  { id: 'bokeh', label: 'Bokeh & Dust' },
  { id: 'shadows', label: 'Shadow Overlays' },
  { id: 'product_podiums', label: 'Product Scenes' },
];

export const CREATIVE_ASSETS: CreativeAsset[] = [
  // 1. Pro Backdrops & Studios
  {
    id: 'bg-minimal-studio',
    title: 'Warm Grey Seamless Paper',
    category: 'backgrounds',
    thumbnailUrl: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?auto=format&fit=crop&w=400&q=80',
    assetUrl: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?auto=format&fit=crop&w=1600&q=85',
    defaultBlendMode: 'source-over',
    defaultOpacity: 100,
    description: 'Classic studio seamless paper backdrop with gentle center vignette.',
  },
  {
    id: 'bg-luxury-loft',
    title: 'Penthouse Concrete & Wood',
    category: 'backgrounds',
    thumbnailUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80',
    assetUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
    defaultBlendMode: 'source-over',
    defaultOpacity: 100,
    description: 'Contemporary architectural interior with natural diffuse window illumination.',
  },
  {
    id: 'bg-alpine-lake',
    title: 'Misty Alpine Lake Horizon',
    category: 'backgrounds',
    thumbnailUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=400&q=80',
    assetUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=85',
    defaultBlendMode: 'source-over',
    defaultOpacity: 100,
    description: 'Breathtaking mountain peaks reflected in still turquoise water.',
  },
  {
    id: 'bg-sunset-coastal',
    title: 'Golden Hour Ocean Beach',
    category: 'backgrounds',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80',
    assetUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=85',
    defaultBlendMode: 'source-over',
    defaultOpacity: 100,
    description: 'Pristine coastal shoreline with warm horizon gradient.',
  },
  {
    id: 'bg-urban-street',
    title: 'SoHo Architectural Street',
    category: 'backgrounds',
    thumbnailUrl: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=400&q=80',
    assetUrl: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=1600&q=85',
    defaultBlendMode: 'source-over',
    defaultOpacity: 100,
    description: 'Moody urban cityscape with bokeh architecture.',
  },
  {
    id: 'bg-emerald-forest',
    title: 'Misty Redwood Sanctuary',
    category: 'backgrounds',
    thumbnailUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=400&q=80',
    assetUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1600&q=85',
    defaultBlendMode: 'source-over',
    defaultOpacity: 100,
    description: 'Atmospheric pine trees shrouded in soft mountain fog.',
  },

  // 2. Skies
  {
    id: 'sky-milky-way',
    title: 'Deep Astro Milky Way',
    category: 'skies',
    thumbnailUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=400&q=80',
    assetUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1600&q=85',
    defaultBlendMode: 'screen',
    defaultOpacity: 90,
    description: 'Crystal-clear night sky packed with vibrant nebulae and stars.',
  },
  {
    id: 'sky-dramatic-sunset',
    title: 'Fiery Amber Cloudbreak',
    category: 'skies',
    thumbnailUrl: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?auto=format&fit=crop&w=400&q=80',
    assetUrl: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?auto=format&fit=crop&w=1600&q=85',
    defaultBlendMode: 'overlay',
    defaultOpacity: 85,
    description: 'Dramatic sunset clouds illuminated with crimson and apricot glow.',
  },
  {
    id: 'sky-aurora',
    title: 'Nordic Emerald Aurora',
    category: 'skies',
    thumbnailUrl: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=400&q=80',
    assetUrl: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=1600&q=85',
    defaultBlendMode: 'screen',
    defaultOpacity: 90,
    description: 'Vivid green polar aurora borealis curtains dancing in night sky.',
  },

  // 3. Light Leaks & Lens Flares
  {
    id: 'leak-golden-hour',
    title: 'Vintage Amber Streak',
    category: 'light_leaks',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80',
    assetUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=85',
    defaultBlendMode: 'screen',
    defaultOpacity: 70,
    description: 'Warm organic 35mm film edge light leak with soft gradient falloff.',
  },
  {
    id: 'flare-anamorphic-blue',
    title: 'Cinematic Anamorphic Streak',
    category: 'lens_flares',
    thumbnailUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=400&q=80',
    assetUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1600&q=85',
    defaultBlendMode: 'screen',
    defaultOpacity: 75,
    description: 'Horizontal cyan anamorphic lens flare with iris polygon artifacts.',
  },

  // 4. Fog, Mist & Smoke
  {
    id: 'fog-ground-mist',
    title: 'Low Rolling Ground Mist',
    category: 'fog_smoke',
    thumbnailUrl: 'https://images.unsplash.com/photo-1487621167305-5d248087c724?auto=format&fit=crop&w=400&q=80',
    assetUrl: 'https://images.unsplash.com/photo-1487621167305-5d248087c724?auto=format&fit=crop&w=1600&q=85',
    defaultBlendMode: 'screen',
    defaultOpacity: 65,
    description: 'Subtle misty atmospheric haze for adding depth between layers.',
  },

  // 5. Bokeh & Particles
  {
    id: 'bokeh-golden-dust',
    title: 'Champagne Glitter Bokeh',
    category: 'bokeh',
    thumbnailUrl: 'https://images.unsplash.com/photo-1519750157634-b6d493a0f77c?auto=format&fit=crop&w=400&q=80',
    assetUrl: 'https://images.unsplash.com/photo-1519750157634-b6d493a0f77c?auto=format&fit=crop&w=1600&q=85',
    defaultBlendMode: 'screen',
    defaultOpacity: 60,
    description: 'Floating golden light discs and fine sparkling particles.',
  },

  // 6. Shadow Overlays
  {
    id: 'shadow-palm-frond',
    title: 'Monstera & Palm Shadow',
    category: 'shadows',
    thumbnailUrl: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=400&q=80',
    assetUrl: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=1600&q=85',
    defaultBlendMode: 'multiply',
    defaultOpacity: 45,
    description: 'Tropical plant shadow silhouette for editorial product styling.',
  },

  // 7. Product Podiums
  {
    id: 'podium-marble',
    title: 'Carrara Marble Pedestal',
    category: 'product_podiums',
    thumbnailUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=400&q=80',
    assetUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1600&q=85',
    defaultBlendMode: 'source-over',
    defaultOpacity: 100,
    description: 'Polished stone podium setup for cosmetics and jewelry photography.',
  },
];
