/* global THREE */
let camera, scene, renderer, container
let light, ambientLight, pointLight

let globeImage

let globeTexture
const RTTs = {}

const normalize = false
let normScene, normCamera, normTexture, normTextureMat, normTextureGeo
let easeType

const loopSteps = 50

// START THE MACHINE

function init() {
  container = document.getElementById('globecontainer')
  renderer = new THREE.WebGLRenderer({ alpha: true, 'antialias': false })
  renderer.setSize(container.scrollWidth, container.scrollHeight)
  renderer.setClearColor(0xdddddd)
  renderer.autoClear = false
  container.appendChild(renderer.domElement)

  scene = new THREE.Scene()

  const fov = 15 // camera field-of-view in degrees
  const { width } = renderer.domElement
  const { height } = renderer.domElement
  const aspect = width / height // view aspect ratio
  camera = new THREE.PerspectiveCamera(fov, aspect, .1, 10000)
  scene.add(camera)
  camera.position.z = -1000
  camera.position.y = 0
  camera.lookAt(scene.position)
  camera.updateMatrix()

  ambientLight = new THREE.AmbientLight(0x000000)
  scene.add(ambientLight)

  pointLight = new THREE.PointLight(0x888888)
  lightRotate = new THREE.Object3D()

  pointLight.position.set(0, 200, -300)
  lightRotate.add(pointLight)

  const sphere = new THREE.SphereGeometry(100, 8, 8)
  light = new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({ color: 0xffffff }))
  light.position = pointLight.position
  light.scale.x = light.scale.y = light.scale.z = 0.05
  lightRotate.add(light)
  scene.add(lightRotate)

  // MATERIALS

  // base mat def

  const ambient = 0xffffff, diffuse = 0xffffff, specular = 1, shininess = 10.0, scale = 100

  const shader = THREE.ShaderLib.normalmap
  uniforms = THREE.UniformsUtils.clone(shader.uniforms)

  flatNormalTex = THREE.ImageUtils.loadTexture('./img/flat.png', new THREE.UVMapping(), () => {
    render()
  })
  uniforms.tNormal = { type: 't', value: flatNormalTex }

  uniforms.diffuse.value.setHex(diffuse)
  uniforms.specular.value = new THREE.Color().setRGB(specular, specular, specular)
  // uniforms[ "specular" ].value.setHex( specular );
  uniforms.ambient.value.setHex(ambient)
  uniforms.shininess.value = shininess

  uniforms.enableDiffuse = { type: 'i', value: 1 }

  uniforms.tNormal = { type: 't', value: flatNormalTex }
  uniforms.tDiffuse = { type: 't', value: new THREE.ImageUtils.loadTexture('./img/world.topo.1024.jpg', new THREE.UVMapping(), (() => {
    render()
  })) }
  uniforms.tDisplacement = { type: 't', value: globeTexture.texture2 }

  uniforms.tDiffuseOpacity = { type: 'f', value: 1 }
  uniforms.tDiffuse2Opacity = { type: 'f', value: 0 }

  uniforms.uPointLightPos = { type: 'v3', value: pointLight.position },
  uniforms.uPointLightColor = { type: 'c', value: new THREE.Color(pointLight.color) }
  uniforms.uAmbientLightColor = { type: 'c', value: new THREE.Color(ambientLight.color) }

  uniforms.matrightBottom = { type: 'v2', value: new THREE.Vector2(180.0, -90.0) }
  uniforms.matleftTop = { type: 'v2', value: new THREE.Vector2(-180.0, 90.0) }
  uniforms.sphereRadius = { type: 'f', value: 100.0 }
  uniforms.mixAmount = { type: 'f', value: 1.0 }

  // necessary?
  uniforms.diffuse.value.convertGammaToLinear()
  uniforms.specular.value.convertGammaToLinear()
  uniforms.ambient.value.convertGammaToLinear()

  uniforms.enableDisplacement = { type: 'i', value: 1 }
  uniforms.uDisplacementScale = { type: 'f', value: 100 }
  uniforms.uDisplacementPostScale = { type: 'f', value: 25 }

  uniforms.bumpScale = { type: 'f', value: 30.0 }
  uniforms.opacity = { type: 'f', value: 1.0 }
  uniforms.uNormalOffset = { type: 'v2', value: new THREE.Vector2(1.0, 1.0) }

  material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: vs_main,
    fragmentShader: fs_main,
  })

  globeTexture.textureMat2.uniforms.u_erode.value = .02
  globeTexture.textureMat2.uniforms.u_dilate.value = .02
  globeTexture.textureMat.uniforms.u_erode.value = .02
  globeTexture.textureMat.uniforms.u_dilate.value = .02

  textureMats = [globeTexture.textureMat, globeTexture.textureMat2]

  // GEOMETRY
  // geo def

  globeGeo = new THREE.PlaneGeometry(10, 10, 257, 129)
  globeGeo.computeTangents()
  globeMesh = new THREE.Mesh(globeGeo, material)
  globeMesh.frustumCulled = false

  scene.add(globeMesh)

  easeType = TWEEN.Easing.Quartic.InOut
  // unwrapping test
  unwrap = { x: 1.0 }
  unwrapGoal = { x: 1.0 }

  const unwrapTween = new TWEEN.Tween(unwrap)
    .to(unwrapGoal, 1000)
    .easing(easeType)
    .onStart(() => {
      unwrapGoal.x = unwrapGoal.x == 0.0 ? 1.0 : 0.0
    })
    .onUpdate(function() {
      material.uniforms.mixAmount.value = this.x
    })

  controls = new THREE.TrackballControls(camera, container)

  controls.rotateSpeed = 3.0
  controls.zoomSpeed = 0.0
  controls.panSpeed = 0.8

  controls.noZoom = false
  controls.noPan = false

  controls.staticMoving = false
  controls.dynamicDampingFactor = 0.3
  controls.addEventListener('change', render)

  controls.enabled = true

  addMouseHandler(renderer.domElement)

  // calculate all textures
  for (x in RTTs) prepTextures(RTTs[x])
  startLoop()
  
  render()

  render()

}

