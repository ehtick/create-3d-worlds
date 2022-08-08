import * as THREE from 'three'
import { OrbitControls } from '/node_modules/three/examples/jsm/controls/OrbitControls.js'
import { vertexShader, fragmentShader } from './shader.js'

let renderer, scene, camera, clock, controlParameters, uniforms, material, mesh

init()
animate()

function init() {
  renderer = new THREE.WebGLRenderer({
    antialias: true
  })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setClearColor(new THREE.Color(0, 0, 0))

  document.body.appendChild(renderer.domElement)

  scene = new THREE.Scene()

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000)
  camera.position.z = 30

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enablePan = false

  clock = new THREE.Clock(true)

  controlParameters = {
    'Geometry': 'Torus knot'
  }

  uniforms = {
    u_time: {
      type: 'f',
      value: 0.0
    },
    u_frame: {
      type: 'f',
      value: 0.0
    },
    u_resolution: {
      type: 'v2',
      value: new THREE.Vector2(window.innerWidth, window.innerHeight)
        .multiplyScalar(window.devicePixelRatio)
    },
    u_mouse: {
      type: 'v2',
      value: new THREE.Vector2(0.7 * window.innerWidth, window.innerHeight)
        .multiplyScalar(window.devicePixelRatio)
    }
  }

  material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    side: THREE.DoubleSide,
    transparent: true,
    extensions: {
      derivatives: true
    }
  })

  addMeshToScene()

  renderer.domElement.addEventListener('mousemove', onMouseMove, false)
  renderer.domElement.addEventListener('touchstart', onTouchMove, false)
  renderer.domElement.addEventListener('touchmove', onTouchMove, false)
}

function addMeshToScene() {
  if (mesh)
    scene.remove(mesh)

  if (controlParameters.Geometry == 'Suzanne') {
    const loader = new THREE.BufferGeometryLoader()
    loader.load('/objects/suzanne_buffergeometry.json', geometry => {
      geometry.scale(10, 10, 10)
      geometry.computeVertexNormals()
      mesh = new THREE.Mesh(geometry, material)
      scene.add(mesh)
    })
  } else {
    let geometry
    if (controlParameters.Geometry == 'Torus knot')
      geometry = new THREE.TorusKnotGeometry(6.5, 2.3, 256, 32)
    else if (controlParameters.Geometry == 'Sphere')
      geometry = new THREE.SphereGeometry(10, 64, 64)
    else if (controlParameters.Geometry == 'Icosahedron')
      geometry = new THREE.IcosahedronGeometry(10, 0)

    mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)
  }
}

function animate() {
  requestAnimationFrame(animate)
  render()
}

function render() {
  uniforms.u_time.value = clock.getElapsedTime()
  uniforms.u_frame.value += 1.0
  renderer.render(scene, camera)
}

function onMouseMove(event) {
  uniforms.u_mouse.value.set(event.pageX, window.innerHeight - event.pageY).multiplyScalar(
    window.devicePixelRatio)
}

function onTouchMove(event) {
  uniforms.u_mouse.value.set(event.touches[0].pageX, window.innerHeight - event.touches[0].pageY).multiplyScalar(
    window.devicePixelRatio)
}
