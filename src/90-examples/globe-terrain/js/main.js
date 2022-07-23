/* global THREE */
let camera, scene, renderer, container
let globeTexture, controls

import { vs_rt as vs, fs_erode, fs_dilate, material } from './shaders.js'
import { prepRTT } from './RTT_setup.js'

const RTTs = {}
const loopSteps = 50

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

  const ambientLight = new THREE.AmbientLight(0x000000)
  scene.add(ambientLight)

  const pointLight = new THREE.PointLight(0x888888)
  const lightRotate = new THREE.Object3D()

  pointLight.position.set(0, 200, -300)
  lightRotate.add(pointLight)

  const sphere = new THREE.SphereGeometry(100, 8, 8)
  const light = new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({ color: 0xffffff }))
  light.position.copy(pointLight.position)
  light.scale.x = light.scale.y = light.scale.z = 0.05
  lightRotate.add(light)
  scene.add(lightRotate)

  // MATERIALS

  globeTexture.textureMat2.uniforms.u_erode.value = .02
  globeTexture.textureMat2.uniforms.u_dilate.value = .02
  globeTexture.textureMat.uniforms.u_erode.value = .02
  globeTexture.textureMat.uniforms.u_dilate.value = .02

  material.uniforms.uPointLightPos = { type: 'v3', value: pointLight.position },
  material.uniforms.uPointLightColor = { type: 'c', value: new THREE.Color(pointLight.color) }
  material.uniforms.uAmbientLightColor = { type: 'c', value: new THREE.Color(ambientLight.color) }
  material.uniforms.tDisplacement = { type: 't', value: globeTexture.texture2 }

  // GEOMETRY

  const globeGeo = new THREE.PlaneBufferGeometry(10, 10, 257, 129)
  globeGeo.computeTangents()
  const globeMesh = new THREE.Mesh(globeGeo, material)
  globeMesh.frustumCulled = false

  scene.add(globeMesh)

  controls = new THREE.TrackballControls(camera, container)

  controls.rotateSpeed = 3.0
  controls.zoomSpeed = 0.0
  controls.panSpeed = 0.8

  controls.noZoom = false
  controls.noPan = false

  controls.staticMoving = false
  controls.dynamicDampingFactor = 0.3
  controls.enabled = true

  for (const x in RTTs) prepTextures(RTTs[x])

  loop()
}

function prepTextures(myRTT) {
  const firstShader = fs_erode, secondShader = fs_dilate // this feels better - science!

  myRTT.textureMat.fragmentShader = firstShader
  myRTT.textureMat.needsUpdate = true

  myRTT.textureMat2.fragmentShader = firstShader
  myRTT.textureMat2.needsUpdate = true

  myRTT.textureMat.uniforms.colorMap.value = myRTT.image
  renderer.render(myRTT.scene, myRTT.camera, myRTT.texture, false)
  myRTT.textureMat.uniforms.colorMap.value = myRTT.texture2

  for (let x = 0; x < loopSteps; x++)
    calculate(myRTT)

  myRTT.textureMat.fragmentShader = secondShader
  myRTT.textureMat.needsUpdate = true

  myRTT.textureMat2.fragmentShader = secondShader
  myRTT.textureMat2.needsUpdate = true
}

function calculate(myRTT) {
  renderer.render(myRTT.scene2, myRTT.camera2, myRTT.texture2, false)
  renderer.render(myRTT.scene, myRTT.camera, myRTT.texture, false)
}

/* EVENTS */

function loop() {
  requestAnimationFrame(loop)
  controls.update()
  renderer.render(scene, camera)
}

// onload

const globeImage = THREE.ImageUtils.loadTexture(
  window.innerWidth >= 1200 ? './img/Srtm.2k_norm.jpg' : './img/Srtm.1k_norm.jpg',
  new THREE.UVMapping(),
  () => {
    globeTexture = prepRTT(globeImage, vs, fs_dilate)
    RTTs.gloge = globeTexture
    init()
  }
)
