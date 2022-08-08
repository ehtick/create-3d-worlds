/* global THREE */

let model, neck, waist, possibleAnims, mixer, idle
let currentlyAnimating = false

const clock = new THREE.Clock()
const raycaster = new THREE.Raycaster()
const loaderAnim = document.getElementById('js-loader')
const canvas = document.querySelector('#c')
const backgroundColor = 0xf1f1f1

const scene = new THREE.Scene()
scene.background = new THREE.Color(backgroundColor)
scene.fog = new THREE.Fog(backgroundColor, 60, 100)

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
renderer.shadowMap.enabled = true
renderer.setPixelRatio(window.devicePixelRatio)
document.body.appendChild(renderer.domElement)

const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  1000)

camera.position.set(0, -3, 30)

const stacy_txt = new THREE.TextureLoader().load('stacy.jpg')
stacy_txt.flipY = false

const stacy_mtl = new THREE.MeshPhongMaterial({
  map: stacy_txt,
  skinning: true
})

const loader = new THREE.GLTFLoader()

loader.load('stacy_lightweight.glb', gltf => {
  model = gltf.scene
  const fileAnimations = gltf.animations

  model.traverse(o => {
    if (o.isMesh) {
      o.castShadow = true
      o.receiveShadow = true
      o.material = stacy_mtl
    }
    // Reference the neck and waist bones
    if (o.isBone && o.name === 'mixamorigNeck')
      neck = o
    if (o.isBone && o.name === 'mixamorigSpine')
      waist = o
  })

  model.scale.set(7, 7, 7)
  model.position.y = -11

  scene.add(model)

  loaderAnim.remove()

  mixer = new THREE.AnimationMixer(model)

  const clips = fileAnimations.filter(val => val.name !== 'idle')
  possibleAnims = clips.map(val => {
    let clip = THREE.AnimationClip.findByName(clips, val.name)

    clip.tracks.splice(3, 3)
    clip.tracks.splice(9, 3)

    clip = mixer.clipAction(clip)
    return clip
  })
  const idleAnim = THREE.AnimationClip.findByName(fileAnimations, 'idle')
  idleAnim.tracks.splice(3, 3)
  idleAnim.tracks.splice(9, 3)
  idle = mixer.clipAction(idleAnim)
  idle.play()
})

const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.61)
hemiLight.position.set(0, 50, 0)
scene.add(hemiLight)

const d = 8.25
const dirLight = new THREE.DirectionalLight(0xffffff, 0.54)
dirLight.position.set(-8, 12, 8)
dirLight.castShadow = true
dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024)
dirLight.shadow.camera.near = 0.1
dirLight.shadow.camera.far = 1500
dirLight.shadow.camera.left = d * -1
dirLight.shadow.camera.right = d
dirLight.shadow.camera.top = d
dirLight.shadow.camera.bottom = d * -1
scene.add(dirLight)

const floorGeometry = new THREE.PlaneGeometry(5000, 5000, 1, 1)
const floorMaterial = new THREE.MeshPhongMaterial({
  color: 0xeeeeee,
  shininess: 0
})

const floor = new THREE.Mesh(floorGeometry, floorMaterial)
floor.rotation.x = -0.5 * Math.PI
floor.receiveShadow = true
floor.position.y = -11
scene.add(floor)

const geometry = new THREE.SphereGeometry(8, 32, 32)
const material = new THREE.MeshBasicMaterial({ color: 0x9bffaf }) // 0xf2ce2e
const sphere = new THREE.Mesh(geometry, material)

sphere.position.z = -15
sphere.position.y = -2.5
sphere.position.x = -0.25
scene.add(sphere)

function resizeRendererToDisplaySize(renderer) {
  const canvas = renderer.domElement
  const width = window.innerWidth
  const height = window.innerHeight
  const canvasPixelWidth = canvas.width / window.devicePixelRatio
  const canvasPixelHeight = canvas.height / window.devicePixelRatio

  const needResize =
    canvasPixelWidth !== width || canvasPixelHeight !== height
  if (needResize)
    renderer.setSize(width, height, false)

  return needResize
}

