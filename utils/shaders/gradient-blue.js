import * as THREE from '/node_modules/three127/build/three.module.js'

const fragmentShader = /* glsl */`
  uniform vec2 resolution; // uniform variables must be declared here
  uniform vec3 topColor;
  uniform vec3 bottomColor;

  void main() {
    vec2 coord = gl_FragCoord.xy / resolution.xy; // normalize coordinates
    vec3 rgb = mix( bottomColor, topColor, coord.y );
    gl_FragColor = vec4( rgb, 1.0 );
  }
`

const uniforms = {
  topColor: { value: new THREE.Color(0x0077ff) },
  bottomColor: { value: new THREE.Color(0xffffff) },
  resolution: { type: 'v2', value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
}

export const material = new THREE.ShaderMaterial({ uniforms, fragmentShader })