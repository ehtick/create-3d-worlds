import * as THREE from 'three'

const vertexShader = /* glsl */`
  varying vec3 v_position;
  varying vec3 v_normal;

  void main() {
      v_position = position;
      v_normal = normalize(normalMatrix * normal);

      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = /* glsl */`
  uniform vec2 u_resolution;
  uniform vec2 u_mouse;
  uniform float u_time;

  varying vec3 v_position;
  varying vec3 v_normal;

  float diffuseFactor(vec3 normal, vec3 light_direction) {
      float df = dot(normalize(normal), normalize(light_direction));
      if (gl_FrontFacing) {
          df = -df;
      }
      return max(0.0, df);
  }

  void main() {
      // use mouse position to define light direction
      float min_resolution = min(u_resolution.x, u_resolution.y);
      vec3 light_direction = -vec3((u_mouse - 0.5 * u_resolution) / min_resolution, 0.25);

      vec3 surface_color = vec3(0.5 + 0.5 * cos(2.0 * v_position.y + 3.0 * u_time));
      surface_color *= diffuseFactor(v_normal, light_direction);

      gl_FragColor = vec4(surface_color, 1.0);
  }
`

export const uniforms = {
  u_time: {
    type: 'f',
    value: 0.0
  },
  u_resolution: {
    type: 'v2',
    value: new THREE.Vector2(window.innerWidth, window.innerHeight)
      .multiplyScalar(window.devicePixelRatio)
  },
  u_mouse: {
    type: 'v2',
    value: new THREE.Vector2(0.7 * window.innerWidth, window.innerHeight)
  }
}

export const material = new THREE.ShaderMaterial({
  uniforms,
  vertexShader,
  fragmentShader,
})
