import Stats from '/node_modules/three/examples/jsm/libs/stats.module.js'
import { scene, camera, renderer } from '/utils/scene.js'
import { ambLight, dirLight } from '/utils/light.js'

ambLight({ color: 0x505050 })

export class Graphics {
  Initialize() {
    this._stats = new Stats()
    document.body.appendChild(this._stats.dom)
    this._CreateLights()
  }

  _CreateLights() {
    const light = dirLight({ position: [10, 20, 10], mapSize: 2048 })
    light.shadow.camera.near = 0.01
    light.shadow.camera.far = 50
    light.shadow.camera.left = 50
    light.shadow.camera.right = -50
    light.shadow.camera.top = 50
    light.shadow.camera.bottom = -50
    this.dirLight = light
  }

  Render() {
    renderer.render(scene, camera)
    this._stats.update()
  }
}
