import * as THREE from '/node_modules/three/build/three.module.js'
import { camera, scene, renderer, createOrbitControls } from '/utils/scene.js'
import { createGround } from '/utils/ground.js'
import { createCrate, createBarrel, createWoodBarrel } from '/utils/geometry.js'
import { createMoon } from '/utils/planets.js'

createOrbitControls()

const light = new THREE.PointLight(0xffffff)
light.position.set(0, 15, 10)
scene.add(light)
const light2 = new THREE.AmbientLight(0x444444)
scene.add(light2)

/* GEOMETRIES */

const floor = createGround()
scene.add(floor)

const barrel = createWoodBarrel({ r: .4, height: 1 })
barrel.position.set(-2.4, .5, 0)
scene.add(barrel)

const moon = createMoon({ r: .5 })
moon.position.set(-1.2, .5, 0)
scene.add(moon)

const crate = createCrate()
crate.position.set(0, 0, 0)
scene.add(crate)

const rustBarrel = createBarrel()
rustBarrel.position.set(1.2, .5, 0)
scene.add(rustBarrel)

const metalBarrel = createBarrel({ file: 'barrel/metal-barrel-side.jpg', topFile: 'rusty.jpg' })
metalBarrel.position.set(2.4, .5, 0)
scene.add(metalBarrel)

/* UPDATE */

void function update() {
  requestAnimationFrame(update)
  renderer.render(scene, camera)
}()
