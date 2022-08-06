import * as THREE from 'three'
import { scene } from '/utils/scene.js'
import { randomWaypoint } from './utils.js'
import { fredAnims, ghoulAnims } from './data.js'

class Player {
  constructor({ name, object, speed, clip, npc, pathfinder }) {
    this.name = name || 'Player'
    this.animations = {}
    scene.add(object)

    this.object = object
    this.pathLines = new THREE.Object3D()
    this.pathColor = new THREE.Color(0xFFFFFF)
    this.nodeRadius = 0.2
    scene.add(this.pathLines)

    this.npc = npc
    if (this.npc) this.dead = false

    this.speed = speed
    this.pathfinder = pathfinder
    this.navMeshGroup = this.pathfinder.getGroup('dungeon', this.object.position)

    const point = this.object.position.clone()
    point.z += 10
    this.object.lookAt(point)

    const anims = name == 'fred' ? fredAnims : ghoulAnims
    this.mixer = new THREE.AnimationMixer(object)
    anims.forEach(anim => {
      this.animations[anim.name] = THREE.AnimationUtils.subclip(clip, anim.name, anim.start, anim.end)
    })

    // if (animations) {
    //   this.mixer = new THREE.AnimationMixer(object)
    //   animations.forEach(animation => {
    //     this.animations[animation.name.toLowerCase()] = animation
    //   })
    // }
  }

  newPath(point) {
    if (!point) return
    const player = this.object

    if (this.pathfinder === undefined) {
      this.calculatedPath = [point.clone()]
      this.setTargetDirection()
      return
    }

    this.calculatedPath = this.pathfinder.findPath(player.position, point, 'dungeon', this.navMeshGroup)

    if (this.calculatedPath && this.calculatedPath.length) {
      this.action = 'walk'
      this.setTargetDirection()
    } else {
      this.action = 'idle'
      if (this.pathLines) scene.remove(this.pathLines)
    }
  }

  setTargetDirection() {
    const player = this.object
    const point = this.calculatedPath[0].clone()
    point.y = player.position.y
    const quaternion = player.quaternion.clone()
    player.lookAt(point)
    this.quaternion = player.quaternion.clone()
    player.quaternion.copy(quaternion)
  }

  set action(name) {
    if (this.actionName == name.toLowerCase()) return

    const clip = this.animations[name.toLowerCase()]

    delete this.curAction

    if (clip !== undefined) {
      const action = this.mixer.clipAction(clip)
      action.loop = clip.loop
      action.time = 0
      this.mixer.stopAllAction()
      this.actionName = name.toLowerCase()
      this.actionTime = Date.now()
      action.fadeIn(0.5)
      action.play()
      this.curAction = action
    }
  }

  update(dt) {
    const { speed } = this
    const player = this.object
    if (this.mixer) this.mixer.update(dt)

    if (this.calculatedPath && this.calculatedPath.length) {
      const targetPosition = this.calculatedPath[0]
      const vel = targetPosition.clone().sub(player.position)
      let pathLegComplete = (vel.lengthSq() < 0.01)

      if (!pathLegComplete) {
        // Get the distance to the target before moving
        const prevDistanceSq = player.position.distanceToSquared(targetPosition)
        vel.normalize()
        // Move player to target
        if (this.quaternion) player.quaternion.slerp(this.quaternion, 0.1)
        player.position.add(vel.multiplyScalar(dt * speed))
        // Get distance after moving, if greater then we've overshot and this leg is complete
        const newDistanceSq = player.position.distanceToSquared(targetPosition)
        pathLegComplete = newDistanceSq > prevDistanceSq
      }

      if (pathLegComplete) {
        this.calculatedPath.shift()
        if (!this.calculatedPath.length)
          if (this.npc)
            this.newPath(randomWaypoint())
          else {
            player.position.copy(targetPosition)
            this.action = 'idle'
          }
        else
          this.setTargetDirection()
      }
    } else
    if (this.npc && !this.dead) this.newPath(randomWaypoint())
  }
}

export { Player }