import * as THREE from 'three'
import * as BufferGeometryUtils from '/node_modules/three/examples/jsm/utils/BufferGeometryUtils.js'
import { scene, camera, clock } from '/utils/scene.js'
import { createFloor } from '/utils/ground.js'

import { AgentInstanced } from './agent.js'
import { AStarManager } from './astar.js'
import { math } from './math.js'
import { MazeGenerator } from './mazegen.js'
import { Graphics } from './graphics.js'

const _BOID_SPEED = 0.25
const _BOID_ACCELERATION = _BOID_SPEED / 2.5
const _BOID_FORCE_MAX = _BOID_ACCELERATION / 5.0

const _TILES_X = 100
const _TILES_Y = 20
const _TILES_S = 75

const _Key = (x, y) => x + '.' + y

class Graph {
  constructor() {
    this._nodes = {}
  }

  get nodes() {
    return this._nodes
  }

  AddNode(k, e, m) {
    this._nodes[k] = {
      edges: [...e],
      potentialEdges: [...e],
      metadata: m
    }
  }
}

function NodesToMesh(scene, nodes) {
  const material2 = new THREE.MeshStandardMaterial({ color: 0xFFFFFF })

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

      if (curNode.edges.indexOf(_Key(x, y + 1)) < 0) {
        const x1 = w * (x + 0.0)
        const y1 = h * (y + 1.0)
        const x2 = w * (x + 1.0)

        const sq = new THREE.BoxGeometry(x2 - x1, wallHeight, wallWidth)
        const m = new THREE.Matrix4()
        m.makeTranslation(x1 + 0.5, wallHeight * 0.5, y1)
        sq.applyMatrix4(m)
        geometries.push(sq)
      }

      if (curNode.edges.indexOf(_Key(x + 1, y + 0)) < 0) {
        const x1 = w * (x + 1.0)
        const y1 = h * (y + 0.0)
        const y2 = h * (y + 1.0)

        const sq = new THREE.BoxGeometry(wallWidth, wallHeight, y2 - y1)
        const m = new THREE.Matrix4()
        m.makeTranslation(x1, wallHeight * 0.5, y1 + 0.5)
        sq.applyMatrix4(m)
        geometries.push(sq)
      }

      if (curNode.edges.indexOf(_Key(x, y - 1)) < 0) {
        const x1 = w * (x + 0.0)
        const y1 = h * (y + 0.0)
        const x2 = w * (x + 1.0)

        const sq = new THREE.BoxGeometry(x2 - x1, wallHeight, wallWidth)
        const m = new THREE.Matrix4()
        m.makeTranslation(x1 + 0.5, wallHeight * 0.5, y1)
        sq.applyMatrix4(m)
        geometries.push(sq)
      }

      if (curNode.edges.indexOf(_Key(x - 1, y)) < 0) {
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
  const mesh = new THREE.Mesh(mergedGeometry, material2)
  mesh.castShadow = true
  mesh.receiveShadow = true
  scene.add(mesh)

  const plane = createFloor({ size: 500 })
  scene.add(plane)
}

/* INIT */

const graphics = new Graphics()
const entities = []

let graph, mazeGenerator, mazeIterator

graphics.Initialize()
createMaze()

/* FUNCTION */

function createMaze() {
  graph = new Graph()

  for (let x = 0; x < _TILES_X; x++)
    for (let y = 0; y < _TILES_Y; y++) {
      const k = _Key(x, y)
      graph.AddNode(k, [], {
        position: new THREE.Vector2(x, y),
        weight: 0,
        render: {
          visited: false,
          visible: true,
        }
      })
    }

  for (let x = 0; x < _TILES_X; x++)
    for (let y = 0; y < _TILES_Y; y++) {
      const k = _Key(x, y)

      for (let xi = -1; xi <= 1; xi++)
        for (let yi = -1; yi <= 1; yi++) {
          if (xi == 0 && yi == 0 || (Math.abs(xi) + Math.abs(yi) != 1))
            continue

          const ki = _Key(x + xi, y + yi)

          if (ki in graph.nodes)
            graph.nodes[k].potentialEdges.push(ki)
        }
    }

  const start = _Key(0, 0)
  mazeGenerator = new MazeGenerator(graph.nodes)
  mazeIterator = mazeGenerator.GenerateIteratively(start)
}

const mazeDone = () => {
  const nodes = []
  for (let x = 0; x < _TILES_X; x++)
    for (let y = 0; y > -_TILES_S; y--) {
      const k = _Key(x, y)
      if (k in graph.nodes)
        continue

      graph.AddNode(
        k, [],
        {
          position: new THREE.Vector2(x, y),
          weight: 0,
          render: {
            visited: false,
            visible: false,
          }
        })
      nodes.push(k)
    }

  for (let x = 0; x < _TILES_X; x++)
    for (let y = _TILES_Y - 1; y < _TILES_Y + _TILES_S; y++) {
      const k = _Key(x, y)
      if (k in graph.nodes)
        continue

      graph.AddNode(
        k, [],
        {
          position: new THREE.Vector2(x, y),
          weight: 0,
          render: {
            visited: false,
            visible: false,
          }
        })
      nodes.push(k)
    }

  for (const k of nodes) {
    const n = graph.nodes[k]
    const { x } = n.metadata.position
    const { y } = n.metadata.position

    for (let xi = -1; xi <= 1; xi++)
      for (let yi = -1; yi <= 1; yi++) {
        if (xi == 0 && yi == 0 || (Math.abs(xi) + Math.abs(yi) != 1))
          continue

        const ki = _Key(x + xi, y + yi)

        if (ki in graph.nodes)
          graph.nodes[k].potentialEdges.push(ki)

        for (const pk of graph.nodes[k].potentialEdges) {
          graph.nodes[k].edges.push(pk)
          graph.nodes[pk].edges.push(k)
        }
      }
  }
  createEntities()
}

function createEntities() {
  const geometries = {
    cone: new THREE.ConeGeometry(1, 2, 32)
  }

  const material = new THREE.MeshStandardMaterial({ color: 0xFF0000 })
  const numInstances = _TILES_X * _TILES_S / 2

  const mesh = new THREE.InstancedMesh(geometries.cone, material, numInstances)
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
  mesh.castShadow = true
  mesh.receiveShadow = true
  mesh.frustumCulled = false

  let index = 0
  const { nodes } = graph

  function manhattanDistance(n1, n2) {
    const p1 = n1.metadata.position
    const p2 = n2.metadata.position
    const dx = Math.abs(p2.x - p1.x)
    const dy = Math.abs(p2.y - p1.y)
    return (dx + dy)
  }

  const heuristicFunction = (s, e) => 2 * manhattanDistance(nodes[s], nodes[e])

  const weightFunction = (s, e) => manhattanDistance(nodes[s], nodes[e])

  const mgr = new AStarManager(
    graph.nodes,
    heuristicFunction,
    weightFunction)

  entities.push(mgr)

  for (let j = 0; j < _TILES_S / 2; j++)
    for (let i = 0; i < _TILES_X; i++) {
      const xe = math.clamp(math.rand_int(i - 20, i + 20), 0, _TILES_X - 1)
      const start = _Key(i, -j - 1)
      const end = _Key(xe, _TILES_Y + 5)

      const params = {
        geometry: geometries.cone,
        material,
        mesh,
        index: index++,
        speed: _BOID_SPEED,
        maxSteeringForce: _BOID_FORCE_MAX,
        acceleration: _BOID_ACCELERATION,
        position: new THREE.Vector3(i, 0.25, -j - 1),
        astar: mgr.CreateClient(start, end),
      }
      const e = new AgentInstanced(params)
      entities.push(e)
    }

  camera.position.set(_TILES_X / 2, 7, 20)
  console.log('AGENTS: ' + entities.length)
  scene.add(mesh)
}

function stepMazeGeneration() {
  for (let i = 0; i < 100; i++)
    if (mazeIterator) {
      const r = mazeIterator.next()
      if (r.done) {
        mazeGenerator.Randomize()
        mazeDone()
        NodesToMesh(scene, graph.nodes)
        graphics.dirLight.position.set(_TILES_X * 0.5, 10, _TILES_Y * 0.5)
        graphics.dirLight.target.position.set(_TILES_X * 0.5 - 5, 0, _TILES_Y * 0.5 - 5)
        graphics.dirLight.target.updateWorldMatrix()
        mazeIterator = null
      }
    }
}

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  const delta = clock.getDelta()
  stepMazeGeneration()
  for (const e of entities) e.Step(delta)
  graphics.Render(delta)
}()
