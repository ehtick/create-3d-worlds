import StateMachine from '/utils/fsm/StateMachine.js'
import { scene, renderer, camera, createOrbitControls, clock } from '/utils/scene.js'
import { createSun } from '/utils/light.js'
import { createGround } from '/utils/ground.js'
import { loadPartisan } from '/utils/loaders.js'
import { partisanAnimations } from '/data/animations.js'
import JoyStick from '/utils/classes/JoyStick.js'

const keyboard = {
  up: false,
  down: false,
  left: false,
  right: false,
  run: false,
  pressed: {}
}

const onMove = (forward, turn) => {
  keyboard.up = forward > .25
  keyboard.down = forward < -.25
  keyboard.left = turn < -.25
  keyboard.right = turn > .25
  keyboard.run = forward > .5
}

new JoyStick(onMove)

scene.add(createSun())

scene.add(createGround({ size: 100 }))

const { mesh, animations } = await loadPartisan()
const stateMachine = new StateMachine({ mesh, animations, dict: partisanAnimations, keyboard })

scene.add(mesh)

const controls = createOrbitControls()
controls.target = mesh.position

/* LOOP */

void function update() {
  requestAnimationFrame(update)
  const delta = clock.getDelta()

  stateMachine.update(delta)
  renderer.render(scene, camera)
}()
