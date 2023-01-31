import * as THREE from 'three'
import { DecalGeometry } from '/node_modules/three/examples/jsm/geometries/DecalGeometry.js'
import { scene, renderer, camera, createOrbitControls } from '/utils/scene.js'
import { getMouseIntersects } from '/utils/helpers.js'
import { createBox } from '/utils/geometry.js'
import { hemLight } from '/utils/light.js'

hemLight()
createOrbitControls()

const mesh = createBox()
scene.add(mesh)

// decal related stuff

const decalMaterial = new THREE.MeshBasicMaterial({
  color: 0x000000,
  depthWrite: false,
  polygonOffset: true,
  polygonOffsetFactor: - 4,
})

const helper = new THREE.Object3D()

function shoot(e) {
  const intersects = getMouseIntersects(e, camera)
  if (!intersects.length) return

  const { face, point, object } = intersects[0]

  const normal = face.normal.clone()
  normal.transformDirection(object.matrixWorld)
  normal.add(point)

  helper.position.copy(point)
  helper.lookAt(normal)
  helper.rotation.z = Math.random() * 2 * Math.PI

  const size = new THREE.Vector3(.2, .2, .2)

  const geometry = new DecalGeometry(object, point, helper.rotation, size)
  const decal = new THREE.Mesh(geometry, decalMaterial)
  scene.add(decal)
}

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  renderer.render(scene, camera)
}()

document.addEventListener('click', shoot)