function prepTextures(myRTT) {
  firstShader = fs_erode, secondShader = fs_dilate // this feels better - science!

  // set first shader
  myRTT.textureMat.fragmentShader = firstShader
  myRTT.textureMat.needsUpdate = true

  myRTT.textureMat2.fragmentShader = firstShader
  myRTT.textureMat2.needsUpdate = true

  myRTT.textureMat.uniforms.colorMap.value = myRTT.image
  renderer.render(myRTT.scene, myRTT.camera, myRTT.texture, false)
  myRTT.textureMat.uniforms.colorMap.value = myRTT.texture2

  for (x = 0; x < loopSteps; x++)
    calculate(myRTT)

  myRTT.textureMat.fragmentShader = secondShader
  myRTT.textureMat.needsUpdate = true

  myRTT.textureMat2.fragmentShader = secondShader
  myRTT.textureMat2.needsUpdate = true

  for (x = 0; x < loopSteps; x++)
    calculate(myRTT)

  if (normalize) {
    myRTT.textureMat.fragmentShader = fs_maximum
    myRTT.textureMat.needsUpdate = true

    if (normTexture.height != myRTT.texture.height || normTexture.width != myRTT.texture.width)
      adjustNormScene(myRTT.texture.width, myRTT.texture.height)

    normTextureMat.uniforms.colorMap.value = myRTT.texture
    renderer.render(normScene, normCamera, normTexture, false)

    myRTT.textureMat.uniforms.colorMap.value = normTexture

    limit = Math.max(myRTT.texture.width, myRTT.texture.height)
    divisor = 1

    while ((limit / divisor) > .5) {
      divisor *= 2
      myRTT.textureMat.uniforms.u_divisor.value = divisor
      renderer.render(myRTT.scene, myRTT.camera, myRTT.texture, true)

      divisor *= 2
      normTextureMat.uniforms.u_divisor.value = divisor
      renderer.render(normScene, normCamera, normTexture, true)
    }
    // change FBO's shader to final output shader
    myRTT.textureMat.fragmentShader = fs_rtt
    myRTT.textureMat.needsUpdate = true

    // set FBO's input maps
    myRTT.textureMat.uniforms.colorMap.value = myRTT.texture2
    myRTT.textureMat.uniforms.valueMap.value = normTexture

    renderer.render(myRTT.scene, myRTT.camera, myRTT.texture, true)
    myRTT.textureMat.uniforms.colorMap.value = myRTT.texture2

    renderer.render(myRTT.scene2, myRTT.camera2, myRTT.texture2, true)
    renderer.render(scene, camera)
  }
  render()
}

