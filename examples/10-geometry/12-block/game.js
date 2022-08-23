import { camera, scene, renderer } from '/utils/scene.js'
import { initLights } from '/utils/light.js'
import { createBox, createBumpBox } from '/utils/geometry.js'

const rotSpeed = 0.005

camera.position.set(0, .3, 2)
initLights()

/* CUBE */

const cube = createBox({ file: 'walls/bricks.jpg' })
cube.position.set(-1, 0, 0)
scene.add(cube)

const bumpCube = createBumpBox()
bumpCube.position.set(1, 0, 0)
scene.add(bumpCube)

/* LOOP */

void function render() {
  renderer.render(scene, camera)
  cube.rotation.y += rotSpeed
  bumpCube.rotation.y -= rotSpeed
  requestAnimationFrame(render)
}()
