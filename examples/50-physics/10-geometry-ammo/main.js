import * as THREE from 'three'
import { scene, camera, renderer, createOrbitControls } from '/utils/scene.js'
import { AmmoPhysics } from '/node_modules/three/examples/jsm/physics/AmmoPhysics.js'

const physics = await AmmoPhysics()
const position = new THREE.Vector3()

camera.position.set(- 1, 1.5, 2)

const hemiLight = new THREE.HemisphereLight()
hemiLight.intensity = 0.35
scene.add(hemiLight)

const dirLight = new THREE.DirectionalLight()
dirLight.position.set(5, 5, 5)
dirLight.castShadow = true
dirLight.shadow.camera.zoom = 2
scene.add(dirLight)

const floor = new THREE.Mesh(
  new THREE.BoxGeometry(10, 5, 10),
  new THREE.ShadowMaterial({ color: 0x111111 })
)
floor.position.y = - 2.5
floor.receiveShadow = true
scene.add(floor)
physics.addMesh(floor)

const material = new THREE.MeshLambertMaterial()

const matrix = new THREE.Matrix4()
const color = new THREE.Color()

// Boxes
const geometryBox = new THREE.BoxGeometry(0.1, 0.1, 0.1)
const boxes = new THREE.InstancedMesh(geometryBox, material, 100)
boxes.instanceMatrix.setUsage(THREE.DynamicDrawUsage) // will be updated every frame
boxes.castShadow = true
boxes.receiveShadow = true
scene.add(boxes)

for (let i = 0; i < boxes.count; i ++) {
  matrix.setPosition(Math.random() - 0.5, Math.random() * 2, Math.random() - 0.5)
  boxes.setMatrixAt(i, matrix)
  boxes.setColorAt(i, color.setHex(0xffffff * Math.random()))
}

physics.addMesh(boxes, 1)

// Spheres
const geometrySphere = new THREE.IcosahedronGeometry(0.075, 3)
const spheres = new THREE.InstancedMesh(geometrySphere, material, 100)
spheres.instanceMatrix.setUsage(THREE.DynamicDrawUsage) // will be updated every frame
spheres.castShadow = true
spheres.receiveShadow = true
scene.add(spheres)

for (let i = 0; i < spheres.count; i ++) {

  matrix.setPosition(Math.random() - 0.5, Math.random() * 2, Math.random() - 0.5)
  spheres.setMatrixAt(i, matrix)
  spheres.setColorAt(i, color.setHex(0xffffff * Math.random()))
}

physics.addMesh(spheres, 1)

const controls = createOrbitControls()
controls.target.y = 0.5
controls.update()

setInterval(() => {
  let index = Math.floor(Math.random() * boxes.count)

  position.set(0, Math.random() + 1, 0)
  physics.setMeshPosition(boxes, position, index)

  index = Math.floor(Math.random() * spheres.count)

  position.set(0, Math.random() + 1, 0)
  physics.setMeshPosition(spheres, position, index)

}, 1000 / 60)

void function loop() {
  requestAnimationFrame(loop)
  renderer.render(scene, camera)
}()