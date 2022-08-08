export const vertexShader = /* glsl */`
  #define GLSLIFY 1
  varying vec3 v_position;
  varying vec3 v_normal;

  void main() {
      v_position = position;
      v_normal = normalize(normalMatrix * normal);

      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

export const fragmentShader = /* glsl */`
  #define GLSLIFY 1
  uniform vec2 u_resolution;
  uniform vec2 u_mouse;
  uniform float u_time;
  uniform float u_frame;

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

  void main() {
      // Use the mouse position to define the light direction
      float min_resolution = min(u_resolution.x, u_resolution.y);
      vec3 light_direction = -vec3((u_mouse - 0.5 * u_resolution) / min_resolution, 0.5);

      // Calculate the light diffusion factor
      float df = diffuseFactor(v_normal, light_direction);

      // Define the toon shading steps
      float nSteps = 4.0;
      float step = sqrt(df) * nSteps;
      step = (floor(step) + smoothstep(0.48, 0.52, fract(step))) / nSteps;

      // Calculate the surface color
      float surface_color = step * step;

      gl_FragColor = vec4(vec3(surface_color), 1.0);
  }
`