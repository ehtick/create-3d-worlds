import { Ammo, createRigidBody, createShapeFromMesh } from '/utils/physics.js'

export default class AmmoBody {
  constructor({ mesh, mass = 0, shape = createShapeFromMesh(mesh) } = {}) {
    this.mesh = mesh
    shape.setMargin(.05)
    this.mesh.userData.body = createRigidBody({ mesh, mass, shape })
  }

  get body() {
    return this.mesh.userData.body
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
