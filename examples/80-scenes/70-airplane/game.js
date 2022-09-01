import * as THREE from 'three'
import { scene, renderer, camera } from '/utils/scene.js'
import { createSkySphere } from '/utils/geometry.js'
import { createTerrain } from '/utils/ground.js'
import { createFirTrees } from '/utils/geometry/trees.js'
import Airplane from '/utils/classes/aircrafts/Airplane.js'
import { loadModel } from '/utils/loaders.js'
import { createSun } from '/utils/light.js'

const terrain = createTerrain({ size: 8000, segments: 200 })
const trees = createFirTrees({ n: 500, mapSize: 4000, size: 25 })

scene.fog = new THREE.Fog(0xE5C5AB, 1, 5000)
scene.add(createSkySphere(), createSun(), terrain, trees)

const { mesh } = await loadModel({
  file: 'aircraft/ww1-biplane/scene.gltf',
  size: 2,
  axis: [0, 1, 0], angle: Math.PI,
})

const avion = new Airplane({ mesh })
scene.add(avion.mesh)

camera.position.set(0, 3, 20)
avion.mesh.add(camera)
avion.addSolids(terrain)

/* UPDATE */

void function animate() {
  requestAnimationFrame(animate)
  avion.update()
  renderer.render(scene, camera)
}()
