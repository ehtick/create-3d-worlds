import { Ammo, createRigidBody, createShapeFromMesh } from '/utils/physics.js'

export default class AmmoBody {
  constructor({ mesh, mass = 0, shape = createShapeFromMesh(mesh) } = {}) {
    this.mesh = mesh
    this.mesh.userData.body = createRigidBody({ mesh, mass, shape })
  }

  setFriction(value) {
    this.mesh.userData.body.setFriction(value)
  }

  setRestitution(value) {
    this.mesh.userData.body.setRestitution(value)
  }

  setAngularVelocity(x, y, z) {
    const btVector3 = new Ammo.btVector3(x, y, z)
    this.mesh.userData.body.setAngularVelocity(btVector3)
    this.mesh.userData.body.activate()
  }

  setLinearVelocity(x, y, z) {
    const btVector3 = new Ammo.btVector3(x, y, z)
    this.mesh.userData.body.setLinearVelocity(btVector3)
    this.mesh.userData.body.activate()
  }
}
