import * as THREE from 'three'
import { DragControls } from '/node_modules/three/examples/jsm/controls/DragControls.js'
import {scene, renderer, camera} from '/utils/scene.js'

let controls, group
let enableSelection = false

const objects = []

const mouse = new THREE.Vector2(), raycaster = new THREE.Raycaster()

init()

function init() {
  camera.position.z = 1000
  scene.add(new THREE.AmbientLight(0x505050))

  const light = new THREE.SpotLight(0xffffff, 1.5)
  light.position.set(0, 500, 2000)
  scene.add(light)

  group = new THREE.Group()
  scene.add(group)

  const geometry = new THREE.BoxGeometry(40, 40, 40)

  for (let i = 0; i < 200; i ++) {
    const object = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff }))

    object.position.x = Math.random() * 1000 - 500
    object.position.y = Math.random() * 600 - 300
    object.position.z = Math.random() * 800 - 400

    object.rotation.x = Math.random() * 2 * Math.PI
    object.rotation.y = Math.random() * 2 * Math.PI
    object.rotation.z = Math.random() * 2 * Math.PI

    object.scale.x = Math.random() * 2 + 1
    object.scale.y = Math.random() * 2 + 1
    object.scale.z = Math.random() * 2 + 1

    object.castShadow = true
    object.receiveShadow = true

    scene.add(object)

    objects.push(object)
  }

  controls = new DragControls([... objects], camera, renderer.domElement)
  controls.addEventListener('drag', render)

  document.addEventListener('click', onClick)
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)

  render()
}

function onKeyDown(event) {
  enableSelection = (event.keyCode === 16)
}

function onKeyUp() {
  enableSelection = false
}

function onClick(event) {
  event.preventDefault()

  if (enableSelection === true) {

    const draggableObjects = controls.getObjects()
    draggableObjects.length = 0

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1

    raycaster.setFromCamera(mouse, camera)

    const intersections = raycaster.intersectObjects(objects, true)

    if (intersections.length > 0) {
      const { object } = intersections[0]

      if (group.children.includes(object) === true) {
        object.material.emissive.set(0x000000)
        scene.attach(object)
      } else {
        object.material.emissive.set(0xaaaaaa)
        group.attach(object)
      }

      controls.transformGroup = true
      draggableObjects.push(group)
    }

    if (group.children.length === 0) {
      controls.transformGroup = false
      draggableObjects.push(...objects)
    }
  }

  render()
}

function render() {
  renderer.render(scene, camera)
}
