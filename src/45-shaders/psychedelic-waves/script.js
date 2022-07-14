import * as THREE from '/node_modules/three127/build/three.module.js'
// import { camera, scene, renderer } from '/utils/scene.js'

class World {
  constructor(width, height) {

    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true })

    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(width, height)
    this.container = document.getElementsByClassName('world')[0]
    this.scene = new THREE.Scene()
    this.width = width
    this.height = height
    this.aspectRatio = width / height
    this.fieldOfView = 50
    const nearPlane = .1
    const farPlane = 20000
    this.camera = new THREE.PerspectiveCamera(this.fieldOfView, this.aspectRatio, nearPlane, farPlane)
    this.camera.position.z = 200
    this.container.appendChild(this.renderer.domElement)
    this.timer = 0
    this.mousePos = { x: 0, y: 0 }
    this.targetMousePos = { x: 0, y: 0 }
    this.createPlane()
    this.render()
  }

  createPlane() {
    this.material = new THREE.RawShaderMaterial({
      vertexShader: document.getElementById('vertexShader').textContent,
      fragmentShader: document.getElementById('fragmentShader').textContent,

      uniforms: {
        uTime: { type: 'f', value: 0 },
        uHue: { type: 'f', value: .5 },
        uHueVariation: { type: 'f', value: 1 },
        uGradient: { type: 'f', value: 1 },
        uDensity: { type: 'f', value: 1 },
        uDisplacement: { type: 'f', value: 1 },
        uMousePosition: { type: 'v2', value: new THREE.Vector2(0.5, 0.5) } } })

    this.planeGeometry = new THREE.PlaneGeometry(2, 2, 1, 1)

    this.plane = new THREE.Mesh(this.planeGeometry, this.material)
    this.scene.add(this.plane)
  }

  render() {
    this.timer += parameters.speed
    this.plane.material.uniforms.uTime.value = this.timer

    this.mousePos.x += (this.targetMousePos.x - this.mousePos.x) * .1
    this.mousePos.y += (this.targetMousePos.y - this.mousePos.y) * .1

    if (this.plane)
      this.plane.material.uniforms.uMousePosition.value = new THREE.Vector2(this.mousePos.x, this.mousePos.y)

    this.renderer.render(this.scene, this.camera)
  }

  loop() {
    this.render()
    requestAnimationFrame(this.loop.bind(this))
  }

  updateSize(w, h) {
    this.renderer.setSize(w, h)
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
  }
  mouseMove(mousePos) {
    this.targetMousePos.x = mousePos.px
    this.targetMousePos.y = mousePos.py
  }
}
;

document.addEventListener('DOMContentLoaded', domIsReady)
const mousePos = { x: 0, y: 0, px: 0, py: 0 }
let world

const parameters = {
  speed: .2,
  hue: .5,
  hueVariation: 1,
  gradient: .3,
  density: .5,
  displacement: .66 }

function domIsReady() {
  world = new World(window.innerWidth, window.innerHeight)
  window.addEventListener('resize', handleWindowResize, false)
  document.addEventListener('mousemove', handleMouseMove, false)
  handleWindowResize()
  world.loop()
}

function handleWindowResize() {
  world.updateSize(window.innerWidth, window.innerHeight)
}

function handleMouseMove(e) {
  mousePos.x = e.clientX
  mousePos.y = e.clientY
  mousePos.px = mousePos.x / window.innerWidth
  mousePos.py = 1.0 - mousePos.y / window.innerHeight
  world.mouseMove(mousePos)
}