import * as THREE from '/node_modules/three/build/three.module.js'
import { renderer, scene, camera, clock } from '/utils/scene.js'

scene.background = new THREE.Color(0x000000)
camera.position.z = 30

const uniforms = {
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

const material = new THREE.ShaderMaterial({
  uniforms,
  vertexShader: document.getElementById('vertexShader').textContent,
  fragmentShader: document.getElementById('fragmentShader').textContent,
  side: THREE.DoubleSide,
  transparent: true,
  extensions: {
    derivatives: true
  }
})

// Create the mesh and add it to the scene
addMeshToScene()

/*
	 * Adds the mesh to the scene
	 */
function addMeshToScene() {
  // Remove any previous mesh from the scene
  const geometry = new THREE.TorusKnotGeometry(6.5, 2.3, 256, 32)
  // Create the mesh and add it to the scene
  const mesh = new THREE.Mesh(geometry, material)
  scene.add(mesh)
}

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  uniforms.u_time.value = clock.getElapsedTime()
  uniforms.u_frame.value += 1.0
  renderer.render(scene, camera)
}()

/* EVENTS */

function onMouseMove(event) {
  uniforms.u_mouse.value.set(event.pageX, window.innerHeight - event.pageY)
    .multiplyScalar(window.devicePixelRatio)
}

function onTouchMove(event) {
  uniforms.u_mouse.value.set(event.touches[0].pageX, window.innerHeight - event.touches[0].pageY)
    .multiplyScalar(window.devicePixelRatio)
}

renderer.domElement.addEventListener('mousemove', onMouseMove, false)
renderer.domElement.addEventListener('touchstart', onTouchMove, false)
renderer.domElement.addEventListener('touchmove', onTouchMove, false)
