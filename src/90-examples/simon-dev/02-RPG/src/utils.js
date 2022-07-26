import * as THREE from '/node_modules/three127/build/three.module.js'
import { scene, camera } from '/utils/scene.js'

import { Entity } from '../../ecs/entity.js'
import { AnimatedModelComponent, StaticModelComponent } from './load-component.js'
import { math } from '../../shared/math.mjs'
import SpatialGridController from '../../components/spatial-grid-controller-old.js'
import { NPCController } from '../../components/npc-entity-old.js'
import { HealthComponent } from '../../components/health-component-old.js'
import { AttackController } from '../../components/attacker-controller-old.js'
import { BasicCharacterControllerInput } from '../../components/player-input.js'
import { BasicCharacterController } from '../../components/player-entity-old.js'
import { PickableComponent } from '../../components/pickable.js'
import { EquipWeapon } from '../../components/equip-weapon-component-old.js'
import { InventoryController, InventoryItem } from '../../components/inventory-controller-old.js'
import QuestComponent from './quest-component.js'

export function loadClouds(_scene, _entityManager) {
  for (let i = 0; i < 20; ++i) {
    const index = math.rand_int(1, 3)
    const pos = new THREE.Vector3(
      (Math.random() * 2.0 - 1.0) * 500,
      100,
      (Math.random() * 2.0 - 1.0) * 500)

    const e = new Entity()
    e.AddComponent(new StaticModelComponent({
      scene: _scene,
      resourcePath: '/assets/simon-dev/nature2/GLTF/',
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

    const e = new Entity()
    e.AddComponent(new StaticModelComponent({
      scene: _scene,
      resourcePath: '/assets/simon-dev/nature/FBX/',
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
  const npc = new Entity()

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

  npc.AddComponent(new AttackController({ timing: 0.35 }))

  npc.SetPosition(new THREE.Vector3(
    (Math.random() * 2 - 1) * 500,
    0,
    (Math.random() * 2 - 1) * 500))

  return npc
}

export function createPlayer(grid) {
  const player = new Entity()
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
  const girl = new Entity()
  girl.AddComponent(new AnimatedModelComponent({
    scene,
    resourcePath: '/assets/simon-dev/girl/',
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
  const axe = new Entity()
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
  const sword = new Entity()
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