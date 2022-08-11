import * as THREE from 'three'

export const vertexShader = /* glsl */`
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
    vNormal = normalMatrix * normal;
    vViewPosition = -mvPosition.xyz;

    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  }
`

export const fragmentShader = /* glsl */`
  uniform vec3 uMaterialColor;
  uniform vec3 uLightPos;
  uniform vec3 uLightColor;
  uniform float uLightness;

  varying vec3 vNormal;

  void main() {
    vec4 lightDirection = viewMatrix * vec4(uLightPos, 0.0);

    float diffuse = dot(normalize(vNormal), normalize(lightDirection.xyz));

    // 2 tones version
    // diffuse = (diffuse > 0.4) ? 1.0 : 0.3;

    if (diffuse > 0.6) {
			diffuse= 1.0;
		} else if (diffuse > 0.4) {
			diffuse = 0.5;
		} else {
			diffuse = 0.2;
		}
    gl_FragColor = vec4(uLightness * uMaterialColor * uLightColor * diffuse, 1.0);
  }
`

export const uniforms = {
  uLightPos:	{ type: 'v3', value: new THREE.Vector3() },
  uLightColor: { type: 'c', value: new THREE.Color(0xFFFFFF) },
  uMaterialColor: { type: 'c', value: new THREE.Color(0xFFFFFF) },
  uLightness: { type: 'f', value: 0.95 }
}

export const material = new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader })