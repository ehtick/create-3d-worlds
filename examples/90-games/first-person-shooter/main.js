import * as THREE from 'three'
import FirstPersonControls from './FirstPersonControls.js'
import { camera, scene, renderer } from '/utils/scene.js'
import { createFloor } from '/utils/ground.js'

// scene.fog = new THREE.FogExp2 (0x777788, 0.007);

const raycaster = new THREE.Raycaster(camera.getWorldPosition(new THREE.Vector3()), camera.getWorldDirection(new THREE.Vector3()))

const light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 0.75)
light.position.set(0, 100, 0.4)
scene.add(light)

const dirLight = new THREE.SpotLight(0xffffff, .5, 0.0, 180.0)
dirLight.color.setHSL(0.1, 1, 0.95)
dirLight.position.set(0, 300, 100)
dirLight.castShadow = true
dirLight.lookAt(new THREE.Vector3())
scene.add(dirLight)

dirLight.shadow.mapSize.width = 4096
dirLight.shadow.mapSize.height = 4096
dirLight.shadow.camera.far = 3000

const controls = new FirstPersonControls(camera)
scene.add(controls.getObject())

const floor = createFloor({ size: 2000 })
scene.add(floor)

// city
const city = new THREE.Group()
const boxGeometry = new THREE.BoxGeometry(1, 1, 1)
boxGeometry.translate(0, 0.5, 0)

for (let i = 0; i < 500; i++) {
  const boxMaterial = new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff, flatShading: false, vertexColors: false })

  const mesh = new THREE.Mesh(boxGeometry, boxMaterial)
  mesh.position.x = Math.random() * 1600 - 800
  mesh.position.y = 0
  mesh.position.z = Math.random() * 1600 - 800
  mesh.scale.x = 20
  mesh.scale.y = Math.random() * 80 + 10
  mesh.scale.z = 20
  mesh.castShadow = true
  mesh.receiveShadow = true
  mesh.updateMatrix()
  mesh.matrixAutoUpdate = false
  city.add(mesh)
}
scene.add(city)

// TODO: add particles
function makeParticles(position) {
  console.log(position)
}

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)

  if (controls.enabled === true) {
    controls.update()
    raycaster.set(camera.getWorldPosition(new THREE.Vector3()), camera.getWorldDirection(new THREE.Vector3()))
    if (controls.click === true) {
      const intersects = raycaster.intersectObjects(city.children)
      if (intersects.length > 0) {
        const intersect = intersects[0]
        makeParticles(intersect.point)
      }
    }
  }

  renderer.render(scene, camera)
}()

/* EVENTS */

const instructions = document.querySelector('#instructions')

document.addEventListener('pointerlockchange', e => {
  if (document.pointerLockElement === document.body) {
    controls.enabled = true
    instructions.style.display = 'none'
  } else {
    controls.enabled = false
    instructions.style.display = '-webkit-box'
  }
})

instructions.addEventListener('click', () => document.body.requestPointerLock())
