import * as THREE from 'three'

const vertexShader = /* glsl */`
  varying vec2 vUv;
  varying vec3 vPosition;

  void main() {	
    vUv = uv;
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  }
`

const fragmentShader = /* glsl */`
  uniform float u_time;
  uniform vec3 u_color;

  varying vec2 vUv;
  varying vec3 vPosition;

  float rect(vec2 pt, vec2 anchor, vec2 size, vec2 center){
    vec2 p = pt - center;
    vec2 halfsize = size/2.0;
    float horz = step(-halfsize.x - anchor.x, p.x) - step(halfsize.x - anchor.x, p.x);
    float vert = step(-halfsize.y - anchor.y, p.y) - step(halfsize.y - anchor.y, p.y);
    return horz*vert;
  }

  mat2 getRotationMatrix(float theta){
    float s = sin(theta);
    float c = cos(theta);
    return mat2(c, -s, s, c);
  }

  mat2 getScaleMatrix(float scale){
    return mat2(scale,0,0,scale);
  }

  void main (void)
  {
    float tilecount = 6.0;
    vec2 center = vec2(0.5);
    vec2 pt = fract(vUv*tilecount) - center;
    mat2 matr = getRotationMatrix(u_time);
    mat2 mats = getScaleMatrix((sin(u_time)+1.0)/3.0 + 0.5);
    pt = mats * matr * pt;
    pt += center;
    vec3 color = u_color * rect(pt, vec2(0.0), vec2(0.3), center);
    gl_FragColor = vec4(color, 1.0); 
  }
`

export const uniforms = {
  u_color: { value: new THREE.Color(0xffff00) },
  u_time: { value: 0.0 },
}

export const material = new THREE.ShaderMaterial({
  uniforms,
  vertexShader,
  fragmentShader
})
