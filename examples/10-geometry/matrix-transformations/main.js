/* global dat */
import * as THREE from 'three'
import { scene, renderer, camera, createOrbitControls } from '/utils/scene.js'

createOrbitControls()

camera.position.set(15, 16, 13)
camera.lookAt(scene.position)

const cubeGeometry = new THREE.BoxGeometry(10 * Math.random(), 10 * Math.random(), 10 * Math.random())
const cubeMaterial = new THREE.MeshNormalMaterial()
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial)
scene.add(cube)

const matrix = new THREE.Matrix4()

const control = {
  x: 2,
  y: 1,
  z: 1,
  theta: 0.2,

  applyTranslation() {
    matrix.set(
      1, 0, 0, control.x,
      0, 1, 0, control.y,
      0, 0, 1, control.z,
      0, 0, 0, 1
    )
    cube.applyMatrix4(matrix)
    cube.verticesNeedUpdate = true
  },

  applyScale() {
    matrix.set(
      control.x, 0, 0, 0,
      0, control.y, 0, 0,
      0, 0, control.z, 0,
      0, 0, 0, 1
    )
    cube.geometry.applyMatrix4(matrix)
    cube.geometry.verticesNeedUpdate = true
  },

  applyRotationY() {
    const cos = Math.cos(control.theta)
    const sin = Math.sin(control.theta)
    matrix.set(
      cos, 0, sin, 0,
      0, 1, 0, 0,
      -sin, 0, cos, 0,
      0, 0, 0, 1
    )
    cube.geometry.applyMatrix4(matrix)
    cube.geometry.verticesNeedUpdate = true
  },
}

addControls(control)

function addControls(controlObject) {
  const gui = new dat.GUI()
  gui.add(controlObject, 'x', -5, 5).step(0.1)
  gui.add(controlObject, 'y', -5, 5).step(0.1)
  gui.add(controlObject, 'z', -5, 5).step(0.1)
  gui.add(controlObject, 'applyScale')
  gui.add(controlObject, 'applyTranslation')
  gui.add(controlObject, 'theta', -Math.PI, Math.PI).step(0.1)
  gui.add(controlObject, 'applyRotationY')
}

/* LOOP */

void function render() {
  renderer.render(scene, camera)
  requestAnimationFrame(render)
}()