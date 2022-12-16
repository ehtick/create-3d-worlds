import * as THREE from 'three'
import { Ammo, createPhysicsWorld } from '/utils/physics.js'

export default class AmmoWorld {
  constructor() {
    this._ammoControls = []
    this._clock = new THREE.Clock()
    this.maxSteps = 100
    this.physicsWorld = createPhysicsWorld()
  }

  update() {
    const deltaTime = this._clock.getDelta()
    this.physicsWorld.stepSimulation(deltaTime, this.maxSteps)

    // update all ammoControls
    const btTransform = new Ammo.btTransform()
    for (let i = 0; i < this._ammoControls.length; i++) {
      const ammoControls = this._ammoControls[i]

      const motionState = ammoControls.physicsBody.getMotionState()
      motionState.getWorldTransform(btTransform)

      const position = btTransform.getOrigin()
      ammoControls.mesh.position.set(position.x(), position.y(), position.z())

      const quaternion = btTransform.getRotation()
      ammoControls.mesh.quaternion.set(quaternion.x(), quaternion.y(), quaternion.z(), quaternion.w())
    }
  }

  add(ammoControls) {
    this.physicsWorld.addRigidBody(ammoControls.physicsBody)
    this._ammoControls.push(ammoControls)
  }

  remove(ammoControls) {
    if (!this.contains(ammoControls)) return
    this.physicsWorld.removeRigidBody(ammoControls.physicsWorld)
    this._ammoControls.splice(this._ammoControls.indexOf(ammoControls), 1)
  }

  contains(ammoControls) {
    return this._ammoControls.indexOf(ammoControls) !== -1
  }
}
