import * as THREE from 'three'
import { Ammo } from '/utils/physics.js'

const guessGeometryFromMesh = function(mesh) {
  const { parameters } = mesh.geometry
  const { type } = mesh.geometry

  console.log({
    parameters,
    type
  })

  return {
    parameters,
    type
  }
}

const guessShapeFromMesh = function(mesh) {
  const guessedGeometry = guessGeometryFromMesh(mesh)
  const p = guessedGeometry.parameters
  const s = mesh.scale

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
    const box3 = new THREE.Box3().setFromObject(mesh)
    size = box3.getSize()
    btVector3.setX(size.x / 2 * s.x)
    btVector3.setY(size.y / 2 * s.y)
    btVector3.setZ(size.z / 2 * s.z)
    shape = new Ammo.btBoxShape(btVector3)
  }
  return shape
}

const guessMassFromMesh = function(mesh) {
  const guessedGeometry = guessGeometryFromMesh(mesh)
  const p = guessedGeometry.parameters
  const s = mesh.scale

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
    const box3 = new THREE.Box3().setFromObject(mesh)
    const size = box3.getSize()
    mass = size.x * s.x * size.y * s.y * size.z * s.z
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
// Object.assign(AmmoBody.prototype, THREE.EventDispatcher.prototype)
