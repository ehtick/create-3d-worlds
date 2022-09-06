import * as THREE from 'three'
import { SteeringEntity } from '/libs/ThreeSteer.js'
import { camera, scene, renderer, createOrbitControls } from '/utils/scene.js'
import { createFloor } from '/utils/ground.js'
import { getMouseIntersects } from '/utils/helpers.js'
import { createBall, createCrate } from '/utils/geometry.js'
import { ambLight } from '/utils/light.js'

const { randInt } = THREE.MathUtils

ambLight()

const controls = createOrbitControls()
camera.position.set(0, 10, 10)

const floor = createFloor({ size: 100 })
scene.add(floor)

const ball = createBall({ r: 0.5 })
scene.add(ball)

const ai = new SteeringEntity(createCrate())
ai.position.set(randInt(-50, 50), 0, randInt(-50, 50))
ai.maxSpeed = .1
scene.add(ai)

// Plane boundaries (do not cross)
const boundaries = new THREE.Box3(new THREE.Vector3(-50, 0, -50), new THREE.Vector3(50, 0, 50))

/* LOOP */

void function update() {
  requestAnimationFrame(update)
  controls.update()

  if (ai.position.distanceTo(ball.position) > 1) {
    ai.seek(ball.position)
    ai.lookWhereGoing(true)
  } else {
    ai.idle()
    ai.lookAt(ball.position)
  }

  ai.bounce(boundaries)
  ai.update()
  renderer.render(scene, camera)
}()

/* EVENT */

document.addEventListener('mousemove', e => {
  const intersects = getMouseIntersects(e, camera, scene)
  if (intersects.length > 0)
    ball.position.set(intersects[0].point.x, .5, intersects[0].point.z)
})
