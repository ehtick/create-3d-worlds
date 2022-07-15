import * as THREE from '/node_modules/three127/build/three.module.js'

const fragmentShader = /* glsl */`
  uniform vec2 resolution; // Uniform variables must be declared here first

  void main() {
    vec2 coord = gl_FragCoord.xy / resolution.xy; // normalize coordinates -1 to 1
    gl_FragColor = vec4(1.0 - coord.y, 1.0 - coord.y, 1.0, 1.0); // create gradient
  }
`

const uniforms = {}
uniforms.resolution = { type: 'v2', value: new THREE.Vector2(window.innerWidth, window.innerHeight) }

export const material = new THREE.ShaderMaterial({ uniforms, fragmentShader })
