/* global THREE, CANNON */
import JoyStick from '/classes/JoyStick.js'

let scene, camera, renderer, world, vehicle, dt, light, lightOffset
let particleGeo, particleMaterial, settings

scene = new THREE.Scene()
scene.background = new THREE.Color(0xaaaaff)

camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.set(10, 10, 10)

const ambient = new THREE.HemisphereLight(0x555555, 0xFFFFFF)
scene.add(ambient)

light = new THREE.DirectionalLight(0xffffff, 0.5)
light.position.set(1, 1.25, 1.25)
scene.add(light)

renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

initPhysics()

new JoyStick({ onMove })

function onMove(forward, turn) {
  const maxSteerVal = 0.5
  const maxForce = 500
  const brakeForce = 5

  const force = maxForce * forward
  const steer = maxSteerVal * -turn

  if (forward != 0) {
    vehicle.setBrake(0, 0)
    vehicle.setBrake(0, 1)
    vehicle.setBrake(0, 2)
    vehicle.setBrake(0, 3)

    vehicle.applyEngineForce(force, 2)
    vehicle.applyEngineForce(force, 3)
  } else {
    vehicle.setBrake(brakeForce, 0)
    vehicle.setBrake(brakeForce, 1)
    vehicle.setBrake(brakeForce, 2)
    vehicle.setBrake(brakeForce, 3)
  }

  vehicle.setSteeringValue(steer, 0)
  vehicle.setSteeringValue(steer, 1)
}

function shape2Mesh(body, castShadow, receiveShadow, material) {
  const obj = new THREE.Object3D()
  let index = 0

  body.shapes.forEach (shape => {
    let mesh
    let geometry
    let v0, v1, v2

    switch (shape.type) {
      case CANNON.Shape.types.SPHERE:
        const sphere_geometry = new THREE.SphereGeometry(shape.radius, 8, 8)
        mesh = new THREE.Mesh(sphere_geometry, material)
        break

      case CANNON.Shape.types.PARTICLE:
        mesh = new THREE.Mesh(particleGeo, particleMaterial)
        const s = settings
        mesh.scale.set(s.particleSize, s.particleSize, s.particleSize)
        break

      case CANNON.Shape.types.PLANE:
        geometry = new THREE.PlaneGeometry(10, 10, 4, 4)
        mesh = new THREE.Object3D()
        const submesh = new THREE.Object3D()
        const ground = new THREE.Mesh(geometry, material)
        ground.scale.set(100, 100, 100)
        submesh.add(ground)

        mesh.add(submesh)
        break

      case CANNON.Shape.types.BOX:
        const box_geometry = new THREE.BoxGeometry(shape.halfExtents.x * 2,
          shape.halfExtents.y * 2,
          shape.halfExtents.z * 2)
        mesh = new THREE.Mesh(box_geometry, material)
        break

      case CANNON.Shape.types.CONVEXPOLYHEDRON:
        const geo = new THREE.Geometry()

        // Add vertices
        shape.vertices.forEach(v => {
          geo.vertices.push(new THREE.Vector3(v.x, v.y, v.z))
        })

        shape.faces.forEach(face => {
          // add triangles
          const a = face[0]
          for (let j = 1; j < face.length - 1; j++) {
            const b = face[j]
            const c = face[j + 1]
            geo.faces.push(new THREE.Face3(a, b, c))
          }
        })
        geo.computeBoundingSphere()
        geo.computeFaceNormals()
        mesh = new THREE.Mesh(geo, material)
        break

      case CANNON.Shape.types.HEIGHTFIELD:
        geometry = new THREE.Geometry()

        v0 = new CANNON.Vec3()
        v1 = new CANNON.Vec3()
        v2 = new CANNON.Vec3()
        for (let xi = 0; xi < shape.data.length - 1; xi++)
          for (let yi = 0; yi < shape.data[xi].length - 1; yi++)
            for (let k = 0; k < 2; k++) {
              shape.getConvexTrianglePillar(xi, yi, k === 0)
              v0.copy(shape.pillarConvex.vertices[0])
              v1.copy(shape.pillarConvex.vertices[1])
              v2.copy(shape.pillarConvex.vertices[2])
              v0.vadd(shape.pillarOffset, v0)
              v1.vadd(shape.pillarOffset, v1)
              v2.vadd(shape.pillarOffset, v2)
              geometry.vertices.push(
                new THREE.Vector3(v0.x, v0.y, v0.z),
                new THREE.Vector3(v1.x, v1.y, v1.z),
                new THREE.Vector3(v2.x, v2.y, v2.z)
              )
              const i = geometry.vertices.length - 3
              geometry.faces.push(new THREE.Face3(i, i + 1, i + 2))
            }

        geometry.computeBoundingSphere()
        geometry.computeFaceNormals()
        mesh = new THREE.Mesh(geometry, material)
        break

      case CANNON.Shape.types.TRIMESH:
        geometry = new THREE.Geometry()

        v0 = new CANNON.Vec3()
        v1 = new CANNON.Vec3()
        v2 = new CANNON.Vec3()
        for (let i = 0; i < shape.indices.length / 3; i++) {
          shape.getTriangleVertices(i, v0, v1, v2)
          geometry.vertices.push(
            new THREE.Vector3(v0.x, v0.y, v0.z),
            new THREE.Vector3(v1.x, v1.y, v1.z),
            new THREE.Vector3(v2.x, v2.y, v2.z)
          )
          const j = geometry.vertices.length - 3
          geometry.faces.push(new THREE.Face3(j, j + 1, j + 2))
        }
        geometry.computeBoundingSphere()
        geometry.computeFaceNormals()
        mesh = new THREE.Mesh(geometry, MutationRecordaterial)
        break

      default:
        throw 'Visual type not recognized: ' + shape.type
    }

    mesh.receiveShadow = receiveShadow
    mesh.castShadow = castShadow

    mesh.traverse(child => {
      if (child.isMesh) {
        child.castShadow = castShadow
        child.receiveShadow = receiveShadow
      }
    })

    const o = body.shapeOffsets[index]
    const q = body.shapeOrientations[index++]
    mesh.position.set(o.x, o.y, o.z)
    mesh.quaternion.set(q.x, q.y, q.z, q.w)

    obj.add(mesh)
  })

  return obj
}

