const IMAGE_HD = 'hd',
  COLOR_WHITE = 0xffffff,
  COLOR_BLACK = 0x000000

const windowRatio = window.innerWidth / window.innerHeight

const Renderer = (function() {
  const _Renderer = function() {

    const params = {
      webGLRenderer: {
        antialias: false,
        alpha: true,
        clearColor: COLOR_BLACK,
        canvasId: 'canvas-earth'
      }
    }

    this.init = function() {
      this.keepCurrentAntialias()

      this.webGLRenderer = new THREE.WebGLRenderer({
        antialias: params.webGLRenderer.antialias,
        alpha: params.webGLRenderer.alpha
      })

      this.webGLRenderer.setClearColor(params.webGLRenderer.clearColor)
      this.webGLRenderer.setPixelRatio(window.devicePixelRatio)
      this.webGLRenderer.domElement.id = params.webGLRenderer.canvasId

      this.renderView()
    }

    this.keepCurrentAntialias = function() {
      params.webGLRenderer.previousAntialias = params.webGLRenderer.antialias
    }

    this.renderView = function() {
      this.view = document.body
      this.view.appendChild(this.webGLRenderer.domElement)
      this.updateSize()
    }

    this.updateSize = function() {
      this.webGLRenderer.setSize(window.innerWidth, window.innerHeight)
    }

    this.init()
  }

  return new _Renderer()
})()

const Camera = (function() {
  const _Camera = function() {
    const params = {
      positionX: 0,
      positionY: 0,
      positionZ: 150,
      fov: 63,
      near: 1,
      far: 8000
    }

    this.camera = new THREE.PerspectiveCamera(
      params.fov,
      windowRatio,
      params.near,
      params.far
    )

    this.camera.position.set(
      params.positionX,
      params.positionY,
      params.positionZ
    )
  }

  return new _Camera()
})()

const Sun = (function() {
  const _Sun = function() {

    const params = {
      imgDef: IMAGE_HD,
      imgDefPrevious: undefined,
      sunLight: {
        visible: true,
        color: COLOR_WHITE,
        intensity: 1.3,
        position: {
          x: -380,
          y: 240,
          z: -1000,
        }
      },
      sunLensFlare: {
        textures: {
          sun: {
            sd: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/122460/lens_flare_sun_512x512.jpg',
            hd: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/122460/lens_flare_sun_1024x1024.jpg'
          },
          circle: {
            sd: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/122460/lens_flare_circle_32x32.jpg',
            hd: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/122460/lens_flare_circle_64x64.jpg'
          },
          hexagon: {
            sd: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/122460/lens_flare_hexagon_128x128.jpg',
            hd: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/122460/lens_flare_hexagon_256x256.jpg'
          }
        },
        flareCircleSizeMax: 70,
        lensFlares: [{
          size: 1400,
          opacity: 1,
          distance: 0
        }, {
          size: 20,
          opacity: 0.4,
          distance: 0.63
        }, {
          size: 40,
          opacity: 0.3,
          distance: 0.64
        }, {
          size: 70,
          opacity: 0.8,
          distance: 0.7
        }, {
          size: 110,
          opacity: 0.7,
          distance: 0.8
        }, {
          size: 60,
          opacity: 0.4,
          distance: 0.85
        }, {
          size: 30,
          opacity: 0.4,
          distance: 0.86
        }, {
          size: 120,
          opacity: 0.3,
          distance: 0.9
        }, {
          size: 260,
          opacity: 0.4,
          distance: 1
        }]
      }
    }

    this.init = function() {
      this.textureLoader = new THREE.TextureLoader()
      this.sunLight = new THREE.DirectionalLight(params.sunLight.color, params.sunLight.intensity)

      this.sunLight.position.set(
        params.sunLight.position.x,
        params.sunLight.position.y,
        params.sunLight.position.z
      )

      this.sunLight.visible = params.sunLight.visible

      this.createLensFlare()
      this.disableRefreshTexture()
    }

    this.setParamImgDef = function(imgDef) {
      params.imgDef = imgDef || params.imgDef
    }

    this.createLensFlare = function() {
      this.sunLensFlare = this.getSunLensFlare()
      this.sunLight.add(this.sunLensFlare)
    }

    this.getSunLensFlare = function() {
      this.loadLensFlareTextures()
      const sunLensFlare = new THREE.LensFlare(
        this.getTextureByIndex(0),
        params.sunLensFlare.lensFlares[0].size,
        params.sunLensFlare.lensFlares[0].distance,
        THREE.AdditiveBlending
      )
      return this.addLensFlareSunCirclesAndHexagons(sunLensFlare)
    }

    this.addLensFlareSunCirclesAndHexagons = function(sunLensFlare) {
      for (let i = 1; i < params.sunLensFlare.lensFlares.length; i++)
        sunLensFlare.add(
          this.getTextureByIndex(i),
          params.sunLensFlare.lensFlares[i].size,
          params.sunLensFlare.lensFlares[i].distance,
          THREE.AdditiveBlending
        )
      return sunLensFlare
    }

    this.getTextureByIndex = function(index) {
      if (index === 0) return this.textureFlareSun

      return params.sunLensFlare.lensFlares[index].size < params.sunLensFlare.flareCircleSizeMax ?
        this.textureFlareCircle :
        this.textureFlareHexagon
    }

    this.loadLensFlareTextures = function() {
      this.textureFlareSun = this.textureLoader.load(params.sunLensFlare.textures.sun[params.imgDef])
      this.textureFlareCircle = this.textureLoader.load(params.sunLensFlare.textures.circle[params.imgDef])
      this.textureFlareHexagon = this.textureLoader.load(params.sunLensFlare.textures.hexagon[params.imgDef])
    }

    this.disableRefreshTexture = function() {
      params.imgDefPrevious = params.imgDef
    }

    this.init()
  }

  return new _Sun()
})()

const Scene = (function() {
  const _Scene = function() {

    this.init = function() {
      this.scene = new THREE.Scene()
      this.scene.add(Sun.sunLight)
    }

    this.init()
  }

  return new _Scene()
})()

void function animate() {
  requestAnimationFrame(animate)

  Renderer.webGLRenderer.render(Scene.scene, Camera.camera)
}()
