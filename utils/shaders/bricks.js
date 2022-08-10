import * as THREE from 'three'

const vertexShader = /* glsl */`
  varying vec2 vUv;
  void main() {	
    vUv = uv;

    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  }
`

const fragmentShader = /* glsl */`
  uniform vec3 u_color_a;
  uniform vec3 u_color_b;

  varying vec2 vUv;

  float brick(vec2 pt, float border_width, float edge_thickness) {
    if (pt.y > 0.5)
      pt.x = fract(pt.x + 0.5);

    // draw vertical lines
    float result = 1.0 - smoothstep(border_width/2.0, border_width/2.0 + edge_thickness, pt.x) + smoothstep(1.0 - border_width/2.0 - edge_thickness, 1.0 - border_width/2.0, pt.x);

    // draw top and bottom lines
    result += 1.0 - smoothstep(border_width/2.0, border_width/2.0 + edge_thickness, pt.y) + smoothstep(1.0 - border_width/2.0 - edge_thickness, 1.0 - border_width/2.0, pt.y);

    // draw middle line
    result += smoothstep(0.5 - border_width/2.0 - edge_thickness, 0.5 - border_width/2.0, pt.y) - smoothstep(0.5 + border_width/2.0, 0.5 + border_width/2.0 + edge_thickness, pt.y);
    return clamp(result, 0.0, 1.0);
  }

  void main (void) {
    vec2 uv = fract(vUv * 7.5);
    vec3 color = mix(u_color_a, u_color_b, brick(uv, 0.08, 0.005));
    gl_FragColor = vec4(color, 1.0); 
  }
`

const uniforms = {
  u_color_a: { value: new THREE.Color(0xcb4154) },
  u_color_b: { value: new THREE.Color(0xaaaaaa) },
}

export const material = new THREE.ShaderMaterial({
  uniforms,
  vertexShader,
  fragmentShader
})
