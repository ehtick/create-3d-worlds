import * as THREE from 'three'

export const waypoints = [
  new THREE.Vector3(-15.5, 5.26, 15.68),
  new THREE.Vector3(13.4, 5.51, 15.74),
  new THREE.Vector3(13.6, 5.48, -7.96),
  new THREE.Vector3(-15.4, 5.17, -9.03),
  new THREE.Vector3(-8.2, 0.25, 8.55),
  new THREE.Vector3(7.5, 0.18, 8.50),
  new THREE.Vector3(-22.2, 5.37, -0.15)
]

export const fredAnims = [
  { start: 30, end: 59, name: 'backpedal', loop: true },
  { start: 90, end: 129, name: 'bite', loop: false },
  { start: 164, end: 193, name: 'crawl', loop: true },
  { start: 225, end: 251, name: 'die', loop: false },
  { start: 255, end: 294, name: 'hitBehind', loop: false },
  { start: 300, end: 344, name: 'hitFront', loop: false },
  { start: 350, end: 384, name: 'hitLeft', loop: false },
  { start: 390, end: 424, name: 'hitRight', loop: false },
  { start: 489, end: 548, name: 'idle', loop: true },
  { start: 610, end: 659, name: 'jump', loop: false },
  { start: 665, end: 739, name: 'roar', loop: false },
  { start: 768, end: 791, name: 'run', loop: true },
  { start: 839, end: 858, name: 'shuffleLeft', loop: true },
  { start: 899, end: 918, name: 'shuffleRight', loop: true },
  { start: 940, end: 979, name: 'spawn', loop: false },
  { start: 1014, end: 1043, name: 'strafeRight', loop: true },
  { start: 1104, end: 1133, name: 'strafeRight', loop: true },
  { start: 1165, end: 1229, name: 'swipe', loop: false },
  { start: 1264, end: 1293, name: 'walk', loop: true }
]

export const ghoulAnims = [
  { start: 81, end: 161, name: 'idle', loop: true },
  { start: 250, end: 290, name: 'block', loop: false },
  { start: 300, end: 320, name: 'gethit', loop: false },
  { start: 340, end: 375, name: 'die', loop: false },
  { start: 380, end: 430, name: 'attack', loop: false },
  { start: 470, end: 500, name: 'walk', loop: true },
  { start: 540, end: 560, name: 'run', loop: true }
]
