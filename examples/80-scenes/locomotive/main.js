import * as THREE from 'three'
import { scene, renderer, camera, clock, createOrbitControls } from '/utils/scene.js'
import { createSun } from '/utils/light.js'
import { createGround } from '/utils/ground.js'
import { createLocomotive } from '/utils/geometry/shapes.js'
import Thrust from '/utils/classes/Thrust.js'
import { followPath } from '/utils/path.js'

createOrbitControls()
camera.position.z = 20

scene.add(createSun())

scene.add(createGround({ size: 50 }))

// https://stackoverflow.com/questions/45816041/how-to-make-parallel-curves-in-three-js-for-road-marking

const distance = 1
const outerXRadius = 30
const outerYRadius = 15
const innerXRadius = outerXRadius - distance
const innerYRadius = outerYRadius - distance
const outerPath = new THREE.EllipseCurve(0, 0, outerXRadius, outerYRadius, 0, 2 * Math.PI, false)
const innerPath = new THREE.EllipseCurve(0, 0, innerXRadius, innerYRadius, 0, 2 * Math.PI, false)

const outerGeometry = new THREE.BufferGeometry().setFromPoints(outerPath.getPoints(256))
const innerGeometry = new THREE.BufferGeometry().setFromPoints(innerPath.getPoints(256))

const material = new THREE.LineBasicMaterial({ color: 0x333333 })
const outerCurve = new THREE.Line(outerGeometry, material)
const innerCurve = new THREE.Line(innerGeometry, material)

outerCurve.rotation.x = innerCurve.rotation.x = -Math.PI / 2

scene.add(outerCurve)
scene.add(innerCurve)

const locomotive = createLocomotive()
scene.add(locomotive)

const thrust = new Thrust()
thrust.mesh.rotateX(Math.PI)
thrust.mesh.translateZ(-2)
thrust.mesh.translateY(-2)
locomotive.add(thrust.mesh)

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  const delta = clock.getDelta()
  thrust.update(delta)

  const time = clock.getElapsedTime()
  followPath({ path: outerPath, mesh: locomotive, elapsedTime: time })

  renderer.render(scene, camera)
}()
