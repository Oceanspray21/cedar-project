import * as THREE from 'three'

export type GridPosition = { x: number; y: number; z: number }

/**
 * Given a raycast intersection, return the grid-snapped position where
 * a new voxel should be placed.
 *
 * - For a floor hit (normal pointing up): snap x/z, y = 0
 * - For a voxel face hit: offset by the face normal so the new voxel
 *   is adjacent (not overlapping the hit voxel)
 */
export function getPlacementPosition(
  point: THREE.Vector3,
  normal: THREE.Vector3 | null,
): GridPosition {
  if (!normal) {
    // Floor hit fallback
    return {
      x: Math.round(point.x),
      y: 0,
      z: Math.round(point.z),
    }
  }

  // Round the face normal to the nearest axis direction
  const nx = Math.round(normal.x)
  const ny = Math.round(normal.y)
  const nz = Math.round(normal.z)

  if (ny > 0 && nx === 0 && nz === 0) {
    // Top of voxel or floor — use standard floor snap
    return {
      x: Math.round(point.x),
      y: Math.round(point.y - 0.5 + ny), // place on top
      z: Math.round(point.z),
    }
  }

  // Side face hit — offset by the face normal
  // point is on the face surface; we move half a unit in normal direction
  // then snap to place adjacent
  return {
    x: Math.floor(point.x + nx * 0.5),
    y: Math.floor(point.y + ny * 0.5),
    z: Math.floor(point.z + nz * 0.5),
  }
}

/**
 * For floor-plane hits specifically (no face normal from a PlaneGeometry world-space).
 * Snaps the x/z to integers, y stays at 0.
 */
export function snapToFloor(point: THREE.Vector3): GridPosition {
  // Use `|| 0` to coerce JavaScript's -0 to +0
  return {
    x: Math.round(point.x) || 0,
    y: 0,
    z: Math.round(point.z) || 0,
  }
}

/**
 * Given a hit on a voxel's instanced mesh face, return the adjacent placement position.
 * The point is on the face surface; face normal tells us which side was hit.
 */
export function getAdjacentPosition(
  point: THREE.Vector3,
  faceNormal: THREE.Vector3,
): GridPosition {
  // Move slightly outside the face to find the adjacent cell
  const outside = point.clone().addScaledVector(faceNormal, 0.5)
  return {
    x: Math.round(outside.x) || 0,
    y: Math.round(outside.y - 0.5) || 0,
    z: Math.round(outside.z) || 0,
  }
}

/**
 * Given a hit on a voxel's instanced mesh, return the position of the hit voxel itself
 * (for removal).
 */
export function getHitVoxelPosition(point: THREE.Vector3, faceNormal: THREE.Vector3): GridPosition {
  // Move slightly inward from the face to land inside the hit voxel
  const inside = point.clone().addScaledVector(faceNormal, -0.5)
  return {
    x: Math.round(inside.x) || 0,
    y: Math.round(inside.y - 0.5) || 0,
    z: Math.round(inside.z) || 0,
  }
}
