import { v4 as uuidv4 } from 'uuid';
import type { Stamp } from '../types';

function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

const raw: { name: string; category: string; svg: string }[] = [
  {
    name: 'Star',
    category: 'Shapes',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <polygon points="50,5 61,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 39,35"
        fill="currentColor"/>
    </svg>`,
  },
  {
    name: 'Heart',
    category: 'Shapes',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <path d="M50 85 C50 85 10 55 10 30 C10 15 22 5 35 5 C42 5 48 9 50 13
               C52 9 58 5 65 5 C78 5 90 15 90 30 C90 55 50 85 50 85Z"
        fill="currentColor"/>
    </svg>`,
  },
  {
    name: 'Diamond',
    category: 'Shapes',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <polygon points="50,5 95,50 50,95 5,50" fill="currentColor"/>
    </svg>`,
  },
  {
    name: 'Club',
    category: 'Playing Cards',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <circle cx="50" cy="38" r="18" fill="currentColor"/>
      <circle cx="28" cy="55" r="16" fill="currentColor"/>
      <circle cx="72" cy="55" r="16" fill="currentColor"/>
      <rect x="43" y="62" width="14" height="20" fill="currentColor"/>
      <rect x="33" y="80" width="34" height="10" rx="5" fill="currentColor"/>
    </svg>`,
  },
  {
    name: 'Spade',
    category: 'Playing Cards',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <path d="M50 5 L90 55 Q90 72 72 65 Q82 78 65 80 L50 80
               L35 80 Q18 78 28 65 Q10 72 10 55 Z" fill="currentColor"/>
      <rect x="43" y="78" width="14" height="16" fill="currentColor"/>
      <rect x="33" y="90" width="34" height="8" rx="4" fill="currentColor"/>
    </svg>`,
  },
  {
    name: 'Crown',
    category: 'Symbols',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <polygon points="10,80 10,40 30,60 50,15 70,60 90,40 90,80"
        fill="currentColor"/>
      <rect x="10" y="78" width="80" height="14" rx="3" fill="currentColor"/>
    </svg>`,
  },
  {
    name: 'Lightning',
    category: 'Symbols',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <polygon points="60,5 20,55 48,55 40,95 80,45 52,45" fill="currentColor"/>
    </svg>`,
  },
  {
    name: 'Moon',
    category: 'Nature',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <path d="M55 10 A38 38 0 1 0 55 90 A26 26 0 1 1 55 10Z" fill="currentColor"/>
    </svg>`,
  },
  {
    name: 'Sun',
    category: 'Nature',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="20" fill="currentColor"/>
      ${[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        const x1 = 50 + 27 * Math.cos(rad);
        const y1 = 50 + 27 * Math.sin(rad);
        const x2 = 50 + 44 * Math.cos(rad);
        const y2 = 50 + 44 * Math.sin(rad);
        return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>`;
      }).join('')}
    </svg>`,
  },
  {
    name: 'Flower',
    category: 'Nature',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      ${[0, 60, 120, 180, 240, 300].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        const cx = 50 + 22 * Math.cos(rad);
        const cy = 50 + 22 * Math.sin(rad);
        return `<ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="14" ry="9"
          transform="rotate(${deg} ${cx.toFixed(1)} ${cy.toFixed(1)})" fill="currentColor"/>`;
      }).join('')}
      <circle cx="50" cy="50" r="14" fill="currentColor"/>
    </svg>`,
  },
  {
    name: 'Arrow',
    category: 'Symbols',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <polygon points="90,50 55,15 55,38 10,38 10,62 55,62 55,85" fill="currentColor"/>
    </svg>`,
  },
  {
    name: 'Shield',
    category: 'Symbols',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <path d="M50 5 L88 22 L88 52 Q88 78 50 95 Q12 78 12 52 L12 22 Z" fill="currentColor"/>
    </svg>`,
  },
  {
    name: 'Eye',
    category: 'Symbols',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <path d="M5 50 Q50 10 95 50 Q50 90 5 50Z" fill="currentColor"/>
      <circle cx="50" cy="50" r="16" fill="white"/>
      <circle cx="50" cy="50" r="10" fill="currentColor"/>
    </svg>`,
  },
  {
    name: 'Snowflake',
    category: 'Nature',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      ${[0, 60, 120].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        const cos = Math.cos(rad).toFixed(3);
        const sin = Math.sin(rad).toFixed(3);
        return `<line x1="50" y1="50" x2="${(50 + 42 * +cos).toFixed(1)}" y2="${(50 + 42 * +sin).toFixed(1)}"
          stroke="currentColor" stroke-width="6" stroke-linecap="round"/>
          <line x1="50" y1="50" x2="${(50 - 42 * +cos).toFixed(1)}" y2="${(50 - 42 * +sin).toFixed(1)}"
          stroke="currentColor" stroke-width="6" stroke-linecap="round"/>`;
      }).join('')}
      <circle cx="50" cy="50" r="7" fill="currentColor"/>
    </svg>`,
  },
  {
    name: 'Skull',
    category: 'Symbols',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <ellipse cx="50" cy="42" rx="32" ry="35" fill="currentColor"/>
      <rect x="30" y="68" width="40" height="22" rx="5" fill="currentColor"/>
      <rect x="38" y="72" width="8" height="14" rx="2" fill="#0f0e13"/>
      <rect x="54" y="72" width="8" height="14" rx="2" fill="#0f0e13"/>
      <circle cx="37" cy="40" r="9" fill="#0f0e13"/>
      <circle cx="63" cy="40" r="9" fill="#0f0e13"/>
    </svg>`,
  },
];

export const DEFAULT_STAMPS: Stamp[] = raw.map((r) => ({
  id: uuidv4(),
  name: r.name,
  category: r.category,
  src: svgToDataUrl(r.svg),
  aiGenerated: false,
  createdAt: Date.now(),
}));
