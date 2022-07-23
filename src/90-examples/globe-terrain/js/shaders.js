export const vs_rt = /* glsl */ `
  varying vec2 vUv;

  void main() {
      
    // flip image 180 -- two iterations of this shader = two passes,
    // one starting top-left and the other starting bottom-right
    vUv = vec2(1.0) - uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  }
`

export const fs_erode = /* glsl */ `
  precision mediump float;

  uniform lowp sampler2D colorMap;
  uniform vec2 u_textureSize;
  varying vec2 vUv;

  // the width and height of a single pixel, in uv space
  float pixelW = 1.0 / u_textureSize.x;
  float pixelH = 1.0 / u_textureSize.y;

  float intensity = 1.0;
  uniform float u_erode;

  const int size = 1; //modify sampling kernel if needed
  float Infinity = 100000.0;

  #define between(v,x1,x2) (v> x1 && v<x2)

  void main (void) {
    // pixel = current pixel
    vec4 pixel = texture2D(colorMap, vUv);
    // just use r value, assuming monochrome image
    float value = pixel.r;
      
    float minimum = Infinity;
    
    // 3x3 Shih-Wu kernel
    minimum = min(minimum, texture2D(colorMap, vUv+vec2(-pixelW, 0.0)).r + u_erode); // left
    minimum = min(minimum, texture2D(colorMap, vUv+vec2(0.0, -pixelH)).r + u_erode); // up
    minimum = min(minimum, texture2D(colorMap, vUv+vec2(-pixelW, -pixelH)).r + u_erode*1.41421356); // up-left
    minimum = min(minimum, texture2D(colorMap, vUv+vec2(pixelW, -pixelH)).r + u_erode*1.41421356); // up-right

    // 5x5 Shih-Wu kernel additional samples
    minimum = min(minimum, texture2D(colorMap, vUv+vec2(-pixelW*2.0, 0.0)).r + u_erode *2.0); // left-left
    minimum = min(minimum, texture2D(colorMap, vUv+vec2(-pixelW*2.0, -pixelH)).r + u_erode *2.23606798); // up-left-left
    minimum = min(minimum, texture2D(colorMap, vUv+vec2(-pixelW*2.0, -pixelH*2.0)).r + u_erode *2.82842712); // up-up-left-left
    minimum = min(minimum, texture2D(colorMap, vUv+vec2(-pixelW, -pixelH*2.0)).r + u_erode *2.23606798); // up-up-left
    minimum = min(minimum, texture2D(colorMap, vUv+vec2(0.0, -pixelH*2.0)).r + u_erode *2.0); // up-up
    minimum = min(minimum, texture2D(colorMap, vUv+vec2(pixelW, -pixelH*2.0)).r + u_erode *2.23606798); // up-up-right
    minimum = min(minimum, texture2D(colorMap, vUv+vec2(pixelW*2.0, pixelH*2.0)).r + u_erode *2.82842712); // up-up-right-right
    minimum = min(minimum, texture2D(colorMap, vUv+vec2(pixelW*2.0, pixelH)).r + u_erode *2.23606798); // up-right-right
    
    if (value > minimum) {
      // dim pixel to slightly brighter than its darkest neighbor
      pixel = vec4(minimum, minimum, minimum, 1.0);
    }


    if (intensity == 1.0) gl_FragColor = pixel; //just output the value
      
    if (intensity == 0.0) gl_FragColor = texture2D(colorMap, vUv); //output original
    
    if (between(intensity,0.0, 1.0)){ // mix with original
      lowp vec4 front = texture2D(colorMap, vUv);
      gl_FragColor = mix(front, pixel, intensity);
    }
  }
`
export const fs_dilate = /* glsl */ `
  precision mediump float;
  uniform lowp sampler2D colorMap;
  uniform vec2 u_textureSize;
  varying vec2 vUv;

  // the width and height of a single pixel, in uv space
  float pixelW = 1.0 / u_textureSize.x;
  float pixelH = 1.0 / u_textureSize.y;

  float intensity = 1.0;
  uniform float u_dilate;

  const int size = 1; //modify sampling kernel if needed
  float Infinity = 100000.0;

  #define between(v,x1,x2) (v> x1 && v<x2)

  void main (void) {
    // pixel = current pixel
    vec4 pixel = texture2D(colorMap, vUv);
    // just use r value, assuming monochrome image
    float value = pixel.r;
      
    float maximum = 0.0;
    // 3x3 Shih-Wu kernel
    maximum = max(maximum, texture2D(colorMap, vUv+vec2(-pixelW, 0.0)).r - u_dilate); // left
    maximum = max(maximum, texture2D(colorMap, vUv+vec2(0.0, -pixelH)).r - u_dilate); // up
    maximum = max(maximum, texture2D(colorMap, vUv+vec2(-pixelW, -pixelH)).r - u_dilate*1.41421356); // up-left
    maximum = max(maximum, texture2D(colorMap, vUv+vec2(pixelW, -pixelH)).r - u_dilate*1.41421356); // up-right
    // 5x5 Shih-Wu kernel additional weighted samples
    maximum = max(maximum, texture2D(colorMap, vUv+vec2(-pixelW*2.0, 0.0)).r - u_dilate *2.0); // left-left
    maximum = max(maximum, texture2D(colorMap, vUv+vec2(-pixelW*2.0, -pixelH)).r - u_dilate *2.23606798); // up-left-left
    maximum = max(maximum, texture2D(colorMap, vUv+vec2(-pixelW*2.0, -pixelH*2.0)).r - u_dilate *2.82842712); // up-up-left-left
    maximum = max(maximum, texture2D(colorMap, vUv+vec2(-pixelW, -pixelH*2.0)).r - u_dilate *2.23606798); // up-up-left
    maximum = max(maximum, texture2D(colorMap, vUv+vec2(0.0, -pixelH*2.0)).r - u_dilate *2.0); // up-up
    maximum = max(maximum, texture2D(colorMap, vUv+vec2(pixelW, -pixelH*2.0)).r - u_dilate *2.23606798); // up-up-right
    maximum = max(maximum, texture2D(colorMap, vUv+vec2(pixelW*2.0, pixelH*2.0)).r - u_dilate *2.82842712); // up-up-right-right
    maximum = max(maximum, texture2D(colorMap, vUv+vec2(pixelW*2.0, pixelH)).r - u_dilate *2.23606798); // up-right-right
    
    if (value < maximum) {
      maximum *= 1.0;
      // dim pixel to slightly brighter than its darkest neighbor
      pixel = vec4(maximum, maximum, maximum, 1.0);
    }

    if (intensity == 1.0) gl_FragColor = pixel; //just output the value 
    if (intensity == 0.0) gl_FragColor = texture2D(colorMap, vUv); //output original

    if (between(intensity,0.0, 1.0)){ // mix with original
      lowp vec4 front = texture2D(colorMap, vUv);
      gl_FragColor = mix(front, pixel, intensity);
    }
  }
`

