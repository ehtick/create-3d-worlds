/* global CANNON */
import * as THREE from '/node_modules/three127/build/three.module.js'

import * as utils from './utils.js'
import createVehicle from './vehicle.js'
import { generateTerrain } from './terrainHelper.js'
import { cameraHelper } from './cameraHelper.js'

const world = new CANNON.World()
const scene = new THREE.Scene()
const renderer = new THREE.WebGLRenderer(/* {antialias: true}*/)
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000)
let pause = false

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
const sunLight = new THREE.DirectionalLight(0xf5f4d3, 0.9)
sunLight.position.set(-1, 100, -1).normalize()
scene.add(ambientLight)
scene.add(sunLight)

world.broadphase = new CANNON.SAPBroadphase(world)
world.gravity.set(0, -10, 0)
world.defaultContactMaterial.friction = 0.001

renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const vehicleInitialPosition = new THREE.Vector3(70, 2, 60)
const vehicleInitialRotation = new THREE.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, -1, 0), -Math.PI / 2)
let resetVehicle = () => {}

utils.loadResource('model/skybox.jpg').then(cubeTexture => {
  const skyBox = new THREE.CubeTexture(utils.sliceCubeTexture(cubeTexture))
  skyBox.needsUpdate = true
  scene.background = skyBox
})

const [wheelGLTF, chassisGLTF, terrainGLB] = await Promise.all([
  utils.loadResource('model/lowPoly_car_wheel.gltf'),
  utils.loadResource('model/mg.gltf'),
  utils.loadResource('model/terrain.glb'),
])

const terrain = terrainGLB.scene

scene.add(terrain)
const heightField = generateTerrain()
world.addBody(heightField)

const wheel = wheelGLTF.scene
const chassis = chassisGLTF.scene
chassis.scale.set(0.7, 0.7, 0.7)

const meshes = {
  wheel_front_r: wheel,
  wheel_front_l: wheel.clone(),
  wheel_rear_r: wheel.clone(),
  wheel_rear_l: wheel.clone(),
  chassis,
}

const vehicle = createVehicle()
vehicle.addToWorld(world, meshes)

resetVehicle = () => {
  vehicle.chassisBody.position.copy(vehicleInitialPosition)
  vehicle.chassisBody.quaternion.copy(vehicleInitialRotation)
  vehicle.chassisBody.velocity.set(0, 0, 0)
  vehicle.chassisBody.angularVelocity.set(0, 0, 0)
}
resetVehicle()

Object.keys(meshes).forEach(meshName => {
  // mirror meshes suffixed with '_r'
  if (meshName.endsWith('_r'))
    ['x', 'y', 'z'].forEach(axis => {
      meshes[meshName].scale[axis] *= -1
    })
  scene.add(meshes[meshName])
})

cameraHelper.init(camera, chassis)

/* LOOP */

void function render() {
  requestAnimationFrame(render)
  if (pause) return

  world.step(1 / 60)
  cameraHelper.update()
  renderer.render(scene, camera)
}()

/* EVENTS */

const instructions = document.getElementById('instructions-container')

window.addEventListener('keyup', e => {
  switch (e.key.toUpperCase()) {
    case 'C':
      cameraHelper.switch()
      break
    case 'P':
      pause = !pause
      break
    case 'R':
      resetVehicle()
      break
    case 'ESCAPE':
      instructions.classList.toggle('hidden')
      break
  }
})
