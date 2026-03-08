'use client'

import { useRef } from 'react'
import * as THREE from 'three'
import { type VoxelMap } from '@/lib/voxelStore'
import { useVoxelInteraction } from '@/hooks/useVoxelInteraction'
import { type Tool } from '@/app/page'

type Props = {
  voxels: VoxelMap
  tool: Tool
  color: string
  instanceMeshRef: React.RefObject<THREE.InstancedMesh | null>
  onPlace: (x: number, y: number, z: number, color: string) => void
  onErase: (x: number, y: number, z: number) => void
}

export default function InteractionLayer({
  voxels,
  tool,
  color,
  instanceMeshRef,
  onPlace,
  onErase,
}: Props) {
  const floorRef = useRef<THREE.Mesh>(null)

  const { handlePointerDown, handlePointerMove, handleClick } = useVoxelInteraction({
    voxels,
    tool,
    color,
    instanceMeshRef,
    floorRef,
    onPlace,
    onErase,
  })

  return (
    <mesh
      ref={floorRef}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, 0]}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onClick={handleClick}
    >
      <planeGeometry args={[200, 200]} />
      <meshBasicMaterial visible={false} side={THREE.DoubleSide} />
    </mesh>
  )
}
