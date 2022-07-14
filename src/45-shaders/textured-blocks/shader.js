export const vertexShader = /* glsl */`
  varying vec2 vUv;

  void main()
  {
    vUv = uv;
    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
    gl_Position = projectionMatrix * mvPosition;
  }
`

export const fragmentShaderMarble = /* glsl */`
  uniform float time;
  uniform sampler2D colorTexture;
  varying vec2 vUv;

  void main( void ) {
    vec2 position = - 1.0 + 2.0 * vUv;
    float a = atan( position.y, position.x );
    float r = sqrt( dot( position, position ) );

    vec2 uv;
    uv.x = cos( a ) / r;
    uv.y = sin( a ) / r;
    uv /= 10.0;
    uv += time * 0.05;

    vec3 color = texture2D( colorTexture, uv ).rgb;
    gl_FragColor = vec4( color * r * 1.5, 1.0 );
  }
`

export const fragmentShaderLed = /* glsl */`
  uniform float time;
  varying vec2 vUv;

  void main( void ) {
    vec2 position = vUv;

    float color = 0.0;
    color += sin( position.x * cos( time / 15.0 ) * 80.0 ) + cos( position.y * cos( time / 15.0 ) * 10.0 );
    color += sin( position.y * sin( time / 10.0 ) * 40.0 ) + cos( position.x * sin( time / 25.0 ) * 40.0 );
    color += sin( position.x * sin( time / 5.0 ) * 10.0 ) + sin( position.y * sin( time / 35.0 ) * 80.0 );
    color *= sin( time / 10.0 ) * 0.5;
    gl_FragColor = vec4( vec3( color, color * 0.5, sin( color + time / 3.0 ) * 0.75 ), 1.0 );
  }
`
