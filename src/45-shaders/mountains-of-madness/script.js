
let container
let camera, scene, renderer

container = document.getElementById('container')

camera = new THREE.Camera()
camera.position.z = 1

scene = new THREE.Scene()

const geometry = new THREE.PlaneBufferGeometry(2, 2)

const uniforms = {
  u_time: { type: 'f', value: 1.0 },
  u_resolution: { type: 'v2', value: new THREE.Vector2() },
  u_mouse: { type: 'v2', value: new THREE.Vector2() } }

const material = new THREE.ShaderMaterial({
  uniforms,
  vertexShader: document.getElementById('vertexShader').textContent,
  fragmentShader: document.getElementById('fragmentShader').textContent })

material.extensions.derivatives = true

const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

renderer = new THREE.WebGLRenderer()
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
}

void function animate(delta) {
  requestAnimationFrame(animate)
  render(delta)
}()

function render(delta) {
  uniforms.u_time.value = delta * 0.0005
  renderer.render(scene, camera)
}