import * as THREE from 'three'
import { scene, camera, renderer, clock } from '/utils/scene.js'

class GrannyKnot extends THREE.Curve {
  getPoint(t, optionalTarget) {
    const point = optionalTarget || new THREE.Vector3()
    t *= 2 * Math.PI
    const x = - 0.22 * Math.cos(t) - 1.28 * Math.sin(t) - 0.44 * Math.cos(3 * t) - 0.78 * Math.sin(3 * t)
    const y = - 0.1 * Math.cos(2 * t) - 0.27 * Math.sin(2 * t) + 0.38 * Math.cos(4 * t) + 0.46 * Math.sin(4 * t)
    const z = 0.7 * Math.cos(3 * t) - 0.4 * Math.sin(3 * t)

    return point.set(x, y, z).multiplyScalar(20)
  }
}

scene.background = new THREE.Color(0x000000)

camera.position.set(0, 4, 57)// wide position
camera.lookAt(0, 1.5, 0)

const curve = new GrannyKnot()
const geometry = new THREE.TubeGeometry(curve, 100, 2, 8, true)
const material = new THREE.MeshBasicMaterial({ wireframe: true, side: THREE.DoubleSide })
const tube = new THREE.Mesh(geometry, material)
scene.add(tube)

/* LOOP */

function updateCamera() {
  const time = clock.getElapsedTime()
  const looptime = 20
  const t = (time % looptime) / looptime
  const t2 = ((time + 0.1) % looptime) / looptime

  const pos = tube.geometry.parameters.path.getPointAt(t)
  const pos2 = tube.geometry.parameters.path.getPointAt(t2)

  camera.position.copy(pos)
  camera.lookAt(pos2)
}

void function update() {
  requestAnimationFrame(update)
  updateCamera()
  renderer.render(scene, camera)
}()