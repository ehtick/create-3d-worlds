import * as THREE from 'three'
import { scene, renderer, camera, clock, createOrbitControls } from '/utils/scene.js'
import { createSun } from '/utils/light.js'
import { createGround } from '/utils/ground.js'
import { createLocomotive } from '/utils/geometry/shapes.js'
import { simpleCurve, createPathVisual } from '/utils/path.js'

import Thrust from '/utils/classes/Thrust.js'

createOrbitControls()
camera.position.z = 20

scene.add(createSun())

scene.add(createGround({ size: 50 }))

// https://stackoverflow.com/questions/45816041/how-to-make-parallel-curves-in-three-js-for-road-marking
const path1 = createPathVisual(simpleCurve)
scene.add(path1)
const path2 = createPathVisual(simpleCurve)
path2.translateX(2)
scene.add(path2)

const locomotive = createLocomotive()
scene.add(locomotive)

const thrust = new Thrust()
thrust.mesh.rotateX(Math.PI)
thrust.mesh.translateZ(-2)
thrust.mesh.translateY(-2)
locomotive.add(thrust.mesh)

/* LOOP */

const currPosition = new THREE.Vector2()
const nextPosition = new THREE.Vector2()

void function loop() {
  requestAnimationFrame(loop)
  const delta = clock.getDelta()
  thrust.update(delta)

  const time = clock.getElapsedTime()
  const speed = time * 0.05

  simpleCurve.getPointAt(speed % 1, currPosition)
  simpleCurve.getPointAt((speed + 0.01) % 1, nextPosition)
  locomotive.position.set(currPosition.x, 1, currPosition.y)
  locomotive.lookAt(nextPosition.x, 1, nextPosition.y)

  renderer.render(scene, camera)
}()
