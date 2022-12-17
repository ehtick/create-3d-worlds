import { Ammo } from '/utils/physics.js'
import { getSize } from '/utils/helpers.js'

const margin = 0.05

const getShapeFromMesh = function(mesh) {
  const { scale } = mesh
  const { parameters, type } = mesh.geometry
  const btVector3 = new Ammo.btVector3()
  switch (type) {
    case 'BoxGeometry':
      btVector3.setX(parameters.width / 2 * scale.x)
      btVector3.setY(parameters.height / 2 * scale.y)
      btVector3.setZ(parameters.depth / 2 * scale.z)
      return new Ammo.btBoxShape(btVector3)
    case 'SphereGeometry':
      const radius = parameters.radius * scale.x
      return new Ammo.btSphereShape(radius)
    case 'CylinderGeometry':
      const size = new Ammo.btVector3(parameters.radiusTop * scale.x,
        parameters.height * 0.5 * scale.y,
        parameters.radiusBottom * scale.x)
      return new Ammo.btCylinderShape(size)
    default:
      const { x, y, z } = getSize(mesh)
      btVector3.setX(x / 2 * scale.x)
      btVector3.setY(y / 2 * scale.y)
      btVector3.setZ(z / 2 * scale.z)
      return new Ammo.btBoxShape(btVector3)
  }
}

const getMassFromMesh = function(mesh) {
  const { scale } = mesh
  const { parameters, type } = mesh.geometry
  switch (type) {
    case 'BoxGeometry':
      return parameters.width * scale.x * parameters.height * scale.y * parameters.depth * scale.z
    case 'SphereGeometry':
      return 4 / 3 * Math.PI * Math.pow(parameters.radius * scale.x, 3)
    // from http://jwilson.coe.uga.edu/emt725/Frustum/Frustum.cone.html
    case 'CylinderGeometry':
      return Math.PI * parameters.height / 3 * (
        parameters.radiusBottom * parameters.radiusBottom * scale.x * scale.x
      + parameters.radiusBottom * parameters.radiusTop * scale.y * scale.y
      + parameters.radiusTop * parameters.radiusTop * scale.x * scale.x)
    default:
      const { x, y, z } = getSize(mesh)
      return x * scale.x * y * scale.y * z * scale.z
  }
}

const calcInertia = (mass, shape) => {
  let localInertia
  if (mass) {
    localInertia = new Ammo.btVector3(0, 10, 0)
    shape.calculateLocalInertia(mass, localInertia)
  }
  return localInertia
}

export default class AmmoBody {
  constructor({
    mesh, mass = getMassFromMesh(mesh), shape = getShapeFromMesh(mesh),
  } = {}) {
    const { position, quaternion } = mesh
    this.mesh = mesh
    shape.setMargin(margin)

    const transform = new Ammo.btTransform()
    transform.setIdentity()
    transform.setOrigin(new Ammo.btVector3(position.x, position.y, position.z))
    transform.setRotation(new Ammo.btQuaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w))
    const motionState = new Ammo.btDefaultMotionState(transform)

    const localInertia = calcInertia(mass, shape)
    const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia)

    this.mesh.userData.body = new Ammo.btRigidBody(rbInfo)
  }

  get body() {
    return this.mesh.userData.body
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
