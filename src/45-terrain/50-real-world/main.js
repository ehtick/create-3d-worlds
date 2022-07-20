
const CONS = {
  WIDTH: 904,
  HEIGHT: 604,

  VIEW_ANGLE: 45,
  NEAR: 0.1,
  FAR: 10000,

  CAMERA_X: 1300,
  CAMERA_Y: 600,
  CAMERA_Z: 1300
}

let scene = {}
let renderer = {}
let camera = {}

let n = 0
initMap()

function loaded() {
  n++
  console.log('loaded: ' + n)
  if (n == 3) {
    terrain.visible = true
    render()
  }
}

function initMap() {
  renderer = new THREE.WebGLRenderer()
  renderer.setSize(CONS.WIDTH, CONS.HEIGHT)
  renderer.setClearColor(0x0000cc)
  $('#main_map').append(renderer.domElement)

  camera = new THREE.PerspectiveCamera(CONS.VIEW_ANGLE, CONS.WIDTH / CONS.HEIGHT, CONS.NEAR, CONS.FAR)
  scene = new THREE.Scene()
  scene.add(camera)

  camera.position.z = CONS.CAMERA_Z
  camera.position.x = CONS.CAMERA_X
  camera.position.y = CONS.CAMERA_Y
  camera.lookAt(scene.position)

  pointLight = new THREE.PointLight(0xFFFFFF)
  scene.add(pointLight)
  pointLight.position.x = 1000
  pointLight.position.y = 3000
  pointLight.position.z = -1000
  pointLight.intensity = 8.6

  const texture = THREE.ImageUtils.loadTexture('assets/combined.png', null, loaded)
  const detailTexture = THREE.ImageUtils.loadTexture('assets/bg.jpg', null, loaded)
  const terrainShader = THREE.ShaderTerrain.terrain
  const uniformsTerrain = THREE.UniformsUtils.clone(terrainShader.uniforms)

  uniformsTerrain.tNormal.texture = detailTexture
  uniformsTerrain.uNormalScale.value = 1
  uniformsTerrain.tDisplacement.texture = texture
  uniformsTerrain.uDisplacementScale.value = 100
  uniformsTerrain.tDiffuse1.texture = detailTexture
  uniformsTerrain.tDetail.texture = detailTexture
  uniformsTerrain.enableDiffuse1.value = true
  uniformsTerrain.enableDiffuse2.value = true
  uniformsTerrain.enableSpecular.value = true

  uniformsTerrain.uDiffuseColor.value.setHex(0xcccccc)
  uniformsTerrain.uSpecularColor.value.setHex(0xff0000)
  uniformsTerrain.uAmbientColor.value.setHex(0x0000cc)
  uniformsTerrain.uShininess.value = 3
  uniformsTerrain.uRepeatOverlay.value.set(6, 6)

  const material = new THREE.ShaderMaterial({
    uniforms: uniformsTerrain,
    vertexShader: terrainShader.vertexShader,
    fragmentShader: terrainShader.fragmentShader,
    lights: true,
    fog: false
  })

  const geometryTerrain = new THREE.PlaneGeometry(2000, 4000, 256, 256)
  geometryTerrain.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI / 2))
  geometryTerrain.computeFaceNormals()
  geometryTerrain.computeVertexNormals()
  geometryTerrain.computeTangents()

  terrain = new THREE.Mesh(geometryTerrain, material)
  terrain.position.set(0, -125, 0)
  terrain.rotation.x = -Math.PI / 2

  scene.add(terrain)
  loaded()
}

function render() {
  const timer = Date.now() * 0.0008
  camera.position.x = (Math.cos(timer) * CONS.CAMERA_X)
  camera.position.z = (Math.sin(timer) * CONS.CAMERA_Z)
  camera.lookAt(scene.position)

  renderer.render(scene, camera)
  requestAnimationFrame(render)
}