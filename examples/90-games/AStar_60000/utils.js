import * as THREE from 'three'
import * as BufferGeometryUtils from '/node_modules/three/examples/jsm/utils/BufferGeometryUtils.js'

export const createKey = (x, y) => x + '.' + y

export function NodesToMesh(scene, nodes) {
  const material = new THREE.MeshStandardMaterial({ color: 0xFFFFFF })
  const geometries = []

  for (const k in nodes) {
    const curNode = nodes[k]
    const { x, y } = curNode.metadata.position
    const w = 1
    const h = 1
    const wallWidth = 0.25
    const wallHeight = 0.5

    const neighbours = [[0, 1], [1, 0], [0, -1], [-1, 0]]

    if (!curNode.metadata.render.visible)
      continue

    for (let ni = 0; ni < neighbours.length; ni++) {

      if (curNode.edges.indexOf(createKey(x, y + 1)) < 0) {
        const x1 = w * (x + 0.0)
        const y1 = h * (y + 1.0)
        const x2 = w * (x + 1.0)

        const sq = new THREE.BoxGeometry(x2 - x1, wallHeight, wallWidth)
        const m = new THREE.Matrix4()
        m.makeTranslation(x1 + 0.5, wallHeight * 0.5, y1)
        sq.applyMatrix4(m)
        geometries.push(sq)
      }

      if (curNode.edges.indexOf(createKey(x + 1, y + 0)) < 0) {
        const x1 = w * (x + 1.0)
        const y1 = h * (y + 0.0)
        const y2 = h * (y + 1.0)

        const sq = new THREE.BoxGeometry(wallWidth, wallHeight, y2 - y1)
        const m = new THREE.Matrix4()
        m.makeTranslation(x1, wallHeight * 0.5, y1 + 0.5)
        sq.applyMatrix4(m)
        geometries.push(sq)
      }

      if (curNode.edges.indexOf(createKey(x, y - 1)) < 0) {
        const x1 = w * (x + 0.0)
        const y1 = h * (y + 0.0)
        const x2 = w * (x + 1.0)

        const sq = new THREE.BoxGeometry(x2 - x1, wallHeight, wallWidth)
        const m = new THREE.Matrix4()
        m.makeTranslation(x1 + 0.5, wallHeight * 0.5, y1)
        sq.applyMatrix4(m)
        geometries.push(sq)
      }

      if (curNode.edges.indexOf(createKey(x - 1, y)) < 0) {
        const x1 = w * (x + 0.0)
        const y1 = h * (y + 0.0)
        const y2 = h * (y + 1.0)

        const sq = new THREE.BoxGeometry(wallWidth, wallHeight, y2 - y1)
        const m = new THREE.Matrix4()
        m.makeTranslation(x1, wallHeight * 0.5, y1 + 0.5)
        sq.applyMatrix4(m)
        geometries.push(sq)
      }
    }
  }

  for (const k in nodes) {
    const curNode = nodes[k]
    curNode.edges = [...new Set(curNode.edges)]
  }

  const mergedGeometry = BufferGeometryUtils.mergeBufferGeometries(geometries)
  const mesh = new THREE.Mesh(mergedGeometry, material)
  mesh.castShadow = true
  mesh.receiveShadow = true
  scene.add(mesh)
}