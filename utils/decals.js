import * as THREE from 'three'
import { DecalGeometry } from '/node_modules/three/examples/jsm/geometries/DecalGeometry.js'

import { Ammo } from '/utils/physics.js'
import keyboard from '/utils/classes/Keyboard.js'
import { getMesh } from '/utils/helpers.js'

const textureLoader = new THREE.TextureLoader()

const oldCarPos = new THREE.Vector3(0, 0, 0)
const oldCarPos2 = new THREE.Vector3(0, 0, 0)

let decals = []
let decRot = 0

const decalMaterial = new THREE.MeshPhongMaterial({
  specular: 0x444444,
  map: textureLoader.load('/assets/images/car-track.png'),
  shininess: 900,
  transparent: true,
  depthTest: true,
  depthWrite: false,
  polygonOffset: true,
  polygonOffsetFactor: -4,
  wireframe: false,
  opacity: .4
})

function fixAngleRad(a) {
  if (a > Math.PI) a -= Math.PI * 2
  else if (a < -Math.PI) a += Math.PI * 2
  return a
}

export function leaveDecals({ ground, vehicle, body, wheelMeshes, scene }) {
  if (!keyboard.left && !keyboard.right || vehicle.getCurrentSpeedKmHour() < 30) return

  const groundMesh = getMesh(ground)
  const velocity = new THREE.Vector3(0, 0, 0)
  const dec = new Ammo.btVector3(0, 0, 0)
  const dec2 = new Ammo.btVector3(0, 0, 0)
  const dec3 = new Ammo.btVector3(0, 0, 0)

  const p_d = new THREE.Vector3(0, 0, 0)
  const r_d = new THREE.Euler(0, 0, 0, 'XYZ')
  const s_d = new THREE.Vector3(90, 90, 90)

  const wheelRot = body.getWorldTransform().getBasis()

  // left track
  dec.setValue(-.2, 0, .2)
  dec2.setValue(
    wheelRot.getRow(0).x() * dec.x() + wheelRot.getRow(0).y() * dec.y() + wheelRot.getRow(0).z() * dec.z(),
    wheelRot.getRow(1).x() * dec.x() + wheelRot.getRow(1).y() * dec.y() + wheelRot.getRow(1).z() * dec.z(),
    wheelRot.getRow(2).x() * dec.x() + wheelRot.getRow(2).y() * dec.y() + wheelRot.getRow(2).z() * dec.z()
  )
  dec3.setValue(
    dec2.x() + wheelMeshes[3].position.x,
    dec2.y() + wheelMeshes[3].position.y,
    dec2.z() + wheelMeshes[3].position.z
  )

  p_d.set(dec3.x(), dec3.y(), dec3.z())

  velocity.x = p_d.x - oldCarPos.x
  velocity.y = p_d.y - oldCarPos.y
  velocity.z = p_d.z - oldCarPos.z

  oldCarPos.x = p_d.x
  oldCarPos.y = p_d.y
  oldCarPos.z = p_d.z
  // angle from velocity
  decRot = -fixAngleRad(Math.atan2(velocity.z, velocity.x) + Math.PI / 2)

  r_d.set(0, decRot, 0)
  if (velocity.length() > 2) {
    velocity.x = 0
    velocity.y = 0
    velocity.z = 0
  }
  s_d.set(1, 1, velocity.length())
  const material_d = decalMaterial.clone()

  let md = new THREE.Mesh(new DecalGeometry(groundMesh, p_d, r_d, s_d), material_d)
  decals.push(md)
  scene.add(md)

  // right track
  dec.setValue(.2, 0, .2)
  dec2.setValue(
    wheelRot.getRow(0).x() * dec.x() + wheelRot.getRow(0).y() * dec.y() + wheelRot.getRow(0).z() * dec.z(),
    wheelRot.getRow(1).x() * dec.x() + wheelRot.getRow(1).y() * dec.y() + wheelRot.getRow(1).z() * dec.z(),
    wheelRot.getRow(2).x() * dec.x() + wheelRot.getRow(2).y() * dec.y() + wheelRot.getRow(2).z() * dec.z()
  )
  dec3.setValue(
    dec2.x() + wheelMeshes[2].position.x,
    dec2.y() + wheelMeshes[2].position.y,
    dec2.z() + wheelMeshes[2].position.z
  )
  p_d.set(dec3.x(), dec3.y(), dec3.z())

  velocity.x = p_d.x - oldCarPos2.x
  velocity.y = p_d.y - oldCarPos2.y
  velocity.z = p_d.z - oldCarPos2.z

  oldCarPos2.x = p_d.x
  oldCarPos2.y = p_d.y
  oldCarPos2.z = p_d.z

  decRot = -fixAngleRad(Math.atan2(velocity.z, velocity.x) + Math.PI / 2)
  r_d.set(0, decRot, 0)

  if (velocity.length() > 2) {
    velocity.x = 0; velocity.y = 0; velocity.z = 0
  }
  s_d.set(1, 1, velocity.length())

  md = new THREE.Mesh(new DecalGeometry(groundMesh, p_d, r_d, s_d), material_d)
  decals.push(md)
  scene.add(md)
}

export function fadeDecals(scene) {
  decals.forEach(decal => {
    decal.material.opacity -= .001
    if (decal.material.opacity <= 0) scene.remove(decal)
  })
  decals = decals.filter(decal => decal.material.opacity > 0)
}
