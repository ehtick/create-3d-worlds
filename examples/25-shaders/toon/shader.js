import * as THREE from 'three'

const vertexShader = /* glsl */`
	uniform vec3 uLightPos;
  varying vec3 lightdir;
  varying vec3 eyenorm;
  
  void main() {
    vec4 eyepos = modelViewMatrix * vec4 (position, 1.0);
    vec4 lighteye = viewMatrix * vec4 (uLightPos, 1.0);
    lightdir = lighteye.xyz - eyepos.xyz;
    eyenorm = normalMatrix * normal;

		gl_Position = projectionMatrix* modelViewMatrix * vec4( position, 1.0);
  }
`

const fragmentShader = /* glsl */`
  varying vec3 lightdir;
  varying vec3 eyenorm;
  
	void main() {
		float diffuse = dot (normalize(lightdir), normalize(eyenorm));
    if (diffuse > 0.8) {
			diffuse= 1.0;
		} else if (diffuse > 0.6) {
			diffuse = 0.6;
		} else {
			diffuse = 0.2;
		}
		gl_FragColor = vec4 (diffuse,diffuse,diffuse, 1.0);
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