import { scene, renderer, camera, clock, createOrbitControls } from '/utils/scene.js'
import { createSun } from '/utils/light.js'
import { createGround } from '/utils/ground.js'
import { createLocomotive } from '/utils/geometry/shapes.js'
import Thrust from '/utils/classes/Thrust.js'
import { followPath, createEllipse } from '/utils/path.js'

createOrbitControls()
camera.position.z = 20

scene.add(createSun())
scene.add(createGround({ size: 50 }))

const outerCurve = createEllipse({ xRadius: 30, yRadius: 15 })
const innerCurve = createEllipse({ xRadius: 29, yRadius: 14 })
scene.add(outerCurve, innerCurve)

const locomotive = createLocomotive()
scene.add(locomotive)

const thrust = new Thrust()
thrust.mesh.rotateX(Math.PI).translateZ(-2).translateY(-2)
locomotive.add(thrust.mesh)

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  const delta = clock.getDelta()
  const elapsedTime = clock.getElapsedTime()
  followPath({ path: outerCurve.userData.path, mesh: locomotive, elapsedTime })
  thrust.update(delta)
  renderer.render(scene, camera)
}()
