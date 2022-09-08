/* global THREE */

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, .01, 100000)
camera.position.set(0, 5, 10)
camera.lookAt(scene.position)

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.shadowMap.enabled = true
renderer.shadowMapSoft = true // Shadow
renderer.shadowMap.type = THREE.PCFShadowMap // Shadow
document.body.appendChild(renderer.domElement)

const light = new THREE.DirectionalLight(new THREE.Color('gray'), 1)
light.position.set(1, 1, 1)
scene.add(light)

// =========================================================================================== flag
let geometry = new THREE.BoxGeometry(0.15, 2, 0.15)
/* change the pivot point to be at the bottom of the cube instead of its center */
geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 1, 0))
let material = new THREE.MeshNormalMaterial({ transparent: true, opacity: 0 })
const flagLocation = new THREE.Mesh(geometry, material)
scene.add(flagLocation)
flagLocation.rotateY(Math.PI)

// flag pole
geometry = new THREE.CylinderGeometry(.03, .03, 4, 32)
material = new THREE.MeshPhongMaterial({ color: new THREE.Color('gray') })
const cylinder = new THREE.Mesh(geometry, material)
cylinder.geometry.center()
cylinder.castShadow = true
flagLocation.add(cylinder)

// flag
const texture = new THREE.TextureLoader().load('zastava.jpg')
const plane = new THREE.Mesh(new THREE.PlaneGeometry(600, 430, 20, 20, true), new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide }))
plane.scale.set(.0025, .0025, .0025)
plane.position.set(0, 1.5, 0)
plane.position.x = .75
plane.castShadow = true

flagLocation.add(plane)

// flag wave animation
const modifier = new ModifierStack(plane)
const cloth = new Cloth(3, 0)
cloth.setForce(0.2, -0.2, -0.2)

modifier.addModifier(cloth)
cloth.lockXMin(0)

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  modifier.apply()
  renderer.render(scene, camera)
}()