function calculate(myRTT) {
  renderer.render(myRTT.scene2, myRTT.camera2, myRTT.texture2, false)
  renderer.render(myRTT.scene, myRTT.camera, myRTT.texture, false)
}

let requestId

/* EVENTS */

let mouseDown = false

function onMouseDown(evt) {
  mouseDown = true
}

function onMouseUp(evt) {
  mouseDown = false
}

function addMouseHandler(div) {
  div.addEventListener('mousedown', onMouseDown)
  div.addEventListener('mouseup', onMouseUp)
}

function loop() {
  if (mouseDown) {
    render()
    controls.update() // trackball interaction
  }
  requestId = requestAnimationFrame(loop)
}

function startLoop() {
  if (!requestId)
    loop()

}

function render() {
  renderer.clear()
  renderer.render(scene, camera)
}

// onload

window.onload = function() {
  large = !(window.innerWidth < 1200)
  globeImage = THREE.ImageUtils.loadTexture(
    large ? './img/Srtm.2k_norm.jpg' : './img/Srtm.1k_norm.jpg',
    new THREE.UVMapping(),
    // callback function
    () => {
      globeTexture = prepRTT(globeImage, vs, fs_dilate)
      addRTT('globe', globeTexture)
    }
  )
}

function addRTT(name, texture) {
  RTTs[name] = texture // register texture so it can be referenced by name

  if (Object.keys(RTTs).length == 1) {
    if (normalize) {
      normScene = new THREE.Scene()
      normTexture = new THREE.WebGLRenderTarget(1, 1)
      normUniforms = {
        colorMap: { type: 't', value: texture.image },
        u_divisor: { type: 'f', value: 1.0 },
        u_textureSize: { type: 'v2', value: new THREE.Vector2(1, 1) },
      }
      normTextureMat = new THREE.ShaderMaterial({
        uniforms: normUniforms,
        vertexShader: vs,
        fragmentShader: fs_maximum
      })
      // Setup render-to-texture scene
      normCamera = new THREE.OrthographicCamera(1 / - 2, 1 / 2, 1 / 2, 1 / - 2, 1, 10000)
      normTextureGeo = new THREE.PlaneGeometry(1, 1)
      normTextureMesh = new THREE.Mesh(normTextureGeo, myTextureMat)
      normScene.add(normTextureMesh)
    }
    init()
  }
}

function adjustNormScene(width, height) {
  normTexture = new THREE.WebGLRenderTarget(width, height, renderTargetParams)
  normTextureMat.uniforms.u_textureSize.value = new THREE.Vector2(width, height)
  normTextureMat.needsUpdate = true
  normScene.remove(normTextureMesh)
  normTextureGeo = new THREE.PlaneGeometry(width, height)
  normTextureMesh = new THREE.Mesh(normTextureGeo, normTextureMat)
  normTextureMesh.position.z = -100
  normScene.add(normTextureMesh)
  normCamera = new THREE.OrthographicCamera(width / - 2, width / 2, height / 2, height / - 2, 1, 10000)
}

let vs, fs_erode, fs_dilate, fs_maximum, fs_rtt, vs_main, fs_main

SHADER_LOADER.load(
  data => {
    vs = data.vs_rt.vertex
    fs_erode = data.fs_erode.fragment
    fs_dilate = data.fs_dilate.fragment
    if (normalize) fs_maximum = data.fs_maximum.fragment
    fs_rtt = data.fs_rtt.fragment
    vs_main = data.vs_main.vertex
    fs_main = data.fs_main.fragment
  }
)
