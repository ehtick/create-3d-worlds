/* global THREE, Ammo */

const guessGeometryFromObject3d = function(object3d) {
  let parameters = null
  let type = 'unknown'

  if (object3d.geometry instanceof THREE.BoxGeometry || object3d.geometry instanceof THREE.SphereGeometry || object3d.geometry instanceof THREE.CylinderGeometry) {
    parameters = object3d.geometry.parameters
    type = object3d.geometry.type
  }
  // TODO this is a kludge to support basic shape in a-frame - ugly but harmless
  if (object3d.children.length === 1 && object3d.children[0].geometry.type === 'BufferGeometry') {
    parameters = object3d.children[0].geometry.metadata.parameters
    type = object3d.children[0].geometry.metadata.type
  }

  return {
    parameters,
    type
  }
}

const guessShapeFromObject3d = function(object3d) {
  const guessedGeometry = guessGeometryFromObject3d(object3d)
  const p = guessedGeometry.parameters
  const s = object3d.scale

  const btVector3 = new Ammo.btVector3()
  let shape, size

  if (guessedGeometry.type === 'BoxGeometry') {
    btVector3.setX(p.width / 2 * s.x)
    btVector3.setY(p.height / 2 * s.y)
    btVector3.setZ(p.depth / 2 * s.z)
    shape = new Ammo.btBoxShape(btVector3)
  } else if (guessedGeometry.type === 'SphereGeometry') {
    const radius = p.radius * s.x
    shape = new Ammo.btSphereShape(radius)
  } else if (guessedGeometry.type === 'CylinderGeometry') {
    size = new Ammo.btVector3(p.radiusTop * s.x,
      p.height * 0.5 * s.y,
      p.radiusBottom * s.x)
    shape = new Ammo.btCylinderShape(size)
  } else {
    const box3 = new THREE.Box3().setFromObject(object3d)
    size = box3.getSize()
    btVector3.setX(size.x / 2 * s.x)
    btVector3.setY(size.y / 2 * s.y)
    btVector3.setZ(size.z / 2 * s.z)
    shape = new Ammo.btBoxShape(btVector3)
  }
  return shape
}

const guessMassFromObject3d = function(object3d) {
  const guessedGeometry = guessGeometryFromObject3d(object3d)
  const p = guessedGeometry.parameters
  const s = object3d.scale

  let mass = 0

  if (guessedGeometry.type === 'BoxGeometry')
    mass = p.width * s.x * p.height * s.y * p.depth * s.z
  else if (guessedGeometry.type === 'SphereGeometry')
    mass = 4 / 3 * Math.PI * Math.pow(p.radius * s.x, 3)
  else if (guessedGeometry.type === 'CylinderGeometry')
    // from http://jwilson.coe.uga.edu/emt725/Frustum/Frustum.cone.html
    mass = Math.PI * p.height / 3 * (p.radiusBottom * p.radiusBottom * s.x * s.x
                        + p.radiusBottom * p.radiusTop * s.y * s.y
                        + p.radiusTop * p.radiusTop * s.x * s.x)
  else {
    const box3 = new THREE.Box3().setFromObject(object3d)
    const size = box3.getSize()
    mass = size.x * s.x * size.y * s.y * size.z * s.z
  }
  return mass
}

export default class AmmoControls {
  constructor(object3d, options = {}) {
    this.object3d = object3d

    const shape = options.shape !== undefined ? options.shape : guessShapeFromObject3d(object3d)
    const mass = options.mass !== undefined ? options.mass : guessMassFromObject3d(object3d)

    const margin = 0.05
    shape.setMargin(margin)

    let localInertia
    if (mass !== 0) {
      localInertia = new Ammo.btVector3(0, 10, 0)
      shape.calculateLocalInertia(mass, localInertia)
    }

    const btTransform = new Ammo.btTransform()
    btTransform.setIdentity()
    const { position } = this.object3d
    btTransform.setOrigin(new Ammo.btVector3(position.x, position.y, position.z))
    const { quaternion } = this.object3d
    btTransform.setRotation(new Ammo.btQuaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w))
    const motionState = new Ammo.btDefaultMotionState(btTransform)

    const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia)
    const body = new Ammo.btRigidBody(rbInfo)

    body.setUserIndex(this.object3d.id)
    this.object3d.userData.ammoControls = this

    this.body = body
    this.physicsBody = this.body // Deprecated
  }

  setFriction(value) {
    this.body.setFriction(value)
  }
  setRestitution(value) {
    this.body.setRestitution(value)
  }

  setAngularVelocity(x, y, z) {
    const btVector3 = new Ammo.btVector3(x, y, z)
    this.body.setAngularVelocity(btVector3)
    this.body.activate()
  }

  setLinearVelocity(x, y, z) {
    const btVector3 = new Ammo.btVector3(x, y, z)
    this.body.setLinearVelocity(btVector3)
    this.body.activate()
  }
}
// Object.assign(AmmoControls.prototype, THREE.EventDispatcher.prototype)
