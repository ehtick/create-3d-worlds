https:// codepen.io/knoland/pen/XKxrJb

var container,
  renderer,
  scene,
  camera,
  mesh,
  start = Date.now(),
  fov = 30

const clock = new THREE.Clock()

const timeUniform = {
  iGlobalTime: {
    type: 'f',
    value: 0.1
  },
  iResolution: {
    type: 'v2',
    value: new THREE.Vector2()
  }
}

timeUniform.iResolution.value.x = window.innerWidth
timeUniform.iResolution.value.y = window.innerHeight

window.addEventListener('load', () => {
  container = document.getElementById('container')
  scene = new THREE.Scene()

  camera = new THREE.PerspectiveCamera(
    fov,
    window.innerWidth / window.innerHeight,
    1,
    10000
  )
  camera.position.x = 20
  camera.position.y = 10
  camera.position.z = 20
  camera.lookAt(scene.position)
  scene.add(camera)

  const axis = new THREE.AxisHelper(10)
  scene.add (axis)

  material = new THREE.ShaderMaterial({
    uniforms: timeUniform,
    vertexShader: document.getElementById('vertex-shader').textContent,
    fragmentShader: document.getElementById('fragment-shader').textContent
  })

  const water = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(window.innerWidth, window.innerHeight, 40), material
  )
  scene.add(water)

  const geometry = new THREE.SphereGeometry(10, 32, 32)
  var material = new THREE.MeshBasicMaterial({ color: 0xffff00 })
  const sphere = new THREE.Mesh(geometry, material)
  scene.add(sphere)

  renderer = new THREE.WebGLRenderer()
  renderer.setSize(window.innerWidth, window.innerHeight)

  container.appendChild(renderer.domElement)

  render()
})

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

function render() {
  timeUniform.iGlobalTime.value += clock.getDelta()
  renderer.render(scene, camera)
  requestAnimationFrame(render)
}