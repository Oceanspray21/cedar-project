'use client'

import { useState, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { type VoxelMap } from '@/lib/voxelStore'
import { snapToFloor, getAdjacentPosition } from '@/lib/raycasting'
import { type Tool } from '@/app/page'

type Props = {
  voxels: VoxelMap
  tool: Tool
  instanceMeshRef: React.RefObject<THREE.InstancedMesh | null>
}

const PLACE_COLOR = '#FF6B35'
const ERASE_COLOR = '#FF3535'

export default function GhostVoxel({ voxels, tool, instanceMeshRef }: Props) {
  const { camera, raycaster, pointer } = useThree()
  const floorRef = useRef<THREE.Mesh>(null)
  const [ghostPos, setGhostPos] = useState<{ x: number; y: number; z: number } | null>(null)

  const handlePointerMove = () => {
    raycaster.setFromCamera(pointer, camera)

    const targets: THREE.Object3D[] = []
    if (instanceMeshRef.current) targets.push(instanceMeshRef.current)
    if (floorRef.current) targets.push(floorRef.current)

    const hits = raycaster.intersectObjects(targets, false)

    if (hits.length === 0) {
      setGhostPos(null)
      return
    }

    const hit = hits[0]
    const normal = hit.face?.normal?.clone() ?? null

    if (hit.object === instanceMeshRef.current && normal) {
      const worldNormal = normal.clone().transformDirection(hit.object.matrixWorld)
      if (tool === 'erase') {
        // In erase mode, ghost highlights the voxel that would be removed
        // — just show at the same spot, handled by color
        const pos = getAdjacentPosition(hit.point, worldNormal)
        setGhostPos(pos)
      } else {
        const pos = getAdjacentPosition(hit.point, worldNormal)
        if (pos.y >= 0) setGhostPos(pos)
        else setGhostPos(null)
      }
    } else if (hit.object === floorRef.current) {
      if (tool === 'place') {
        setGhostPos(snapToFloor(hit.point))
      } else {
        setGhostPos(null)
      }
    } else {
      setGhostPos(null)
    }
  }

  const handlePointerLeave = () => setGhostPos(null)

  const ghostColor = tool === 'erase' ? ERASE_COLOR : PLACE_COLOR

  return (
    <>
      {/* Invisible floor plane to catch pointer move events */}
      <mesh
        ref={floorRef}
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        <planeGeometry args={[200, 200]} />
        <meshBasicMaterial visible={false} side={THREE.DoubleSide} />
      </mesh>

      {/* Ghost cube at snapped position */}
      {ghostPos && (
        <mesh position={[ghostPos.x, ghostPos.y + 0.5, ghostPos.z]}>
          <boxGeometry args={[1.02, 1.02, 1.02]} />
          <meshLambertMaterial
            color={ghostColor}
            transparent
            opacity={0.45}
            depthWrite={false}
          />
        </mesh>
      )}
    </>
  )
}
