import * as THREE from '/node_modules/three127/build/three.module.js'

const _MIN_NODE_SIZE = 500

export class QuadTree {
  constructor(params) {
    const s = params.size
    const b = new THREE.Box2(
      new THREE.Vector3(-s, -s,),
      new THREE.Vector3(s, s))
    this._root = {
      bounds: b,
      children: [],
      center: b.getCenter(new THREE.Vector2()),
      size: b.getSize(new THREE.Vector2()),
    }
  }

  GetChildren() {
    const children = []
    this._GetChildren(this._root, children)
    return children
  }

  _GetChildren(node, target) {
    if (node.children.length == 0) {
      target.push(node)
      return
    }

    for (const c of node.children)
      this._GetChildren(c, target)

  }

  Insert(pos) {
    this._Insert(this._root, new THREE.Vector2(pos.x, pos.z))
  }

  _Insert(child, pos) {
    const distToChild = this._DistanceToChild(child, pos)

    if (distToChild < child.size.x && child.size.x > _MIN_NODE_SIZE) {
      child.children = this._CreateChildren(child)

      for (const c of child.children)
        this._Insert(c, pos)

    }
  }

  _DistanceToChild(child, pos) {
    return child.center.distanceTo(pos)
  }

  _CreateChildren(child) {
    const midpoint = child.bounds.getCenter(new THREE.Vector2())

    // Bottom left
    const b1 = new THREE.Box2(child.bounds.min, midpoint)

    // Bottom right
    const b2 = new THREE.Box2(
      new THREE.Vector2(midpoint.x, child.bounds.min.y),
      new THREE.Vector2(child.bounds.max.x, midpoint.y))

    // Top left
    const b3 = new THREE.Box2(
      new THREE.Vector2(child.bounds.min.x, midpoint.y),
      new THREE.Vector2(midpoint.x, child.bounds.max.y))

    // Top right
    const b4 = new THREE.Box2(midpoint, child.bounds.max)

    const children = [b1, b2, b3, b4].map(
      b => ({
        bounds: b,
        children: [],
        center: b.getCenter(new THREE.Vector2()),
        size: b.getSize(new THREE.Vector2())
      }))

    return children
  }
}
