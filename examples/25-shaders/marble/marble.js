// https://codepen.io/nik-lever/pen/gEoaez
import * as THREE from 'three'

const vshader = /* glsl */`
  varying vec3 v_position;

  void main() {
    v_position = position;

    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  }
`
const fshader = /* glsl */`
  varying vec3 v_position;

  #include <noise>

  void main(){
    vec2 p = v_position.xy;
    float scale = 800.0;
    vec3 color;
    bool marble = true;

    p *= scale;

    if (marble){
      float d = perlin(p.x, p.y) * scale; 
      float u = p.x + d;
      float v = p.y + d;
      d = perlin(u, v) * scale;
      float noise = perlin(p.x + d, p.y + d);
      color = vec3(0.6 * (vec3(2.0 * noise) - vec3(noise * 0.1, noise * 0.2 - sin(u / 30.0) * 0.1, noise * 0.3 + sin(v / 40.0) * 0.2))); 
    }else{
      color = vec3(perlin(p.x, p.y));
    }
    gl_FragColor = vec4(color, 1.0);
  }
`

export const uniforms = {
  u_resolution: { value: new THREE.Vector2() },
  u_LightColor: { value: new THREE.Color(0xbb905d) },
  u_DarkColor: { value: new THREE.Color(0x7d490b) },
  u_Frequency: { value: 2.0 },
  u_NoiseScale: { value: 6.0 },
  u_RingScale: { value: 0.6 },
  u_Contrast: { value: 4.0 },
}

export const material = new THREE.ShaderMaterial({
  uniforms,
  vertexShader: vshader,
  fragmentShader: fshader
})
