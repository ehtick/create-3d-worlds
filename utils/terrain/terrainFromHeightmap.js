import * as THREE from 'three'
import { material } from '/utils/shaders/heightmap-terrain.js'

const textureLoader = new THREE.TextureLoader()

export function terrainFromHeightmap({
  file = 'wiki.png', textureFile = '', widthSegments = 100, heightSegments = 100, displacementScale = 100
} = {}) {
  const geometry = new THREE.PlaneGeometry(1000, 1000, widthSegments, heightSegments)

  const material = new THREE.MeshStandardMaterial({
    color: 0x666666,
    map: textureFile ? textureLoader.load(`/assets/textures/${textureFile}`) : null,
    displacementMap: textureLoader.load(`/assets/heightmaps/${file}`),
    displacementScale,
  })

  const mesh = new THREE.Mesh(geometry, material)
  mesh.rotation.x = -Math.PI / 2
  mesh.position.y = -.5
  return mesh
}

export function shaderFromHeightmap({
  file = 'wiki.png', segments = 100, displacementScale = 100
} = {}) {
  const geometry = new THREE.PlaneGeometry(1000, 1000, segments, segments)
  material.uniforms.heightmap.value = textureLoader.load(`/assets/heightmaps/${file}`)
  material.uniforms.displacementScale.value = displacementScale

  const mesh = new THREE.Mesh(geometry, material)
  mesh.rotation.x = -Math.PI / 2
  mesh.position.y = -.5
  return mesh
}
