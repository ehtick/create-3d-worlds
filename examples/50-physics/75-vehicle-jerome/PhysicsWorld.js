import { clock } from '/utils/scene.js'
import { createPhysicsWorld, updateMesh } from '/utils/physics.js'

export default class PhysicsWorld {
  constructor() {
    this.maxSteps = 30
    this.rigidBodies = []
    this.physicsWorld = createPhysicsWorld()
  }

  add(mesh) {
    this.physicsWorld.addRigidBody(mesh.userData.body)
    this.rigidBodies.push(mesh)
  }

  update() {
    this.physicsWorld.stepSimulation(clock.getDelta(), this.maxSteps)
    this.rigidBodies.forEach(updateMesh)
  }
}
