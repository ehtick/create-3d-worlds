/* global THREE, Ammo */
const textureLoader = new THREE.TextureLoader()
const decalDiffuse = textureLoader.load('track5.png')

const oldCarPos = new THREE.Vector3(0, 0, 0)
const oldCarPos2 = new THREE.Vector3(0, 0, 0)
let decRot = 0
let decals = []

const decalMaterial = new THREE.MeshPhongMaterial({
  specular: 0x444444,
  map: decalDiffuse,
  shininess: 900,
  transparent: true,
  depthTest: true,
  depthWrite: false,
  polygonOffset: true,
  polygonOffsetFactor: - 4,
  wireframe: false,
  opacity: .4
})

function fixAngleRad(a) {
  if (a > Math.PI) a -= Math.PI * 2
  else if (a < -Math.PI) a += Math.PI * 2
  return a
}

export function leaveDecals(carModel, worldModel, body, tireClones, scene) {
  const velocity = new THREE.Vector3(0, 0, 0)
  const dec = new Ammo.btVector3(0, 0, 0)
  const dec2 = new Ammo.btVector3(0, 0, 0)
  const dec3 = new Ammo.btVector3(0, 0, 0)

  const p_d = new THREE.Vector3(0, 0, 0)
  const r_d = new THREE.Euler(0, 0, 0, 'XYZ')
  const s_d = new THREE.Vector3(90, 90, 90)

  if (carModel[0] && carModel[1] && worldModel.children[0]) {
    const wheelRot = body.getWorldTransform().getBasis()
    dec.setValue(-.2, 0, .2)
    dec2.setValue(
      wheelRot.getRow(0).x() * dec.x() + wheelRot.getRow(0).y() * dec.y() + wheelRot.getRow(0).z() * dec.z(),
      wheelRot.getRow(1).x() * dec.x() + wheelRot.getRow(1).y() * dec.y() + wheelRot.getRow(1).z() * dec.z(),
      wheelRot.getRow(2).x() * dec.x() + wheelRot.getRow(2).y() * dec.y() + wheelRot.getRow(2).z() * dec.z()
    )
    dec3.setValue(
      dec2.x() + carModel[1].position.x,
      dec2.y() + carModel[1].position.y,
      dec2.z() + carModel[1].position.z
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
    let md = new THREE.Mesh(new THREE.DecalGeometry(worldModel.children[0], p_d, r_d, s_d), material_d)
    decals.push(md)
    scene.add(md)

    dec.setValue(.2, 0, .2)
    dec2.setValue(
      wheelRot.getRow(0).x() * dec.x() + wheelRot.getRow(0).y() * dec.y() + wheelRot.getRow(0).z() * dec.z(),
      wheelRot.getRow(1).x() * dec.x() + wheelRot.getRow(1).y() * dec.y() + wheelRot.getRow(1).z() * dec.z(),
      wheelRot.getRow(2).x() * dec.x() + wheelRot.getRow(2).y() * dec.y() + wheelRot.getRow(2).z() * dec.z()
    )
    dec3.setValue(
      dec2.x() + tireClones[0][2].position.x,
      dec2.y() + tireClones[0][2].position.y,
      dec2.z() + tireClones[0][2].position.z
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

    md = new THREE.Mesh(new THREE.DecalGeometry(worldModel.children[0], p_d, r_d, s_d), material_d)
    decals.push(md)
    scene.add(md)
  }
}

export function fadeDecals(scene) {
  decals.forEach(decal => {
    decal.material.opacity -= .001
    if (decal.material.opacity <= 0) scene.remove(decal)
  })
  decals = decals.filter(decal => decal.material.opacity > 0)
}
