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

  vec3 color_from_height( const float height )
  {
      vec3 terrain_colours[4];
      terrain_colours[0] = vec3(0.0,0.0,0.6);
      terrain_colours[1] = vec3(0.1, 0.3, 0.1);
      terrain_colours[2] =  vec3(0.4, 0.8, 0.4);
      terrain_colours[3] = vec3(1.0,1.0,1.0);
      if (height < 0.0)
          return terrain_colours[0];
      else
      {
          float hscaled = height * 2.0 - 1e-05; // hscaled should range in [0,2)
          int hi = int(hscaled); // hi should range in [0,1]
          float hfrac = hscaled-float(hi); // hfrac should range in [0,1]
          if ( hi == 0)
              return mix(terrain_colours[1],terrain_colours[2],hfrac); // blends between the two colours    
          else
              return mix(terrain_colours[2],terrain_colours[3],hfrac); // blends between the two colours
      }
      return vec3(0.0,0.0,0.0);
  }

	void main() 
	{
    vec3 color = color_from_height(vAmount * 2.0-1.0);

    // gl_FragColor = texture2D(bumpTexture, vUV);
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