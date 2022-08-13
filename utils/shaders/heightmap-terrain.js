import * as THREE from 'three'

const vertexShader = /* glsl */`
	uniform sampler2D bumpTexture;
	uniform float displacementScale;

	varying float vAmount;
	varying vec2 vUV;

	void main() 
	{ 
		vUV = uv;
		vec4 bumpData = texture2D(bumpTexture, uv);
		vAmount = bumpData.r; // map is grayscale so r, g, or b is the same.
		
		// move the position along the normal
		vec3 newPosition = position + normal * displacementScale * vAmount;
		gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );
	}
`

const fragmentShader = /* glsl */`
  uniform sampler2D bumpTexture;
  uniform float seaLevel;

	varying vec2 vUV;
	varying float vAmount;

  // https://gamedev.stackexchange.com/questions/86805
  vec3 color_from_height( const float height )
  {
      vec3 blue = vec3(0.592,0.824,0.89);
      vec3 green = vec3(0.29,0.651,0.239);
      vec3 yellow =  vec3(0.984,0.886,0.671);
      vec3 brown = vec3(0.498,0.18,0.024);
      vec3 snow = vec3(1.,0.98,0.98);
      vec3 colors[4] = vec3[](green, yellow, brown, snow);

      if (height < seaLevel) return blue;

      float steps = 3.0;
      float hscaled = height * steps - 1e-05;
      int i = int(hscaled);
      float frac = hscaled - float(i);

      return mix(colors[i], colors[i+1], frac);
  }

	void main() 
	{
    vec3 color = color_from_height(vAmount);

    gl_FragColor = vec4(color, 1.0);
	}
`

const uniforms = {
  seaLevel: { type: 'f', value: 0.05 },
  displacementScale: { type: 'f', value: 200.0 },
}

export const material = new THREE.ShaderMaterial({
  uniforms,
  vertexShader,
  fragmentShader
})