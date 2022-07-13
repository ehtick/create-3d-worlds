const vertexShader = /* glsl */`
  varying vec3 vPosition;

  void main() {
    vPosition = position;

    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  }
`

const fragmentShader = /* glsl */`
  uniform vec3 u_LightColor;
  uniform vec3 u_DarkColor;
  uniform float u_Frequency;
  uniform float u_NoiseScale;
  uniform float u_RingScale;
  uniform float u_Contrast;

  varying vec3 vPosition;

  #include <noise>

  void main(){
    float n = snoise( vPosition );
    float ring = fract( u_Frequency * vPosition.z + u_NoiseScale * n );
    ring *= u_Contrast * ( 1.0 - ring );

    // Adjust ring smoothness and shape, and add some noise
    float lerp = pow( ring, u_RingScale ) + n;
    vec3 color = mix(u_DarkColor, u_LightColor, lerp);

    gl_FragColor = vec4(color, 1.0);
  }
`

const scene = new THREE.Scene()
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10)
const clock = new THREE.Clock()

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const uniforms = {}
uniforms.u_time = { value: 0.0 }
uniforms.u_resolution = { value: new THREE.Vector2() }
uniforms.u_LightColor = { value: new THREE.Color(0xbb905d) }
uniforms.u_DarkColor = { value: new THREE.Color(0x7d490b) }
uniforms.u_Frequency = { value: 2.0 }
uniforms.u_NoiseScale = { value: 6.0 }
uniforms.u_RingScale = { value: 0.6 }
uniforms.u_Contrast = { value: 4.0 }

const geometry = new THREE.PlaneGeometry(2, 2)
const material = new THREE.ShaderMaterial({
  uniforms,
  vertexShader,
  fragmentShader
})

const plane = new THREE.Mesh(geometry, material)
scene.add(plane)

camera.position.z = 1

void function animate() {
  requestAnimationFrame(animate)
  uniforms.u_time.value += clock.getDelta()
  renderer.render(scene, camera)
}()
