import * as THREE from 'three'
import { scene, renderer, camera, clock, createOrbitControls } from '/utils/scene.js'
import { createSun } from '/utils/light.js'
import { createGround } from '/utils/ground.js'
import Thrust from '/utils/classes/Thrust.js'
import { followPath, createEllipse } from '/utils/path.js'
import { loadModel } from '/utils/loaders.js'

createOrbitControls()
camera.position.z = 20

scene.add(createSun())
scene.add(createGround({ size: 50 }))

const outerLine = createEllipse({ xRadius: 30, yRadius: 15 })
const innerLine = createEllipse({ xRadius: 29.4, yRadius: 14.4 })
scene.add(outerLine, innerLine)

const { mesh: locomotive, mixer } = await loadModel({ file: 'vehicle/train/toy-locomotive/scene.gltf', angle: Math.PI, axis: [0, 1, 0] })

const thrust = new Thrust()

const group = new THREE.Group()
locomotive.position.set(-.3, -.25, 0)
thrust.mesh.rotateX(Math.PI).translateY(-1.5).translateZ(-1.5)
group.add(locomotive)
group.add(thrust.mesh)
scene.add(group)

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  const delta = clock.getDelta()
  const elapsedTime = clock.getElapsedTime()
  followPath({ path: outerLine.userData.path, mesh: group, elapsedTime, speed: .025 })
  thrust.update(delta * .5, { velocity: [0, -14, 5] })
  mixer.update(delta * 15)
  renderer.render(scene, camera)
}()
