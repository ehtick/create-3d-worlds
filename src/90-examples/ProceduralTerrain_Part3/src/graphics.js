import * as THREE from '/node_modules/three127/build/three.module.js'
import { scene, camera, renderer } from '/utils/scene.js'

export const graphics = (function() {

  function _GetImageData(image) {
    const canvas = document.createElement('canvas')
    canvas.width = image.width
    canvas.height = image.height

    const context = canvas.getContext('2d')
    context.drawImage(image, 0, 0)

    return context.getImageData(0, 0, image.width, image.height)
  }

  function _GetPixel(imagedata, x, y) {
    const position = (x + imagedata.width * y) * 4
    const { data } = imagedata
    return {
      r: data[position],
      g: data[position + 1],
      b: data[position + 2],
      a: data[position + 3]
    }
  }

  class _Graphics {

    Initialize() {
      camera.position.set(75, 20, 0)
      scene.background = new THREE.Color(0xaaaaaa)
      this._CreateLights()
      return true
    }

    _CreateLights() {
      let light = new THREE.DirectionalLight(0x808080, 1, 100)
      light.position.set(-100, 100, -100)
      light.target.position.set(0, 0, 0)
      light.castShadow = false
      scene.add(light)

      light = new THREE.DirectionalLight(0x404040, 1.5, 100)
      light.position.set(100, 100, -100)
      light.target.position.set(0, 0, 0)
      light.castShadow = false
      scene.add(light)
    }

    get Scene() {
      return scene
    }

    get Camera() {
      return camera
    }

    Render() {
      renderer.render(scene, camera)
    }
  }

  return {
    Graphics: _Graphics,
    GetPixel: _GetPixel,
    GetImageData: _GetImageData,
  }
})()
