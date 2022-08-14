// https://codepen.io/Yakudoo/pen/rJjOJx
import THREE from '/libs/shader-includes.js'

const vertexShader = /* glsl */`
	varying vec2 vUv;

	void main() {
		vUv = uv;
		vec4 pos = vec4(position, 1.0);
		gl_Position = pos;
	}
`

const fragmentShader = /* glsl */`
	precision highp float;
  #include <noise>

  uniform float uTime;
  uniform float uHue;
  uniform float uHueVariation;
  uniform float uDensity;
  uniform float uDisplacement;

  varying vec2 vUv;

  float hue2rgb(float f1, float f2, float hue) {
    if (hue < 0.0)
        hue += 1.0;
    else if (hue > 1.0)
        hue -= 1.0;
    float res;
    if ((6.0 * hue) < 1.0)
        res = f1 + (f2 - f1) * 6.0 * hue;
    else if ((2.0 * hue) < 1.0)
        res = f2;
    else if ((3.0 * hue) < 2.0)
        res = f1 + (f2 - f1) * ((2.0 / 3.0) - hue) * 6.0;
    else
        res = f1;
    return res;
  }

  vec3 hsl2rgb(vec3 hsl) {
    vec3 rgb;

    if (hsl.y == 0.0) {
        rgb = vec3(hsl.z); // Luminance
    } else {
        float f2;

        if (hsl.z < 0.5)
            f2 = hsl.z * (1.0 + hsl.y);
        else
            f2 = hsl.z + hsl.y - hsl.y * hsl.z;

        float f1 = 2.0 * hsl.z - f2;

        rgb.r = hue2rgb(f1, f2, hsl.x + (1.0/3.0));
        rgb.g = hue2rgb(f1, f2, hsl.x);
        rgb.b = hue2rgb(f1, f2, hsl.x - (1.0/3.0));
    }
    return rgb;
  }

  void main () {
    float t = uTime * .005;
    float elevation =  vUv.y * uDensity * 30.0;
    
    float shadow = smoothstep(0.0, .3 + sin(t * 5.0 * 3.14) * .1 , length(vUv));
    elevation += shadow * 5.0;
    
    float displacement = cnoise( vec2( t + vUv.y * 2.0, t + vUv.x * 3.0 )) * uDisplacement * 3.0 ;

    elevation += displacement * 4.0;
    elevation *= 2.0 + cnoise( vec2( t + vUv.y * 1.0, t + .5)) * 2.0 ;
    
    float light = .9 + fract(elevation) ;
    light *= .9 + (1.0 - (displacement * displacement)) * .1;
    elevation = floor(elevation);
    
    float hue =  uHue + shadow * .1 + cnoise( vec2( elevation * .10, .1 + t)) * uHueVariation;
    float saturation = .6;;
    float brightness =  - (1.0 - shadow) * .1 + .5  - smoothstep( 0.0, .9,  cnoise( vec2( elevation * .5, .4 + t * 5.0)) ) * .1;

    vec3 hslCol = vec3( hue, saturation, brightness);
    vec3 col = hsl2rgb(hslCol) * vec3(light, 1.0, 1.0);
    
    gl_FragColor = vec4(col, 1.);
  }
`

const uniforms = {
  uTime: { type: 'f', value: 0 },
  uHue: { type: 'f', value: .5 },
  uHueVariation: { type: 'f', value: 1 },
  uDensity: { type: 'f', value: 1 },
  uDisplacement: { type: 'f', value: 1 },
}

export const material = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms,
})
