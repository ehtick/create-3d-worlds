import * as THREE from 'three'
import { scene, renderer, camera, createOrbitControls } from '/utils/scene.js'

createOrbitControls()

camera.position.set(0, 3, 8)

const light = new THREE.DirectionalLight(0xffffff, 1)
light.position.setScalar(1)
scene.add(light, new THREE.AmbientLight(0xffffff, 0.25))

const canvas = document.createElement('canvas')
canvas.width = 256
canvas.height = 128
const ctx = canvas.getContext('2d')
ctx.fillStyle = 'rgba(255, 255, 255, 0)'
ctx.fillRect(0, 0, canvas.width, canvas.height)
ctx.textAlign = 'center'
ctx.textBaseline = 'middle'
ctx.fillStyle = 'magenta'
ctx.font = 'bold 36px Arial'
const text = 'I love Three.js'
ctx.fillText(text, canvas.width * 0.5, canvas.height * 0.5)
ctx.strokeStyle = 'red'
ctx.strokeText(text, canvas.width * 0.5, canvas.height * 0.5)
const texture = new THREE.CanvasTexture(canvas)
texture.offset.y = 0.25

const u = {
  y: { value: 0 },
  graffiti: { value: texture }
}

const g = new THREE.CylinderGeometry(2, 2, 4.5, 36, 1, true)
g.rotateY(Math.PI)

const material = new THREE.MeshLambertMaterial({
  color: 0x7f7f64,
  map: new THREE.TextureLoader().load('https://threejs.org/examples/textures/floors/FloorsCheckerboard_S_Diffuse.jpg', texture => {
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(3, 1)
  }),
  side: THREE.DoubleSide,
  onBeforeCompile: shader => {
    shader.uniforms.graffiti = u.graffiti
    shader.fragmentShader = `
        uniform float y;
        uniform sampler2D graffiti;
      ${shader.fragmentShader}
    `.replace(
    '#include <map_fragment>',
    `#include <map_fragment>
        vec4 textCol = texture(graffiti, (vUv * 2. - 0.5) + vec2(-2., y));
        vec3 col = mix(diffuseColor.rgb, textCol.rgb, textCol.a);
        diffuseColor = vec4( col, opacity );
      `
  )
  }
})

const mesh = new THREE.Mesh(g, material)
scene.add(mesh)

renderer.setAnimationLoop(() => {
  renderer.render(scene, camera)
})
