import * as THREE from '/node_modules/three127/build/three.module.js'

const textureLoader = new THREE.TextureLoader()

const fireGradient = textureLoader.load('/assets/textures/fire.png')
const texture = textureLoader.load('/assets/textures/tendrils.png')
texture.wrapS = texture.wrapT = THREE.RepeatWrapping

const vertexShader = /* glsl */`
  precision mediump float;
  precision mediump int;
  attribute vec4 color;

  uniform float blend;
  uniform sampler2D gradient;
  uniform sampler2D blendPattern;

  varying vec2 vUv;
  varying float vFade;
  varying float dissolve;
  void main()	{
    vUv = uv;
    dissolve = texture2D(blendPattern, vUv).r * 0.1;
    vec4 localPosition = vec4( position*(1.+(dissolve*5.)), 1);
    
    vFade = clamp((localPosition.y + 3.0) / 6.0, 0.0, 1.0);
    gl_Position = projectionMatrix * modelViewMatrix * localPosition;
  }
`

const fragmentShader = /* glsl */`
  precision mediump float;
  precision mediump int;

  uniform float time;
  uniform float blend;

  uniform sampler2D gradient;
  uniform sampler2D blendPattern;

  varying float vFade;
  varying vec2 vUv;
  varying float dissolve;

  void main()	{
    
    float spread = 0.2;
    
    float fadeAmount = smoothstep(
      max(0., vFade - spread),
      min(1., vFade + spread),
      blend + dissolve*1.2
    );
    
    gl_FragColor = texture2D(gradient, vec2(vUv.x, fadeAmount));
  }
`

export const material = new THREE.ShaderMaterial({
  uniforms: {
    time: { value: 1.0 },
    blend: { value: 1.0 },
    gradient: { type: 't', value: fireGradient },
    blendPattern: { type: 't', value: texture },
  },
  vertexShader,
  fragmentShader,
  transparent: true,
  side: THREE.DoubleSide,
})
