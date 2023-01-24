// http://learningthreejs.com/blog/2013/08/02/how-to-do-a-procedural-city-in-100lines/
import * as THREE from 'three'
import { scene, camera, renderer, createOrbitControls } from '/utils/scene.js'
import { createFloor } from '/utils/ground.js'
import { createCity, createBuildingTexture } from '/utils/city.js'
import { hemLight } from '/utils/light.js'

const mapSize = 2000
const numBuildings = 10000

hemLight()
const controls = createOrbitControls()
camera.position.set(0, 100, 400)
camera.lookAt(new THREE.Vector3(0, 100, 0))

scene.fog = new THREE.FogExp2(0xd0e0f0, 0.0025)
renderer.setClearColor(0x7ec0ee)

scene.add(createFloor({ size: mapSize }))
scene.add(createCity({ mapSize, numBuildings, rotateEvery: 2, enlargeEvery: 10, map: createBuildingTexture(), colorParams: { colorful: .035, max: 1 } }))

/* INIT */

void function animate() {
  requestAnimationFrame(animate)
  controls.update()
  renderer.render(scene, camera)
}()
