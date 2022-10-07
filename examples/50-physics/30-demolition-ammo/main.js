/* global Ammo */
import * as THREE from 'three'
import { scene, camera, renderer, clock, createOrbitControls } from '/utils/scene.js'
import { createSun } from '/utils/light.js'
import { createBox, createBall, createBrick } from '/utils/physics.js'

const AMMO = await Ammo

const pos = new THREE.Vector3()
const quat = new THREE.Quaternion()

camera.position.set(-7, 5, 8)
createOrbitControls()

const gravityConstant = - 9.8
const rigidBodies = []
const margin = 0.05
let physicsWorld, hinge, rope, transformAux1
let armMovement = 0

const sun = createSun({ position: [-5, 10, 5] })
scene.add(sun)

initPhysics()
createObjects()
initInput()

function initPhysics() {
  // Physics configuration
  const collisionConfiguration = new AMMO.btSoftBodyRigidBodyCollisionConfiguration()
  const dispatcher = new AMMO.btCollisionDispatcher(collisionConfiguration)
  const broadphase = new AMMO.btDbvtBroadphase()
  const solver = new AMMO.btSequentialImpulseConstraintSolver()
  const softBodySolver = new AMMO.btDefaultSoftBodySolver()
  physicsWorld = new AMMO.btSoftRigidDynamicsWorld(dispatcher, broadphase, solver, collisionConfiguration, softBodySolver)
  physicsWorld.setGravity(new AMMO.btVector3(0, gravityConstant, 0))
  physicsWorld.getWorldInfo().set_m_gravity(new AMMO.btVector3(0, gravityConstant, 0))

  transformAux1 = new AMMO.btTransform()
}

function createObjects() {
  const ground = createBox(40, 1, 40, 0, { x: 0, y: -0.5, z: 0 }, { x: 0, y: 0, z: 0, w: 1 }, 0xFFFFFF)
  addRigidBody(ground)

  const ballRadius = 0.6
  const ball = createBall(ballRadius, 1.2, { x: -3, y: 2, z: 0 })
  addRigidBody(ball)

  const brickLength = 1.2
  const brickHeight = brickLength * 0.5
  const numBricksLength = 6
  const numBricksHeight = 8
  const z = -numBricksLength * brickLength * 0.5
  pos.set(0, brickHeight * 0.5, z)

  for (let j = 0; j < numBricksHeight; j ++) {
    const oddRow = (j % 2) == 1
    const nRow = oddRow ? numBricksLength + 1 : numBricksLength

    pos.z = oddRow ? z - brickLength * .25 : z

    for (let i = 0; i < nRow; i ++) {
      const firstOrLast = oddRow && (i == 0 || i == nRow - 1)
      const brick = createBrick(brickLength, brickHeight, 0.6, pos, firstOrLast)
      addRigidBody(brick)

      pos.z = oddRow && (i == 0 || i == nRow - 2)
        ? pos.z + brickLength * .75
        : pos.z + brickLength
    }

    pos.y += brickHeight
  }

  // Rope graphic object
  const ropeNumSegments = 10
  const ropeLength = 4
  const ropeMass = 3
  const ropePos = ball.mesh.position.clone()
  ropePos.y += ballRadius

  const segmentLength = ropeLength / ropeNumSegments
  const ropeGeometry = new THREE.BufferGeometry()
  const ropeMaterial = new THREE.LineBasicMaterial({ color: 0x000000 })
  const ropePositions = []
  const ropeIndices = []

  for (let i = 0; i < ropeNumSegments + 1; i ++)
    ropePositions.push(ropePos.x, ropePos.y + i * segmentLength, ropePos.z)

  for (let i = 0; i < ropeNumSegments; i ++)
    ropeIndices.push(i, i + 1)

  ropeGeometry.setIndex(new THREE.BufferAttribute(new Uint16Array(ropeIndices), 1))
  ropeGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(ropePositions), 3))
  ropeGeometry.computeBoundingSphere()
  rope = new THREE.LineSegments(ropeGeometry, ropeMaterial)
  rope.castShadow = true
  rope.receiveShadow = true
  scene.add(rope)

  // Rope physic object
  const softBodyHelpers = new AMMO.btSoftBodyHelpers()
  const ropeStart = new AMMO.btVector3(ropePos.x, ropePos.y, ropePos.z)
  const ropeEnd = new AMMO.btVector3(ropePos.x, ropePos.y + ropeLength, ropePos.z)
  const ropeSoftBody = softBodyHelpers.CreateRope(physicsWorld.getWorldInfo(), ropeStart, ropeEnd, ropeNumSegments - 1, 0)
  const sbConfig = ropeSoftBody.get_m_cfg()
  sbConfig.set_viterations(10)
  sbConfig.set_piterations(10)
  ropeSoftBody.setTotalMass(ropeMass, false)
  AMMO.castObject(ropeSoftBody, AMMO.btCollisionObject).getCollisionShape().setMargin(margin * 3)
  physicsWorld.addSoftBody(ropeSoftBody, 1, - 1)
  rope.userData.physicsBody = ropeSoftBody
  // Disable deactivation
  ropeSoftBody.setActivationState(4)

  // The base
  const armMass = 2
  const armLength = 3
  const pylonHeight = ropePos.y + ropeLength
  pos.set(ropePos.x, 0.1, ropePos.z - armLength)
  quat.set(0, 0, 0, 1)
  const base = createBox(1, 0.2, 1, 0, pos, quat, 0x606060)
  addRigidBody(base)
  pos.set(ropePos.x, 0.5 * pylonHeight, ropePos.z - armLength)
  const pylon = createBox(0.4, pylonHeight, 0.4, 0, pos, quat, 0x606060)
  addRigidBody(pylon)
  pos.set(ropePos.x, pylonHeight + 0.2, ropePos.z - 0.5 * armLength)
  const arm = createBox(0.4, 0.4, armLength + 0.4, armMass, pos, quat, 0x606060)
  addRigidBody(arm)

  // Glue the rope extremes to the ball and the arm
  const influence = 1
  ropeSoftBody.appendAnchor(0, ball.body, true, influence)
  ropeSoftBody.appendAnchor(ropeNumSegments, arm.body, true, influence)

  // Hinge constraint to move the arm
  const pivotA = new AMMO.btVector3(0, pylonHeight * 0.5, 0)
  const pivotB = new AMMO.btVector3(0, - 0.2, - armLength * 0.5)
  const axis = new AMMO.btVector3(0, 1, 0)
  hinge = new AMMO.btHingeConstraint(pylon.body, arm.body, pivotA, pivotB, axis, axis, true)
  physicsWorld.addConstraint(hinge, true)
}

