import { clock } from '/utils/scene.js'
import { createPhysicsWorld, updateMesh } from '/utils/physics.js'

export default class AmmoWorld {
  constructor() {
    this.ammoBodies = []
    this.maxSteps = 30
    this.physicsWorld = createPhysicsWorld()
  }

  update() {
    this.physicsWorld.stepSimulation(clock.getDelta(), this.maxSteps)
    this.ammoBodies.forEach(ammoBody => updateMesh(ammoBody.mesh))
  }

  add(ammoBody) {
    this.physicsWorld.addRigidBody(ammoBody.body)
    this.ammoBodies.push(ammoBody)
  }

  remove(ammoBody) {
    if (!this.ammoBodies.contains(ammoBody)) return
    this.physicsWorld.removeRigidBody(ammoBody.physicsWorld)
    this.ammoBodies.splice(this.ammoBodies.indexOf(ammoBody), 1)
  }
}
