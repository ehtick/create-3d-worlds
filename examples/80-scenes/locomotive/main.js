import * as THREE from 'three'
import { scene, renderer, camera, clock, createOrbitControls } from '/utils/scene.js'
import { createSun } from '/utils/light.js'
import { createGround } from '/utils/ground.js'
import { createLocomotive } from '/utils/geometry/shapes.js'
import Thrust from '/utils/classes/Thrust.js'
import { followPath, createEllipse } from '/utils/path.js'
import { loadModel } from '/utils/loaders.js'

createOrbitControls()
camera.position.z = 20

scene.add(createSun())
scene.add(createGround({ size: 50 }))

const outerLine = createEllipse({ xRadius: 30, yRadius: 15 })
const innerLine = createEllipse({ xRadius: 29.6, yRadius: 14.6 })
scene.add(outerLine, innerLine)

const { mesh: locomotive } = await loadModel({ file: 'vehicle/train/locomotive-lowpoly/parovoZ1.fbx', shouldCenter: true })
// const locomotive = createLocomotive()

const thrust = new Thrust()
thrust.mesh.rotateX(Math.PI).translateZ(-2).translateY(-2)
locomotive.add(thrust.mesh)

const group = new THREE.Group()
group.add(locomotive)
locomotive.translateX(-.2)
scene.add(group)

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  const delta = clock.getDelta()
  const elapsedTime = clock.getElapsedTime()
  followPath({ path: outerLine.userData.path, mesh: group, elapsedTime, speed: .025 })
  thrust.update(delta, { velocity: [0, -14, 5] })
  renderer.render(scene, camera)
}()