function addVisual(body, color = 0x888888, name = 'mesh', castShadow = true, receiveShadow = true, material = new THREE.MeshLambertMaterial({ color })) {
  body.name = name
  if (!settings) {
    settings = {
      stepFrequency: 60,
      quatNormalizeSkip: 2,
      quatNormalizeFast: true,
      gx: 0,
      gy: 0,
      gz: 0,
      iterations: 3,
      tolerance: 0.0001,
      k: 1e6,
      d: 3,
      scene: 0,
      paused: false,
      rendermode: 'solid',
      constraints: false,
      contacts: false,  // Contact points
      cm2contact: false, // center of mass to contact points
      normals: false, // contact normals
      axes: false, // "local" frame axes
      particleSize: 0.1,
      shadows: false,
      aabbs: false,
      profiling: false,
      maxSubSteps: 3
    }
    particleGeo = new THREE.SphereGeometry(1, 16, 8)
    particleMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 })
  }
  // What geometry should be used?
  let mesh
  if (body instanceof CANNON.Body) mesh = shape2Mesh(body, castShadow, receiveShadow, material)

  if (mesh) {
    // Add body
    body.threemesh = mesh
    mesh.castShadow = castShadow
    mesh.receiveShadow = receiveShadow
    scene.add(mesh)
  }
}

