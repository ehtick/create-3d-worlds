import * as THREE from 'three'
import { scene, renderer, camera, createOrbitControls } from '/utils/scene.js'

const { degToRad } = THREE.MathUtils

const shadowLightRadius = 8

camera.position.y = 15

const controls = createOrbitControls()
controls.update()

const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.5)
scene.add(ambientLight)

function createShadowLight() {
  const dirLight = new THREE.DirectionalLight(0xFFFFFF, 1)
  dirLight.target.position.set(0, 0, 0)
  dirLight.castShadow = true
  dirLight.shadow.mapSize.width = 2000
  dirLight.shadow.mapSize.height = 2000

  dirLight.shadow.camera.left = -8
  dirLight.shadow.camera.right = 8
  dirLight.shadow.camera.far = 30

  scene.add(dirLight)
  scene.add(dirLight.target)

  return dirLight
}

const dirLight = createShadowLight()

function createBlock(radius, degree) {
  const cubeGeo = new THREE.BoxGeometry(1, 3, 1)
  const cubeMat = new THREE.MeshLambertMaterial({ color: 'white' })
  const cube = new THREE.Mesh(cubeGeo, cubeMat)
  cube.position.x = Math.cos(degToRad(degree)) * radius
  cube.position.z = Math.sin(degToRad(degree)) * radius
  cube.position.y = 1.5
  cube.rotation.y = degToRad(-degree)
  cube.castShadow = true
  cube.receiveShadow = true
  scene.add(cube)
}

for (let degree = 0; degree <= 360; degree += 30)
  createBlock(5, degree)

const planeSize = 20
const planeGeo = new THREE.PlaneBufferGeometry(planeSize, planeSize)
const planeMat = new THREE.MeshLambertMaterial({
  color: 'lightgray',
})
const plane = new THREE.Mesh(planeGeo, planeMat)
plane.receiveShadow = true
plane.rotation.x = degToRad(-90)
scene.add(plane)

/* LOOP */

let shadowLightAngle = 0

void function loop(time) {
  time *= 0.001
  shadowLightAngle += 0.3
  const shadowLightPositionX = Math.cos(degToRad(shadowLightAngle)) * shadowLightRadius
  const shadowLightPositionZ = Math.sin(degToRad(shadowLightAngle)) * shadowLightRadius
  // senka je dobra kad je svetlo nisko
  dirLight.position.set(shadowLightPositionX, 3, shadowLightPositionZ)

  renderer.render(scene, camera)
  requestAnimationFrame(loop)
}()