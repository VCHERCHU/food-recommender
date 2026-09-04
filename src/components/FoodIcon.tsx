import type { IllustrationKey } from '../types'

/**
 * Hand-drawn-feeling inline SVG food icons. Chunky dark-brown outlines,
 * slightly wobbly paths, flat fills from the palette. All share a 64x64 box.
 */
const B = '#3D2B1F'
const P = {
  cream: '#FFF8ED',
  tomato: '#E8553D',
  mustard: '#F2B632',
  pandan: '#6DB36B',
  teal: '#5BB3B0',
  white: '#FFFFFF',
  pink: '#F4A08A',
  brownLight: '#8B5E3C',
}
const stroke = { stroke: B, strokeWidth: 3.2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

function Steam({ x = 32, y = 14 }: { x?: number; y?: number }) {
  return (
    <g fill="none" {...stroke} strokeWidth={2.8} opacity={0.9}>
      <path d={`M${x - 8} ${y + 8}c-2-3 2-5 0-8 -1.5-2 1-4 0-6`} />
      <path d={`M${x} ${y + 6}c-2-3 2-5 0-8 -1.5-2 1-4 0-6`} />
      <path d={`M${x + 8} ${y + 8}c-2-3 2-5 0-8 -1.5-2 1-4 0-6`} />
    </g>
  )
}

function Noodles() {
  return (
    <g>
      <Steam />
      <path d="M8 34.5c-.4 12 8 20 24 20.5 16 .4 24.6-8 24-20.5z" fill={P.tomato} {...stroke} />
      <path d="M8 34.5h48" fill="none" {...stroke} />
      <path d="M14 34c2-7 7-10 18-10s16 3 18 10" fill={P.mustard} {...stroke} />
      <path d="M18 31c3-2 5 1 8-1s5 1 8-1 5 1 8-1" fill="none" {...stroke} strokeWidth={2.4} />
      <path d="M40 10l4 24M46 12l2 22" fill="none" {...stroke} />
      <ellipse cx="26" cy="47" rx="7" ry="2.5" fill={P.cream} opacity={0.6} />
    </g>
  )
}

function Wok() {
  return (
    <g>
      <path d="M12 30c-2 12 6 22 20 22s22-10 20-22z" fill={B} {...stroke} />
      <path d="M12 30h40" fill="none" {...stroke} />
      <path d="M50 30l10-9" fill="none" {...stroke} strokeWidth={4.5} />
      <path d="M16 29c2-5 7-7 16-7s14 2 16 7" fill={P.mustard} {...stroke} />
      <path d="M20 27c3-2 5 1 8-1s5 1 8-1 5 1 7-1" fill="none" {...stroke} strokeWidth={2.4} />
      <circle cx="26" cy="24" r="2.2" fill={P.tomato} />
      <circle cx="38" cy="25" r="2.2" fill={P.pandan} />
      <path d="M22 60c-1-3 2-4 1-7 3 2 4 5 3 7M32 61c-2-3 2-5 0-8 3 1 5 5 4 8M42 60c-1-3 2-4 1-7 3 2 4 5 3 7" fill={P.tomato} {...stroke} strokeWidth={2.4} />
    </g>
  )
}

function Bowl() {
  return (
    <g>
      <Steam />
      <path d="M8 33c-.3 12 8 21 24 21s24.4-9 24-21z" fill={P.teal} {...stroke} />
      <path d="M8 33h48" fill="none" {...stroke} />
      <path d="M14 33c1-5 6-8 18-8s17 3 18 8" fill={P.mustard} {...stroke} />
      <circle cx="24" cy="30" r="4" fill={P.white} {...stroke} strokeWidth={2.6} />
      <circle cx="36" cy="29" r="4" fill={P.white} {...stroke} strokeWidth={2.6} />
      <path d="M44 20l10-10" fill="none" {...stroke} />
      <ellipse cx="46" cy="16" rx="4.5" ry="3" transform="rotate(-45 46 16)" fill={P.cream} {...stroke} strokeWidth={2.6} />
      <path d="M14 42h36" fill="none" stroke={P.cream} strokeWidth={2.6} opacity={0.6} strokeLinecap="round" />
    </g>
  )
}

function Prawn() {
  return (
    <g>
      <path d="M14 14c8-4 14 2 14 10M18 12c8-3 15 4 14 13" fill="none" {...stroke} strokeWidth={2.6} />
      <path d="M12 42c0-14 12-22 24-18 12 4 14 18 8 26-3 5-9 6-13 3 3-2 5-5 3-9-2 3-6 5-10 3 2-3 3-6 0-9-3 2-7 3-10 1z" fill={P.tomato} {...stroke} />
      <path d="M22 30c6-2 11 0 14 5M26 26c6-2 12 1 14 7" fill="none" {...stroke} strokeWidth={2.4} opacity={0.7} />
      <circle cx="18" cy="35" r="2.4" fill={B} />
      <path d="M44 50c3 3 8 4 12 2M46 44c4 1 8 1 11-1" fill="none" {...stroke} strokeWidth={2.6} />
    </g>
  )
}

function Claypot() {
  return (
    <g>
      <Steam y={12} />
      <path d="M12 30h40c1 12-4 24-20 24S11 42 12 30z" fill={P.brownLight} {...stroke} />
      <path d="M10 30c0-4 5-6 22-6s22 2 22 6-5 5-22 5-22-1-22-5z" fill={B} {...stroke} />
      <path d="M18 24c1-3 5-4 14-4s13 1 14 4" fill={P.tomato} {...stroke} />
      <path d="M32 13v7" fill="none" {...stroke} strokeWidth={4} />
      <circle cx="32" cy="13" r="3" fill={P.mustard} {...stroke} strokeWidth={2.6} />
      <path d="M6 33c-4 2-4 6 0 7M58 33c4 2 4 6 0 7" fill="none" {...stroke} />
      <path d="M20 44c4 2 20 2 24 0" fill="none" stroke={P.cream} strokeWidth={2.4} opacity={0.5} strokeLinecap="round" />
    </g>
  )
}

function Duck() {
  return (
    <g>
      <ellipse cx="32" cy="49" rx="26" ry="8" fill={P.white} {...stroke} />
      <path d="M12 44c4-8 14-14 26-12s16 8 14 14z" fill={P.mustard} {...stroke} />
      <path d="M22 41c6-8 18-11 26-8" fill="none" {...stroke} strokeWidth={2.4} opacity={0.6} />
      <path d="M30 32c-2-8 2-14 8-16 5-2 10 1 10 6 0 4-3 6-5 8" fill={P.tomato} {...stroke} />
      <path d="M43 22l7-3M46 27l7-1" fill="none" {...stroke} strokeWidth={2.4} />
      <path d="M22 50c3-2 6-1 8 1M36 51c3-2 6-1 8 1" fill="none" {...stroke} strokeWidth={2.4} />
      <path d="M16 36c-5 2-8 5-8 8" fill="none" {...stroke} strokeWidth={2.4} />
    </g>
  )
}

function Skewer() {
  return (
    <g>
      <path d="M10 56L54 12" fill="none" {...stroke} strokeWidth={3.6} />
      <path d="M19 42c3-4 8-4 11 0 3 4 1 9-3 10-4 1-9-1-9-5 0-2 0-3 1-5z" fill={P.tomato} {...stroke} />
      <path d="M29 32c3-4 8-4 11 0 3 4 1 9-3 10-4 1-9-1-9-5 0-2 0-3 1-5z" fill={P.brownLight} {...stroke} />
      <path d="M39 22c3-4 8-4 11 0 3 4 1 9-3 10-4 1-9-1-9-5 0-2 0-3 1-5z" fill={P.tomato} {...stroke} />
      <path d="M8 60l-3 3" fill="none" {...stroke} strokeWidth={3.6} />
      <path d="M14 22c-1-3 2-4 1-7 3 2 4 5 3 7M8 32c-1-3 2-4 1-7 3 2 4 5 3 7" fill={P.mustard} {...stroke} strokeWidth={2.4} />
    </g>
  )
}

function Rojak() {
  return (
    <g>
      <ellipse cx="32" cy="46" rx="26" ry="9" fill={P.white} {...stroke} />
      <path d="M12 42c2-8 10-14 20-14s18 6 20 14z" fill={P.brownLight} {...stroke} />
      <circle cx="24" cy="36" r="5" fill={P.pandan} {...stroke} strokeWidth={2.6} />
      <circle cx="24" cy="36" r="2" fill={P.cream} />
      <path d="M32 28c3-3 8-3 10 1 2 4-2 7-6 6" fill={P.mustard} {...stroke} strokeWidth={2.6} />
      <path d="M36 36c3-1 7 1 7 4" fill={P.pink} {...stroke} strokeWidth={2.6} />
      <path d="M44 12l-8 18" fill="none" {...stroke} strokeWidth={3.2} />
      <path d="M22 44c4 1 16 1 20 0" fill="none" {...stroke} strokeWidth={2.4} opacity={0.6} />
    </g>
  )
}

function Dessert() {
  return (
    <g>
      <path d="M14 22h36l-5 30c-.5 3-3 5-6 5H25c-3 0-5.5-2-6-5z" fill={P.mustard} {...stroke} />
      <path d="M12 22h40" fill="none" {...stroke} />
      <rect x="22" y="12" width="9" height="9" rx="2" transform="rotate(-10 26 16)" fill={P.mustard} {...stroke} strokeWidth={2.6} />
      <rect x="34" y="11" width="9" height="9" rx="2" transform="rotate(12 38 15)" fill={P.mustard} {...stroke} strokeWidth={2.6} />
      <circle cx="24" cy="36" r="2.6" fill={P.white} {...stroke} strokeWidth={2.2} />
      <circle cx="34" cy="42" r="2.6" fill={P.white} {...stroke} strokeWidth={2.2} />
      <circle cx="40" cy="32" r="2.6" fill={P.white} {...stroke} strokeWidth={2.2} />
      <path d="M50 10l-6 30" fill="none" {...stroke} strokeWidth={3} />
      <ellipse cx="51" cy="10" rx="4" ry="5" transform="rotate(10 51 10)" fill={P.teal} {...stroke} strokeWidth={2.4} />
    </g>
  )
}

function CarrotCake() {
  return (
    <g>
      <ellipse cx="32" cy="48" rx="26" ry="8" fill={P.white} {...stroke} />
      <path d="M14 44c1-8 8-14 18-14s17 6 18 14z" fill={P.brownLight} {...stroke} />
      <path d="M16 34l6-6 8 3 6-5 8 4 6 2" fill="none" {...stroke} strokeWidth={2.4} opacity={0.5} />
      <path d="M20 40c3-2 5 1 8-1s5 1 8-1" fill={P.mustard} {...stroke} strokeWidth={2.4} />
      <circle cx="40" cy="38" r="3" fill={P.mustard} {...stroke} strokeWidth={2.4} />
      <circle cx="24" cy="35" r="2.6" fill={P.pandan} {...stroke} strokeWidth={2.4} />
      <path d="M50 10v14M46 10v8M54 10v8M46 18c0 3 2 4 4 4s4-1 4-4" fill="none" {...stroke} strokeWidth={2.8} />
      <path d="M50 24l-3 20" fill="none" {...stroke} strokeWidth={2.8} />
    </g>
  )
}

const ICONS: Record<IllustrationKey, () => JSX.Element> = {
  noodles: Noodles,
  wok: Wok,
  bowl: Bowl,
  prawn: Prawn,
  claypot: Claypot,
  duck: Duck,
  skewer: Skewer,
  rojak: Rojak,
  dessert: Dessert,
  carrotcake: CarrotCake,
}

export function FoodIcon({ name, className, title }: { name: IllustrationKey; className?: string; title?: string }) {
  const Icon = ICONS[name] ?? Bowl
  return (
    <svg viewBox="0 0 64 64" className={className} role={title ? 'img' : 'presentation'} aria-hidden={title ? undefined : true}>
      {title && <title>{title}</title>}
      <Icon />
    </svg>
  )
}

/** A little bowl-with-a-face mascot for empty/error states. */
export function BowlFace({ mood, className }: { mood: 'happy' | 'sad' | 'sleepy' | 'shrug'; className?: string }) {
  const mouth =
    mood === 'happy' ? 'M24 40c3 5 13 5 16 0'
    : mood === 'sad' ? 'M24 44c3-5 13-5 16 0'
    : mood === 'sleepy' ? 'M27 42h10'
    : 'M25 42c3-3 6 2 9 0s4 1 5 0'
  const eyes =
    mood === 'sleepy' ? <path d="M22 34c2-2 5-2 7 0M35 34c2-2 5-2 7 0" fill="none" {...stroke} strokeWidth={2.8} />
    : <g><circle cx="25" cy="34" r="2.6" fill={B} /><circle cx="39" cy="34" r="2.6" fill={B} /></g>
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      {mood !== 'sad' && <Steam y={10} />}
      <path d="M8 28c-.3 14 8 24 24 24s24.4-10 24-24z" fill={P.teal} {...stroke} />
      <path d="M8 28h48" fill="none" {...stroke} />
      <path d="M14 28c1-5 6-8 18-8s17 3 18 8" fill={P.mustard} {...stroke} />
      {eyes}
      <path d={mouth} fill="none" {...stroke} strokeWidth={2.8} />
      {mood === 'sad' && <path d="M44 38c0 3 3 4 3 7s-3 3-3 0" fill={P.teal} {...stroke} strokeWidth={2} />}
      <circle cx="19" cy="40" r="2.5" fill={P.pink} opacity={0.7} />
      <circle cx="45" cy="40" r="2.5" fill={P.pink} opacity={0.7} />
    </svg>
  )
}

export function Star({ fill }: { fill: 'full' | 'half' | 'empty' }) {
  const id = `half-${Math.random().toString(36).slice(2, 7)}`
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {fill === 'half' && (
        <defs>
          <linearGradient id={id}>
            <stop offset="50%" stopColor={P.mustard} />
            <stop offset="50%" stopColor="#fff" />
          </linearGradient>
        </defs>
      )}
      <path
        d="M12 2.5l2.9 6.2 6.7.8-5 4.6 1.4 6.7L12 17.4l-6 3.4 1.4-6.7-5-4.6 6.7-.8z"
        fill={fill === 'full' ? P.mustard : fill === 'half' ? `url(#${id})` : '#fff'}
        stroke={B}
        strokeWidth={2}
        strokeLinejoin="round"
      />
    </svg>
  )
}
