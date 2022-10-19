/* global Ammo */
const AMMO = await Ammo()

export function createRigidBody(mesh, physicsShape, mass, pos, quat, vel, angVel) {
  if (pos)
    mesh.position.copy(pos)
  else
    pos = mesh.position
  if (quat)
    mesh.quaternion.copy(quat)
  else
    quat = mesh.quaternion
  const transform = new AMMO.btTransform()
  transform.setIdentity()
  transform.setOrigin(new AMMO.btVector3(pos.x, pos.y, pos.z))
  transform.setRotation(new AMMO.btQuaternion(quat.x, quat.y, quat.z, quat.w))
  const motionState = new AMMO.btDefaultMotionState(transform)
  const localInertia = new AMMO.btVector3(0, 0, 0)
  physicsShape.calculateLocalInertia(mass, localInertia)
  const rbInfo = new AMMO.btRigidBodyConstructionInfo(mass, motionState, physicsShape, localInertia)
  const body = new AMMO.btRigidBody(rbInfo)
  body.setFriction(0.5)
  if (vel)
    body.setLinearVelocity(new AMMO.btVector3(vel.x, vel.y, vel.z))
  if (angVel)
    body.setAngularVelocity(new AMMO.btVector3(angVel.x, angVel.y, angVel.z))
  mesh.userData.physicsBody = body
  mesh.userData.collided = false

  if (mass > 0) body.setActivationState(4) // Disable deactivation

  return { mesh, body, mass }
}
