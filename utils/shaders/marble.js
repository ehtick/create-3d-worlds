// https://threejs.org/examples/webgl_shader2.html
import * as THREE from '/node_modules/three/build/three.module.js'

const textureLoader = new THREE.TextureLoader()

export const vertexShader = /* glsl */`
  varying vec2 vUv;

  void main()
  {
    vUv = uv;
    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
    gl_Position = projectionMatrix * mvPosition;
  }
`

export const fragmentShader = /* glsl */`
  uniform float time;
  uniform sampler2D colorTexture;
  varying vec2 vUv;

  void main( void ) {
    vec2 position = - 1.0 + 2.0 * vUv;
    float a = atan( position.y, position.x );
    float r = sqrt( dot( position, position ) );

    vec2 uv;
    uv.x = cos( a ) / r;
    uv.y = sin( a ) / r;
    uv /= 10.0;
    uv += time * 0.05;

    vec3 color = texture2D( colorTexture, uv ).rgb;
    gl_FragColor = vec4( color * r * 1.5, 1.0 );
  }
`

const uniforms = {
  time: { value: 1.0 },
  colorTexture: { value: textureLoader.load('/assets/textures/marble.jpg') }
}

uniforms.colorTexture.value.wrapS = uniforms.colorTexture.value.wrapT = THREE.RepeatWrapping

export const material = new THREE.ShaderMaterial({
  uniforms,
  vertexShader,
  fragmentShader
})
