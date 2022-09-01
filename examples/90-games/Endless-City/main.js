import * as THREE from 'three'
import { GLTFLoader } from '/node_modules/three/examples/jsm/loaders/GLTFLoader.js'
import { MapControls } from '/node_modules/three/examples/jsm/controls/OrbitControls.js'
import { scene, camera, renderer } from '/utils/scene.js'
import { createSun } from '/utils/light.js'
import { SOUTH, LEAP, cluster } from './data.js'

const sun = createSun()
sun.position.set(-120, 175, -150)
scene.add(sun)

const controls = new MapControls(camera, renderer.domElement)
renderer.outputEncoding = THREE.GammaEncoding
camera.position.set(0, 50, 10)

const cars = []
const loader = new GLTFLoader()

cluster.forEach(cls => loadCluster(cls))
loadCars({ x: 1, z: 0, cluster: 'cars' })

function loadCluster({ x, z, cluster, direction }) {
  loader.load(`models/${cluster}.glb`, ({ scene: model }) => {
    model.traverse(child => {
      if (child.isMesh)
        child.receiveShadow = child.castShadow = true
    })

    model.position.set(x * 60, 0, z * 60)
    if (direction == SOUTH) model.rotation.y = Math.PI * direction
    scene.add(model)
  })
}

function loadCars({ x, z, cluster, direction }) {
  loader.load(`models/${cluster}.gltf`, ({ scene: model }) => {
    model.traverse(child => {
      if (child.isMesh)
        child.receiveShadow = child.castShadow = true
    })

    model.position.set(x * 60, 0, z * 60)
    if (direction == SOUTH) model.rotation.y = Math.PI * direction

    scene.add(model)

    model.children.forEach(e => {
      e.distance = 0
      e.maxSpeed = 0.3
      e.speed = e.maxSpeed
      e.r = new THREE.Raycaster(
        new THREE.Vector3(e.position.x, 2, e.position.z),
        new THREE.Vector3(e.userData.x, 0, e.userData.z),
        5,
        15
      )
      cars.push(e)
    })
  })
}

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  controls.update()

  cars.forEach(car => {
    car.r.set(
      new THREE.Vector3(car.position.x + 58, 1, car.position.z),
      new THREE.Vector3(car.userData.x, 0, car.userData.z)
    )
    const obstacles = car.r.intersectObjects(cars, true)
    if (obstacles.length > 0) {
      car.speed = 0
      return
    }

    car.speed = car.speed < car.maxSpeed ? car.speed + 0.002 : car.speed

    if (car.position.x < -380) car.position.x += LEAP * 2
    else if (car.position.x > 100) car.position.x -= LEAP * 2
    if (car.position.z < -320) car.position.x += LEAP * 2
    else if (car.position.z > 160) car.position.x -= LEAP * 2

    car.position.x += car.userData.x * car.speed
    car.position.z += car.userData.z * car.speed
  })
  renderer.render(scene, camera)
}()
