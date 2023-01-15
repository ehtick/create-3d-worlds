// http://jsfiddle.net/0couqp27/9/
import * as THREE from 'three'
import { scene, renderer, camera, clock, createOrbitControls } from '/utils/scene.js'

createOrbitControls()

document.fonts.onloadingdone = function() {
  const ctx = document.getElementById('c').getContext('2d')

  ctx.font = '48px Lobster'
  ctx.fillStyle = 'teal'
  ctx.textBaseline = 'top'
  ctx.fillText('This is the Lobster font', 0, 10)
}

