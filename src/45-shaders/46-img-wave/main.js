import * as THREE from '/node_modules/three127/build/three.module.js'

const vertexShader = /* glsl */`
  varying vec2 vUv;
  void main() {	
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  }
`
const fragmentShader = /* glsl */`
  #define PI 3.141592653589
  #define PI2 6.28318530718

  uniform vec2 u_mouse;
  uniform vec2 u_resolution;
  uniform float u_time;
  uniform float u_duration;
  uniform sampler2D u_tex;

  varying vec2 vUv;

  void main (void)
  {
    vec2 p = vUv*2.0 - 1.0;
    float len = length(p);
    vec2 ripple = vUv + p/len*0.03*cos(len*12.0-u_time*4.0);
    float delta = (((sin(u_time)+1.0)/2.0)* u_duration)/u_duration;
    vec2 uv = mix(ripple, vUv, delta);
    vec3 color = texture2D(u_tex, uv).rgb;
    gl_FragColor = vec4(color, 1.0); 
  }
`

const scene = new THREE.Scene()
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10)

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const clock = new THREE.Clock()

const geometry = new THREE.PlaneGeometry(2, 1.5)
const uniforms = {
  u_tex: { value: new THREE.TextureLoader().load('nosorog.jpg') },
  u_duration: { value: 2.0 },
  u_time: { value: 0.0 },
  u_mouse: { value: { x: 0.0, y: 0.0 } },
  u_resolution: { value: { x: 0, y: 0 } }
}

const material = new THREE.ShaderMaterial({
  uniforms,
  vertexShader,
  fragmentShader
})

const plane = new THREE.Mesh(geometry, material)
scene.add(plane)

camera.position.z = 1

onWindowResize()
window.addEventListener('resize', onWindowResize, false)

animate()

function onWindowResize(event) {
  const aspectRatio = window.innerWidth / window.innerHeight
  let width, height
  if (aspectRatio >= (2 / 1.5)) {
    width = 1
    height = (window.innerHeight / window.innerWidth) * width
  } else {
    height = 1.5 / 2
    width = (window.innerWidth / window.innerHeight) * height
  }
  camera.left = -width
  camera.right = width
  camera.top = height
  camera.bottom = -height
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  uniforms.u_resolution.value.x = window.innerWidth
  uniforms.u_resolution.value.y = window.innerHeight
}

function animate() {
  requestAnimationFrame(animate)
  uniforms.u_time.value += clock.getDelta()
  renderer.render(scene, camera)
}