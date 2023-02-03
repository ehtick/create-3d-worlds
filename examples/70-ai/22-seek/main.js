import { camera, scene, renderer, clock, createOrbitControls } from '/utils/scene.js'
import { createFloor } from '/utils/ground.js'
import { ambLight } from '/utils/light.js'
import { loadModel, loadRobotko } from '/utils/loaders.js'
import { robotkoAnimations, ghostAnimations } from '/data/animations.js'
import Player from '/utils/player/Player.js'
import NPC from '/utils/player/NPC.js'

const mapSize = 100
const npcs = []

ambLight()
createOrbitControls()
camera.position.set(0, 10, 15)

scene.add(createFloor({ size: mapSize }))

const player = new Player({ ...await loadRobotko(), dict: robotkoAnimations })
scene.add(player.mesh)

const { mesh: ghostMesh, animations: ghostAnims } = await loadModel({ file: 'character/ghost/scene.gltf' })

for (let i = 0; i < 5; i++) {
  const npc = new NPC({ mesh: ghostMesh, animations: ghostAnims, dict: ghostAnimations, mapSize })
  npcs.push(npc)
  scene.add(npc.entity)
}

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  const delta = clock.getDelta()

  npcs.forEach(npc => {
    npc.seek(player.mesh)
    npc.update(delta)
  })

  player.update(delta)
  renderer.render(scene, camera)
}()
