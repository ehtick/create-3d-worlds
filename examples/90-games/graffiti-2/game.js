import * as THREE from 'three'
import { scene, renderer, camera, clock, createOrbitControls } from '/utils/scene.js'

createOrbitControls()

camera.position.set(0, 3, 8)

const light = new THREE.DirectionalLight(0xffffff, 1)
light.position.setScalar(1)
scene.add(light, new THREE.AmbientLight(0xffffff, 0.25))

const c = document.createElement('canvas')
c.width = 256
c.height = 128
const ctx = c.getContext('2d')
ctx.fillStyle = 'rgba(255, 255, 255, 0)'
ctx.fillRect(0, 0, c.width, c.height)
ctx.textAlign = 'center'
ctx.textBaseline = 'middle'
ctx.fillStyle = 'magenta'
ctx.font = 'bold 36px Arial'
const text = 'I love Three.js'
ctx.fillText(text, c.width * 0.5, c.height * 0.5)
ctx.strokeStyle = 'red'
ctx.strokeText(text, c.width * 0.5, c.height * 0.5)
const tex = new THREE.CanvasTexture(c)
tex.offset.y = 0.25

const u = {
  time: { value: 0 },
  textTex: { value: tex }
}

const g = new THREE.CylinderGeometry(2, 2, 4.5, 36, 1, true)
g.rotateY(Math.PI)

const m = new THREE.MeshLambertMaterial({
  color: 0x7f7f64,
  map: new THREE.TextureLoader().load('https://threejs.org/examples/textures/floors/FloorsCheckerboard_S_Diffuse.jpg', tex => {
    tex.wrapS = THREE.RepeatWrapping
    tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(3, 1)
  }),
  side: THREE.DoubleSide,
  onBeforeCompile: shader => {
    shader.uniforms.time = u.time
    shader.uniforms.textTex = u.textTex
    shader.fragmentShader = `
        uniform float time;
        uniform sampler2D textTex;
      ${shader.fragmentShader}
    `.replace(
    '#include <map_fragment>',
    `#include <map_fragment>
        vec4 textCol = texture(textTex, (vUv * 2. - 0.5) + vec2(-2., sin(time) * 0.25));
        vec3 col = mix(diffuseColor.rgb, textCol.rgb, textCol.a);
        diffuseColor = vec4( col, opacity );
      `
  )}
})
m.defines = { 'USE_UV': '' }
const o = new THREE.Mesh(g, m)
scene.add(o)

renderer.setAnimationLoop(() => {
  const time = clock.getElapsedTime()
  u.time.value = time
  renderer.render(scene, camera)
})
