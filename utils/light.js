import * as THREE from 'three'
import { scene as defaultScene } from '/utils/scene.js'

export function dirLight({ scene = defaultScene, position = [20, 50, 20], color = 0xffffff, intensity = 1 } = {}) {
  const light = new THREE.DirectionalLight(color, intensity)
  light.position.set(...position)
  light.castShadow = true
  light.shadow.camera = new THREE.OrthographicCamera(-50, 50, 50, -50, 0.5, position[1] * 3)
  // const helper = new THREE.CameraHelper(light.shadow.camera)
  // scene.add(helper)
  scene.add(light)
}

export function hemLight({ scene = defaultScene, skyColor = 0xfffff0, groundColor = 0x101020, intensity = 1 } = {}) {
  const hemisphereLight = new THREE.HemisphereLight(skyColor, groundColor, intensity)
  hemisphereLight.name = 'hemisphereLight' // needed for some cases
  scene.add(hemisphereLight)
}

export function spotLight({ scene = defaultScene, position = [75, 75, 75], color = 0xffffff, intensity = 1 } = {}) {
  const spotLight = new THREE.SpotLight(color, intensity)
  spotLight.position.set(...position)
  spotLight.castShadow = true
  scene.add(spotLight)
}

export function ambLight({ scene = defaultScene, color = 0xffffff, intensity = 1 } = {}) { // 0x343434
  const ambient = new THREE.AmbientLight(color, intensity)
  scene.add(ambient)
}

export function initLights({ scene = defaultScene, position = [-10, 30, 40], r = 1 } = {}) {
  const spotLight = new THREE.SpotLight(0xffffff)
  spotLight.shadow.mapSize.width = 2048
  spotLight.shadow.mapSize.height = 2048
  spotLight.shadow.camera.fov = 15
  spotLight.castShadow = true
  spotLight.decay = 2
  spotLight.penumbra = 0.05

  const ambientLight = new THREE.AmbientLight(0x343434)

  const container = new THREE.Mesh(
    new THREE.SphereGeometry(r),
    new THREE.MeshToonMaterial({ color: 0xFCE570 })
  )
  container.add(spotLight, ambientLight)
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

export function sunFollow(sun, pos) {
  sun.position.copy(pos)
  sun.position.add(new THREE.Vector3(-10, 500, -10))
  sun.target.position.copy(pos)
  sun.updateMatrixWorld()
  sun.target.updateMatrixWorld()
}
