import * as THREE from 'three'
import { Pathfinding } from './libs/three-pathfinding.module.js'
import { scene, camera, renderer, clock } from '/utils/scene.js'
import { Fred, Ghoul } from './Player.js'
import { createSunLight, ambLight } from '/utils/light.js'
import { getMouseIntersects } from '/utils/helpers.js'
import { cloneGLTF, randomWaypoint } from './utils.js'
import { loadModel } from '/utils/loaders.js'

const pathfinder = new Pathfinding()
const ghouls = []
const scale = 0.015

const wideCamera = new THREE.Object3D()
wideCamera.target = new THREE.Vector3(0, 0, 0)
const frontCamera = new THREE.Object3D()
frontCamera.position.set(0, 500, 500)
const rearCamera = new THREE.Object3D()
rearCamera.position.set(0, 500, -500)
const cameras = { wideCamera, rearCamera, frontCamera }

/* INIT */

let navmesh
let activeCamera = wideCamera

ambLight()
scene.add(createSunLight({ x: -5, y: 10, z: 2 }))
camera.position.set(0, 22, 18)
wideCamera.position.copy(camera.position)

const { mesh: dungeon } = await loadModel('world/dungeon.glb')
scene.add(dungeon)
dungeon.traverse(child => {
  if (child.name == 'Navmesh') {
    child.material.visible = false
    navmesh = child
  }
})
pathfinder.setZoneData('dungeon', Pathfinding.createZone(navmesh.geometry))

const { mesh, animations } = await loadModel({ file: 'character/fred.glb' })
const model = mesh.children[0].children[0]
model.rotateX(-Math.PI * .5)
const fred = new Fred({
  model,
  animations,
  pathfinder,
})
model.scale.set(scale, scale, scale)
model.position.set(-1, 0, 2)
model.add(rearCamera, frontCamera)
rearCamera.target = frontCamera.target = model.position

const { mesh: ghoulScene, animations: ghoulAnimations } = await loadModel('character/ghoul.glb')

for (let i = 0; i < 4; i++) {
  const model = cloneGLTF(ghoulScene.children[0].children[0])
  const ghoul = new Ghoul({
    model,
    animations: ghoulAnimations,
    pathfinder,
  })
  ghoul.model.scale.set(scale, scale, scale)
  ghoul.model.position.copy(randomWaypoint())
  ghoul.newPath(randomWaypoint())
  ghouls.push(ghoul)
}

/* FUNCTIONS */

const raycast = e => {
  const intersects = getMouseIntersects(e, camera, navmesh)
  if (intersects.length) fred.newPath(intersects[0].point, true)
}

const switchCamera = () => {
  if (activeCamera == cameras.wideCamera)
    activeCamera = cameras.rearCamera
  else if (activeCamera == cameras.rearCamera)
    activeCamera = cameras.frontCamera
  else if (activeCamera == cameras.frontCamera)
    activeCamera = cameras.wideCamera
}

/* LOOP */

void function render() {
  const delta = clock.getDelta()
  requestAnimationFrame(render)

  camera.position.lerp(activeCamera.getWorldPosition(new THREE.Vector3()), 0.1)
  const pos = activeCamera.target.clone()
  pos.y += 1.8
  camera.lookAt(pos)

  fred.update(delta)
  ghouls.forEach(ghoul => ghoul.update(delta))
  renderer.render(scene, camera)
}()

/* EVENTS */

renderer.domElement.addEventListener('click', raycast, false)

document.getElementById('camera').addEventListener('click', switchCamera)
