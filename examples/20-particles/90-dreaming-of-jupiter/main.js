import * as THREE from 'three'
import { camera, scene, renderer } from '/utils/scene.js'
import { createMoon, createJupiter } from '/utils/planets.js'
import { createTerrain, wave, shake } from '/utils/ground.js'
import { createStars, updateStars } from '/utils/particles.js'

scene.background = new THREE.Color(0x000000)
camera.position.set(0, 9, 32)

let t = 0

const light = new THREE.PointLight('#ffffff', 1, 0)
light.position.set(0, 30, 30)
scene.add(light)

const planet = createJupiter()
planet.position.set(0, 8, -30)
scene.add(planet)

const moon = createMoon()
moon.position.set(0, 8, 0)
scene.add(moon)

const terrain = createTerrain() // { colorParam: 'purple' }
terrain.material.wireframe = true
scene.add(terrain)

const stars = createStars({ num: 1000 })
scene.add(stars)

/* FUNCTIONS */

function orbit(moon, t) {
  moon.rotation.y -= 0.007

  moon.position.x = 15 * Math.cos(t)
  moon.position.z = 20 * Math.sin(t) - 35
}

const updateTerrain = Math.random() > .5 ? shake : wave

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)

  planet.rotation.y += 0.002
  orbit(moon, t)
  updateTerrain(terrain.geometry, t)
  updateStars({ particles: stars })

  t += 0.015
  renderer.render(scene, camera)
}()
