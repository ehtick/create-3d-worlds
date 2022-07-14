// https://threejs.org/examples/?q=water#webgl_shaders_ocean
import * as THREE from '/node_modules/three127/build/three.module.js'
import { Water } from '/node_modules/three127/examples/jsm/objects/Water.js'
import { Sky } from '/node_modules/three127/examples/jsm/objects/Sky.js'
import { camera, scene, renderer } from '/utils/scene.js'

camera.position.y = 15

const sun = new THREE.Vector3()

const waterGeometry = new THREE.PlaneGeometry(10000, 10000)
const water = new Water(
  waterGeometry,
  {
    textureWidth: 512,
    textureHeight: 512,
    waterNormals: new THREE.TextureLoader().load('/assets/textures/waternormals.jpg', texture => {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping
    }),
    sunDirection: new THREE.Vector3(),
    sunColor: 0xffffff,
    waterColor: 0x001e0f,
    distortionScale: 3.7,
    fog: scene.fog !== undefined
  }
)

water.rotation.x = - Math.PI / 2
scene.add(water)

const sky = new Sky()
sky.scale.setScalar(10000)
scene.add(sky)

const phi = THREE.MathUtils.degToRad(89)
const theta = THREE.MathUtils.degToRad(180)

sun.setFromSphericalCoords(1, phi, theta)

sky.material.uniforms.sunPosition.value.copy(sun)

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  water.material.uniforms.time.value += 1.0 / 60.0
  renderer.render(scene, camera)
}()