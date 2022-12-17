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

  add(ammoControls) {
    this.physicsWorld.addRigidBody(ammoControls.body)
    this.ammoBodies.push(ammoControls)
  }

  remove(ammoControls) {
    if (!this.ammoBodies.contains(ammoControls)) return
    this.physicsWorld.removeRigidBody(ammoControls.physicsWorld)
    this.ammoBodies.splice(this.ammoBodies.indexOf(ammoControls), 1)
  }
}
