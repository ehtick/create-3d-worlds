import * as THREE from '/node_modules/three/build/three.module.js'

const vertexShader = /* glsl */ `
  uniform float pointMultiplier;

  attribute float size;
  attribute float angle;
  attribute vec4 colour;

  varying vec4 vColour;
  varying vec2 vAngle;

  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = size * pointMultiplier / gl_Position.w;

    vAngle = vec2(cos(angle), sin(angle));
    vColour = colour;
  }
`

const fragmentShader = /* glsl */ `
  uniform sampler2D diffuseTexture;

  varying vec4 vColour;
  varying vec2 vAngle;

  void main() {
    vec2 coords = (gl_PointCoord - 0.5) * mat2(vAngle.x, vAngle.y, -vAngle.y, vAngle.x) + 0.5;
    gl_FragColor = texture2D(diffuseTexture, coords) * vColour;
  }
`

const uniforms = {
  diffuseTexture: {
    value: new THREE.TextureLoader().load('/assets/particles/fire.png')
  },
  pointMultiplier: {
    value: window.innerHeight / (2.0 * Math.tan(0.5 * 60.0 * Math.PI / 180.0))
  }
}

export const material = new THREE.ShaderMaterial({
  uniforms,
  vertexShader,
  fragmentShader,
  blending: THREE.AdditiveBlending,
  depthTest: true,
  depthWrite: false,
  transparent: true,
  vertexColors: true
})