export const vs_main = /* glsl */ `

attribute vec4 tangent; 
attribute float amplitude;
attribute float displacement;

varying vec3 vTangent;
varying vec3 vBinormal;
varying vec3 vNormal;
varying vec2 vUv;

uniform vec2 matrightBottom;
uniform vec2 matleftTop;
uniform float sphereRadius;
uniform float mixAmount;

varying vec3 vPointLightVector;
varying vec3 vWorldPosition;
varying vec3 vViewPosition;

uniform vec3 uPointLightPos;

#ifdef VERTEX_TEXTURES

	uniform sampler2D tDisplacement;
	uniform float uDisplacementScale;
	uniform float uDisplacementBias;
	uniform float uDisplacementPostScale;

#endif

		// convert the positions from a lat, lon to a position on a sphere.
vec3 latLongToVector3(float lat, float lon, float radius) {
		float PI = 3.1415926535897932384626433832795;
		float phi = (lat)*PI/180.0;
		// float theta = (lon-180.0)*PI/180.0; // not sure why that -180 is there
		float theta = (lon)*PI/180.0; // this makes the shader work for regular geo too
		
		float x = radius * cos(phi) * cos(theta);
		float y = radius * cos(phi) * sin(theta);
		float z = radius * sin(phi);

		// return vec3(x,y,z);
		// the above math calls Z up - 3D calls Y up
		// i don't know why it has to be negative :P
		return vec3(x,z,-y);
}

vec2 uvToLatLong(vec2 uvs, vec2 leftTop, vec2 rightBottom ) {
		// uv coordinates go from bottom-left to top-right
		// 0.0,0.0 is bottom left, 1.0,1.0 is top right, 0.5,0.5 is center
		// latLong coords go depending on which demisphere you're in
		float right = rightBottom.x;
		float bottom = rightBottom.y;
		float left = leftTop.x;
		float top = leftTop.y;

		float xDiff = right - left;
		float yDiff = bottom - top;
		
		// treat uv as a completion ratio from left to right and bottom to top
		float xPercent = left + ( xDiff * uvs.x );
		float yPercent = bottom - ( yDiff * uvs.y );
		
		vec2 latlong = vec2( xPercent, yPercent );
		return latlong;
		
		
}

void main() {
	vec2 thisUV = uv;
	// stretch the uv join a bit to reduce the gap at the seam
	if ( thisUV.x == 1.0 ) thisUV.x = 1.003;
	// convert material lat/long uniforms to cartesian coordinates
	vec2 newLatLong = uvToLatLong(thisUV, matleftTop, matrightBottom);
	// for debugging
	vec3 goalPosition = latLongToVector3(newLatLong.y, newLatLong.x, sphereRadius);
	vec3 newPosition = mix( position, goalPosition, mixAmount );
	// for a sphere centered at the origin, vertex position also == normal!
	vec3 newnormal = normalize(newPosition);
	
	vec4 mvPosition = modelViewMatrix * vec4( newPosition, 1.0 );
	vViewPosition = -mvPosition.xyz;

	vNormal = normalize( normalMatrix * newnormal );
	//tangent and binormal vectors
	vTangent = normalize( normalMatrix * tangent.xyz );
	vBinormal = normalize( cross( vNormal, vTangent ) * tangent.w );
	vBinormal = normalize( vBinormal );

	vUv = thisUV;
	
	// point light
	vec4 lPosition      = viewMatrix * vec4( uPointLightPos, 1.0 );
	vPointLightVector   = normalize( lPosition.xyz - mvPosition.xyz );

	#ifdef VERTEX_TEXTURES
			vec3 dv                 = texture2D( tDisplacement, vUv ).xyz;
			float df                = uDisplacementScale * dv.x + uDisplacementBias;
			
			vec4 displacedPosition  = vec4( vNormal.xyz * df * uDisplacementPostScale/100.0, 0.0 ) + mvPosition;

			gl_Position             = projectionMatrix * displacedPosition;
	#else
		gl_Position = projectionMatrix * mvPosition;
	#endif
}
`

