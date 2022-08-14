// https://2pha.com/demos/threejs/shaders/perlin_noise_3d_vertex.html
import THREE from '/libs/shader-includes.js'

const vertexShader = /* glsl */`
  #include <noise>

  uniform float scale;
  uniform float displacement;

  varying float vNoise;

  void main() {
    vNoise = cnoise(normalize(position) * scale);
    vec3 pos = position + normal * vNoise * vec3(displacement);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos,1.0);
  }
`

const fragmentShader = /* glsl */`
  varying float vNoise;
  void main() {
    gl_FragColor = vec4(vec3(1.0) * vNoise, 1.0);
  }
`

const uniforms = {
  scale: { type: 'f', value: 10.0 },
  displacement: { type: 'f', value: 20.0 }
}

export const material = new THREE.ShaderMaterial({
  uniforms,
  vertexShader,
  fragmentShader,
})
