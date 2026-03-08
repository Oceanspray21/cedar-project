'use client'

import { useState, useEffect } from 'react'
import VoxelScene from '@/components/VoxelScene'
import Toolbar from '@/components/Toolbar'
import { useVoxels } from '@/hooks/useVoxels'

export type Tool = 'place' | 'erase'

const GRID_SIZES = [16, 32, 64] as const

export default function Home() {
  const { voxels, placeVoxel, eraseVoxel, clearVoxels, undo, redo, canUndo, canRedo } = useVoxels()
  const [color, setColor] = useState('#FF6B35')
  const [tool, setTool] = useState<Tool>('place')
  const [gridSize, setGridSize] = useState<number>(32)

  const cycleGridSize = () => {
    setGridSize(prev => {
      const idx = GRID_SIZES.indexOf(prev as typeof GRID_SIZES[number])
      return GRID_SIZES[(idx + 1) % GRID_SIZES.length]
    })
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return
      const ctrl = e.ctrlKey || e.metaKey
      if (ctrl && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo() }
      else if (ctrl && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo() }
      else if (e.key === 'b' || e.key === 'B') setTool('place')
      else if (e.key === 'e' || e.key === 'E') setTool('erase')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [undo, redo])

  return (
    <main style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#000', position: 'relative' }}>
      <VoxelScene
        voxels={voxels}
        tool={tool}
        color={color}
        gridSize={gridSize}
        onPlace={placeVoxel}
        onErase={eraseVoxel}
      />
      <Toolbar
        tool={tool}
        color={color}
        voxelCount={voxels.size}
        gridSize={gridSize}
        canUndo={canUndo}
        canRedo={canRedo}
        onToolChange={setTool}
        onColorChange={setColor}
        onUndo={undo}
        onRedo={redo}
        onClear={clearVoxels}
        onCycleGridSize={cycleGridSize}
      />
    </main>
  )
}
