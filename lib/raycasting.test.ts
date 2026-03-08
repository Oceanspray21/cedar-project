import { describe, test, expect } from 'vitest'
import * as THREE from 'three'
import { snapToFloor, getAdjacentPosition, getHitVoxelPosition } from './raycasting'

describe('snapToFloor', () => {
  test('snaps x and z to nearest integer, y always 0', () => {
    const point = new THREE.Vector3(1.4, 0, 2.6)
    expect(snapToFloor(point)).toEqual({ x: 1, y: 0, z: 3 })
  })

  test('handles negative coordinates', () => {
    const point = new THREE.Vector3(-1.7, 0, -0.3)
    expect(snapToFloor(point)).toEqual({ x: -2, y: 0, z: 0 })
  })

  test('exact integer coordinates unchanged', () => {
    const point = new THREE.Vector3(3, 0, 5)
    expect(snapToFloor(point)).toEqual({ x: 3, y: 0, z: 5 })
  })

  test('y is always 0 regardless of point y', () => {
    const point = new THREE.Vector3(0, 99, 0)
    expect(snapToFloor(point)).toEqual({ x: 0, y: 0, z: 0 })
  })
})

describe('getAdjacentPosition', () => {
  test('top face hit places block one unit above', () => {
    // Hitting the top face of a voxel at (0, 0, 0): face surface y=1.0, normal pointing up
    const point = new THREE.Vector3(0, 1.0, 0) // top face center of voxel at (0,0,0)
    const normal = new THREE.Vector3(0, 1, 0)
    const result = getAdjacentPosition(point, normal)
    expect(result.x).toBe(0)
    expect(result.y).toBe(1)
    expect(result.z).toBe(0)
  })

  test('right face hit places block one unit to the right', () => {
    // Hitting the +x face of a voxel at (0, 0, 0): face surface x=0.5, normal pointing +x
    const point = new THREE.Vector3(0.5, 0.5, 0)
    const normal = new THREE.Vector3(1, 0, 0)
    const result = getAdjacentPosition(point, normal)
    expect(result.x).toBe(1)
    expect(result.y).toBe(0)
    expect(result.z).toBe(0)
  })

  test('front face hit places block one unit forward', () => {
    // Hitting the +z face of a voxel at (0, 0, 0): face surface z=0.5, normal pointing +z
    const point = new THREE.Vector3(0, 0.5, 0.5)
    const normal = new THREE.Vector3(0, 0, 1)
    const result = getAdjacentPosition(point, normal)
    expect(result.x).toBe(0)
    expect(result.y).toBe(0)
    expect(result.z).toBe(1)
  })

  test('negative direction face hit works correctly', () => {
    // Hitting the -x face of a voxel at (0, 0, 0): face surface x=-0.5, normal pointing -x
    const point = new THREE.Vector3(-0.5, 0.5, 0) // -x face of voxel at (0,0,0)
    const normal = new THREE.Vector3(-1, 0, 0)
    const result = getAdjacentPosition(point, normal)
    expect(result.x).toBe(-1)
    expect(result.y).toBe(0)
    expect(result.z).toBe(0)
  })
})

describe('getHitVoxelPosition', () => {
  test('returns the position of the voxel that was hit (not adjacent)', () => {
    // Hitting top face of voxel at (0, 0, 0): point at y=1, normal up → voxel at y=0
    const point = new THREE.Vector3(0, 1.0, 0)
    const normal = new THREE.Vector3(0, 1, 0)
    const result = getHitVoxelPosition(point, normal)
    expect(result).toEqual({ x: 0, y: 0, z: 0 })
  })

  test('hitting +x face returns the voxel at that position', () => {
    // Hitting +x face of voxel at (1, 0, 0): face surface x=1.5, normal pointing +x
    const point = new THREE.Vector3(1.5, 0.5, 0) // +x face of voxel at (1, 0, 0)
    const normal = new THREE.Vector3(1, 0, 0)
    const result = getHitVoxelPosition(point, normal)
    expect(result).toEqual({ x: 1, y: 0, z: 0 })
  })
})
