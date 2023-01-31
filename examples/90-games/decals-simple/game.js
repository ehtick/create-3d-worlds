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

const helper = new THREE.Object3D()

const decalMaterial = new THREE.MeshBasicMaterial({
  color: 0x000000,
  depthWrite: false,
  polygonOffset: true,
  polygonOffsetFactor: - 4,
})

function shoot(e) {
  const intersects = getMouseIntersects(e, camera, mesh)

  if (intersects.length > 0) {
    const n = intersects[0].face.normal.clone()
    n.transformDirection(mesh.matrixWorld)
    n.add(intersects[0].point)

    helper.position.copy(intersects[0].point)
    helper.lookAt(n)

    const position = intersects[0].point
    const size = new THREE.Vector3(.2, .2, .2)

    const decalGeometry = new DecalGeometry(mesh, position, helper.rotation, size)

    const decal = new THREE.Mesh(decalGeometry, decalMaterial)
    scene.add(decal)
  }
}

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  renderer.render(scene, camera)
}()

document.addEventListener('click', shoot)
