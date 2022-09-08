import * as SkeletonUtils from '/node_modules/three/examples/jsm/utils/SkeletonUtils.js'
import { Pathfinding } from './libs/three-pathfinding.module.js'
import { scene, camera, renderer, clock, createOrbitControls } from '/utils/scene.js'
import { Fred, Ghoul } from './Player.js'
import { createSun, ambLight } from '/utils/light.js'
import { getMouseIntersects } from '/utils/helpers.js'
import { randomWaypoint } from './utils.js'
import { loadModel } from '/utils/loaders.js'

createOrbitControls()

const pathfinder = new Pathfinding()
const ghouls = []
const scale = 0.015

/* INIT */

let navmesh

ambLight()
scene.add(createSun({ x: -5, y: 10, z: 2 }))
camera.position.set(0, 22, 18)

const { mesh: dungeon } = await loadModel({ file: 'world/dungeon.glb', size: null })
scene.add(dungeon)
dungeon.traverse(child => {
  if (child.name == 'Navmesh') {
    child.material.visible = false
    navmesh = child
  }
})
pathfinder.setZoneData('dungeon', Pathfinding.createZone(navmesh.geometry))

const { mesh, animations } = await loadModel({ file: 'character/fred.glb', size: null })
const model = mesh.children[0].children[0]
model.rotateX(-Math.PI * .5)
const fred = new Fred({
  model,
  animations,
  pathfinder,
})
model.scale.set(scale, scale, scale)
model.position.set(-1, 0, 2)
camera.target = model.position

const { mesh: ghoulScene, animations: ghoulAnimations } = await loadModel({ file: 'character/ghoul.glb', size: null })

for (let i = 0; i < 4; i++) {
  const model = SkeletonUtils.clone(ghoulScene.children[0].children[0])
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

/* LOOP */

void function render() {
  const delta = clock.getDelta()
  requestAnimationFrame(render)

  const pos = camera.target.clone()
  pos.y += 1.8
  camera.lookAt(pos)

  fred.update(delta)
  ghouls.forEach(ghoul => ghoul.update(delta))
  renderer.render(scene, camera)
}()

/* EVENTS */

renderer.domElement.addEventListener('click', raycast)
