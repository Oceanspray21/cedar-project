'use client'

import { useState, useCallback } from 'react'
import { addVoxel, addVoxels, removeVoxel, type Voxel, type VoxelMap } from '@/lib/voxelStore'
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

  const recolorVoxel = useCallback((x: number, y: number, z: number, newColor: string) => {
    setState(prev => {
      const existing = prev.voxels.get(`${x},${y},${z}` as `${number},${number},${number}`)
      if (!existing || existing.color === newColor) return prev
      const recolored = { ...existing, color: newColor }
      return {
        voxels: addVoxel(prev.voxels, recolored),
        history: pushCommand(prev.history, { type: 'recolor', voxel: recolored, previousColor: existing.color }),
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

  const placeVoxels = useCallback((voxels: Voxel[]) => {
    if (voxels.length === 0) return
    setState(prev => ({
      voxels: addVoxels(prev.voxels, voxels),
      history: pushCommand(prev.history, { type: 'batch_add', voxels }),
    }))
  }, [])

  return {
    voxels: state.voxels,
    placeVoxel,
    placeVoxels,
    eraseVoxel,
    recolorVoxel,
    undo,
    redo,
    clearVoxels,
    canUndo: state.history.past.length > 0,
    canRedo: state.history.future.length > 0,
  }
}
