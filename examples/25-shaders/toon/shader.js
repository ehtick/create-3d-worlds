import * as THREE from 'three'

const vertexShader = /* glsl */`
  varying vec3 vNormal;
  varying vec4 mvPosition;

  void main() {
    mvPosition = modelViewMatrix * vec4 (position, 1.0);
    vNormal = normalMatrix * normal;

		gl_Position = projectionMatrix* modelViewMatrix * vec4( position, 1.0);
  }
`

const fragmentShader = /* glsl */`
	uniform vec3 uLightPos;

  varying vec4 mvPosition;
  varying vec3 vNormal;
  
	void main() {
    vec4 lightDirection = viewMatrix * vec4 (uLightPos, 1.0);
    vec3 lightdir = lightDirection.xyz - mvPosition.xyz;

		float diffuse = dot (normalize(vNormal), normalize(lightdir));
    if (diffuse > 0.6) {
			diffuse= 1.0;
		} else if (diffuse > 0.4) {
			diffuse = 0.5;
		} else {
			diffuse = 0.2;
		}
		gl_FragColor = vec4 (diffuse, diffuse, diffuse, 1.0);
	}
`

export const uniforms = {
  uLightPos: { type: 'v3', value: new THREE.Vector3(0, 30, 20) }
}

export const material = new THREE.ShaderMaterial({
  uniforms,
  vertexShader,
  fragmentShader
})