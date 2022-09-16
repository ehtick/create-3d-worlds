import * as THREE from 'three'
import { scene as defaultScene } from '/utils/scene.js'

/* BASIC LIGHTS */

export function dirLight({
  scene = defaultScene,
  position = [20, 50, 20],
  color = 0xffffff,
  intensity = 1,
  target,
  mapSize = 512,
  area = 5,
} = {}) {
  const light = new THREE.DirectionalLight(color, intensity)
  light.position.set(...position)
  light.castShadow = true
  light.shadow.mapSize.width = light.shadow.mapSize.height = mapSize
  if (target) light.target = target
  if (scene) scene.add(light)
  light.shadow.camera.left = light.shadow.camera.bottom = -area
  light.shadow.camera.right = light.shadow.camera.top = area
  // const helper = new THREE.CameraHelper(light.shadow.camera)
  // scene.add(helper)
  return light
}

export function pointLight({ scene = defaultScene, color = 0xffffff, intensity = 1, mapSize = 512, } = {}) {
  const light = new THREE.PointLight(color, intensity)
  light.castShadow = true
  light.shadow.mapSize.width = light.shadow.mapSize.height = mapSize
  if (scene) scene.add(light)
  return light
}

export function spotLight({ scene = defaultScene, position = [75, 75, 75], color = 0xffffff, intensity = 1, mapSize = 512 } = {}) {
  const light = new THREE.SpotLight(color, intensity)
  light.position.set(...position)
  light.castShadow = true
  light.shadow.mapSize.width = light.shadow.mapSize.height = mapSize
  // if (scene) scene.add(light)
  return light
}

export function hemLight({ scene = defaultScene, skyColor = 0xfffff0, groundColor = 0x101020, intensity = 1 } = {}) {
  const light = new THREE.HemisphereLight(skyColor, groundColor, intensity)
  if (scene) scene.add(light)
}

export function ambLight({ scene = defaultScene, color = 0xffffff, intensity = 1 } = {}) { // 0x343434
  const light = new THREE.AmbientLight(color, intensity)
  if (scene) scene.add(light)
}

/* MIXED LIGHTS */

export function initLight({ scene = defaultScene, position = [-10, 30, 40], r = 1 } = {}) {
  const light = spotLight({ mapSize: 2048, position: [0, 0, 0] })

  const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.5)

  const container = new THREE.Mesh(
    new THREE.SphereGeometry(r),
    new THREE.MeshToonMaterial({ color: 0xFCE570 })
  )
  container.add(light, ambientLight)
  container.position.set(...position)
  scene.add(container)
  return container
}

export function createSun({ color = 0xffffff, intensity = 1.4, far = 3500, target } = {}) {
  const sun = new THREE.PointLight(color, intensity)
  sun.castShadow = true
  sun.shadow.camera.far = far
  if (target) sun.target = target

  const container = new THREE.Mesh(
    new THREE.SphereGeometry(10),
    new THREE.MeshToonMaterial({ color: 0xFCE570 })
  )
  const ambientLight = new THREE.AmbientLight(0xfffee1, .25)
  container.add(sun, ambientLight)
  container.position.set(150, 350, 350)
  return container
}

/* UPDATES */

export function sunFollow(sun, pos) {
  sun.position.copy(pos)
  sun.position.add(new THREE.Vector3(-10, 500, -10))
  sun.target.position.copy(pos)
  sun.updateMatrixWorld()
  sun.target.updateMatrixWorld()
}

export function lightFollow(light, target, distance = [12, 8, 1]) {
  const newPos = new THREE.Vector3(...distance).add(target.position)
  light.position.copy(newPos)
}
