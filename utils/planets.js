import * as THREE from 'three'
import { createSphere } from '/utils/geometry.js'

const textureLoader = new THREE.TextureLoader()
textureLoader.setPath('/assets/textures/planets/')

/* EARTH */

export function createEarth({ r = 15, segments = 64 } = {}) {
  const map = textureLoader.load('earthmap4k.jpg') // max width is 4096
  const bumpMap = textureLoader.load('earthbump4k.jpg')
  const specularMap = textureLoader.load('earthspec4k.jpg')
  const material = new THREE.MeshPhongMaterial({ map, specularMap, bumpMap, displacementMap: bumpMap, displacementScale: 1.75 })

  const geometry = new THREE.SphereGeometry(r, segments, segments)
  const mesh = new THREE.Mesh(geometry, material)
  mesh.castShadow = mesh.receiveShadow = true
  mesh.name = 'earth'
  return mesh
}

export function createEarthClouds({ r = 15.2, segments = 64 } = {}) {
  const map = textureLoader.load('fair_clouds_4k.png')
  const material = new THREE.MeshPhongMaterial({ map, transparent: true })

  const geometry = new THREE.SphereGeometry(r, segments, segments)
  const clouds = new THREE.Mesh(geometry, material)
  clouds.name = 'clouds'
  return clouds
}

/* MOON */

export function createMoon({ r = 2, segments = 32 } = {}) {
  const mesh = createSphere({ r, segments })
  mesh.material.map = textureLoader.load('moon_1024.jpg')
  mesh.material.bumpMap = textureLoader.load('moon_cloud.png')
  return mesh
}

/* SUN */

export function createSun({ r = 50, segments = 32 } = {}) {
  const material = new THREE.MeshStandardMaterial({ map: textureLoader.load('sun.jpg'), color: 0xFFD700 })
  const geometry = new THREE.SphereGeometry(r, segments, segments)
  geometry.rotateX(Math.PI / 2)
  const mesh = new THREE.Mesh(geometry, material)
  const sunLight = new THREE.PointLight(0xffffff, 5, 1000)
  mesh.add(sunLight)
  addGlow(mesh, r * 3)
  return mesh
}

function addGlow(sun, distance = 50) {
  const intensity = 5
  const angle = Math.PI / 7

  for (let i = 0; i < 6; i++) {
    const spotlight = new THREE.SpotLight(0xFFFFFF, intensity, distance, angle)
    const pos = i % 2 ? -distance : distance
    const x = i < 2 ? pos : 0
    const y = i >= 2 && i < 4 ? pos : 0
    const z = i >= 4 ? pos : 0
    spotlight.position.set(x, y, z)
    sun.add(spotlight)
  }
}

/* SATURN */

function createRing(radius, tube, color) {
  const geometry = new THREE.TorusGeometry(radius, tube, 2, 35)
  const material = new THREE.MeshBasicMaterial({ color })
  const ring = new THREE.Mesh(geometry, material)
  ring.rotation.x = Math.PI * .5
  return ring
}

export function createSaturn() {
  const group = new THREE.Group()
  group.add(createSphere({ color: 0xDDBC77 }))
  group.add(createRing(1.4, .2, 0x665E4E))
  group.add(createRing(1.9, .2, 0x7C776B))
  group.add(createRing(2.4, .2, 0x645F52))
  return group
}

/* JUPITER */

export function createJupiter({ r = 10, segments = 32 } = {}) {
  const planet = createSphere({ r, segments })
  planet.material.map = textureLoader.load('jupiter.jpg')
  return planet
}
