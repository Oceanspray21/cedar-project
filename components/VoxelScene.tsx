'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'
import SceneInteraction from './SceneInteraction'
import { type VoxelMap } from '@/lib/voxelStore'
import { type Tool } from '@/app/page'

type Props = {
  voxels: VoxelMap
  tool: Tool
  color: string
  gridSize: number
  selectedPreset: string | null
  onPlace: (x: number, y: number, z: number, color: string) => void
  onPlaceVoxels: (voxels: { x: number; y: number; z: number; color: string }[]) => void
  onErase: (x: number, y: number, z: number) => void
  onRecolor: (x: number, y: number, z: number, color: string) => void
}

export default function VoxelScene({ voxels, tool, color, gridSize, selectedPreset, onPlace, onPlaceVoxels, onErase, onRecolor }: Props) {
  return (
    <Canvas
      gl={{ antialias: true }}
      camera={{ position: [15, 15, 15], fov: 60, near: 0.1, far: 1000 }}
      onCreated={({ gl }) => {
        gl.setClearColor('#111111')
      }}
    >
      <ambientLight intensity={0.7} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />

      {/*
        Grid offset by [0.5, 0, 0.5] so grid LINES fall at 0.5, 1.5, 2.5...
        and cell CENTERS align with integer voxel positions (0, 1, 2...).
      */}
      <Grid
        args={[gridSize, gridSize]}
        position={[0.5, 0, 0.5]}
        cellColor="#555555"
        sectionColor="#FF6B35"
        cellSize={1}
        sectionSize={8}
        fadeDistance={gridSize * 2}
        fadeStrength={1.5}
      />

      {/* Voxels (instanced), floor plane, ghost preview — all in one component */}
      <SceneInteraction
        voxels={voxels}
        tool={tool}
        color={color}
        gridSize={gridSize}
        selectedPreset={selectedPreset}
        onPlace={onPlace}
        onPlaceVoxels={onPlaceVoxels}
        onErase={onErase}
        onRecolor={onRecolor}
      />

      <OrbitControls makeDefault enableDamping dampingFactor={0.05} />
    </Canvas>
  )
}