function initPhysics() {
  world = new CANNON.World()

  dt = 1 / 60

  world.broadphase = new CANNON.SAPBroadphase(world)
  world.gravity.set(0, -10, 0)
  world.defaultContactMaterial.friction = 0

  const groundMaterial = new CANNON.Material('groundMaterial')
  const wheelMaterial = new CANNON.Material('wheelMaterial')
  const wheelGroundContactMaterial = new CANNON.ContactMaterial(wheelMaterial, groundMaterial, {
    friction: 0.3,
    restitution: 0,
    contactEquationStiffness: 1000
  })

  world.addContactMaterial(wheelGroundContactMaterial)

  const chassisShape = new CANNON.Box(new CANNON.Vec3(1, 0.5, 2))
  const chassisBody = new CANNON.Body({ mass: 150, material: groundMaterial })
  chassisBody.addShape(chassisShape)
  chassisBody.position.set(0, 4, 0)
  addVisual(chassisBody, 0x0000aa, 'car')
  light.target = chassisBody.threemesh
  lightOffset = chassisBody.threemesh.position.clone().sub(light.position)

  const options = {
    radius: 0.5,
    directionLocal: new CANNON.Vec3(0, -1, 0),
    suspensionStiffness: 30,
    suspensionRestLength: 0.8,
    frictionSlip: 1,
    dampingRelaxation: 2.3,
    dampingCompression: 4.4,
    maxSuspensionForce: 100000,
    rollInfluence: 0.01,
    axleLocal: new CANNON.Vec3(-1, 0, 0),
    chassisConnectionPointLocal: new CANNON.Vec3(1, 1, 0),
    maxSuspensionTravel: 0.3,
    customSlidingRotationalSpeed: 30,
    useCustomSlidingRotationalSpeed: true
  }

  vehicle = new CANNON.RaycastVehicle({
    chassisBody,
    indexRightAxis: 0,
    indexUpAxis: 1,
    indexForwardAxis: 2
  })

  options.chassisConnectionPointLocal.set(1, 0, -1)
  vehicle.addWheel(options)

  options.chassisConnectionPointLocal.set(-1, 0, -1)
  vehicle.addWheel(options)

  options.chassisConnectionPointLocal.set(1, 0, 1)
  vehicle.addWheel(options)

  options.chassisConnectionPointLocal.set(-1, 0, 1)
  vehicle.addWheel(options)

  vehicle.addToWorld(world)

  const wheelBodies = []
  vehicle.wheelInfos.forEach(wheel => {
    const cylinderShape = new CANNON.Cylinder(wheel.radius, wheel.radius, wheel.radius / 2, 20)
    const wheelBody = new CANNON.Body({ mass: 1, material: wheelMaterial })
    const q = new CANNON.Quaternion()
    q.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI / 2)
    wheelBody.addShape(cylinderShape, new CANNON.Vec3(), q)
    wheelBodies.push(wheelBody)
    addVisual(wheelBody, 0x111111, 'wheel')
  })

  world.addEventListener('postStep', () => {
    vehicle.wheelInfos.forEach((wheel, i) => {
      vehicle.updateWheelTransform(i)
      const t = wheel.worldTransform
      wheelBodies[i].threemesh.position.copy(t.position)
      wheelBodies[i].threemesh.quaternion.copy(t.quaternion)
    })
  })

  const matrix = []
  const sizeX = 64, sizeY = 64

  for (let i = 0; i < sizeX; i++) {
    matrix.push([])
    for (let j = 0; j < sizeY; j++) {
      let height = Math.cos(i / sizeX * Math.PI * 5) * Math.cos(j / sizeY * Math.PI * 5) * 2 + 2
      if (i === 0 || i === sizeX - 1 || j === 0 || j === sizeY - 1)
        height = 3
      matrix[i].push(height)
    }
  }

  const hfShape = new CANNON.Heightfield(matrix, {
    elementSize: 100 / sizeX
  })
  const hfBody = new CANNON.Body({ mass: 0 })
  hfBody.addShape(hfShape)
  hfBody.position.set(-sizeX * hfShape.elementSize / 2, -4, sizeY * hfShape.elementSize / 2)
  hfBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
  world.add(hfBody)
  addVisual(hfBody, 0x00aa00, 'landscape')
}

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  world.step(dt)
  world.bodies.forEach(body => {
    if (!body.threemesh) return
    body.threemesh.position.copy(body.position)
    body.threemesh.quaternion.copy(body.quaternion)
  })
  camera.lookAt(vehicle.chassisBody.threemesh.position)
  renderer.render(scene, camera)
}()