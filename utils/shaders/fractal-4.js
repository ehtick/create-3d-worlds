// https://codepen.io/gThiesson/pen/PowYRqg
import * as THREE from 'three'

const vertexShader = /* glsl*/`
  precision highp float;
    void main() {
      gl_Position = vec4(position, 1.0);
    }
`

const fragmentShader = /* glsl*/`
		precision highp float;
		
		uniform vec2 u_resolution;
		uniform float time;
		
		vec2 f(vec2 x, vec2 c) {
			return mat2(x,-x.y,x.x)*x + c;
		}
		
		vec3 palette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
			return a + b*cos( 6.28318*(c*t+d) );
		}
		
		void main() {
			vec2 uv = gl_FragCoord.xy / vec2(800.0, 800.0);
			uv -= 0.5;uv *= 1.3;uv += 0.5;
			int u_maxIterations = 75;
  			
			float r = 0.7885*(sin((time/3.) - 1.57)*0.2+0.85);
			vec2 c = vec2(r*cos((time/3.)), r*sin((time/3.)));

			vec2 z = vec2(0.);
			z.x = 3.0 * (uv.x - 0.5);
    		z.y = 2.0 * (uv.y - 0.5);
			bool escaped = false;
			int iterations;
			for (int i = 0; i < 10000; i++) {
				if (i > u_maxIterations) break;
				iterations = i;
				z = f(z, c);
				if (dot(z,z) > 4.0) {
					escaped = true;
					break;
				}
			}
			
			vec4 iterationCol = vec4(palette(float(iterations)/ float(u_maxIterations),
							 vec3(0.5),
							 vec3(0.5),
							 vec3(1.0, 1.0, 0.0),
							 vec3(0.3 + 0.3 * sin(time),
								  0.2 + 0.2 * sin(1. + time),
								  0.2  + 0.2 * sin(1.5 + time))),
					 		 1.0);
		
			vec4 coreCol = vec4(vec3(0.), 1.0);
			
			gl_FragColor = escaped ? iterationCol : coreCol;
		}
`

export const uniforms = {
  time: { type: 'f', value: 1.0 },
  resolution: { type: 'v2', value: new THREE.Vector2() }
}

export const material = new THREE.ShaderMaterial({
  uniforms,
  vertexShader,
  fragmentShader,
})
