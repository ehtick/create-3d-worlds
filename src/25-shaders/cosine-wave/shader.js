import * as THREE from '/node_modules/three/build/three.module.js'

const vertexShader = /* glsl */`
  #define GLSLIFY 1
  // Common varyings
  varying vec3 v_position;
  varying vec3 v_normal;

  /*
  * The main program
  */
  void main() {
      // Save the varyings
      v_position = position;
      v_normal = normalize(normalMatrix * normal);

      // Vertex shader output
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = /* glsl */`
  #define GLSLIFY 1
  // Common uniforms
  uniform vec2 u_resolution;
  uniform vec2 u_mouse;
  uniform float u_time;
  uniform float u_frame;

  // Common varyings
  varying vec3 v_position;
  varying vec3 v_normal;

  /*
  *  Calculates the diffuse factor produced by the light illumination
  */
  float diffuseFactor(vec3 normal, vec3 light_direction) {
      float df = dot(normalize(normal), normalize(light_direction));

      if (gl_FrontFacing) {
          df = -df;
      }

      return max(0.0, df);
  }

  /*
  * The main program
  */
  void main() {
      // Use the mouse position to define the light direction
      float min_resolution = min(u_resolution.x, u_resolution.y);
      vec3 light_direction = -vec3((u_mouse - 0.5 * u_resolution) / min_resolution, 0.25);

      // Set the surface color
      vec3 surface_color = vec3(0.5 + 0.5 * cos(2.0 * v_position.y + 3.0 * u_time));

      // Apply the light diffusion factor
      surface_color *= diffuseFactor(v_normal, light_direction);

      // Fragment shader output
      gl_FragColor = vec4(surface_color, 1.0);
  }
`

export const uniforms = {
  u_time: {
    type: 'f',
    value: 0.0
  },
  u_frame: {
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
      .multiplyScalar(window.devicePixelRatio)
  }
}

export const material = new THREE.ShaderMaterial({
  uniforms,
  vertexShader,
  fragmentShader,
  side: THREE.DoubleSide,
  transparent: true,
  extensions: {
    derivatives: true
  }
})
