import type { Voxel } from './voxelStore'

/** Pre-defined voxel structures. All centered near origin. */
export const PRESETS: Record<string, Voxel[]> = {
  house: [
    // 3×3 base (foundation)
    { x: -1, y: 0, z: -1, color: '#666666' }, { x: 0, y: 0, z: -1, color: '#666666' }, { x: 1, y: 0, z: -1, color: '#666666' },
    { x: -1, y: 0, z: 0, color: '#666666' },  { x: 0, y: 0, z: 0, color: '#666666' },  { x: 1, y: 0, z: 0, color: '#666666' },
    { x: -1, y: 0, z: 1, color: '#666666' },  { x: 0, y: 0, z: 1, color: '#666666' },  { x: 1, y: 0, z: 1, color: '#666666' },
    // 3×3 body (walls)
    { x: -1, y: 1, z: -1, color: '#FFFFFF' }, { x: 0, y: 1, z: -1, color: '#FFFFFF' }, { x: 1, y: 1, z: -1, color: '#FFFFFF' },
    { x: -1, y: 1, z: 0, color: '#FFFFFF' },  { x: 0, y: 1, z: 0, color: '#FFFFFF' },  { x: 1, y: 1, z: 0, color: '#FFFFFF' },
    { x: -1, y: 1, z: 1, color: '#FFFFFF' },  { x: 0, y: 1, z: 1, color: '#FFFFFF' },  { x: 1, y: 1, z: 1, color: '#FFFFFF' },
    // Staircase roof — stepped pyramid (brown)
    { x: -1, y: 2, z: -1, color: '#884422' }, { x: 0, y: 2, z: -1, color: '#884422' }, { x: 1, y: 2, z: -1, color: '#884422' },
    { x: -1, y: 2, z: 0, color: '#884422' },  { x: 0, y: 2, z: 0, color: '#884422' },  { x: 1, y: 2, z: 0, color: '#884422' },
    { x: -1, y: 2, z: 1, color: '#884422' },  { x: 0, y: 2, z: 1, color: '#884422' },  { x: 1, y: 2, z: 1, color: '#884422' },
    { x: 0, y: 3, z: -1, color: '#996633' },  { x: 0, y: 3, z: 0, color: '#996633' },  { x: 0, y: 3, z: 1, color: '#996633' },
    { x: 0, y: 4, z: 0, color: '#AA7744' },
  ],
  pyramid: [
    // Base layer 5×5 (y=0)
    { x: -2, y: 0, z: -2, color: '#BB9955' }, { x: -1, y: 0, z: -2, color: '#BB9955' }, { x: 0, y: 0, z: -2, color: '#BB9955' }, { x: 1, y: 0, z: -2, color: '#BB9955' }, { x: 2, y: 0, z: -2, color: '#BB9955' },
    { x: -2, y: 0, z: -1, color: '#BB9955' }, { x: -1, y: 0, z: -1, color: '#BB9955' }, { x: 0, y: 0, z: -1, color: '#BB9955' }, { x: 1, y: 0, z: -1, color: '#BB9955' }, { x: 2, y: 0, z: -1, color: '#BB9955' },
    { x: -2, y: 0, z: 0, color: '#BB9955' },  { x: -1, y: 0, z: 0, color: '#BB9955' },  { x: 0, y: 0, z: 0, color: '#BB9955' },  { x: 1, y: 0, z: 0, color: '#BB9955' },  { x: 2, y: 0, z: 0, color: '#BB9955' },
    { x: -2, y: 0, z: 1, color: '#BB9955' },  { x: -1, y: 0, z: 1, color: '#BB9955' },  { x: 0, y: 0, z: 1, color: '#BB9955' },  { x: 1, y: 0, z: 1, color: '#BB9955' },  { x: 2, y: 0, z: 1, color: '#BB9955' },
    { x: -2, y: 0, z: 2, color: '#BB9955' },  { x: -1, y: 0, z: 2, color: '#BB9955' },  { x: 0, y: 0, z: 2, color: '#BB9955' },  { x: 1, y: 0, z: 2, color: '#BB9955' },  { x: 2, y: 0, z: 2, color: '#BB9955' },
    // Layer 3×3 (y=1)
    { x: -1, y: 1, z: -1, color: '#CCAA66' }, { x: 0, y: 1, z: -1, color: '#CCAA66' }, { x: 1, y: 1, z: -1, color: '#CCAA66' },
    { x: -1, y: 1, z: 0, color: '#CCAA66' },  { x: 0, y: 1, z: 0, color: '#CCAA66' },  { x: 1, y: 1, z: 0, color: '#CCAA66' },
    { x: -1, y: 1, z: 1, color: '#CCAA66' },  { x: 0, y: 1, z: 1, color: '#CCAA66' },  { x: 1, y: 1, z: 1, color: '#CCAA66' },
    // Top (y=2)
    { x: 0, y: 2, z: 0, color: '#DDAA77' },
  ],
  tower: [
    // Base (wider)
    { x: -1, y: 0, z: -1, color: '#555555' }, { x: 0, y: 0, z: -1, color: '#555555' }, { x: 1, y: 0, z: -1, color: '#555555' },
    { x: -1, y: 0, z: 0, color: '#555555' },  { x: 0, y: 0, z: 0, color: '#555555' },  { x: 1, y: 0, z: 0, color: '#555555' },
    { x: -1, y: 0, z: 1, color: '#555555' },  { x: 0, y: 0, z: 1, color: '#555555' },  { x: 1, y: 0, z: 1, color: '#555555' },
    // Shaft (narrower)
    { x: 0, y: 1, z: 0, color: '#666666' }, { x: 1, y: 1, z: 0, color: '#666666' },
    { x: 0, y: 1, z: 1, color: '#666666' }, { x: 1, y: 1, z: 1, color: '#666666' },
    { x: 0, y: 2, z: 0, color: '#777777' }, { x: 1, y: 2, z: 0, color: '#777777' },
    { x: 0, y: 2, z: 1, color: '#777777' }, { x: 1, y: 2, z: 1, color: '#777777' },
    { x: 0, y: 3, z: 0, color: '#888888' }, { x: 1, y: 3, z: 0, color: '#888888' },
    { x: 0, y: 3, z: 1, color: '#888888' }, { x: 1, y: 3, z: 1, color: '#888888' },
    // Spire
    { x: 0, y: 4, z: 0, color: '#FF6B35' }, { x: 0, y: 5, z: 0, color: '#FF8844' },
  ],
  stairs: [
    { x: 0, y: 0, z: 0, color: '#888888' }, { x: 1, y: 0, z: 0, color: '#888888' },
    { x: 0, y: 1, z: 1, color: '#888888' }, { x: 1, y: 1, z: 1, color: '#888888' },
    { x: 0, y: 2, z: 2, color: '#888888' }, { x: 1, y: 2, z: 2, color: '#888888' },
    { x: 0, y: 3, z: 3, color: '#888888' }, { x: 1, y: 3, z: 3, color: '#888888' },
  ],
  tree: [
    // Trunk (brown)
    { x: 0, y: 0, z: 0, color: '#664422' }, { x: 0, y: 1, z: 0, color: '#774433' },
    // Foliage - layered canopy (green)
    { x: -1, y: 2, z: -1, color: '#228822' }, { x: 0, y: 2, z: -1, color: '#33AA33' }, { x: 1, y: 2, z: -1, color: '#228822' },
    { x: -1, y: 2, z: 0, color: '#33AA33' },  { x: 0, y: 2, z: 0, color: '#228822' },  { x: 1, y: 2, z: 0, color: '#33AA33' },
    { x: -1, y: 2, z: 1, color: '#228822' },  { x: 0, y: 2, z: 1, color: '#33AA33' },  { x: 1, y: 2, z: 1, color: '#228822' },
    { x: 0, y: 3, z: -1, color: '#33AA33' }, { x: -1, y: 3, z: 0, color: '#228822' }, { x: 0, y: 3, z: 0, color: '#33AA33' }, { x: 1, y: 3, z: 0, color: '#228822' }, { x: 0, y: 3, z: 1, color: '#33AA33' },
    { x: 0, y: 4, z: 0, color: '#228822' },
  ],
  wall: [
    { x: -2, y: 0, z: 0, color: '#888888' }, { x: -1, y: 0, z: 0, color: '#888888' },
    { x: 0, y: 0, z: 0, color: '#888888' },  { x: 1, y: 0, z: 0, color: '#888888' },
    { x: 2, y: 0, z: 0, color: '#888888' },
    { x: -2, y: 1, z: 0, color: '#999999' }, { x: -1, y: 1, z: 0, color: '#999999' },
    { x: 0, y: 1, z: 0, color: '#999999' },  { x: 1, y: 1, z: 0, color: '#999999' },
    { x: 2, y: 1, z: 0, color: '#999999' },
  ],
  platform: [
    { x: -1, y: 0, z: -1, color: '#666666' }, { x: 0, y: 0, z: -1, color: '#666666' }, { x: 1, y: 0, z: -1, color: '#666666' },
    { x: -1, y: 0, z: 0, color: '#666666' },  { x: 0, y: 0, z: 0, color: '#666666' },  { x: 1, y: 0, z: 0, color: '#666666' },
    { x: -1, y: 0, z: 1, color: '#666666' },  { x: 0, y: 0, z: 1, color: '#666666' },  { x: 1, y: 0, z: 1, color: '#666666' },
  ],
  bridge: [
    { x: -2, y: 0, z: 0, color: '#884422' }, { x: -1, y: 0, z: 0, color: '#884422' },
    { x: 0, y: 0, z: 0, color: '#884422' },  { x: 1, y: 0, z: 0, color: '#884422' },
    { x: 2, y: 0, z: 0, color: '#884422' },
    { x: -1, y: 1, z: 0, color: '#996633' }, { x: 0, y: 1, z: 0, color: '#996633' }, { x: 1, y: 1, z: 0, color: '#996633' },
    { x: 0, y: 2, z: 0, color: '#AA7744' },
  ],
  line: [
    { x: -2, y: 0, z: 0, color: '#FF6B35' }, { x: -1, y: 0, z: 0, color: '#FF6B35' },
    { x: 0, y: 0, z: 0, color: '#FF6B35' },  { x: 1, y: 0, z: 0, color: '#FF6B35' },
    { x: 2, y: 0, z: 0, color: '#FF6B35' },
  ],
  pillar: [
    { x: 0, y: 0, z: 0, color: '#FF6B35' }, { x: 0, y: 1, z: 0, color: '#FF6B35' },
    { x: 0, y: 2, z: 0, color: '#FF6B35' }, { x: 0, y: 3, z: 0, color: '#FF6B35' },
    { x: 0, y: 4, z: 0, color: '#FF6B35' },
  ],
}