export const fs_main = /* glsl */ `
  #extension GL_OES_standard_derivatives : enable

  uniform vec3 uPointLightPos;

  uniform vec3 uAmbientLightColor;
  uniform vec3 uPointLightColor;

  uniform vec3 ambient;
  uniform vec3 diffuse;
  uniform vec3 specular;
  uniform float shininess;

  uniform sampler2D tDiffuse;
  uniform sampler2D tDiffuse2;
  uniform sampler2D tDisplacement;
  uniform sampler2D tNormal;
  uniform sampler2D tSpec;
  uniform sampler2D tOcc;

  uniform float tDiffuseOpacity;
  uniform float tDiffuse2Opacity;

  uniform vec2 uNormalScale;
  uniform vec2 uNormalOffset;

  varying vec3 vTangent;
  varying vec3 vBinormal;
  varying vec3 vNormal;
  varying vec2 vUv;

  varying vec3 vPointLightVector;
  varying vec3 vViewPosition;

  uniform float uDisplacementPostScale;

  uniform float bumpScale;
  uniform float opacity;

  // Derivative maps - bump mapping unparametrized surfaces by Morten Mikkelsen
  //	http://mmikkelsen3d.blogspot.sk/2011/07/derivative-maps.html

  // Evaluate the derivative of the height w.r.t. screen-space using forward differencing (listing 2)

  vec2 dHdxy_fwd() {
    vec2 dSTdx = dFdx( vUv );
    vec2 dSTdy = dFdy( vUv );

    float hll = bumpScale * texture2D( tDisplacement, vUv ).x;
    float dBx = bumpScale * texture2D( tDisplacement, vUv + dSTdx ).x - hll;
    float dBy = bumpScale * texture2D( tDisplacement, vUv + dSTdy ).x - hll;

    return vec2( dBx, dBy );
  }

  vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy ) {
    vec3 vSigmaX = dFdx( surf_pos );
    vec3 vSigmaY = dFdy( surf_pos );
    vec3 vN = surf_norm;		// normalized

    vec3 R1 = cross( vSigmaY, vN );
    vec3 R2 = cross( vN, vSigmaX );

    float fDet = dot( vSigmaX, R1 );

    vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
    return normalize( abs( fDet ) * surf_norm - vGrad );
  }


  void main() {
    vec4 diffuseTex     = texture2D( tDiffuse, vUv ) * tDiffuseOpacity;
    if (tDiffuse2Opacity > 0.0) {
      vec4 diffuseTex2     = texture2D( tDiffuse2, vUv );
      vec4 diffuseTex     = texture2D( tDiffuse2, vUv ) * tDiffuseOpacity;
    }
    vec3 normalTex      = texture2D( tNormal, vUv ).xyz * 2.0 - 1.0;
    normalTex = normalize( normalTex );

    mat3 tsb            = mat3( vTangent, vBinormal, vNormal );
    vec3 finalNormal    = tsb * normalTex.rgb;
    vec3 normal         = normalize( finalNormal );
    vec3 normal2         = normalize( finalNormal );
    vec3 viewPosition   = normalize( vViewPosition );

    normal = perturbNormalArb( -vViewPosition, normal * vec3(100.0/(uDisplacementPostScale+1.0)), dHdxy_fwd() );
    normal = normalize(normal);

    // point light
    vec4 pointDiffuse           = vec4( 0.0, 0.0, 0.0, 0.0 );
    vec4 pointSpecular          = vec4( 0.0, 0.0, 0.0, 0.0 ); //
    vec3 pointVector            = normalize( vPointLightVector );
    float dotProduct = dot( normal, pointVector );
    float pointDiffuseWeight = max( dotProduct, 0.0 );
    vec3 pointHalfVector        = normalize( vPointLightVector + viewPosition );
    
    // specular
    float pointDotNormalHalf = max( dot( normal, pointHalfVector ), 0.0 );
    float pointSpecularWeight   = 0.0;  //
    pointSpecularWeight += max( pow( pointDotNormalHalf, shininess ), 0.0 );
    pointSpecular += vec4( specular, 1.0 ) * vec4( uPointLightColor, 1.0 ) * pointSpecularWeight * pointDiffuseWeight;
        
    if ( pointDotNormalHalf >= 0.0 )    pointSpecularWeight = pow( pointDotNormalHalf, shininess );  // no spectex
    pointDiffuse                  += vec4( diffuse, 1.0 ) * vec4( uPointLightColor, 1.0 ) * pointDiffuseWeight;

    // all lights contribution summation

    vec4 totalLight             = vec4( uAmbientLightColor * ambient , 1.0 ); // orig
    totalLight                 += vec4( uPointLightColor, 1.0 ) * ( pointDiffuse + pointSpecular );

    // with texture
    gl_FragColor = vec4( diffuseTex.xyz + totalLight.xyz, opacity );
    // without texture
    // gl_FragColor = vec4( totalLight.xyz, 1.0 );
    // gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );								
  }
`
