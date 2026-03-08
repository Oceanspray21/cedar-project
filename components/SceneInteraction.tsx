'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { type VoxelMap } from '@/lib/voxelStore'
import { snapToFloor, getAdjacentPosition, getHitVoxelPosition } from '@/lib/raycasting'
import { PRESETS } from '@/lib/voxelPresets'
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
  selectedPreset: string | null
  onPlace: (x: number, y: number, z: number, color: string) => void
  onPlaceVoxels: (voxels: { x: number; y: number; z: number; color: string }[]) => void
  onErase: (x: number, y: number, z: number) => void
  onRecolor: (x: number, y: number, z: number, color: string) => void
}

export default function SceneInteraction({ voxels, tool, color, gridSize, selectedPreset, onPlace, onPlaceVoxels, onErase, onRecolor }: Props) {
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
    } else if (tool === 'paint') {
      const pos = getHitVoxelPosition(e.point, worldNormal)
      onRecolor(pos.x, pos.y, pos.z, color)
    } else if (selectedPreset && tool === 'place') {
      const pos = getAdjacentPosition(e.point, worldNormal)
      if (pos.y >= 0) {
        const presetVoxels = PRESETS[selectedPreset]
        if (presetVoxels?.length) {
          const offset = presetVoxels.map(v => ({ ...v, x: v.x + pos.x, y: v.y + pos.y, z: v.z + pos.z }))
          onPlaceVoxels(offset)
        }
      }
    } else {
      const pos = getAdjacentPosition(e.point, worldNormal)
      if (pos.y >= 0) onPlace(pos.x, pos.y, pos.z, color)
    }
  }, [tool, color, selectedPreset, onPlace, onPlaceVoxels, onErase, onRecolor])

  const onVoxelPointerMove = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    if (!e.face) { setGhostPos(null); return }
    const worldNormal = e.face.normal.clone().transformDirection(e.object.matrixWorld)

    if (tool === 'erase' || tool === 'paint') {
      setGhostPos(getHitVoxelPosition(e.point, worldNormal))
    } else {
      const pos = getAdjacentPosition(e.point, worldNormal)
      setGhostPos(pos.y >= 0 ? pos : null)
    }
  }, [tool])

  const onVoxelPointerLeave = useCallback(() => setGhostPos(null), [])

  // --- Floor events ---
  const pointerDownXY = useRef({ x: 0, y: 0 })

  const onFloorPointerDown = useCallback((e: ThreeEvent<PointerEvent>) => {
    // Ref mutation is intentional — storing pointer position for click-vs-drag detection
    // eslint-disable-next-line react-hooks/immutability
    pointerDownXY.current = { x: e.clientX, y: e.clientY }
  }, [])

  const onFloorPointerUp = useCallback((e: ThreeEvent<PointerEvent>) => {
    if (tool !== 'place') return
    const dx = e.clientX - pointerDownXY.current.x
    const dy = e.clientY - pointerDownXY.current.y
    const moved = Math.sqrt(dx * dx + dy * dy)
    if (moved > 6) return // was a drag, not a click
    const pos = snapToFloor(e.point)
    if (pos.x < gridMin || pos.x > gridMax || pos.z < gridMin || pos.z > gridMax) return
    if (selectedPreset) {
      const presetVoxels = PRESETS[selectedPreset]
      if (presetVoxels?.length) {
        const offset = presetVoxels.map(v => ({ ...v, x: v.x + pos.x, y: v.y + pos.y, z: v.z + pos.z }))
        onPlaceVoxels(offset)
      }
    } else {
      onPlace(pos.x, pos.y, pos.z, color)
    }
  }, [tool, color, selectedPreset, gridMin, gridMax, onPlace, onPlaceVoxels])

  const onFloorPointerMove = useCallback((e: ThreeEvent<PointerEvent>) => {
    if (tool !== 'place') { setGhostPos(null); return }
    const pos = snapToFloor(e.point)
    if (pos.x < gridMin || pos.x > gridMax || pos.z < gridMin || pos.z > gridMax) { setGhostPos(null); return }
    setGhostPos(pos)
  }, [tool, gridMin, gridMax])

  const onFloorPointerLeave = useCallback(() => setGhostPos(null), [])

  const ghostColor = tool === 'erase' ? '#FF3535' : color
  const presetVoxels = selectedPreset ? PRESETS[selectedPreset] : null
  const showPresetGhost = tool === 'place' && selectedPreset && ghostPos && presetVoxels?.length

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

      {/* Ghost preview — single block or full preset */}
      {ghostPos &&
        (showPresetGhost ? (
          <group>
            {presetVoxels!.map((v, i) => (
              <mesh
                key={i}
                position={[ghostPos!.x + v.x, ghostPos!.y + v.y + 0.5, ghostPos!.z + v.z]}
                raycast={() => null as unknown as boolean}
              >
                <boxGeometry args={[1.02, 1.02, 1.02]} />
                <meshLambertMaterial color={v.color} transparent opacity={0.4} depthWrite={false} />
              </mesh>
            ))}
          </group>
        ) : (
          <mesh position={[ghostPos.x, ghostPos.y + 0.5, ghostPos.z]} raycast={() => null as unknown as boolean}>
            <boxGeometry args={[1.02, 1.02, 1.02]} />
            <meshLambertMaterial color={ghostColor} transparent opacity={0.4} depthWrite={false} />
          </mesh>
        ))}
    </>
  )
}
