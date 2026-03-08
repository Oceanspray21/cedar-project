'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { type VoxelMap } from '@/lib/voxelStore'
import { snapToFloor, getAdjacentPosition, getHitVoxelPosition } from '@/lib/raycasting'
import { type Tool } from '@/app/page'

const MAX_INSTANCES = 10_000
const _matrix = new THREE.Matrix4()
const _color = new THREE.Color()

type GhostPos = { x: number; y: number; z: number } | null

type Props = {
  voxels: VoxelMap
  tool: Tool
  color: string
  gridSize: number
  onPlace: (x: number, y: number, z: number, color: string) => void
  onErase: (x: number, y: number, z: number) => void
}

export default function SceneInteraction({ voxels, tool, color, gridSize, onPlace, onErase }: Props) {
  const gridMin = -(gridSize / 2 - 1)
  const gridMax = gridSize / 2
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const [ghostPos, setGhostPos] = useState<GhostPos>(null)

  // Sync instance matrices + colors whenever voxels change
  useEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return
    let i = 0
    for (const voxel of voxels.values()) {
      _matrix.setPosition(voxel.x, voxel.y + 0.5, voxel.z)
      mesh.setMatrixAt(i, _matrix)
      _color.set(voxel.color)
      mesh.setColorAt(i, _color)
      i++
    }
    mesh.count = voxels.size
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    mesh.computeBoundingSphere()
  }, [voxels])

  // --- Voxel mesh events ---
  // R3F's onClick already guarantees this is a click not a drag — no extra isDrag needed.
  const onVoxelPointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    pointerDownXY.current = { x: e.clientX, y: e.clientY }
  }

  const onVoxelPointerUp = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    const dx = e.clientX - pointerDownXY.current.x
    const dy = e.clientY - pointerDownXY.current.y
    const moved = Math.sqrt(dx * dx + dy * dy)
    if (moved > 6) return // drag, not click

    if (!e.face) return
    const worldNormal = e.face.normal.clone().transformDirection(e.object.matrixWorld)

    if (tool === 'erase') {
      const pos = getHitVoxelPosition(e.point, worldNormal)
      onErase(pos.x, pos.y, pos.z)
    } else {
      const pos = getAdjacentPosition(e.point, worldNormal)
      if (pos.y >= 0) onPlace(pos.x, pos.y, pos.z, color)
    }
  }, [tool, color, onPlace, onErase])

  const onVoxelPointerMove = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    if (!e.face) { setGhostPos(null); return }
    const worldNormal = e.face.normal.clone().transformDirection(e.object.matrixWorld)

    if (tool === 'erase') {
      setGhostPos(getHitVoxelPosition(e.point, worldNormal))
    } else {
      const pos = getAdjacentPosition(e.point, worldNormal)
      setGhostPos(pos.y >= 0 ? pos : null)
    }
  }, [tool])

  const onVoxelPointerLeave = useCallback(() => setGhostPos(null), [])

  // --- Floor events ---
  // Use pointerDown + pointerUp to detect real clicks vs drags on the floor.
  const pointerDownXY = useRef({ x: 0, y: 0 })

  const onFloorPointerDown = (e: ThreeEvent<PointerEvent>) => {
    pointerDownXY.current = { x: e.clientX, y: e.clientY }
  }

  const onFloorPointerUp = useCallback((e: ThreeEvent<PointerEvent>) => {
    if (tool !== 'place') return
    const dx = e.clientX - pointerDownXY.current.x
    const dy = e.clientY - pointerDownXY.current.y
    const moved = Math.sqrt(dx * dx + dy * dy)
    if (moved > 6) return // was a drag, not a click
    const pos = snapToFloor(e.point)
    if (pos.x < gridMin || pos.x > gridMax || pos.z < gridMin || pos.z > gridMax) return
    onPlace(pos.x, pos.y, pos.z, color)
  }, [tool, color, gridMin, gridMax, onPlace])

  const onFloorPointerMove = useCallback((e: ThreeEvent<PointerEvent>) => {
    if (tool !== 'place') { setGhostPos(null); return }
    const pos = snapToFloor(e.point)
    if (pos.x < gridMin || pos.x > gridMax || pos.z < gridMin || pos.z > gridMax) { setGhostPos(null); return }
    setGhostPos(pos)
  }, [tool, gridMin, gridMax])

  const onFloorPointerLeave = useCallback(() => setGhostPos(null), [])

  const ghostColor = tool === 'erase' ? '#FF3535' : '#FF6B35'

  return (
    <>
      {/*
        count={voxels.size} in JSX starts at 0 — no phantom instances at origin.
        useEffect keeps matrices + colors updated imperatively.
      */}
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, MAX_INSTANCES]}
        count={voxels.size}
        castShadow
        receiveShadow
        onPointerDown={onVoxelPointerDown}
        onPointerUp={onVoxelPointerUp}
        onPointerMove={onVoxelPointerMove}
        onPointerLeave={onVoxelPointerLeave}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshLambertMaterial />
      </instancedMesh>

      {/* Invisible floor — pointerDown + pointerUp handles click-vs-drag reliably */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerDown={onFloorPointerDown}
        onPointerUp={onFloorPointerUp}
        onPointerMove={onFloorPointerMove}
        onPointerLeave={onFloorPointerLeave}
      >
        <planeGeometry args={[200, 200]} />
        <meshBasicMaterial visible={false} side={THREE.DoubleSide} />
      </mesh>

      {/* Ghost preview voxel — raycast=noop so it never blocks clicks on real blocks */}
      {ghostPos && (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        <mesh position={[ghostPos.x, ghostPos.y + 0.5, ghostPos.z]} raycast={() => null as any}>
          <boxGeometry args={[1.02, 1.02, 1.02]} />
          <meshLambertMaterial color={ghostColor} transparent opacity={0.4} depthWrite={false} />
        </mesh>
      )}
    </>
  )
}
