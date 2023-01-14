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

// https://stackoverflow.com/questions/45816041/how-to-make-parallel-curves-in-three-js-for-road-marking

const { mesh: outerCurve, path } = createEllipse({ xRadius: 30, yRadius: 15 })
const { mesh: innerCurve } = createEllipse({ xRadius: 29, yRadius: 14 })
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
  followPath({ path, mesh: locomotive, elapsedTime })
  thrust.update(delta)
  renderer.render(scene, camera)
}()
