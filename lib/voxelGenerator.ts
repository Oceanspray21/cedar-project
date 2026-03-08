import type { Voxel } from './voxelStore'

/** Normalize a value to a valid voxel shape. Handles array [x,y,z,color] or object {x,y,z,color}. */
function normalizeVoxel(item: unknown): Voxel | null {
  if (Array.isArray(item)) {
    const [x, y, z, color] = item
    if (
      typeof x === 'number' &&
      typeof y === 'number' &&
      typeof z === 'number' &&
      typeof color === 'string'
    ) {
      return { x: Math.round(x), y: Math.round(y), z: Math.round(z), color }
    }
    return null
  }
  if (item && typeof item === 'object' && 'x' in item && 'y' in item && 'z' in item) {
    const o = item as Record<string, unknown>
    const x = Number(o.x)
    const y = Number(o.y)
    const z = Number(o.z)
    const color = typeof o.color === 'string' ? o.color : '#FF6B35'
    if (!Number.isNaN(x) && !Number.isNaN(y) && !Number.isNaN(z)) {
      return { x: Math.round(x), y: Math.round(y), z: Math.round(z), color }
    }
  }
  return null
}

export type GenerateResult =
  | { ok: true; voxels: Voxel[] }
  | { ok: false; error: string }

/**
 * Generate voxels from JavaScript/TypeScript code.
 * Code must evaluate to an array of voxels.
 * Each voxel: { x, y, z, color } or [x, y, z, color]
 *
 * Examples:
 *   [{x:0,y:0,z:0,color:'#ff0000'}, {x:1,y:0,z:0,color:'#00ff00'}]
 *   (function(){ const v=[]; for(let i=0;i<5;i++) v.push({x:i,y:0,z:0,color:'#FF6B35'}); return v; })()
 */
export function generateFromCode(code: string): GenerateResult {
  if (!code.trim()) {
    return { ok: false, error: 'Empty input' }
  }
  try {
    const fn = new Function(`return (${code.trim()})`)
    const raw = fn()
    if (!Array.isArray(raw)) {
      return { ok: false, error: 'Code must return an array of voxels' }
    }
    const voxels: Voxel[] = []
    for (let i = 0; i < raw.length; i++) {
      const v = normalizeVoxel(raw[i])
      if (v) voxels.push(v)
    }
    if (voxels.length === 0 && raw.length > 0) {
      return { ok: false, error: 'No valid voxels found. Each item needs x, y, z, and color.' }
    }
    return { ok: true, voxels }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return { ok: false, error: msg }
  }
}

/**
 * Generate voxels from a text description via AI (Google Gemini).
 * Calls /api/generate-voxels. Requires GOOGLE_GENERATIVE_AI_API_KEY on the server.
 */
export async function generateFromText(text: string): Promise<GenerateResult> {
  if (!text.trim()) {
    return { ok: false, error: 'Empty description' }
  }
  try {
    const res = await fetch('/api/generate-voxels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: text.trim() }),
    })
    let data: unknown
    try {
      data = await res.json()
    } catch {
      return { ok: false, error: `Server error (${res.status}). Try again.` }
    }
    if (!res.ok) {
      const errMsg = data && typeof data === 'object' && 'error' in data && typeof (data as { error: unknown }).error === 'string'
        ? (data as { error: string }).error
        : `Request failed: ${res.status}`
      return { ok: false, error: errMsg }
    }
    if (!data || typeof data !== 'object' || !('voxels' in data) || !Array.isArray((data as { voxels: unknown }).voxels)) {
      return { ok: false, error: 'Invalid response from server' }
    }
    const rawVoxels = (data as { voxels: unknown[] }).voxels
    const voxels: Voxel[] = []
    for (const item of rawVoxels) {
      const v = normalizeVoxel(item)
      if (v) voxels.push(v)
    }
    if (voxels.length === 0) {
      return { ok: false, error: 'No valid voxels in response. Try a simpler description.' }
    }
    return { ok: true, voxels }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
      return { ok: false, error: 'Network error. Is the dev server running?' }
    }
    return { ok: false, error: msg }
  }
}
