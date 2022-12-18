import { Ammo, createRigidBody, createShapeFromMesh } from '/utils/physics.js'
import { getSize } from '/utils/helpers.js'

const margin = 0.05

const getMassFromMesh = function(mesh) {
  const { scale } = mesh
  const { parameters, type } = mesh.geometry
  switch (type) {
    case 'BoxGeometry':
      return parameters.width * scale.x * parameters.height * scale.y * parameters.depth * scale.z
    case 'SphereGeometry':
      return 4 / 3 * Math.PI * Math.pow(parameters.radius * scale.x, 3)
    // from http://jwilson.coe.uga.edu/emt725/Frustum/Frustum.cone.html
    case 'CylinderGeometry':
      return Math.PI * parameters.height / 3 * (
        parameters.radiusBottom * parameters.radiusBottom * scale.x * scale.x
      + parameters.radiusBottom * parameters.radiusTop * scale.y * scale.y
      + parameters.radiusTop * parameters.radiusTop * scale.x * scale.x)
    default:
      const { x, y, z } = getSize(mesh)
      return x * scale.x * y * scale.y * z * scale.z
  }
}

export default class AmmoBody {
  constructor({ mesh, mass = getMassFromMesh(mesh), shape = createShapeFromMesh(mesh) } = {}) {
    this.mesh = mesh
    shape.setMargin(margin)
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
