import { scene, renderer, camera, clock } from '/utils/scene.js'
import { createSun } from '/utils/light.js'
import { createGround } from '/utils/ground.js'
import { createAvatar, updateAvatar } from '/utils/geometry/avatar.js'
import { simpleCurve, createPathVisual, followPath } from '/utils/path.js'

scene.add(createSun())

camera.position.set(12, 6, 16)
camera.lookAt(0, 0, 0)

scene.add(createGround({ size: 50 }))
scene.add(createPathVisual(simpleCurve))

const avatar = createAvatar()
scene.add(avatar)

/* LOOP */

void function loop() {
  const time = clock.getElapsedTime()
  followPath({ path: simpleCurve, mesh: avatar, elapsedTime: time })
  updateAvatar(avatar, time * 5)
  renderer.render(scene, camera)
  requestAnimationFrame(loop)
}()
