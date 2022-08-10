import * as THREE from 'three'

const vertexShader = /* glsl */`
uniform float uTime;
uniform vec2 uMouse;

attribute vec3 color;
attribute float size;
attribute float rotation;
attribute float sCoef;

varying vec4 vColor;
varying float vRotation;

void main() {
  vColor = vec4(color, 1.);
  vRotation = rotation;

  vec3 p = vec3(position);
  p.z = -1000. + mod(position.z + uTime*(sCoef * 25. * uMouse.y), 2000.);
  p.x = -500. + mod(position.x - uTime*(sCoef * 5. * uMouse.x), 1000.);

  vec4 mvPosition = modelViewMatrix * vec4(p, 1.);
  gl_Position = projectionMatrix * mvPosition;

  float psize = size * (200. / -mvPosition.z);
  gl_PointSize = psize * (1. + .5*sin(uTime*sCoef + position.x));
}
`

const fragmentShader = /* glsl */`
uniform sampler2D uTexture;

varying vec4 vColor;
varying float vRotation;

void main() {
  vec2 v = gl_PointCoord - .5;
  float ca = cos(vRotation), sa = sin(vRotation);
  mat2 rmat = mat2(ca, -sa, sa, ca);
  gl_FragColor = vColor * texture2D(uTexture, v*rmat + .5);
}
`

const uniforms = {
  uTime: { value: 0 },
  uMouse: { value: new THREE.Vector2(0.2, 0.2) },
  uTexture: { value: new THREE.TextureLoader().load('/assets/particles/star.png')
  }
}

export const material = new THREE.ShaderMaterial({
  uniforms,
  vertexShader,
  fragmentShader,
  blending: THREE.AdditiveBlending,
  depthTest: false,
  transparent: true
})
