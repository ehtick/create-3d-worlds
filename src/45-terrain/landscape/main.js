import {
  Scene, PerspectiveCamera, WebGLRenderer, Fog, SpotLight, HemisphereLight,
} from 'three'

import Landscape from './Landscape.js'
import { size, count, speed } from './config.js'

const W = window.innerWidth
const H = window.innerHeight

const canvas = document.getElementById('canvas')
const dpr = window.devicePixelRatio
const antialias = true

class Sketch {
  constructor() {
    this.canvas = canvas
    this.dpr = dpr
    this.antialias = antialias
    this.radId = null
    this.init()
  }

  createCamera() {
    this.camera = new PerspectiveCamera(
      50,
      W / H,
      .1,
      size * (count - 2),
    )
    this.camera.position.set(0, 1.8, 3)
  }

  createLight() {
    this.light = new SpotLight(0xD90FFF, .75)
    this.light.penumbra = 1
    this.light.angle = .5
    this.light.position.set(0, 120, -size * 5 * count)

    this.scene.add(
      this.light,
      new HemisphereLight(0xD90FFF, 0x1C1385, .25)
    )
  }

  createSegments() {
    this.segments = []
    for (let i = 0; i < count; i++) {
      const landscape = new Landscape(this.scene)
      landscape.container.position.z = -1 * i * size

      this.segments.push(landscape)
      this.scene.add(landscape.container)
    }
  }

  getContext() {
    return this.canvas.getContext('webgl')
  }

  init() {
    this.scene = new Scene()
    this.scene.fog = new Fog(0x100820, size, size * 2)

    this.scene.position.set(0, 0, 5)
    this.scene.rotation.x = 0

    this.createCamera()
    this.createLight()
    this.createSegments()

    this.renderer = new WebGLRenderer({
      canvas: this.canvas,
      context: this.getContext(),
      antialias: this.antialias,
      alpha: true,
      powerPreference: 'high-performance',
    })
    this.renderer.setSize(W, H)
    this.renderer.setPixelRatio(this.dpr)
  }

  render() {
    this.segments.forEach(({ container }) => {
      if (container.position.z >= size)
        container.position.z = -1 * size * (count - 1)
      container.position.z += speed
    })
    this.renderer.render(this.scene, this.camera)
  }

  update() {
    this.radId = requestAnimationFrame(() => this.update())
    this.render()
  }

  start() {
    this.update()
  }

  stop() {
    cancelAnimationFrame(this.radId)
  }
}

const sketch = new Sketch()

sketch.start()
