// https://codepen.io/BrendonC/pen/wEmWaP
let renderer, camera, scene, uniforms

function setup() {
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  renderer = new THREE.WebGLRenderer()
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setClearColor(0x000000, 1)
  document.body.appendChild(renderer.domElement)
}

setup()

const fragShader = document.getElementById('fragment').textContent
const vertShader = document.getElementById('vertex').textContent

const noiseTexture = THREE.ImageUtils.loadTexture('images/broken-earth.png')
noiseTexture.wrapS = THREE.RepeatWrapping
noiseTexture.wrapT = THREE.RepeatWrapping
noiseTexture.repeat.set(10, 10)
noiseTexture.minFilter = THREE.NearestFilter

uniforms = {
  time: {
    type: 'f',
    value: 0
  },
  resolution: {
    type: 'v2',
    value: new THREE.Vector2(
      window.innerWidth,
      window.innerHeight
    )
  },
  amplitude: {
    type: 'f',
    value: 0
  },
  light: {
    type: 'v3',
    value: new THREE.Vector3(
      100, 150, 100
    )
  },
  heightMap: {
    type: 't',
    value: noiseTexture
  }
}

const attributes = {
  displacement: {
    type: 'f',
    value: []
  }
}

const material = new THREE.ShaderMaterial({
  fragmentShader: fragShader,
  vertexShader: vertShader,
  uniforms,
  attributes,
  wireframe: true,
  flatShading: false
})

const geometry = new THREE.PlaneGeometry(400, 300, 600, 600)

const sphere = new THREE.Mesh(geometry, material)
sphere.position.z = -100
sphere.geometry.verticesNeedUpdate = true // Allows Changes to the vertices
sphere.geometry.normalsNeedUpdate = true // Allows Changes to the normals
sphere.rotation.x = -Math.PI / 3
scene.add(sphere)

const verts = sphere.geometry.vertices

for (let i = 0; i < verts.length; i++)
  attributes.displacement.value.push((Math.random() - 0.5) * 25)

const pointLight = new THREE.PointLight(0xffffff)
pointLight.position.x = -20
pointLight.position.y = 100
pointLight.position.z = -100
scene.add(pointLight)

let time = 0

function render(delta) {
  uniforms.time.value = time
  time += 0.025
  uniforms.resolution.value.x = window.innerWidth
  uniforms.resolution.value.y = window.innerHeight
  requestAnimationFrame(render)
  renderer.render(scene, camera)
}

render()