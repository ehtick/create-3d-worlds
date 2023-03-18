import { scene, renderer, camera, setBackground } from '/utils/scene.js'
import { createFloor } from '/utils/ground.js'
import { meshFromMatrix, putInMaze } from '/utils/mazes.js'
import { aldousBroderMatrix } from '/utils/mazes/algorithms.js'
import Avatar from '/utils/player/Avatar.js'
import { hemLight } from '/utils/light.js'
import { material, uniforms } from '/utils/shaders/lightning-led.js'

const size = 3

hemLight()
setBackground(0)

scene.add(createFloor())

const matrix = aldousBroderMatrix(10)
const maze = meshFromMatrix({ matrix, size, maxHeight: size * 3, material })
scene.add(maze)

const player = new Avatar({ size: .5, camera })
scene.add(player.mesh)
player.addSolids(maze)
putInMaze(player.mesh, matrix, size)

/* LOOP */

void function loop(time) {
  requestAnimationFrame(loop)
  uniforms.iTime.value = time * 0.0006
  player.update()
  renderer.render(scene, camera)
}()
