import * as THREE from 'three'
import { DragControls } from '/node_modules/three/examples/jsm/controls/DragControls.js'
import { scene, renderer, camera } from '/utils/scene.js'

const { randInt, randFloat } = THREE.Math

const objects = []

camera.position.z = 800
scene.add(new THREE.AmbientLight(0x505050))

const light = new THREE.SpotLight(0xffffff, 1.5)
light.position.set(0, 500, 2000)
scene.add(light)

const geometry = new THREE.BoxGeometry(40, 40, 40)

for (let i = 0; i < 200; i ++) {
  const object = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff }))

  object.position.x = randInt(-500, 500)
  object.position.y = randInt(-300, 300)
  object.position.z = randInt(-400, 400)

  object.scale.x = randFloat(1, 3)
  object.scale.y = randFloat(1, 3)
  object.scale.z = randFloat(1, 3)

  scene.add(object)
  objects.push(object)
}

const controls = new DragControls(objects, camera, renderer.domElement)

render()

function render() {
  renderer.render(scene, camera)
}

/* EVENT */

controls.addEventListener('drag', render)
