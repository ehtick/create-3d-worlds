import * as THREE from 'three'
import { scene, renderer, camera, clock, createOrbitControls } from '/utils/scene.js'
import { createSun } from '/utils/light.js'
import { createGround } from '/utils/ground.js'
import { createLocomotive } from '/utils/geometry/shapes.js'
import { simplePath, createPathVisual } from '/utils/path.js'

import Thrust from '/utils/classes/Thrust.js'

createOrbitControls()
camera.position.z = 20

scene.add(createSun())

scene.add(createGround({ size: 50 }))
scene.add(createPathVisual(simplePath))

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

  simplePath.getPointAt(speed % 1, currPosition)
  simplePath.getPointAt((speed + 0.01) % 1, nextPosition)
  locomotive.position.set(currPosition.x, 1, currPosition.y)
  locomotive.lookAt(nextPosition.x, 1, nextPosition.y)

  renderer.render(scene, camera)
}()
