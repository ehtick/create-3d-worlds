import { loadModel } from '/utils/loaders.js'
import { createWorldScene, camera, renderer, createOrbitControls } from '/utils/scene.js'
import { randomInCircle } from '/utils/helpers.js'

const scene = createWorldScene()
const controls = createOrbitControls()
camera.position.set(0, 20, 30)

const OGRES = 2
const BIRDS = 10
const HORSES = 10
const HOUSES = 3

const randomPos = mesh => {
  const { x, z } = randomInCircle(30)
  mesh.position.set(x, 0, z)
  return mesh
}

{
  const { mesh } = await loadModel({ file: 'animal/flamingo.glb', shouldAdjustHeight: true })
  for (let i = 0; i < BIRDS; i++) {
    const bird = mesh.clone()
    scene.add(randomPos(bird))
  }
}

{
  const { mesh } = await loadModel({ file: 'castle/wizard-isle/scene.gltf', size: 15 })
  const tower = mesh.clone()
  scene.add(randomPos(tower))
}

{
  const { mesh } = await loadModel({ file: 'character/ogro/ogro.md2', texture: 'character/ogro/skins/arboshak.png', shouldCenter: true, shouldAdjustHeight: true })
  for (let i = 0; i < OGRES; i++) {
    const hunter = mesh.clone()
    scene.add(randomPos(hunter))
  }
}

{
  const { mesh } = await loadModel({ file: 'animal/horse.glb' })
  for (let i = 0; i < HORSES; i++) {
    const horse = mesh.clone()
    scene.add(randomPos(horse))
  }
}

{
  const { mesh } = await loadModel({ file: 'building/medieval-house/house1-01.obj', mtl: 'building/medieval-house/house1-01.mtl' })
  for (let i = 0; i < HOUSES; i++) {
    const house = mesh.clone()
    scene.add(randomPos(house))
  }
}

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  controls.update()
  renderer.render(scene, camera)
}()
