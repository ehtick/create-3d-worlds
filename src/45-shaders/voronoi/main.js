// https://2pha.com/demos/threejs/shaders/voronoi_with_borders.html
import * as THREE from '/node_modules/three127/build/three.module.js'
// import { camera, scene, renderer } from '/utils/scene.js'

let camera, scene, renderer
let mesh, material
init()
animate()

function init() {
  renderer = new THREE.WebGLRenderer()
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  document.body.appendChild(renderer.domElement)

  camera = new THREE.PerspectiveCamera(70, window.innerWidth
        / window.innerHeight, 1, 1000)
  camera.position.z = 400

  scene = new THREE.Scene()

  const uniforms = {
    amount: {
      type: 'f',
      value: 1.0,
      min: 0.1, // only used for dat.gui, not needed for production
      max: 10.0 // only used for dat.gui, not needed for production
    },
    color: {
      type: 'c',
      value: new THREE.Color(0xffffff),
    },
    borderWidth: {
      type: 'f',
      value: 10.0,
      min: 0.1, // only used for dat.gui, not needed for production
      max: 100 // only used for dat.gui, not needed for production
    },
    borderColor: {
      type: 'c',
      value: new THREE.Color(0x000000),
    },
    blur: {
      type: 'f',
      value: 0.0,
      min: 0.0, // only used for dat.gui, not needed for production
      max: 100.0 // only used for dat.gui, not needed for production
    }
  }
  const vertexShader = document.getElementById('vertexShader').text
  const fragmentShader = document.getElementById('fragmentShader').text
  material = new THREE.ShaderMaterial(
    {
      uniforms,
      vertexShader,
      fragmentShader,
    })

  const geometry = new THREE.BoxGeometry(200, 200, 200)
  // material = new THREE.MeshBasicMaterial();
  mesh = new THREE.Mesh(geometry, material)
  scene.add(mesh)

  const light = new THREE.AmbientLight(0x404040) // soft white light
  scene.add(light)

  const directionalLight = new THREE.DirectionalLight(0xffffff)
  directionalLight.position.set(1, 1, 1).normalize()
  scene.add(directionalLight)
}

function animate() {
  requestAnimationFrame(animate)
  mesh.rotation.x += 0.005
  mesh.rotation.y += 0.01
  renderer.render(scene, camera)
}

function changeGeometry(type) {
  switch (type) {
    case 'box':
      var geometry = new THREE.BoxGeometry(200, 200, 200)
      break
    case 'sphere':
      var geometry = new THREE.SphereGeometry(200, 20, 20)
      break
    case 'torusknot':
      var geometry = new THREE.TorusKnotGeometry()
      break
  }
  mesh.geometry = geometry
}

String.prototype.htmlEncode = function() {
  return String(this)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

}
