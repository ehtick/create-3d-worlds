import * as THREE from 'three'
import { waypoints } from './data.js'

export const randomWaypoint = () => {
  const i = Math.floor(Math.random() * waypoints.length)
  return waypoints[i]
}

export function cloneGLTF({ scene, animations }) {
  const clone = {
    animations,
    scene: scene.clone(true)
  }

  const skinnedMeshes = {}
  scene.traverse(node => {
    if (node.isSkinnedMesh)
      skinnedMeshes[node.name] = node
  })

  const cloneBones = {}
  const cloneSkinnedMeshes = {}

  clone.scene.traverse(node => {
    if (node.isBone)
      cloneBones[node.name] = node
    if (node.isSkinnedMesh)
      cloneSkinnedMeshes[node.name] = node
  })

  for (const name in skinnedMeshes) {
    const skinnedMesh = skinnedMeshes[name]
    const { skeleton } = skinnedMesh
    const cloneSkinnedMesh = cloneSkinnedMeshes[name]
    const orderedCloneBones = []
    for (let i = 0; i < skeleton.bones.length; ++i) {
      const cloneBone = cloneBones[skeleton.bones[i].name]
      orderedCloneBones.push(cloneBone)
    }
    cloneSkinnedMesh.bind(
      new THREE.Skeleton(orderedCloneBones, skeleton.boneInverses),
      cloneSkinnedMesh.matrixWorld)
  }
  return clone
}