/** Preset IDs in display order */
export const PRESET_IDS = ['tree', 'house', 'pyramid', 'tower', 'stairs', 'wall', 'platform', 'bridge', 'line', 'pillar'] as const

/** Apply a single color to a preset's voxels */
export function presetWithColor(presetId: string, color: string): Voxel[] | null {
  const voxels = PRESETS[presetId]
  if (!voxels) return null
  return voxels.map(v => ({ ...v, color }))
}

/** Keywords that map to each preset (first match wins) */
const KEYWORDS: Record<string, string[]> = {
  house: ['house', 'home', 'building'],
  pyramid: ['pyramid'],
  tower: ['tower', 'tall', 'skyscraper'],
  stairs: ['stairs', 'steps', 'staircase'],
  tree: ['tree'],
  wall: ['wall'],
  platform: ['platform', 'floor', 'pad'],
  bridge: ['bridge'],
  line: ['line', 'row'],
  pillar: ['pillar', 'column'],
}

function normalizeInput(s: string): string {
  return s.toLowerCase().replace(/\s+/g, ' ').trim()
}

export type PresetResult = { ok: true; voxels: Voxel[] } | { ok: false; error: string }

/** Match text to a preset. Returns voxels or error. */
export function generateFromKeywords(text: string): PresetResult {
  const input = normalizeInput(text)
  if (!input) return { ok: false, error: 'Enter a shape (e.g. house, pyramid, tower)' }

  for (const [presetId, keywords] of Object.entries(KEYWORDS)) {
    if (keywords.some(kw => input.includes(kw))) {
      const voxels = PRESETS[presetId]
      if (voxels) return { ok: true, voxels }
    }
  }

  const suggestions = Object.keys(PRESETS).slice(0, 6).join(', ')
  return { ok: false, error: `Try: ${suggestions}...` }
}
