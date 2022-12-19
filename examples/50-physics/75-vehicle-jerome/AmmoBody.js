import { createRigidBody } from '/utils/physics.js'

export default class AmmoBody {
  constructor({ mesh, mass = 0, shape } = {}) {
    this.mesh = mesh
    this.mesh.userData.body = createRigidBody({ mesh, mass, shape })
  }
}
