import * as THREE from 'three'
import { FBXLoader } from '/node_modules/three/examples/jsm/loaders/FBXLoader.js'
import * as SkeletonUtils from '/node_modules/three/examples/jsm/utils/SkeletonUtils.js'

import { loadModel, loadFbxAnimations } from '/utils/loaders.js'
import { scene, camera, renderer, clock, createOrbitControls } from '/utils/scene.js'
import { randomInCircle } from '/utils/helpers.js'
import { createGround } from '/utils/ground.js'
import { createSun } from '/utils/light.js'

const mixers = []
const fbxLoader = new FBXLoader()
const controls = createOrbitControls()
camera.position.set(0, 20, 30)

const HORSES = 10
const OGRES = 3
const BIRDS = 10
const HOUSES = 3
const GIRLS = 4

const sun = createSun()
sun.position.set(50, 150, 150)
scene.add(createGround(), sun)

/* FUNCTIONS */

const randomPos = mesh => {
  const { x, z } = randomInCircle(30)
  mesh.position.set(x, 0, z)
  return mesh
}

function createMixer(mesh, animation) {
  const mixer = new THREE.AnimationMixer(mesh)
  const action = mixer.clipAction(animation)
  action.play()
  mixers.push(mixer)
}

/* LOAD */

const { mesh: towerModel } = await loadModel({ file: 'castle/wizard-isle/scene.gltf', size: 15 })
scene.add(randomPos(towerModel))

const girlModel = await fbxLoader.loadAsync('/assets/models/character/kachujin/Kachujin.fbx')
const girlAnimations = await loadFbxAnimations(['Dwarf-Idle', 'Bencao', 'Queshada', 'Walking'], 'character/kachujin/')
for (let i = 0; i < GIRLS; i++) {
  const girl = SkeletonUtils.clone(girlModel)
  girl.scale.set(.01, .01, .01)
  createMixer(girl, girlAnimations[i])
  scene.add(randomPos(girl))
}

const { mesh: houseModel } = await loadModel({ file: 'building/medieval-house/house1-01.obj', mtl: 'building/medieval-house/house1-01.mtl' })
for (let i = 0; i < HOUSES; i++) {
  const house = houseModel.clone()
  scene.add(randomPos(house))
}

const { mesh: birdModel, animations: birdAnimations } = await loadModel({ file: 'animal/flamingo.glb', shouldAdjustHeight: true })
for (let i = 0; i < BIRDS; i++) {
  const bird = birdModel.clone()
  createMixer(bird, birdAnimations[0])
  scene.add(randomPos(bird))
}

const { mesh: ogreModel, animations: ogreAnimations } = await loadModel({ file: 'character/ogro/ogro.md2', texture: 'character/ogro/skins/arboshak.png', shouldCenter: true, shouldAdjustHeight: true })
for (let i = 0; i < OGRES; i++) {
  const ogre = ogreModel.clone()
  createMixer(ogre.children[0], ogreAnimations[i])
  scene.add(randomPos(ogre))
}

const { mesh: horseModel, animations: horseAnimations } = await loadModel({ file: 'animal/horse.glb' })
for (let i = 0; i < HORSES; i++) {
  const horse = horseModel.clone()
  createMixer(horse, horseAnimations[0])
  scene.add(randomPos(horse))
}

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  controls.update()
  const delta = clock.getDelta()
  mixers.forEach(mixer => mixer.update(delta))
  renderer.render(scene, camera)
}()
