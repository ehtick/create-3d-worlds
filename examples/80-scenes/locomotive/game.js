import * as THREE from 'three'
import { scene, renderer, camera, clock } from '/utils/scene.js'
import { createSun } from '/utils/light.js'
import { createGround } from '/utils/ground.js'
import { createLocomotive } from '/utils/geometry/shapes.js'
import { simplePath, createPathVisual } from '/utils/path.js'

scene.add(createSun())

camera.position.set(12, 6, 16)
camera.lookAt(0, 0, 0)

scene.add(createGround({ size: 50 }))
scene.add(createPathVisual(simplePath))

const avatar = createLocomotive()
scene.add(avatar)

/* LOOP */

const currPosition = new THREE.Vector2()
const nextPosition = new THREE.Vector2()

void function loop() {
  const time = clock.getElapsedTime()
  const speed = time * 0.05

  simplePath.getPointAt(speed % 1, currPosition)
  simplePath.getPointAt((speed + 0.01) % 1, nextPosition)
  avatar.position.set(currPosition.x, 0, currPosition.y)
  avatar.lookAt(nextPosition.x, 0, nextPosition.y)
  // updateLocomotive()

  renderer.render(scene, camera)
  requestAnimationFrame(loop)
}()
