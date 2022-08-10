import * as THREE from 'three'
import { scene } from '/utils/scene.js'
import { randomWaypoint } from './utils.js'
import { fredAnims, ghoulAnims } from './data.js'

class Player {
  constructor({ name, model, animations, speed, npc, pathfinder }) {
    this.name = name
    this.model = model
    this.animations = {}
    scene.add(model)

    this.npc = npc
    if (this.npc) this.dead = false

    this.speed = speed
    this.pathfinder = pathfinder
    this.navMeshGroup = this.pathfinder.getGroup('dungeon', this.model.position)

    const anims = name == 'fred' ? fredAnims : ghoulAnims
    const clip = animations[0]
    this.mixer = new THREE.AnimationMixer(model)
    anims.forEach(anim => {
      this.animations[anim.name] = THREE.AnimationUtils.subclip(clip, anim.name, anim.start, anim.end)
    })
  }

  newPath(point) {
    const { model } = this

    if (this.pathfinder === undefined) {
      this.calculatedPath = [point.clone()]
      this.setTargetDirection()
      return
    }

    this.calculatedPath = this.pathfinder.findPath(model.position, point, 'dungeon', this.navMeshGroup)

    if (this.calculatedPath && this.calculatedPath.length) {
      this.action = 'walk'
      this.setTargetDirection()
    } else
      this.action = 'idle'
  }

  setTargetDirection() {
    const { model } = this
    const point = this.calculatedPath[0].clone()
    point.y = model.position.y
    const quaternion = model.quaternion.clone()
    model.lookAt(point)
    this.quaternion = model.quaternion.clone()
    model.quaternion.copy(quaternion)
  }

  set action(name) {
    if (this.actionName == name.toLowerCase()) return

    delete this.curAction

    const clip = this.animations[name.toLowerCase()]
    if (clip) {
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
    const { speed, model } = this
    if (this.mixer) this.mixer.update(dt)

    if (this.calculatedPath && this.calculatedPath.length) {
      const targetPosition = this.calculatedPath[0]
      const vel = targetPosition.clone().sub(model.position)
      let pathLegComplete = (vel.lengthSq() < 0.01)

      if (!pathLegComplete) {
        // Get the distance to the target before moving
        const prevDistanceSq = model.position.distanceToSquared(targetPosition)
        vel.normalize()
        // Move model to target
        if (this.quaternion) model.quaternion.slerp(this.quaternion, 0.1)
        model.position.add(vel.multiplyScalar(dt * speed))
        // Get distance after moving, if greater then we've overshot and this leg is complete
        const newDistanceSq = model.position.distanceToSquared(targetPosition)
        pathLegComplete = newDistanceSq > prevDistanceSq
      }

      if (pathLegComplete) {
        this.calculatedPath.shift()
        if (!this.calculatedPath.length)
          if (this.npc)
            this.newPath(randomWaypoint())
          else {
            model.position.copy(targetPosition)
            this.action = 'idle'
          }
        else
          this.setTargetDirection()
      }
    } else
    if (this.npc && !this.dead) this.newPath(randomWaypoint())
  }
}

class Fred extends Player {
  constructor({ model, animations, pathfinder }) {
    super({ name: 'fred', npc: false, speed: 5, model, animations, pathfinder })
    this.action = 'idle'
  }
}

class Ghoul extends Player {
  constructor({ model, animations, pathfinder }) {
    super({ name: 'ghoul', npc: true, speed: 4, model, animations, pathfinder })
  }
}

export { Player, Fred, Ghoul }