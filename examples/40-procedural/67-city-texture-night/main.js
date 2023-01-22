// http://learningthreejs.com/blog/2013/08/02/how-to-do-a-procedural-city-in-100lines/
import * as THREE from 'three'
import { scene, camera, renderer, createOrbitControls, hemLight } from '/utils/scene.js'
import { createFloor } from '/utils/ground.js'
import { createCity, createBuildingTexture } from '/utils/city.js'

const size = 2000
const numBuildings = 10000

hemLight()
const controls = createOrbitControls()
camera.position.set(0, 100, 400)
camera.lookAt(new THREE.Vector3(0, 100, 0))

scene.fog = new THREE.FogExp2(0x304050, 0.001)
renderer.setClearColor(0x070b34)

scene.add(createFloor({ size, color: 0x101018 }))
scene.add(createCity({ numBuildings, size, circle: false, rotateEvery: 2, enlargeEvery: 10, map: createBuildingTexture({ night: true }), colorParams: { colorful: .035, max: 1 }, night: true }))

/* INIT */

void function animate() {
  requestAnimationFrame(animate)
  controls.update()
  renderer.render(scene, camera)
}()
