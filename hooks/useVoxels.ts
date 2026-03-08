'use client'

import { useState, useCallback } from 'react'
import { addVoxel, removeVoxel, type VoxelMap } from '@/lib/voxelStore'
import {
  pushCommand,
  undo as historyUndo,
  redo as historyRedo,
  emptyHistory,
  type History,
} from '@/lib/history'

type State = { voxels: VoxelMap; history: History }

export function useVoxels() {
  const [state, setState] = useState<State>({ voxels: new Map(), history: emptyHistory })

  const placeVoxel = useCallback((x: number, y: number, z: number, color: string) => {
    const voxel = { x, y, z, color }
    setState(prev => ({
      voxels: addVoxel(prev.voxels, voxel),
      history: pushCommand(prev.history, { type: 'add', voxel }),
    }))
  }, [])

  const eraseVoxel = useCallback((x: number, y: number, z: number) => {
    setState(prev => {
      const existing = prev.voxels.get(`${x},${y},${z}` as `${number},${number},${number}`)
      if (!existing) return prev
      return {
        voxels: removeVoxel(prev.voxels, x, y, z),
        history: pushCommand(prev.history, { type: 'remove', voxel: existing }),
      }
    })
  }, [])

  const undo = useCallback(() => {
    setState(prev => {
      const { history, voxels } = historyUndo(prev.history, prev.voxels)
      return { history, voxels }
    })
  }, [])

  const redo = useCallback(() => {
    setState(prev => {
      const { history, voxels } = historyRedo(prev.history, prev.voxels)
      return { history, voxels }
    })
  }, [])

  const clearVoxels = useCallback(() => {
    setState({ voxels: new Map(), history: emptyHistory })
  }, [])

  return {
    voxels: state.voxels,
    placeVoxel,
    eraseVoxel,
    undo,
    redo,
    clearVoxels,
    canUndo: state.history.past.length > 0,
    canRedo: state.history.future.length > 0,
  }
}
