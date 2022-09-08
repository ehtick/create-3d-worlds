import * as THREE from 'three'
import FirstPersonControls from './FirstPersonControls.js'

let camera, scene, renderer, controls, raycaster, arrow, world

init()

function init() {

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 3000)
  world = new THREE.Group()

  raycaster = new THREE.Raycaster(camera.getWorldPosition(new THREE.Vector3()), camera.getWorldDirection(new THREE.Vector3()))
  arrow = new THREE.ArrowHelper(camera.getWorldDirection(new THREE.Vector3()), camera.getWorldPosition(new THREE.Vector3()), 3, 0x000000)

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xffffff)
  scene.fog = new THREE.Fog(0xffffff, 0, 2000)
  // scene.fog = new THREE.FogExp2 (0xffffff, 0.007);

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.shadowMap.enabled = true
  document.body.appendChild(renderer.domElement)
  renderer.outputEncoding = THREE.sRGBEncoding

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

  controls = new FirstPersonControls(camera)
  scene.add(controls.getObject())

  // floor

  const floorGeometry = new THREE.PlaneGeometry(2000, 2000, 100, 100)
  const floorMaterial = new THREE.MeshLambertMaterial()
  floorMaterial.color.setHSL(0.095, 1, 0.75)

  const floor = new THREE.Mesh(floorGeometry, floorMaterial)
  floor.rotation.x = - Math.PI / 2
  floor.receiveShadow = true
  world.add(floor)

  // city

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
    world.add(mesh)
  }
  scene.add(world)
}

function makeParticles(position) {
  // TODO: add particles
  console.log(position)
}

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)

  if (controls.enabled === true) {
    controls.update()

    raycaster.set(camera.getWorldPosition(new THREE.Vector3()), camera.getWorldDirection(new THREE.Vector3()))
    scene.remove(arrow)
    arrow = new THREE.ArrowHelper(raycaster.ray.direction, raycaster.ray.origin, 5, 0x000000)
    scene.add(arrow)

    if (controls.click === true) {
      const intersects = raycaster.intersectObjects(world.children)

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
