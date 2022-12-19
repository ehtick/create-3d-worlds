import { clock } from '/utils/scene.js'
import { createPhysicsWorld, updateMesh } from '/utils/physics.js'

export default class AmmoWorld {
  constructor() {
    this.ammoBodies = []
    this.maxSteps = 30
    this.physicsWorld = createPhysicsWorld()
  }

  add(ammoBody) {
    this.physicsWorld.addRigidBody(ammoBody.mesh.userData.body)
    this.ammoBodies.push(ammoBody.mesh)
  }

  update() {
    this.physicsWorld.stepSimulation(clock.getDelta(), this.maxSteps)
    this.ammoBodies.forEach(updateMesh)
  }
}
