/* global THREE */

const terrainColors = [
  new THREE.Vector4(0.2, 1.0, 0.2, 0.2),
  new THREE.Vector4(0.4, 0.4, 1.0, 0.4),
  new THREE.Vector4(0.6, 0.6, 0.6, 1.0),
  new THREE.Vector4(0.8, 1.0, 0.8, 0.8),
  new THREE.Vector4(1.0, 1.0, 0.0, 1.0),
]

const vertexShader = /* glsl */`
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec3 vectorPos;

  void main()
  {
      vectorPos = (modelViewMatrix * vec4(position, 1.0)).xyz;
      vPosition = position;
      vNormal = (modelViewMatrix * vec4(normal, 0.0)).xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = /* glsl */`
  #define TERRAIN_COLOR_ARRAY_LENGTH ${terrainColors.length}
  precision highp float;

  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec3 vectorPos;

  uniform float lightIntensity;
  uniform float magnitudeY;

  uniform vec4 terrainColors[TERRAIN_COLOR_ARRAY_LENGTH];

  #if NUM_DIR_LIGHTS > 0 
      struct DirectionalLight {
          vec3 direction;
          vec3 color;
          int shadow;
          float shadowBias;
          float shadowRadius;
          vec2 shadowMapSize;
      };
      uniform DirectionalLight directionalLights[NUM_DIR_LIGHTS];
  #endif

  void main()
  {
      vec4 addedLights = vec4(0.0, 0.0, 0.0, 1.0);
      if(NUM_DIR_LIGHTS > 0) {
          for(int l0 = 0; l0 < NUM_DIR_LIGHTS; l0++) {
              vec3 lightDirection = normalize(vectorPos - directionalLights[l0].direction);
              addedLights.rgb += (clamp(dot(lightDirection, -vNormal), 0.0, 0.9) + 0.1) * directionalLights[l0].color * lightIntensity;
          }
      }
      for (int l1 = 0; l1 < TERRAIN_COLOR_ARRAY_LENGTH; l1 ++) {
          if (terrainColors[l1].x < vPosition.y/magnitudeY) {
              gl_FragColor = vec4(terrainColors[l1].y, terrainColors[l1].z, terrainColors[l1].w, 1.0) * addedLights;
          }
      }
      
  }
`

const uniforms = THREE.UniformsUtils.merge([
  THREE.UniformsLib.lights,
  {
    lightIntensity: { type: 'f', value: 1.0 },
    terrainColors: { value: terrainColors, type: 'v4v' },
    magnitudeY: { type: 'f', value: 6.0 }
  }
])

export const material = new THREE.ShaderMaterial({
  side: THREE.DoubleSide,
  uniforms,
  transparent: true,
  lights: true,
  vertexShader,
  fragmentShader,
})
