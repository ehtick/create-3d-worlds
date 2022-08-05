let scene, renderer, camera, lightmodel, material
let angle = 0
let pointLight

init()
animate()

function init() {
  const width = window.innerWidth
  const height = window.innerHeight

  renderer = new THREE.WebGLRenderer({
    antialias: true
  })
  renderer.setSize(width, height)
  renderer.setClearColor(0x888888)
  document.body.appendChild(renderer.domElement)

  scene = new THREE.Scene()

  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10000)
  camera.position.z = 200
  camera.lookAt(new THREE.Vector3(0, 0, 0))

  const controls = new THREE.OrbitControls(camera, renderer.domElement)

  pointLight = new THREE.PointLight(0xffffff)
  // pointLight.position.set(0, 300, 200);
  scene.add(pointLight)
  const ambientLight = new THREE.AmbientLight(0x111111)
  scene.add(ambientLight)

  lightmodel = new THREE.Mesh(new THREE.SphereGeometry(3, 16, 16), new THREE.MeshBasicMaterial({
    color: 0xffff00
  }))
  scene.add(lightmodel)

  material = new THREE.ShaderMaterial({
    uniforms: {
      lightpos: {
        type: 'v3',
        value: new THREE.Vector3(0, 30, 20)
      }
    },
    vertexShader: document.getElementById('myVertexShader').textContent,
    fragmentShader: document.getElementById('myFragmentShader').textContent
  })

  const geometry = new THREE.TeapotGeometry()
  const teapot = new THREE.Mesh(geometry, material)
  teapot.scale.set(.21, .21, .21)
  teapot.position.set(50, 0, 0)
  const teapot2 = teapot.clone()
  teapot2.position.set(-50, 0, 50)

  scene.add(teapot)
  scene.add(teapot2)
}

/* LOOP */

function animate() {
  angle += 0.01
  pointLight.position.set(40 * Math.cos(angle), 75, 40 * Math.sin(angle))

  material.uniforms.lightpos.value.copy(pointLight.position)

  lightmodel.position.copy(pointLight.position)
  requestAnimationFrame(animate)
  renderer.render(scene, camera)
}
