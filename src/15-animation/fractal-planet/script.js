let container,
  renderer,
  scene,
  camera,
  controls,
  mesh,
  start = Date.now(),
  fov = 30

window.addEventListener('load', () => {
  container = document.getElementById('container')
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(
    fov,
    window.innerWidth / window.innerHeight,
    0.01,
    100
  )
  camera.position.z = 5

  uniforms = {
    u_time: { type: 'f', value: 1.0 },
  }

  material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: document.getElementById('vertexShader').textContent,
    fragmentShader: document.getElementById('fragmentShader').textContent,
  })

  const radius = 1
  mesh = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 200, 100),
    material
  )
  scene.add(mesh)

  renderer = new THREE.WebGLRenderer()
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(window.devicePixelRatio)
  container.appendChild(renderer.domElement)

  controls = new THREE.OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.1
  controls.maxDistance = 10
  controls.minDistance = 1.1
  controls.autoRotate = true
  controls.autoRotateSpeed = 0.1
  controls.rotateSpeed = .05

  render()
})

const frame = 0
function render() {
  requestAnimationFrame(render)
  renderer.render(scene, camera)
  controls.update()
  const { x, y, z } = camera.position
  const distance = Math.sqrt(x * x + y * y + z * z) - 1
  camera.rotateSpeed = 0.05 * distance / 4
  camera.autoRotateSpeed = 0.1 * distance / 4
  uniforms.u_time.value = Date.now() - start
}