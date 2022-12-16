import * as THREE from 'three'
import { Ammo } from '/utils/physics.js'

const guessShapeFromMesh = function(mesh) {
  const { parameters, type } = mesh.geometry
  const { scale } = mesh

  const btVector3 = new Ammo.btVector3()
  let shape, size

  if (type === 'BoxGeometry') {
    btVector3.setX(parameters.width / 2 * scale.x)
    btVector3.setY(parameters.height / 2 * scale.y)
    btVector3.setZ(parameters.depth / 2 * scale.z)
    shape = new Ammo.btBoxShape(btVector3)
  } else if (type === 'SphereGeometry') {
    const radius = parameters.radius * scale.x
    shape = new Ammo.btSphereShape(radius)
  } else if (type === 'CylinderGeometry') {
    size = new Ammo.btVector3(parameters.radiusTop * scale.x,
      parameters.height * 0.5 * scale.y,
      parameters.radiusBottom * scale.x)
    shape = new Ammo.btCylinderShape(size)
  } else {
    const box3 = new THREE.Box3().setFromObject(mesh)
    size = box3.getSize()
    btVector3.setX(size.x / 2 * scale.x)
    btVector3.setY(size.y / 2 * scale.y)
    btVector3.setZ(size.z / 2 * scale.z)
    shape = new Ammo.btBoxShape(btVector3)
  }
  return shape
}

const guessMassFromMesh = function(mesh) {
  const { parameters, type } = mesh.geometry
  const { scale } = mesh

  let mass = 0

  if (type === 'BoxGeometry')
    mass = parameters.width * scale.x * parameters.height * scale.y * parameters.depth * scale.z
  else if (type === 'SphereGeometry')
    mass = 4 / 3 * Math.PI * Math.pow(parameters.radius * scale.x, 3)
  else if (type === 'CylinderGeometry')
    // from http://jwilson.coe.uga.edu/emt725/Frustum/Frustum.cone.html
    mass = Math.PI * parameters.height / 3 * (parameters.radiusBottom * parameters.radiusBottom * scale.x * scale.x
                        + parameters.radiusBottom * parameters.radiusTop * scale.y * scale.y
                        + parameters.radiusTop * parameters.radiusTop * scale.x * scale.x)
  else {
    const box3 = new THREE.Box3().setFromObject(mesh)
    const size = box3.getSize()
    mass = size.x * scale.x * size.y * scale.y * size.z * scale.z
  }
  return mass
}

export default class AmmoBody {
  constructor(mesh, {
    shape = guessShapeFromMesh(mesh),
    mass = guessMassFromMesh(mesh),
  } = {}) {
    this.mesh = mesh
    const margin = 0.05
    shape.setMargin(margin)

    let localInertia
    if (mass !== 0) {
      localInertia = new Ammo.btVector3(0, 10, 0)
      shape.calculateLocalInertia(mass, localInertia)
    }

    const btTransform = new Ammo.btTransform()
    btTransform.setIdentity()
    const { position } = this.mesh
    btTransform.setOrigin(new Ammo.btVector3(position.x, position.y, position.z))
    const { quaternion } = this.mesh
    btTransform.setRotation(new Ammo.btQuaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w))
    const motionState = new Ammo.btDefaultMotionState(btTransform)

    const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia)
    const body = new Ammo.btRigidBody(rbInfo)

    body.setUserIndex(this.mesh.id)
    this.mesh.userData.ammoControls = this

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
