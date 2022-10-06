import * as THREE from 'three'
import { scene, camera, renderer, createOrbitControls } from '/utils/scene.js'
import { AmmoPhysics } from '/node_modules/three/examples/jsm/physics/AmmoPhysics.js'
import { createSun } from '/utils/light.js'

createOrbitControls()

const physics = await AmmoPhysics()
const position = new THREE.Vector3()

const sun = createSun()
scene.add(sun)

const floor = new THREE.Mesh(
  new THREE.BoxGeometry(100, 2, 100),
  new THREE.MeshToonMaterial()
)
floor.receiveShadow = true
floor.position.y = -1
scene.add(floor)
physics.addMesh(floor)

const material = new THREE.MeshLambertMaterial()
const color = new THREE.Color()

const boxNum = 100
const geometry = new THREE.BoxGeometry()
const boxes = new THREE.InstancedMesh(geometry, material, boxNum)
// boxes.instanceMatrix.setUsage(THREE.DynamicDrawUsage) // will be updated every frame
boxes.castShadow = boxes.receiveShadow = true
scene.add(boxes)

for (let i = 0; i < boxes.count; i ++)
  boxes.setColorAt(i, color.setHex(0xffffff * Math.random()))

physics.addMesh(boxes, 1)

setInterval(() => {
  const index = Math.floor(Math.random() * boxes.count)
  position.set(0, Math.random() * 100, 0)
  physics.setMeshPosition(boxes, position, index)
}, 1000 / 60)

void function loop() {
  requestAnimationFrame(loop)
  renderer.render(scene, camera)
}()