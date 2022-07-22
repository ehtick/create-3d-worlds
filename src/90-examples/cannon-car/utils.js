import * as THREE from '/node_modules/three127/build/three.module.js'
import * as CANNON from '/libs/cannon-es.js'
import { createFloor } from '/utils/ground.js'
import { randomInRange } from '/utils/helpers.js'
import { material } from '/utils/shaders/gradient-uv.js'

const colors = [0xc2b280, 0xF2D16B, 0xedc9af, 0xfffacd, 0xF3CCAA, 0xf5deb3, 0xf0e68c]
material.uniforms.color1.value = new THREE.Color(colors[1])
material.uniforms.color2.value = new THREE.Color(colors[5])

export function createObstacles() {
  const radiusTop = 0
  const obstacles = []

  for (let i = 0; i < 100; i++) {
    const radiusBottom = randomInRange(2, 3, true)
    const height = randomInRange(radiusBottom * .1, radiusBottom * .4)
    const radialSegments = radiusBottom * 5

    const geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments)
    const phongMaterial = new THREE.MeshPhongMaterial({ color: colors[i % colors.length] })
    const mesh = new THREE.Mesh(geometry, phongMaterial)
    mesh.position.x = Math.random() * 100 - 50
    mesh.position.y = 0.5
    mesh.position.z = Math.random() * 100 - 50

    const shape = new CANNON.Cylinder(radiusTop + 0.01, radiusBottom, height, radialSegments)
    const body = new CANNON.Body({ mass: 0 })
    body.addShape(shape, new CANNON.Vec3())
    body.position.copy(mesh.position)

    mesh.body = body
    obstacles.push(mesh)
  }
  return obstacles
}

export function createGround({ size = 100 } = {}) {
  const mesh = createFloor({ size, color: colors[6] })
  mesh.material = material
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
