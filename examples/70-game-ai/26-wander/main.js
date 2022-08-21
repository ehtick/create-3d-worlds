/* global THREE, SteeringEntity */
import { camera, scene, renderer, createOrbitControls } from '/utils/scene.js'
import { createFloor } from '/utils/ground.js'
import { ambLight } from '/utils/light.js'
import { createBox } from '/utils/geometry.js'

const { randInt } = THREE.Math

ambLight()

const controls = createOrbitControls()
camera.position.set(0, 100, 100)

const floor = createFloor({ size: 1000 })
scene.add(floor)

const numEntities = 20

const entities = []
for (let i = 0; i < numEntities; i++) {
  const mesh = createBox({ size: 10, height: 20 })
  const entity = new SteeringEntity(mesh)
  entity.maxSpeed = 1
  entity.position.set(randInt(-500, 500), 0, randInt(-500, 500))
  entities.push(entity)
  scene.add(entity)
}

const boundaries = new THREE.Box3(new THREE.Vector3(-500, 0, -500), new THREE.Vector3(500, 0, 500))

void function animate() {
  requestAnimationFrame(animate)

  entities.forEach(entity => {
    entity.wander()
    entity.lookWhereGoing(true)
    entity.update()
    entity.bounce(boundaries)
  })

  controls.update()
  renderer.render(scene, camera)
}()