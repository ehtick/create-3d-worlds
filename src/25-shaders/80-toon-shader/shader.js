import * as THREE from '/node_modules/three127/build/three.module.js'

export const vertexShader = /* glsl */`
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {

    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    vNormal = normalize( normalMatrix * normal );
    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
    vViewPosition = -mvPosition.xyz;

  }
`

export const fragmentShader = /* glsl */`
  uniform vec3 uMaterialColor;

  uniform vec3 uDirLightPos;
  uniform vec3 uDirLightColor;

  uniform float uKd;
  uniform float uBorder;

  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    // compute direction to light
    vec4 lDirection = viewMatrix * vec4( uDirLightPos, 0.0 );
    vec3 lVector = normalize( lDirection.xyz );

    // diffuse: N * L. Normal must be normalized, since it's interpolated.
    vec3 normal = normalize( vNormal );
    
    // check the diffuse dot product against uBorder and adjust diffuse value accordingly.
    float diffuse = dot( normal, lVector );
    diffuse = ( diffuse > uBorder ) ? 1.0 : 0.5;

    // 3 tones version
    // if ( diffuse > 0.6 ) { diffuse = 1.0; }
    // else if (diffuse > -0.2) { diffuse = 0.7; }
    // else { diffuse = 0.3; }

    gl_FragColor = vec4( uKd * uMaterialColor * uDirLightColor * diffuse, 1.0 );
  }
`

const uniforms = {
  'uDirLightPos':	{ type: 'v3', value: new THREE.Vector3() },
  'uDirLightColor': { type: 'c', value: new THREE.Color(0xFFFFFF) },
  'uMaterialColor': { type: 'c', value: new THREE.Color(0xFFFFFF) },
  uKd: {
    type: 'f',
    value: 0.7
  },
  uBorder: {
    type: 'f',
    value: 0.4
  }
}

export const material = new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader })