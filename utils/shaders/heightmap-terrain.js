// https://stemkoski.github.io/Three.js/Shader-Heightmap-Textures.html
import * as THREE from 'three'

const vertexShader = /* glsl */`
	uniform sampler2D bumpTexture;
	uniform float bumpScale;

	varying float vAmount;
	varying vec2 vUV;

	void main() 
	{ 
		vUV = uv;
		vec4 bumpData = texture2D(bumpTexture, uv);
		vAmount = bumpData.r; // map is grayscale so r, g, or b is the same.
		
		// move the position along the normal
		vec3 newPosition = position + normal * bumpScale * vAmount;
		gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );
	}
`

const fragmentShader = /* glsl */`
  uniform sampler2D bumpTexture;

	varying vec2 vUV;
	varying float vAmount;

  // https://gamedev.stackexchange.com/questions/86805
  vec3 color_from_height( const float height )
  {
      vec3 blue = vec3(0.592,0.824,0.89);
      vec3 green = vec3(0.286,0.647,0.239);
      vec3 yellow =  vec3(0.984,0.886,0.671);
      vec3 brown = vec3(0.498,0.18,0.024);

      if (height < 0.05)
          return blue;

      float hscaled = height * 2.0 - 1e-05; // hscaled should range in [0,2)
      int hi = int(hscaled); // hi should be 0 or 1
      float hfrac = hscaled - float(hi); // hfrac should range in [0,1]

      if (hi == 0)
          return mix(green, yellow, hfrac);
      else
          return mix(yellow, brown, hfrac);
  }

	void main() 
	{
    vec3 color = color_from_height(vAmount);

    gl_FragColor = vec4(color, 1.0);
	}
`

const uniforms = {
  bumpScale: { type: 'f', value: 300.0 },
}

export const material = new THREE.ShaderMaterial({
  uniforms,
  vertexShader,
  fragmentShader
})