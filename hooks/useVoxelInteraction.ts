'use client'

import { useRef, useCallback } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { type VoxelMap } from '@/lib/voxelStore'
import { snapToFloor, getAdjacentPosition, getHitVoxelPosition } from '@/lib/raycasting'
import { type Tool } from '@/app/page'

type Props = {
  voxels: VoxelMap
  tool: Tool
  color: string
  instanceMeshRef: React.RefObject<THREE.InstancedMesh | null>
  floorRef: React.RefObject<THREE.Mesh | null>
  onPlace: (x: number, y: number, z: number, color: string) => void
  onErase: (x: number, y: number, z: number) => void
}

export function useVoxelInteraction({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- voxels kept for API consistency
  voxels,
  tool,
  color,
  instanceMeshRef,
  floorRef,
  onPlace,
  onErase,
}: Props) {
  const { camera, raycaster, pointer } = useThree()
  const isDragging = useRef(false)
  const pointerDownPos = useRef({ x: 0, y: 0 })

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointerDownPos.current = { x: e.clientX, y: e.clientY }
    isDragging.current = false
  }, [])

  const handlePointerMove = useCallback(() => {
    isDragging.current = true
  }, [])

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      // Only act on left-click
      if (e.button !== 0) return
      // Ignore if the user was dragging (orbiting)
      if (isDragging.current) return

      raycaster.setFromCamera(pointer, camera)

      const targets: THREE.Object3D[] = []
      if (instanceMeshRef.current) targets.push(instanceMeshRef.current)
      if (floorRef.current) targets.push(floorRef.current)

      const hits = raycaster.intersectObjects(targets, false)
      if (hits.length === 0) return

      const hit = hits[0]
      const normal = hit.face?.normal?.clone() ?? null

      if (hit.object === instanceMeshRef.current && normal) {
        // Transform normal from local to world space
        const worldNormal = normal.clone().transformDirection(hit.object.matrixWorld)

        if (tool === 'erase') {
          const pos = getHitVoxelPosition(hit.point, worldNormal)
          onErase(pos.x, pos.y, pos.z)
        } else {
          const pos = getAdjacentPosition(hit.point, worldNormal)
          if (pos.y >= 0) onPlace(pos.x, pos.y, pos.z, color)
        }
      } else if (hit.object === floorRef.current) {
        if (tool === 'place') {
          const pos = snapToFloor(hit.point)
          onPlace(pos.x, pos.y, pos.z, color)
        }
      }
    },
    [raycaster, pointer, camera, tool, color, instanceMeshRef, floorRef, onPlace, onErase],
  )

  return { handlePointerDown, handlePointerMove, handleClick }
}
