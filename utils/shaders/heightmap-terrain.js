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

  vec3 blue = vec3(0.592,0.824,0.89);
  vec3 green = vec3(0.29,0.651,0.239);
  vec3 yellow =  vec3(0.984,0.886,0.671);
  vec3 brown = vec3(0.498,0.18,0.024);
  vec3 white = vec3(1.,0.98,0.98);

  // https://gamedev.stackexchange.com/questions/86805
  vec3 color_from_height(const float height )
  {
      if (height < seaLevel) return blue;

      float steps = 3.0;
      float hscaled = height * steps + 0.2; // snow offset
      int i = int(hscaled);
      float frac = hscaled - float(i);
      vec3 colors[4] = vec3[](green, yellow, brown, white);

      return mix(colors[i], colors[i+1], frac);
  }

  vec3 color_from_height_alt(const float height)
  {
      vec3 water = (smoothstep(-0.1, 0.1, vAmount) - smoothstep(0.19, 0.2, vAmount)) * blue;
      vec3 sand = (smoothstep(0.1, 0.3, vAmount) - smoothstep(0.39, 0.4, vAmount)) * yellow;
      vec3 grass = (smoothstep(0.3, 0.5, vAmount) - smoothstep(0.59, 0.6, vAmount)) * green;
      vec3 land = (smoothstep(0.5, 0.7, vAmount) - smoothstep(0.79, 0.8, vAmount)) * brown;
      vec3 snow = (smoothstep(0.70, 0.8, vAmount)) * white;

      return vec3(water + sand + grass + land + snow);
  }

	void main() 
	{
    vec3 color = color_from_height_alt(vAmount);

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