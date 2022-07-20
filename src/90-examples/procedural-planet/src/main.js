import * as THREE from '/node_modules/three127/build/three.module.js'
import { controls } from './controls.js'
import { Graphics } from './graphics.js'
import { TerrainChunkManager } from './terrain.js'
import { scene, camera, clock } from '/utils/scene.js'

const graphics = new Graphics()
graphics.Initialize()

const entities = {}

camera.position.set(357183, -19402, -182320)
camera.quaternion.set(0.251, 0.699, -0.48248, 0.4629)

addEntity('terrain', new TerrainChunkManager(), 1.0)
addEntity('controls', new controls.FPSControls(), 0.0)

loadBackground()

/* FUNCTIONS */

function addEntity(name, entity, priority) {
  entities[name] = { entity, priority }
}

function loadBackground() {
  scene.background = new THREE.Color(0x000000)
  const loader = new THREE.CubeTextureLoader()
  const texture = loader.load([
    './resources/space-posx.jpg',
    './resources/space-negx.jpg',
    './resources/space-posy.jpg',
    './resources/space-negy.jpg',
    './resources/space-posz.jpg',
    './resources/space-negz.jpg',
  ])
  texture.encoding = THREE.sRGBEncoding
  scene.background = texture
}

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  const deltaTime = clock.getDelta()

  const sorted = Object.values(entities).sort((a, b) => a.priority - b.priority)
  for (const s of sorted)
    s.entity.Update(deltaTime)

  graphics.Render(deltaTime)
}()