export interface SamplePhoto {
  id: string;
  title: string;
  category: string;
  url: string;
  author: string;
  exif: {
    model: string;
    lens: string;
    focalLength: string;
    fNumber: string;
    exposureTime: string;
    iso: string;
  };
}

export const SAMPLE_PHOTOS: SamplePhoto[] = [
  {
    id: 'sample-landscape',
    title: 'Alpine Golden Peaks',
    category: 'Landscape',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=85',
    author: 'Bailey Zindel',
    exif: {
      model: 'Sony Alpha A7R IV',
      lens: 'FE 16-35mm F2.8 GM',
      focalLength: '24mm',
      fNumber: 'f/8.0',
      exposureTime: '1/125s',
      iso: '100',
    },
  },
  {
    id: 'sample-portrait',
    title: 'Editorial Studio Portrait',
    category: 'Portrait',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1600&q=85',
    author: 'Aiony Haust',
    exif: {
      model: 'Canon EOS R5',
      lens: 'RF 85mm F1.2L USM',
      focalLength: '85mm',
      fNumber: 'f/1.4',
      exposureTime: '1/320s',
      iso: '160',
    },
  },
  {
    id: 'sample-street',
    title: 'Tokyo Neon Rain',
    category: 'Street & Night',
    url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1600&q=85',
    author: 'Aleksandar Pasaric',
    exif: {
      model: 'Fujifilm X-T4',
      lens: 'XF 23mm F1.4 R LM WR',
      focalLength: '23mm',
      fNumber: 'f/1.8',
      exposureTime: '1/60s',
      iso: '1600',
    },
  },
  {
    id: 'sample-architecture',
    title: 'Brutalist Geometry',
    category: 'Architecture',
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1600&q=85',
    author: 'Simone Hutsch',
    exif: {
      model: 'Nikon Z7 II',
      lens: 'NIKKOR Z 24-70mm f/2.8 S',
      focalLength: '35mm',
      fNumber: 'f/11.0',
      exposureTime: '1/250s',
      iso: '64',
    },
  },
  {
    id: 'sample-cinematic',
    title: 'Misty Nordic Pines',
    category: 'Cinematic',
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1600&q=85',
    author: 'Sebastian Unrau',
    exif: {
      model: 'Leica Q2',
      lens: 'Summilux 28mm f/1.7 ASPH',
      focalLength: '28mm',
      fNumber: 'f/2.8',
      exposureTime: '1/200s',
      iso: '400',
    },
  },
  {
    id: 'sample-food',
    title: 'Artisan Espresso & Bloom',
    category: 'Still Life',
    url: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=1600&q=85',
    author: 'Nathan Dumlao',
    exif: {
      model: 'Sony Alpha A7 III',
      lens: 'FE 50mm F1.8',
      focalLength: '50mm',
      fNumber: 'f/2.2',
      exposureTime: '1/160s',
      iso: '320',
    },
  },
];

/**
 * Creates a beautiful fallback procedural photographic canvas dataURL
 * in case the device is offline or CORS blocks an external image.
 */
export function createProceduralDemoImage(category: string): string {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 800;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const grad = ctx.createLinearGradient(0, 0, 1200, 800);
  if (category === 'Portrait') {
    grad.addColorStop(0, '#3e1f2b');
    grad.addColorStop(0.5, '#734149');
    grad.addColorStop(1, '#1f1318');
  } else if (category === 'Street & Night') {
    grad.addColorStop(0, '#09101f');
    grad.addColorStop(0.5, '#1e1136');
    grad.addColorStop(1, '#052329');
  } else {
    grad.addColorStop(0, '#10223d');
    grad.addColorStop(0.4, '#244e6b');
    grad.addColorStop(0.7, '#d87b4f');
    grad.addColorStop(1, '#4f2b1d');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1200, 800);

  // Draw mountain silhouettes / shapes
  ctx.beginPath();
  ctx.moveTo(0, 800);
  ctx.lineTo(0, 480);
  ctx.lineTo(250, 320);
  ctx.lineTo(480, 420);
  ctx.lineTo(750, 260);
  ctx.lineTo(980, 390);
  ctx.lineTo(1200, 300);
  ctx.lineTo(1200, 800);
  ctx.closePath();
  ctx.fillStyle = 'rgba(12, 20, 32, 0.85)';
  ctx.fill();

  // Draw warm sun / light circle
  const sunGrad = ctx.createRadialGradient(750, 260, 10, 750, 260, 240);
  sunGrad.addColorStop(0, 'rgba(255, 220, 150, 0.9)');
  sunGrad.addColorStop(0.4, 'rgba(255, 140, 80, 0.4)');
  sunGrad.addColorStop(1, 'rgba(255, 100, 50, 0)');
  ctx.fillStyle = sunGrad;
  ctx.beginPath();
  ctx.arc(750, 260, 240, 0, Math.PI * 2);
  ctx.fill();

  // Lake reflection
  ctx.fillStyle = 'rgba(10, 18, 30, 0.7)';
  ctx.fillRect(0, 560, 1200, 240);

  // Subtle water rippling lines
  ctx.strokeStyle = 'rgba(255, 180, 120, 0.15)';
  ctx.lineWidth = 2;
  for (let y = 580; y < 800; y += 16) {
    ctx.beginPath();
    ctx.moveTo(50, y);
    ctx.bezierCurveTo(350, y + 4, 850, y - 4, 1150, y);
    ctx.stroke();
  }

  return canvas.toDataURL('image/jpeg', 0.9);
}
