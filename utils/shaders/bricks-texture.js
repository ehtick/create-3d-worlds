import * as THREE from '/node_modules/three127/build/three.module.js'

const textureLoader = new THREE.TextureLoader()

const vertexShader = /* glsl */`
  varying vec3 vNormal;
  varying vec2 vUv;
  varying mat4 vModelMatrix;

  void main() {
    vUv = uv;
    vNormal = normal;
    vModelMatrix = modelMatrix;

    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );  
  }
`

const fragmentShader = /* glsl */`
  varying vec2 vUv;
  varying vec3 vNormal;
  varying mat4 vModelMatrix;

  uniform vec3 u_light;
  uniform vec2 u_resolution;
  uniform sampler2D u_diffuse_map;
  uniform sampler2D u_normal_map;

  void main(){
    vec3 lightVector = normalize((vModelMatrix * vec4(u_light, 1.0)).xyz);
    vec4 normal = texture2D(u_normal_map, vUv);
    vec3 normalVector = normalize((vModelMatrix * (normal + vec4(vNormal, 1.0))).xyz);
    float lightIntensity = dot(lightVector, normalVector)+ 0.2;
    vec3 color = lightIntensity * texture2D(u_diffuse_map, vUv).rgb;//vec3(0.8, 0.4, 0.1);
    gl_FragColor = vec4(color, 1.0);
  }
`

const uniforms = {}
uniforms.u_light = { value: new THREE.Vector3(0.5, 0.8, 0.1) }
uniforms.u_resolution = { value: new THREE.Vector2(1.0, 1.0) }
uniforms.u_diffuse_map = { value: textureLoader.load('/assets/textures/bricks-diffuse.png') }
uniforms.u_normal_map = { value: textureLoader.load('/assets/textures/bricks-normal.png') }

export const material = new THREE.ShaderMaterial({
  uniforms,
  vertexShader,
  fragmentShader
})
