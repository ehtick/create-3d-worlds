// https://youtu.be/LrgyISOLCbg
import * as THREE from 'three'

const vertexShader = /* glsl */`
  varying vec2 vUv;
  varying vec3 vNormal;

  void main() {	
    vUv = uv; // coordinates from 0 to 1
    vNormal = normal;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = /* glsl */`
  uniform vec3 u_color;

  varying vec2 vUv;
  varying vec3 vNormal;

  float rect(vec2 pt, vec2 anchor, vec2 size, vec2 center){
    vec2 p = pt - center;
    vec2 halfsize = size / 2.0;
    float horiz = step(-halfsize.x - anchor.x, p.x) - step(halfsize.x - anchor.x, p.x);
    float vert = step(-halfsize.y - anchor.y, p.y) - step(halfsize.y - anchor.y, p.y);
    return horiz * vert;
  }

  void main (void)
  {
    vec2 tilecount = vec2(4.0, 5.0);
    vec2 center = vec2(0.5);
    vec2 pt = fract(vUv * tilecount) - center;
    pt += center;
    vec3 color = u_color * rect(pt, vec2(0.0), vec2(0.33), center);

    gl_FragColor = vec4(color, 1.0); 
  }
`

export const uniforms = {
  u_color: { value: new THREE.Color(0xFFFDD0) },
}

export const material = new THREE.ShaderMaterial({
  uniforms,
  vertexShader,
  fragmentShader
})
