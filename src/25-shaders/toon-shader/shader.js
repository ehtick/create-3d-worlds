import * as THREE from '/node_modules/three127/build/three.module.js'

const vertexShader = /* glsl */`
  uniform vec3 uLightDir;
  varying vec3 vNormal;
  varying vec3 vLightDir;

  void main(void) {    
    vNormal = normalize(normalMatrix * normal);
    vLightDir = normalize(viewMatrix * vec4(-uLightDir, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = /* glsl */`
  varying vec3 vNormal;
  varying vec3 vLightDir;
  uniform vec3 uLightDir;

  void main(void) {
    float skalarprod;
    vec4 color;

    skalarprod = dot(vLightDir, vNormal);

    if (skalarprod > 0.8) {
      color = vec4(0.8, 0.8, 1.0, 1.0);
    } else if (skalarprod > 0.6) {
      color = vec4(0.3, 0.3, 0.6, 1.0);
    } else if (skalarprod > 0.3) {
      color = vec4(0.2, 0.2, 0.4, 1.0);
    } else {
      color = vec4(0.1, 0.1, 0.2, 1.0);
    }

    gl_FragColor = color;
  }
`

export const uniforms = {
  uLightDir: {
    type: 'v3',
    value: null
  }
}

export const material = new THREE.ShaderMaterial({
  uniforms,
  vertexShader,
  fragmentShader
})
