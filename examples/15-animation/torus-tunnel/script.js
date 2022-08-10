// Resize your browser & tunnel keeps form
const $container = $('#container')
const renderer = new THREE.WebGLRenderer({ antialias: true })
const camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.1, 10000)
const scene = new THREE.Scene()

const speed = 1

scene.add(camera)
renderer.setSize(window.innerWidth, window.innerHeight)
$container.append(renderer.domElement)

const normalMaterial = new THREE.MeshNormalMaterial({})

function Torus(f) {
  this.b = new THREE.Mesh(new THREE.TorusGeometry(160, 75, 2, 13), normalMaterial)
  this.b.position.x = 57 * Math.cos(f)
  this.b.position.y = 57 * Math.sin(f)
  this.b.position.z = f * 1.25
  this.b.rotation.z = f * 0.03
}

const numTorus = 80
const tabTorus = []
for (let i = 0; i < numTorus; i++) {
  tabTorus.push(new Torus(-i * 13))
  scene.add(tabTorus[i].b)
}

function update() {
  for (let i = 0; i < numTorus; i++) {
    tabTorus[i].b.position.z += speed
    if (tabTorus[i].b.position.z > 0)
      tabTorus[i].b.position.z = -1000

  }
}

function render() {
  requestAnimationFrame(render)

  camera.position.x += (camera.position.x) * .05
  camera.position.y += (camera.position.y) * .05

  renderer.render(scene, camera)
  update()
}

render()