window.addEventListener('click', e => raycast(e))
window.addEventListener('touchend', e => raycast(e, true))

function raycast(e, touch = false) {
  const mouse = {}
  if (touch) {
    mouse.x = 2 * (e.changedTouches[0].clientX / window.innerWidth) - 1
    mouse.y = 1 - 2 * (e.changedTouches[0].clientY / window.innerHeight)
  } else {
    mouse.x = 2 * (e.clientX / window.innerWidth) - 1
    mouse.y = 1 - 2 * (e.clientY / window.innerHeight)
  }
  // update the picking ray with the camera and mouse position
  raycaster.setFromCamera(mouse, camera)
  // calculate objects intersecting the picking ray
  const intersects = raycaster.intersectObjects(scene.children, true)
  if (intersects[0]) {
    const { object } = intersects[0]
    if (object.name === 'stacy')
      if (!currentlyAnimating) {
        currentlyAnimating = true
        playOnClick()
      }
  }
}

// Get a random animation, and play it
function playOnClick() {
  const anim = Math.floor(Math.random() * possibleAnims.length) + 0
  playModifierAnimation(idle, 0.25, possibleAnims[anim], 0.25)
}

function playModifierAnimation(from, fSpeed, to, tSpeed) {
  to.setLoop(THREE.LoopOnce)
  to.reset()
  to.play()
  from.crossFadeTo(to, fSpeed, true)
  setTimeout(() => {
    from.enabled = true
    to.crossFadeTo(from, tSpeed, true)
    currentlyAnimating = false
  }, to._clip.duration * 1000 - (tSpeed + fSpeed) * 1000)
}

document.addEventListener('mousemove', e => {
  const mousecoords = getMousePos(e)
  if (neck && waist) {

    moveJoint(mousecoords, neck, 50)
    moveJoint(mousecoords, waist, 30)
  }
})

function getMousePos(e) {
  return { x: e.clientX, y: e.clientY }
}

function moveJoint(mouse, joint, degreeLimit) {
  const degrees = getMouseDegrees(mouse.x, mouse.y, degreeLimit)
  joint.rotation.y = THREE.Math.degToRad(degrees.x)
  joint.rotation.x = THREE.Math.degToRad(degrees.y)
}

function getMouseDegrees(x, y, degreeLimit) {
  let dx = 0,
    dy = 0,
    xdiff,
    xPercentage,
    ydiff,
    yPercentage

  const w = { x: window.innerWidth, y: window.innerHeight }

  // Left (Rotates neck left between 0 and -degreeLimit)
  // 1. If cursor is in the left half of screen
  if (x <= w.x / 2) {
    // 2. Get the difference between middle of screen and cursor position
    xdiff = w.x / 2 - x
    // 3. Find the percentage of that difference (percentage toward edge of screen)
    xPercentage = xdiff / (w.x / 2) * 100
    // 4. Convert that to a percentage of the maximum rotation we allow for the neck
    dx = degreeLimit * xPercentage / 100 * -1
  }

  // Right (Rotates neck right between 0 and degreeLimit)
  if (x >= w.x / 2) {
    xdiff = x - w.x / 2
    xPercentage = xdiff / (w.x / 2) * 100
    dx = degreeLimit * xPercentage / 100
  }
  // Up (Rotates neck up between 0 and -degreeLimit)
  if (y <= w.y / 2) {
    ydiff = w.y / 2 - y
    yPercentage = ydiff / (w.y / 2) * 100
    // Note that I cut degreeLimit in half when she looks up
    dy = degreeLimit * 0.5 * yPercentage / 100 * -1
  }
  // Down (Rotates neck down between 0 and degreeLimit)
  if (y >= w.y / 2) {
    ydiff = y - w.y / 2
    yPercentage = ydiff / (w.y / 2) * 100
    dy = degreeLimit * yPercentage / 100
  }
  return { x: dx, y: dy }
}

/* LOOP */

function update() {
  if (mixer)
    mixer.update(clock.getDelta())

  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement
    camera.aspect = canvas.clientWidth / canvas.clientHeight
    camera.updateProjectionMatrix()
  }

  renderer.render(scene, camera)
  requestAnimationFrame(update)
}

update()
