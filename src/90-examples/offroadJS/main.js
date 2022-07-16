/* global CANNON */
import * as THREE from '/node_modules/three127/build/three.module.js'

import * as utils from './utils.js'
import createVehicle from './raycastVehicle.js'
import { generateTerrain } from './terrainHelper.js'
import { cameraHelper } from './cameraHelper.js'

const gravity = [0, -10, 0]
const worldStep = 1 / 60

const gWorld = new CANNON.World()
const gScene = new THREE.Scene()
const gRenderer = new THREE.WebGLRenderer(/* {antialias: true}*/)
const gCamera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000)
let pause = false
// omogućiti gama za ovu scenu gRenderer.gammaOutput = true

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
const sunLight = new THREE.DirectionalLight(0xf5f4d3, 0.9)
sunLight.position.set(-1, 100, -1).normalize()
gScene.add(ambientLight)
gScene.add(sunLight)

gWorld.broadphase = new CANNON.SAPBroadphase(gWorld)
gWorld.gravity.set(...gravity)
gWorld.defaultContactMaterial.friction = 0.001

gRenderer.setPixelRatio(window.devicePixelRatio)
gRenderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(gRenderer.domElement)

const vehicleInitialPosition = new THREE.Vector3(70, 2, 60)
const vehicleInitialRotation = new THREE.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, -1, 0), -Math.PI / 2)
let resetVehicle = () => {}

utils.loadResource('model/skybox.jpg').then(cubeTexture => {
  const skyBox = new THREE.CubeTexture(utils.sliceCubeTexture(cubeTexture))
  skyBox.needsUpdate = true
  gScene.background = skyBox
})

const [wheelGLTF, chassisGLTF, terrainGLB] = await Promise.all([
  utils.loadResource('model/lowPoly_car_wheel.gltf'),
  utils.loadResource('model/mg.gltf'),
  utils.loadResource('model/terrain.glb'),
])

const terrain = terrainGLB.scene

gScene.add(terrain)
const heightField = generateTerrain()
gWorld.addBody(heightField)

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
vehicle.addToWorld(gWorld, meshes)

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
  gScene.add(meshes[meshName])
})

cameraHelper.init(gCamera, chassis)

/* LOOP */

void function render() {
  if (pause) return

  gWorld.step(worldStep)
  cameraHelper.update()
  gRenderer.render(gScene, gCamera)
  requestAnimationFrame(render)
}()

/* EVENTS */

const instructionsContainer = document.getElementById('instructions-container')
const instructionsCloseButton = document.getElementById('instructions-close-button')

window.addEventListener('keyup', e => {
  switch (e.key.toUpperCase()) {
    case 'C':
      cameraHelper.switch()
      break
    case 'P':
      pause = !pause
      if (pause)
        console.info('Pause')
      else
        render()
      break
    case 'R':
      resetVehicle()
      break
    case 'ESCAPE':
      instructionsContainer.classList.toggle('hidden')
      break
  }
})

instructionsCloseButton.addEventListener('click', () => {
  instructionsContainer.classList.add('hidden')
})

instructionsContainer.addEventListener('mousedown', e => {
  console.log('instructions mousedown')
  e.stopImmediatePropagation
  e.stopPropagation
})
