import { BRAND_NAME } from '@/lib/brand';
import { cn } from '@/lib/utils';

/**
 * Logotipo provisional de la marca, en SVG inline y en un solo archivo, pensado
 * para sustituirse por el SVG oficial: basta con reemplazar el cuerpo de <Logo />
 * conservando las props (variant, size, className).
 *
 * "fotiva" en Plus Jakarta Sans 800 (tracking -0.04em). La "o" es un diafragma de
 * seis aspas; la "i" es la i sin punto (ı) con un destello de cuatro puntas encima.
 *
 * Los colores del diafragma y del destello son identidad del logotipo y NO cambian
 * con el tema ni con la variante; solo cambia el color de la palabra.
 */

// Constantes locales del logotipo (excepción deliberada a "sin HEX en componentes").
const BLADE_COLORS = ['#635BFF', '#8A83FF', '#4038C9'];
// Sobre violeta de marca la escala se invierte (como el app icon): aspas blancas y
// violetas claros, apertura en violeta oscuro.
const BLADE_COLORS_ON_BRAND = ['#FFFFFF', '#EEECFF', '#8A83FF'];
const APERTURE_ON_BRAND = '#4038C9';
const SPARKLE_COLOR = '#FF7A45';

export type LogoVariant = 'light' | 'dark' | 'on-brand';

// light: fondo claro · dark: fondo oscuro · on-brand: sobre violeta de marca
const WORD_CLASS: Record<LogoVariant, string> = {
  light: 'text-neutral-ink',
  dark: 'text-dark-text',
  'on-brand': 'text-white',
};

const CENTER = 50;
const OUTER_R = 48;
const INNER_R = 17; // apertura hexagonal

const polar = (r: number, deg: number): [number, number] => [
  CENTER + r * Math.cos((deg * Math.PI) / 180),
  CENTER + r * Math.sin((deg * Math.PI) / 180),
];
const fmt = (n: number) => n.toFixed(2);

// Vértices del hexágono de apertura.
const hex = Array.from({ length: 6 }, (_, i) => polar(INNER_R, -90 + 60 * i));

// Punto donde la recta V_i → V_{i+1}, prolongada, corta la circunferencia exterior.
const edgeEnd = (i: number): [number, number] => {
  const [x0, y0] = hex[i];
  const [x1, y1] = hex[(i + 1) % 6];
  const len = Math.hypot(x1 - x0, y1 - y0);
  const dx = (x1 - x0) / len;
  const dy = (y1 - y0) / len;
  const px = x0 - CENTER;
  const py = y0 - CENTER;
  const b = px * dx + py * dy;
  const t = -b + Math.sqrt(b * b - (px * px + py * py - OUTER_R * OUTER_R));
  return [x0 + t * dx, y0 + t * dy];
};

// Cada aspa tiene el vértice en V_i y se abre hasta el borde, entre dos aristas prolongadas.
const BLADES = hex.map((v, i) => {
  const a = edgeEnd(i);
  const b = edgeEnd((i + 5) % 6);
  return `M${fmt(v[0])} ${fmt(v[1])} L${fmt(a[0])} ${fmt(a[1])} A${OUTER_R} ${OUTER_R} 0 0 0 ${fmt(b[0])} ${fmt(b[1])} Z`;
});
const APERTURE = `M${hex.map(([x, y]) => `${fmt(x)} ${fmt(y)}`).join(' L')} Z`;

const Diaphragm = ({ onBrand }: { onBrand: boolean }) => (
  <svg viewBox="0 0 100 100" aria-hidden="true" className="inline-block h-[0.6em] w-[0.6em] shrink-0 overflow-visible">
    {BLADES.map((d, i) => (
      <path
        key={i}
        d={d}
        fill={(onBrand ? BLADE_COLORS_ON_BRAND : BLADE_COLORS)[i % 3]}
        stroke={onBrand ? APERTURE_ON_BRAND : 'white'}
        strokeOpacity={onBrand ? 0.5 : 0.35}
        strokeWidth="1"
      />
    ))}
    <path d={APERTURE} fill={onBrand ? APERTURE_ON_BRAND : 'var(--brand-soft)'} />
  </svg>
);

const Sparkle = () => (
  <svg
    viewBox="-1 -1 2 2"
    aria-hidden="true"
    className="absolute left-1/2 top-[-0.1em] h-[0.42em] w-[0.42em] -translate-x-1/2"
  >
    <path d="M0 -1 Q0.12 -0.12 1 0 Q0.12 0.12 0 1 Q-0.12 0.12 -1 0 Q-0.12 -0.12 0 -1Z" fill={SPARKLE_COLOR} />
  </svg>
);

interface LogoProps {
  variant?: LogoVariant;
  /** Tamaño de la palabra en px (font-size). */
  size?: number;
  className?: string;
}

const Logo = ({ variant = 'light', size = 28, className }: LogoProps) => (
  <span
    role="img"
    aria-label={BRAND_NAME}
    style={{ fontSize: size }}
    className={cn(
      'inline-flex items-baseline font-heading font-extrabold leading-none tracking-[-0.04em] select-none',
      WORD_CLASS[variant],
      className,
    )}
  >
    <span aria-hidden="true">f</span>
    <Diaphragm onBrand={variant === 'on-brand'} />
    <span aria-hidden="true">t</span>
    <span aria-hidden="true" className="relative">
      ı<Sparkle />
    </span>
    <span aria-hidden="true">va</span>
  </span>
);

export default Logo;
