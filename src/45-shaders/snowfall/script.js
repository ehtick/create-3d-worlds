let container
let camera, scene, renderer
let uniforms

const loader = new THREE.TextureLoader()
let texture
loader.setCrossOrigin('anonymous')
loader.load('noise.png', tex => {
  texture = tex
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.minFilter = THREE.LinearFilter
  init()
  animate()
})

function init() {
  container = document.getElementById('container')

  camera = new THREE.Camera()
  camera.position.z = 1

  scene = new THREE.Scene()

  const geometry = new THREE.PlaneBufferGeometry(2, 2)

  uniforms = {
    u_time: { type: 'f', value: 1.0 },
    u_resolution: { type: 'v2', value: new THREE.Vector2() },
    u_noise: { type: 't', value: texture },
  }

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: document.getElementById('vertexShader').textContent,
    fragmentShader: document.getElementById('fragmentShader').textContent })

  material.extensions.derivatives = true

  const mesh = new THREE.Mesh(geometry, material)
  scene.add(mesh)

  renderer = new THREE.WebGLRenderer()
  renderer.setPixelRatio(window.devicePixelRatio)

  container.appendChild(renderer.domElement)

  onWindowResize()
}

function onWindowResize(event) {
  renderer.setSize(window.innerWidth, window.innerHeight)
  uniforms.u_resolution.value.x = renderer.domElement.width
  uniforms.u_resolution.value.y = renderer.domElement.height
}

function animate(delta) {
  requestAnimationFrame(animate)
  render(delta)
}

function render(delta) {
  uniforms.u_time.value = -10000 + delta * 0.0005
  renderer.render(scene, camera)
}