function addRigidBody({ mesh, body, mass }) {
  scene.add(mesh)
  if (mass > 0) rigidBodies.push(mesh)
  physicsWorld.addRigidBody(body)
}

function initInput() {
  window.addEventListener('keydown', event => {
    switch (event.keyCode) {
      // Q
      case 81:
        armMovement = 1
        break
        // A
      case 65:
        armMovement = - 1
        break
    }
  })

  window.addEventListener('keyup', () => {
    armMovement = 0
  })
}

function updatePhysics(deltaTime) {
  // Hinge control
  hinge.enableAngularMotor(true, 1.5 * armMovement, 50)
  // Step world
  physicsWorld.stepSimulation(deltaTime, 10)
  // Update rope
  const softBody = rope.userData.physicsBody
  const ropePositions = rope.geometry.attributes.position.array
  const numVerts = ropePositions.length / 3
  const nodes = softBody.get_m_nodes()
  let indexFloat = 0

  for (let i = 0; i < numVerts; i ++) {
    const node = nodes.at(i)
    const nodePos = node.get_m_x()
    ropePositions[indexFloat ++] = nodePos.x()
    ropePositions[indexFloat ++] = nodePos.y()
    ropePositions[indexFloat ++] = nodePos.z()
  }

  rope.geometry.attributes.position.needsUpdate = true

  rigidBodies.forEach(mesh => {
    const { physicsBody } = mesh.userData
    const ms = physicsBody.getMotionState()
    if (ms) {
      ms.getWorldTransform(transformAux1)
      const p = transformAux1.getOrigin()
      const q = transformAux1.getRotation()
      mesh.position.set(p.x(), p.y(), p.z())
      mesh.quaternion.set(q.x(), q.y(), q.z(), q.w())
    }
  })
}

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  const deltaTime = clock.getDelta()
  updatePhysics(deltaTime)
  renderer.render(scene, camera)
}()
