import * as THREE from 'three'
import '/libs/modifiers.min.js'
import { scene, renderer, camera, createOrbitControls } from '/utils/scene.js'
import { createSun } from '/utils/light.js'

scene.add(createSun())
createOrbitControls()

// =========================================================================================== flag
const flagGroup = new THREE.Group()
flagGroup.rotateY(-Math.PI * .5)
scene.add(flagGroup)

const geometry = new THREE.CylinderGeometry(.03, .03, 4, 32)
const material = new THREE.MeshPhongMaterial({ color: new THREE.Color(0x654321) })
const pole = new THREE.Mesh(geometry, material)
pole.castShadow = true
flagGroup.add(pole)

const texture = new THREE.TextureLoader().load('zastava.jpg')
const flag = new THREE.Mesh(
  new THREE.PlaneGeometry(600, 430, 20, 20, true),
  new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide }))
flag.scale.set(.0025, .0025, .0025)
flag.position.set(.75, 1.5, 0)
flag.castShadow = true

flagGroup.add(flag)

// flag wave
const modifier = new ModifierStack(flag)
const cloth = new Cloth(3, 0)
cloth.setForce(0.2, -0.2, -0.2)

modifier.addModifier(cloth)
cloth.lockXMin(0)

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  modifier.apply()
  renderer.render(scene, camera)
}()