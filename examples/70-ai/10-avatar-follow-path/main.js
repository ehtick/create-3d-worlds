import * as THREE from 'three'
import { scene, renderer, camera, clock } from '/utils/scene.js'
import { createSun } from '/utils/light.js'
import { createGround } from '/utils/ground.js'
import { createAvatar, updateAvatar } from '/utils/geometry/avatar.js'
import { simpleCurve, createPathVisual } from '/utils/path.js'

scene.add(createSun())

camera.position.set(12, 6, 16)
camera.lookAt(0, 0, 0)

scene.add(createGround({ size: 50 }))
scene.add(createPathVisual(simpleCurve))

const avatar = createAvatar()
scene.add(avatar)

/* LOOP */

const currPosition = new THREE.Vector2()
const nextPosition = new THREE.Vector2()

void function loop() {
  const time = clock.getElapsedTime()
  const speed = time * 0.05

  simpleCurve.getPointAt(speed % 1, currPosition)
  simpleCurve.getPointAt((speed + 0.01) % 1, nextPosition)
  avatar.position.set(currPosition.x, 0, currPosition.y)
  avatar.lookAt(nextPosition.x, 0, nextPosition.y)
  updateAvatar(avatar, time * 5)

  renderer.render(scene, camera)
  requestAnimationFrame(loop)
}()
