/* global THREE, Ammo */
import AmmoBody from './AmmoBody.js'

export default class AmmoWorld {
  constructor() {
    this._ammoControls = []

    this._clock = new THREE.Clock()
    this.maxSteps = 100
    this.collisionEnabled = false

    const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration()
    const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration)
    const broadphase = new Ammo.btDbvtBroadphase()
    const solver = new Ammo.btSequentialImpulseConstraintSolver()
    this.physicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, broadphase, solver, collisionConfiguration)

    // gravity
    this.physicsWorld.setGravity(new Ammo.btVector3(0, -9.81, 0))
  }
}

// //////////////////////////////////////////////////////////////////////////////
//          Code Separator
// //////////////////////////////////////////////////////////////////////////////

AmmoWorld.prototype.update = function() {
  const deltaTime = this._clock.getDelta()

  if (this.collisionEnabled === true)
    this._updateCollisions()

  // compute physics
  this.physicsWorld.stepSimulation(deltaTime, this.maxSteps)

  // update all ammoControls
  const btTransform = new Ammo.btTransform()
  for (let i = 0; i < this._ammoControls.length; i++) {
    const ammoControls = this._ammoControls[i]

    const motionState = ammoControls.physicsBody.getMotionState()
    console.assert(motionState)
    motionState.getWorldTransform(btTransform)

    const position = btTransform.getOrigin()
    ammoControls.object3d.position.set(position.x(), position.y(), position.z())

    const quaternion = btTransform.getRotation()
    ammoControls.object3d.quaternion.set(quaternion.x(), quaternion.y(), quaternion.z(), quaternion.w())
  }
}

// //////////////////////////////////////////////////////////////////////////////
//          Code Separator
// //////////////////////////////////////////////////////////////////////////////

AmmoWorld.prototype.add = function(ammoControls) {
  console.assert(ammoControls instanceof AmmoBody)

  this.physicsWorld.addRigidBody(ammoControls.physicsBody)

  this._ammoControls.push(ammoControls)
}

AmmoWorld.prototype.remove = function(ammoControls) {
  console.assert(ammoControls instanceof AmmoBody)

  if (this.contains(ammoControls) === false) return

  this.physicsWorld.removeRigidBody(ammoControls.physicsWorld)

  // retmove it from _ammoControls
  this._ammoControls.splice(this._ammoControls.indexOf(ammoControls), 1)
}

AmmoWorld.prototype.contains = function(ammoControls) {
  return this._ammoControls.indexOf(ammoControls) !== -1 ? true : False
}

// //////////////////////////////////////////////////////////////////////////////
//          Handled collision
// //////////////////////////////////////////////////////////////////////////////

/**
 * - based on http://stackoverflow.com/questions/31991267/bullet-physicsammo-js-in-asm-js-how-to-get-collision-impact-force
 */
AmmoWorld.prototype._updateCollisions = function() {
  console.assert(this.collisionEnabled === true)
  const _this = this

  // loop thru all manifolds
  const dispatcher = this.physicsWorld.getDispatcher()
  const nManifolds = dispatcher.getNumManifolds()
  for (let i = 0; i < nManifolds; i++) {
    // get this manifold
    const manifold = dispatcher.getManifoldByIndexInternal(i)
    // get the number of contacts
    const nContact = manifold.getNumContacts()
    if (nContact === 0) continue
    // go thru all contacts
    for (let j = 0; j < nContact; j++) {
      const btContactPoint = manifold.getContactPoint(j)
      const ammoControls0 = getAmmoControls(manifold.getBody0())
      const ammoControls1 = getAmmoControls(manifold.getBody1())
      // dispatchEvent
      ammoControls0.dispatchEvent({ type: 'colliding', otherAmmoControls: ammoControls1, btContactPoint })
      ammoControls1.dispatchEvent({ type: 'colliding', otherAmmoControls: ammoControls0, btContactPoint })
    }
  }
  return

  function getAmmoControls(body) {
    const object3dId = body.getUserIndex()
    const ammoControls = _this._ammoControls.find(ammoControls => ammoControls.object3d.id === object3dId)
    console.assert(ammoControls instanceof THREEx.AmmoBody === true)
    return ammoControls
  }
}

AmmoWorld.prototype.setGravity = function(x, y, z) {
  this.physicsWorld.setGravity(new Ammo.btVector3(x, y, z))
}
