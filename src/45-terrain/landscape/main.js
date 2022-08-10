import Sketch from './modules/Sketch/index.js'

const canvas = document.getElementById('canvas')
const dpr = window.devicePixelRatio
const antialias = true

const sketch = new Sketch({
  node: canvas,
  dpr,
  antialias,
  tryWebGL2: true,
})

sketch.start()
