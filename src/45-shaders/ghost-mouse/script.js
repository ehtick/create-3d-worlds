/* global THREE */

let container
let camera, scene, renderer
let uniforms

container = document.getElementById('container')

camera = new THREE.Camera()
camera.position.z = 1

scene = new THREE.Scene()

const geometry = new THREE.PlaneBufferGeometry(2, 2)

let rtTexture = new THREE.WebGLRenderTarget(window.innerWidth * .2, window.innerHeight * .2)
let rtTexture2 = new THREE.WebGLRenderTarget(window.innerWidth * .2, window.innerHeight * .2)

uniforms = {
  u_time: { type: 'f', value: 1.0 },
  u_resolution: { type: 'v2', value: new THREE.Vector2() },
  u_buffer: { type: 't', value: rtTexture.texture },
  u_mouse: { type: 'v2', value: new THREE.Vector2() },
  u_renderpass: { type: 'b', value: false }
}

const material = new THREE.ShaderMaterial({
  uniforms,
  vertexShader: document.getElementById('vertexShader').textContent,
  fragmentShader: document.getElementById('fragmentShader').textContent
})

material.extensions.derivatives = true

const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

renderer = new THREE.WebGLRenderer()
renderer.setPixelRatio(window.devicePixelRatio)

container.appendChild(renderer.domElement)

onWindowResize()
window.addEventListener('resize', onWindowResize, false)

document.addEventListener('pointermove', e => {
  const ratio = window.innerHeight / window.innerWidth
  uniforms.u_mouse.value.x = (e.pageX - window.innerWidth / 2) / window.innerWidth / ratio
  uniforms.u_mouse.value.y = (e.pageY - window.innerHeight / 2) / window.innerHeight * -1

  e.preventDefault()
})

function onWindowResize(event) {
  renderer.setSize(window.innerWidth, window.innerHeight)
  uniforms.u_resolution.value.x = renderer.domElement.width
  uniforms.u_resolution.value.y = renderer.domElement.height

  rtTexture = new THREE.WebGLRenderTarget(window.innerWidth * .2, window.innerHeight * .2)
  rtTexture2 = new THREE.WebGLRenderTarget(window.innerWidth * .2, window.innerHeight * .2)
}

function renderTexture() {
  const odims = uniforms.u_resolution.value.clone()
  uniforms.u_resolution.value.x = window.innerWidth * .2
  uniforms.u_resolution.value.y = window.innerHeight * .2
  uniforms.u_buffer.value = rtTexture2.texture
  uniforms.u_renderpass.value = true

  window.rtTexture = rtTexture
  renderer.setRenderTarget(rtTexture)
  renderer.render(scene, camera, rtTexture, true)

  const buffer = rtTexture
  rtTexture = rtTexture2
  rtTexture2 = buffer

  uniforms.u_buffer.value = rtTexture.texture
  uniforms.u_resolution.value = odims
  uniforms.u_renderpass.value = false
}

function render(delta) {
  uniforms.u_time.value = delta * 0.0005
  renderer.render(scene, camera)
  renderTexture()
}

void function animate(delta) {
  requestAnimationFrame(animate)
  render(delta)
}()
