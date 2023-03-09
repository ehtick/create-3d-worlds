import { scene, renderer, camera, clock, createOrbitControls } from '/utils/scene.js'
import { createSun } from '/utils/light.js'
import { createGround } from '/utils/ground.js'
import Thrust from '/utils/classes/Thrust.js'
import { followPath, createEllipse, createRailroadTracks } from '/utils/path.js'
import { loadModel } from '/utils/loaders.js'

createOrbitControls()
camera.position.z = 20

scene.add(createSun())
scene.add(createGround({ size: 50, circle: true }))

const xRadius = 40, yRadius = 15

const line = createEllipse({ xRadius, yRadius })
const { path } = line.userData
const outerLine = createEllipse({ xRadius: xRadius + .4, yRadius: yRadius + .4 })
const innerLine = createEllipse({ xRadius: xRadius - .4, yRadius: yRadius - .4 })
scene.add(outerLine, innerLine)

const { mesh: locomotive, mixer } = await loadModel({
  file: 'vehicle/train/toy-locomotive/scene.gltf', angle: Math.PI, axis: [0, 1, 0]
})
scene.add(locomotive)

const thrust = new Thrust(true)
thrust.mesh.position.set(0, 1.5, 1.5)
locomotive.add(thrust.mesh)

const tracks = createRailroadTracks(path, 200)
scene.add(...tracks)

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  const delta = clock.getDelta()
  const elapsedTime = clock.getElapsedTime()

  followPath({ path, mesh: locomotive, elapsedTime, speed: .025, y: .75 })
  thrust.update(delta * .5, { velocity: [0, -14, 5] })
  mixer.update(delta * 15)

  renderer.render(scene, camera)
}()
