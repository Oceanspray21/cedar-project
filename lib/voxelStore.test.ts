import { describe, test, expect } from 'vitest'
import {
  addVoxel,
  removeVoxel,
  hasVoxel,
  getVoxel,
  listVoxels,
  voxelKey,
  type VoxelMap,
} from './voxelStore'

const empty: VoxelMap = new Map()

describe('voxelKey', () => {
  test('produces a consistent string key', () => {
    expect(voxelKey(1, 2, 3)).toBe('1,2,3')
    expect(voxelKey(0, 0, 0)).toBe('0,0,0')
    expect(voxelKey(-1, 5, -3)).toBe('-1,5,-3')
  })
})

describe('addVoxel', () => {
  test('creates a new entry at the correct key', () => {
    const map = addVoxel(empty, { x: 1, y: 2, z: 3, color: '#ff0000' })
    expect(map.size).toBe(1)
    expect(map.get('1,2,3')).toEqual({ x: 1, y: 2, z: 3, color: '#ff0000' })
  })

  test('does not mutate the original map', () => {
    const original = new Map(empty)
    addVoxel(original, { x: 0, y: 0, z: 0, color: '#fff' })
    expect(original.size).toBe(0)
  })

  test('key collision: adding same position updates the color', () => {
    const map1 = addVoxel(empty, { x: 0, y: 0, z: 0, color: '#ff0000' })
    const map2 = addVoxel(map1, { x: 0, y: 0, z: 0, color: '#0000ff' })
    expect(map2.size).toBe(1)
    expect(map2.get('0,0,0')?.color).toBe('#0000ff')
  })

  test('multiple voxels accumulate correctly', () => {
    let map = empty
    map = addVoxel(map, { x: 0, y: 0, z: 0, color: '#fff' })
    map = addVoxel(map, { x: 1, y: 0, z: 0, color: '#fff' })
    map = addVoxel(map, { x: 0, y: 1, z: 0, color: '#fff' })
    expect(map.size).toBe(3)
  })
})

describe('removeVoxel', () => {
  test('removes the entry at the given position', () => {
    const map = addVoxel(empty, { x: 1, y: 2, z: 3, color: '#fff' })
    const result = removeVoxel(map, 1, 2, 3)
    expect(result.size).toBe(0)
  })

  test('does not mutate the original map', () => {
    const map = addVoxel(empty, { x: 0, y: 0, z: 0, color: '#fff' })
    removeVoxel(map, 0, 0, 0)
    expect(map.size).toBe(1)
  })

  test('removing a non-existent position is a no-op', () => {
    const map = addVoxel(empty, { x: 0, y: 0, z: 0, color: '#fff' })
    const result = removeVoxel(map, 9, 9, 9)
    expect(result.size).toBe(1)
  })

  test('only removes the targeted voxel', () => {
    let map = addVoxel(empty, { x: 0, y: 0, z: 0, color: '#fff' })
    map = addVoxel(map, { x: 1, y: 0, z: 0, color: '#fff' })
    const result = removeVoxel(map, 0, 0, 0)
    expect(result.size).toBe(1)
    expect(result.has('1,0,0')).toBe(true)
  })
})

describe('hasVoxel', () => {
  test('returns false for an empty map', () => {
    expect(hasVoxel(empty, 0, 0, 0)).toBe(false)
  })

  test('returns true when voxel exists', () => {
    const map = addVoxel(empty, { x: 5, y: 0, z: 5, color: '#fff' })
    expect(hasVoxel(map, 5, 0, 5)).toBe(true)
  })

  test('returns false for a different position', () => {
    const map = addVoxel(empty, { x: 1, y: 0, z: 0, color: '#fff' })
    expect(hasVoxel(map, 0, 0, 0)).toBe(false)
  })
})

describe('getVoxel', () => {
  test('returns the voxel data', () => {
    const map = addVoxel(empty, { x: 2, y: 3, z: 4, color: '#123456' })
    expect(getVoxel(map, 2, 3, 4)).toEqual({ x: 2, y: 3, z: 4, color: '#123456' })
  })

  test('returns undefined for missing position', () => {
    expect(getVoxel(empty, 0, 0, 0)).toBeUndefined()
  })
})

describe('listVoxels', () => {
  test('returns empty array for empty map', () => {
    expect(listVoxels(empty)).toEqual([])
  })

  test('returns all voxels', () => {
    let map = addVoxel(empty, { x: 0, y: 0, z: 0, color: '#fff' })
    map = addVoxel(map, { x: 1, y: 0, z: 0, color: '#f00' })
    const result = listVoxels(map)
    expect(result).toHaveLength(2)
  })
})
