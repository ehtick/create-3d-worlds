/* eslint-disable new-cap */
import * as THREE from '/node_modules/three127/build/three.module.js'
import { scene, camera } from '/utils/scene.js'

import { AnimatedModelComponent, StaticModelComponent } from './gltf-component.js'
import { entity } from './entity.js'
import { math } from '../../shared/math.mjs'
import SpatialGridController from './spatial-grid-controller.js'
import NPCController from './npc-entity.js'
import HealthComponent from './health-component.js'
import AttackController from './attacker-controller.js'
import HealthBar from './health-bar.js'
import { PickableComponent, BasicCharacterControllerInput } from './player-input.js'
import { BasicCharacterController } from './player-entity.js'
import EquipWeapon from './equip-weapon-component.js'
import { InventoryController, InventoryItem } from './inventory-controller.js'
import QuestComponent from './quest-component.js'
import { material as skyMaterial } from '/utils/shaders/gradient-sky.js'

export function addSky(scene) {
  const hemiLight = new THREE.HemisphereLight(0xFFFFFF, 0xFFFFFFF, 0.6)
  hemiLight.color.setHSL(0.6, 1, 0.6)
  hemiLight.groundColor.setHSL(0.095, 1, 0.75)
  scene.add(hemiLight)

  const skyGeo = new THREE.SphereBufferGeometry(1000, 32, 15)
  const sky = new THREE.Mesh(skyGeo, skyMaterial)
  scene.add(sky)
}

export function loadClouds(_scene, _entityManager) {
  for (let i = 0; i < 20; ++i) {
    const index = math.rand_int(1, 3)
    const pos = new THREE.Vector3(
      (Math.random() * 2.0 - 1.0) * 500,
      100,
      (Math.random() * 2.0 - 1.0) * 500)

    const e = new entity.Entity()
    e.AddComponent(new StaticModelComponent({
      scene: _scene,
      resourcePath: './assets/nature2/GLTF/',
      resourceName: 'Cloud' + index + '.glb',
      position: pos,
      scale: Math.random() * 5 + 10,
      emissive: new THREE.Color(0x808080),
    }))
    e.SetPosition(pos)
    _entityManager.Add(e)
    e.SetActive(false)
  }
}

export function loadTrees(_scene, _grid, _entityManager) {
  for (let i = 0; i < 100; ++i) {
    const names = [
      'CommonTree_Dead', 'CommonTree',
      'BirchTree', 'BirchTree_Dead',
      'Willow', 'Willow_Dead',
      'PineTree',
    ]
    const name = names[math.rand_int(0, names.length - 1)]
    const index = math.rand_int(1, 5)

    const pos = new THREE.Vector3(
      (Math.random() * 2.0 - 1.0) * 500,
      0,
      (Math.random() * 2.0 - 1.0) * 500)

    const e = new entity.Entity()
    e.AddComponent(new StaticModelComponent({
      scene: _scene,
      resourcePath: './assets/nature/FBX/',
      resourceName: name + '_' + index + '.fbx',
      scale: 0.25,
      emissive: new THREE.Color(0x000000),
      specular: new THREE.Color(0x000000),
      receiveShadow: true,
      castShadow: true,
    }))
    e.AddComponent(
      new SpatialGridController({ grid: _grid }))
    e.SetPosition(pos)
    _entityManager.Add(e)
    e.SetActive(false)
  }
}

export function createNPC(resourceName, resourceTexture, grid) {
  const npc = new entity.Entity()

  npc.AddComponent(new NPCController({
    camera,
    scene,
    resourceName,
    resourceTexture,
  }))

  npc.AddComponent(new HealthComponent({
    health: 50,
    maxHealth: 50,
    strength: 2,
    wisdomness: 2,
    benchpress: 3,
    curl: 1,
    experience: 0,
    level: 1,
    camera,
    scene,
  }))

  npc.AddComponent(new SpatialGridController({ grid }))

  npc.AddComponent(new HealthBar({
    parent: scene,
    camera,
  }))

  npc.AddComponent(new AttackController({ timing: 0.35 }))

  npc.SetPosition(new THREE.Vector3(
    (Math.random() * 2 - 1) * 500,
    0,
    (Math.random() * 2 - 1) * 500))

  return npc
}

export function createPlayer(grid) {
  const player = new entity.Entity()
  const params = { camera, scene }
  player.AddComponent(new BasicCharacterControllerInput(params))
  player.AddComponent(new BasicCharacterController(params))
  player.AddComponent(new EquipWeapon({ anchor: 'RightHandIndex1' }))
  player.AddComponent(new InventoryController(params))
  player.AddComponent(new HealthComponent({
    updateUI: true,
    health: 100,
    maxHealth: 100,
    strength: 50,
    wisdomness: 5,
    benchpress: 20,
    curl: 100,
    experience: 0,
    level: 1,
  }))
  player.AddComponent(new SpatialGridController({ grid }))
  player.AddComponent(new AttackController({ timing: 0.7 }))

  return player
}

export function createGirl(grid) {
  const girl = new entity.Entity()
  girl.AddComponent(new AnimatedModelComponent({
    scene,
    resourcePath: './assets/girl/',
    resourceName: 'peasant_girl.fbx',
    resourceAnimation: 'Standing Idle.fbx',
    scale: 0.035,
    receiveShadow: true,
    castShadow: true,
  }))
  girl.AddComponent(new SpatialGridController({ grid }))
  girl.AddComponent(new PickableComponent())
  girl.AddComponent(new QuestComponent())
  girl.SetPosition(new THREE.Vector3(30, 0, 0))
  return girl
}

export function createAxe() {
  const axe = new entity.Entity()
  axe.AddComponent(new InventoryItem({
    type: 'weapon',
    damage: 3,
    renderParams: {
      name: 'Axe',
      scale: 0.25,
      icon: 'war-axe-64.png',
    },
  }))
  return axe
}

export function createSword() {
  const sword = new entity.Entity()
  sword.AddComponent(new InventoryItem({
    type: 'weapon',
    damage: 3,
    renderParams: {
      name: 'Sword',
      scale: 0.25,
      icon: 'pointy-sword-64.png',
    },
  }))
  return sword
}