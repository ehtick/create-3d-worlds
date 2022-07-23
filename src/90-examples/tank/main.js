import * as THREE from '/node_modules/three127/build/three.module.js'
import { scene, renderer, camera, clock } from '/utils/scene.js'
import { initLights } from '/utils/light.js'
import { createGround } from '/utils/ground.js'
import { createTank } from './tank.js'
import { path, createPathVisual, createTarget } from './utils.js'

camera.position.set(8, 4, 10).multiplyScalar(2)
camera.lookAt(0, 0, 0)

initLights()

scene.add(createGround({ size: 50 }))

const { tank, tankGun, wheelMeshes } = createTank()
scene.add(tank)

const { targetOrbit, targetMesh } = createTarget()
scene.add(targetOrbit)

scene.add(createPathVisual(path))

/* LOOP */

const targetPosition = new THREE.Vector3()
const tankPosition = new THREE.Vector2()
const tankNext = new THREE.Vector2()

void function loop() {
  const time = clock.getElapsedTime()
  const tankTime = time * 0.05

  targetOrbit.rotation.y = time * .27
  targetMesh.getWorldPosition(targetPosition)

  path.getPointAt(tankTime % 1, tankPosition)
  path.getPointAt((tankTime + 0.01) % 1, tankNext)
  tank.position.set(tankPosition.x, 0, tankPosition.y)
  tank.lookAt(tankNext.x, 0, tankNext.y)
  tankGun.lookAt(targetPosition)

  wheelMeshes.forEach(obj => {
    obj.rotation.x = time * 3
  })

  renderer.render(scene, camera)
  requestAnimationFrame(loop)
}()
