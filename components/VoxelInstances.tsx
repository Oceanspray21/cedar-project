'use client'

import { useEffect } from 'react'
import * as THREE from 'three'
import { type VoxelMap } from '@/lib/voxelStore'

const MAX_INSTANCES = 10_000
const _matrix = new THREE.Matrix4()
const _color = new THREE.Color()

type Props = {
  voxels: VoxelMap
  meshRef: React.RefObject<THREE.InstancedMesh | null>
}

export default function VoxelInstances({ voxels, meshRef }: Props) {

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

    // Clear unused slots
    for (; i < mesh.count; i++) {
      _matrix.setPosition(0, -9999, 0) // hide far below scene
      mesh.setMatrixAt(i, _matrix)
    }

    mesh.count = voxels.size
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }, [voxels])

  return (
    <instancedMesh
      ref={meshRef as React.RefObject<THREE.InstancedMesh>}
      args={[undefined, undefined, MAX_INSTANCES]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshLambertMaterial vertexColors />
    </instancedMesh>
  )
}
