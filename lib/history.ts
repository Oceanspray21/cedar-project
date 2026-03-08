import { addVoxel, removeVoxel, addVoxels, type Voxel, type VoxelMap } from './voxelStore'

export type Command =
  | { type: 'add'; voxel: Voxel }
  | { type: 'remove'; voxel: Voxel }
  | { type: 'batch_add'; voxels: Voxel[] }
  | { type: 'recolor'; voxel: Voxel; previousColor: string }

export type History = {
  past: Command[]
  future: Command[]
}

export const emptyHistory: History = { past: [], future: [] }

export function pushCommand(history: History, command: Command): History {
  return {
    past: [...history.past, command],
    future: [], // new action clears redo stack
  }
}

export function undo(
  history: History,
  voxels: VoxelMap,
): { history: History; voxels: VoxelMap } {
  if (history.past.length === 0) return { history, voxels }

  const command = history.past[history.past.length - 1]
  const newPast = history.past.slice(0, -1)

  let newVoxels: VoxelMap
  if (command.type === 'add') {
    newVoxels = removeVoxel(voxels, command.voxel.x, command.voxel.y, command.voxel.z)
  } else if (command.type === 'batch_add') {
    newVoxels = command.voxels.reduce(
      (map, v) => removeVoxel(map, v.x, v.y, v.z),
      voxels
    )
  } else if (command.type === 'recolor') {
    newVoxels = addVoxel(voxels, {
      ...command.voxel,
      color: command.previousColor,
    })
  } else {
    newVoxels = addVoxel(voxels, command.voxel)
  }

  return {
    history: { past: newPast, future: [command, ...history.future] },
    voxels: newVoxels,
  }
}

export function redo(
  history: History,
  voxels: VoxelMap,
): { history: History; voxels: VoxelMap } {
  if (history.future.length === 0) return { history, voxels }

  const command = history.future[0]
  const newFuture = history.future.slice(1)

  let newVoxels: VoxelMap
  if (command.type === 'add') {
    newVoxels = addVoxel(voxels, command.voxel)
  } else if (command.type === 'batch_add') {
    newVoxels = addVoxels(voxels, command.voxels)
  } else if (command.type === 'recolor') {
    newVoxels = addVoxel(voxels, command.voxel)
  } else {
    newVoxels = removeVoxel(voxels, command.voxel.x, command.voxel.y, command.voxel.z)
  }

  return {
    history: { past: [...history.past, command], future: newFuture },
    voxels: newVoxels,
  }
}
