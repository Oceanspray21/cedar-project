export type Voxel = {
  x: number
  y: number
  z: number
  color: string
}

export type VoxelMap = Map<string, Voxel>

export function voxelKey(x: number, y: number, z: number): string {
  return `${x},${y},${z}`
}

export function addVoxel(map: VoxelMap, voxel: Voxel): VoxelMap {
  const next = new Map(map)
  next.set(voxelKey(voxel.x, voxel.y, voxel.z), voxel)
  return next
}

export function removeVoxel(map: VoxelMap, x: number, y: number, z: number): VoxelMap {
  const next = new Map(map)
  next.delete(voxelKey(x, y, z))
  return next
}

export function hasVoxel(map: VoxelMap, x: number, y: number, z: number): boolean {
  return map.has(voxelKey(x, y, z))
}

export function getVoxel(map: VoxelMap, x: number, y: number, z: number): Voxel | undefined {
  return map.get(voxelKey(x, y, z))
}

export function listVoxels(map: VoxelMap): Voxel[] {
  return Array.from(map.values())
}
