// https://www.shadertoy.com/view/4dS3Wd
// By Morgan McGuire @morgan3d, http://graphicscodex.com
// https://www.clicktorelease.com/blog/vertex-displacement-noise-3d-webgl-glsl-three-js/

const vertexShader = /* glsl */`
  #include <noise>

  uniform float u_time;
  varying vec2 vUv;
  varying float noise;

  void main() {	
    float time = u_time;
    float displacement;
    float b;

    vUv = uv;
    
    // add time to the noise parameters so it's animated
    noise = 10.0 *  -.10 * turbulence( .5 * normal + time );
    b = 5.0 * pnoise( 0.05 * position + vec3( 2.0 * time ), vec3( 100.0 ) );
    displacement = - 10. * noise + b;

    // move the position along the normal and transform it
    vec3 newPosition = position + normal * displacement;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );
  }
`

const fragmentShader = /* glsl */`
  uniform float u_time;
  uniform sampler2D u_tex;

  varying vec2 vUv;
  varying float noise;

  float random( vec3 scale, float seed ){
    return fract( sin( dot( gl_FragCoord.xyz + seed, scale ) ) * 43758.5453 + seed ) ;
  }

  void main() {
    // get a random offset
    float r = .01 * random( vec3( 12.9898, 78.233, 151.7182 ), 0.0 );
    // lookup vertically in texture, using noise and offset to get right RGB color
    vec2 t_pos = vec2( 0, 1.3 * noise + r );
    vec4 color = texture2D( u_tex, t_pos );
    gl_FragColor = vec4( color.rgb, 1.0 );
  }
`

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  1,
  10000
)
camera.position.z = 100

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const clock = new THREE.Clock()

const geometry = new THREE.IcosahedronGeometry(20, 4)
const uniforms = {
  u_time: { value: 0.0 },
  u_tex: { value: new THREE.TextureLoader().load('explosion.png') }
}

const material = new THREE.ShaderMaterial({
  uniforms,
  vertexShader,
  fragmentShader
})

const ball = new THREE.Mesh(geometry, material)
scene.add(ball)

void function animate() {
  requestAnimationFrame(animate)
  uniforms.u_time.value += clock.getDelta()
  renderer.render(scene, camera)
}()