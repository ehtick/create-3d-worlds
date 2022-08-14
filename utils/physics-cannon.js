import * as THREE from 'three'
import * as CANNON from '/libs/cannon-es.js'
import { createFloor } from '/utils/ground.js'

const { randInt, randFloat } = THREE.Math

const colors = [0xc2b280, 0xF2D16B, 0xedc9af, 0xfffacd, 0xF3CCAA, 0xf5deb3, 0xf0e68c]

/* WORLD */

export const world = new CANNON.World()
world.gravity.set(0, -9.82, 0)

/* GROUND */

export function createGround({ size = 100, color = colors[1], file } = {}) {
  const mesh = createFloor({ size, color, file })
  const cannonMaterial = new CANNON.Material()
  cannonMaterial.friction = 0.25
  cannonMaterial.restitution = 0.25
  const groundShape = new CANNON.Box(new CANNON.Vec3(size * .5, 1, size * .5))
  const body = new CANNON.Body({ mass: 0, cannonMaterial })
  body.addShape(groundShape)
  body.position.set(0, -1, 0)
  mesh.body = body
  return mesh
}

/* DUNES */

export function createObstacles() {
  const radiusTop = 0
  const obstacles = []

  for (let i = 0; i < 100; i++) {
    const radiusBottom = randInt(2, 3)
    const height = randFloat(radiusBottom * .1, radiusBottom * .4)
    const radialSegments = radiusBottom * 5

    const geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments)
    const material = new THREE.MeshPhongMaterial({ color: colors[5] })

    const mesh = new THREE.Mesh(geometry, material)
    mesh.receiveShadow = true
    mesh.position.x = Math.random() * 100 - 50
    mesh.position.y = 0.5
    mesh.position.z = Math.random() * 100 - 50

    const shape = new CANNON.Cylinder(radiusTop + 0.01, radiusBottom, height, radialSegments)
    const cannonMaterial = new CANNON.Material()
    cannonMaterial.friction = .9
    cannonMaterial.restitution = .9
    const body = new CANNON.Body({ mass: 0, material: cannonMaterial })
    body.addShape(shape, new CANNON.Vec3())
    body.position.copy(mesh.position)

    mesh.body = body
    obstacles.push(mesh)
  }
  return obstacles
}
