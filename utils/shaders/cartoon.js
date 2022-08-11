import * as THREE from 'three'

export const vertexShader = /* glsl */`
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
    vNormal = normalize( normalMatrix * normal );
    vViewPosition = -mvPosition.xyz;

    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  }
`

export const fragmentShader = /* glsl */`
  uniform vec3 uMaterialColor;
  uniform vec3 uLightPos;
  uniform vec3 uDirLightColor;
  uniform float uKd;

  varying vec3 vNormal;

  void main() {
    vec4 lightDirection = viewMatrix * vec4( uLightPos, 0.0 );
    vec3 lVector = normalize( lightDirection.xyz );

    float diffuse = dot(normalize(vNormal), lVector);

    // 2 tones version
    // diffuse = (diffuse > 0.4) ? 1.0 : 0.5;

    // 3 tones version
    if ( diffuse > 0.6 ) { 
      diffuse = 1.0; 
    } else if (diffuse > -0.2) { 
      diffuse = 0.7; 
    } else { 
      diffuse = 0.3; 
    }

    gl_FragColor = vec4(uKd * uMaterialColor * uDirLightColor * diffuse, 1.0);
  }
`

export const uniforms = {
  uLightPos:	{ type: 'v3', value: new THREE.Vector3() },
  uDirLightColor: { type: 'c', value: new THREE.Color(0xFFFFFF) },
  uMaterialColor: { type: 'c', value: new THREE.Color(0xFFFFFF) },
  uKd: { type: 'f', value: 0.75 }
}

export const material = new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader })