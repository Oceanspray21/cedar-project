import { describe, test, expect } from 'vitest'
import { pushCommand, undo, redo, emptyHistory, type History } from './history'
import { addVoxel, addVoxels, type VoxelMap } from './voxelStore'

const empty: VoxelMap = new Map()
const voxelA = { x: 0, y: 0, z: 0, color: '#ff0000' }
const voxelB = { x: 1, y: 0, z: 0, color: '#0000ff' }
const voxelsBatch = [
  { x: 0, y: 0, z: 0, color: '#fff' },
  { x: 1, y: 0, z: 0, color: '#f00' },
  { x: 0, y: 1, z: 0, color: '#0f0' },
]

describe('pushCommand', () => {
  test('adds command to past', () => {
    const h = pushCommand(emptyHistory, { type: 'add', voxel: voxelA })
    expect(h.past).toHaveLength(1)
    expect(h.past[0]).toEqual({ type: 'add', voxel: voxelA })
  })

  test('clears the future stack on new action', () => {
    // Simulate: add A, undo, then push a new command
    const h = pushCommand(emptyHistory, { type: 'add', voxel: voxelA })
    const map = addVoxel(empty, voxelA)
    const { history: undone } = undo(h, map)
    expect(undone.future).toHaveLength(1)

    const h2 = pushCommand(undone, { type: 'add', voxel: voxelB })
    expect(h2.future).toHaveLength(0)
  })
})

describe('undo', () => {
  test('undo after add removes the voxel', () => {
    const h = pushCommand(emptyHistory, { type: 'add', voxel: voxelA })
    const map = addVoxel(empty, voxelA)
    const { voxels: result } = undo(h, map)
    expect(result.size).toBe(0)
  })

  test('undo moves command from past to future', () => {
    const h = pushCommand(emptyHistory, { type: 'add', voxel: voxelA })
    const map = addVoxel(empty, voxelA)
    const { history } = undo(h, map)
    expect(history.past).toHaveLength(0)
    expect(history.future).toHaveLength(1)
    expect(history.future[0]).toEqual({ type: 'add', voxel: voxelA })
  })

  test('undo after remove re-adds the voxel', () => {
    const h = pushCommand(emptyHistory, { type: 'remove', voxel: voxelA })
    const { voxels: result } = undo(h, empty)
    expect(result.size).toBe(1)
    expect(result.get('0,0,0')).toEqual(voxelA)
  })

  test('undo on empty history is a no-op', () => {
    const map = addVoxel(empty, voxelA)
    const { history, voxels } = undo(emptyHistory, map)
    expect(history).toEqual(emptyHistory)
    expect(voxels.size).toBe(1)
  })

  test('multiple undos work sequentially', () => {
    let h: History = emptyHistory
    let map = empty
    h = pushCommand(h, { type: 'add', voxel: voxelA })
    map = addVoxel(map, voxelA)
    h = pushCommand(h, { type: 'add', voxel: voxelB })
    map = addVoxel(map, voxelB)

    ;({ history: h, voxels: map } = undo(h, map))
    expect(map.size).toBe(1)
    ;({ history: h, voxels: map } = undo(h, map))
    expect(map.size).toBe(0)
  })
})

describe('redo', () => {
  test('redo after undo re-places the voxel', () => {
    let h = pushCommand(emptyHistory, { type: 'add', voxel: voxelA })
    let map = addVoxel(empty, voxelA)
    ;({ history: h, voxels: map } = undo(h, map))
    expect(map.size).toBe(0)
    ;({ history: h, voxels: map } = redo(h, map))
    expect(map.size).toBe(1)
  })

  test('redo moves command back from future to past', () => {
    let h = pushCommand(emptyHistory, { type: 'add', voxel: voxelA })
    let map = addVoxel(empty, voxelA)
    ;({ history: h, voxels: map } = undo(h, map))
    ;({ history: h } = redo(h, map))
    expect(h.past).toHaveLength(1)
    expect(h.future).toHaveLength(0)
  })

  test('redo on empty future is a no-op', () => {
    const map = addVoxel(empty, voxelA)
    const { history, voxels } = redo(emptyHistory, map)
    expect(history).toEqual(emptyHistory)
    expect(voxels.size).toBe(1)
  })

  test('recolor: undo restores previous color, redo reapplies', () => {
    const voxelOrig = { x: 0, y: 0, z: 0, color: '#ff0000' }
    const voxelNew = { x: 0, y: 0, z: 0, color: '#00ff00' }
    let h = pushCommand(emptyHistory, { type: 'recolor', voxel: voxelNew, previousColor: voxelOrig.color })
    let map = addVoxel(empty, voxelNew)
    expect(map.get('0,0,0')?.color).toBe('#00ff00')
    ;({ history: h, voxels: map } = undo(h, map))
    expect(map.get('0,0,0')?.color).toBe('#ff0000')
    ;({ history: h, voxels: map } = redo(h, map))
    expect(map.get('0,0,0')?.color).toBe('#00ff00')
  })

  test('batch_add: undo removes all voxels, redo restores them', () => {
    let h = pushCommand(emptyHistory, { type: 'batch_add', voxels: voxelsBatch })
    let map = addVoxels(empty, voxelsBatch)
    expect(map.size).toBe(3)
    ;({ history: h, voxels: map } = undo(h, map))
    expect(map.size).toBe(0)
    ;({ history: h, voxels: map } = redo(h, map))
    expect(map.size).toBe(3)
  })

  test('new action after undo clears future and prevents redo', () => {
    let h = pushCommand(emptyHistory, { type: 'add', voxel: voxelA })
    let map = addVoxel(empty, voxelA)
    ;({ history: h, voxels: map } = undo(h, map))
    // New action
    h = pushCommand(h, { type: 'add', voxel: voxelB })
    map = addVoxel(map, voxelB)
    expect(h.future).toHaveLength(0)
    // Redo should be no-op
    const { voxels: after } = redo(h, map)
    expect(after.size).toBe(map.size)
  })
})
