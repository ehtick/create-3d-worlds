// https://codepen.io/shubniggurath/pen/gzjzom
import * as THREE from '/node_modules/three127/build/three.module.js'

const vertexShader = /* glsl */`
  void main() {
    gl_Position = vec4( position, 1.0 );
  }
`

const fragmentShader = /* glsl */`
  uniform vec2 u_resolution;
  uniform float u_time;
  uniform vec2 u_mouse;

  const int octaves = 2;
  const float seed = 43758.5453123;
  const float seed2 = 73156.8473192;
  // Epsilon value, used for normal gradient generation
  const float eps = 0.0015;

  const vec3 ambientLight = 0.99 * vec3(1.0, 1.0, 1.0);
  const vec3 light1Pos = vec3(10., 5.0, -25.0);
  const vec3 light1Intensity = vec3(0.35);
  const vec3 light2Pos = vec3(-20., -25.0, 85.0);
  const vec3 light2Intensity = vec3(0.2);

  const vec3 colour_fog = vec3(.1, .1, .15);

  // movement variables
  vec3 movement = vec3(.0);
  const int maxIterations = 256;
  const int maxIterationsShad = 16;
  const float stepScale = .5;
  const float stopThreshold = 0.01;

  float offset;
  
  mat2 rot2( float a ){ vec2 v = sin(vec2(1.570796, 0) + a);	return mat2(v, -v.y, v.x); }
  
  mat4 rotationMatrix(vec3 axis, float angle)
  {
      axis = normalize(axis);
      float s = sin(angle);
      float c = cos(angle);
      float oc = 1.0 - c;

      return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                  oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                  oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                  0.0,                                0.0,                                0.0,                                1.0);
  }
  
  float length2( vec2 p )
  {
    return sqrt( p.x*p.x + p.y*p.y );
  }

  float length6( vec2 p )
  {
    p = p*p*p; p = p*p;
    return pow( p.x + p.y, 1.0/6.0 );
  }

  float length8( vec2 p )
  {
    p = p*p; p = p*p; p = p*p;
    return pow( p.x + p.y, 1.0/8.0 );
  }
  
  vec3 camPath(float z) {
    return vec3(cos(z * .2) * sin(z * .2), sin(z * .3) * .6, z);
  }
  
  float tri(in float x){return abs(fract(x)-.5);}
  vec3 tri3(in vec3 p){return vec3( tri(p.z+tri(p.y*1.)), tri(p.z+tri(p.x*1.)), tri(p.y+tri(p.x*1.)));}

  mat2 m2 = mat2(0.970,  0.242, -0.242,  0.970);

  float triNoise3d(in vec3 p, in float spd)
  {
    float z=1.4;
    float rz = 0.;
    vec3 bp = p;
    for (float i=0.; i<=3.; i++ )
    {
      vec3 dg = tri3(bp*2.);
      p += (dg+u_time*spd);

      bp *= 1.8;
      z *= 1.5;
      p *= 1.2;
      //p.xz*= m2;

      rz+= (tri(p.z+tri(p.x+tri(p.y))))/z;
      bp += 0.14;
    }
    return rz;
  }
  
  // smooth min
  // reference: http://iquilezles.org/www/articles/smin/smin.htm
  float smin(float a, float b, float k) {
      float res = exp(-k*a) + exp(-k*b);
      return -log(res)/k;
  }
  
  vec3 random3( vec3 p ) {
      return fract(sin(vec3(dot(p,vec3(127.1,311.7,319.8)),dot(p,vec3(269.5,183.3, 415.2)),dot(p,vec3(362.9,201.5,134.7))))*43758.5453);
  }
  vec2 random2( vec2 p ) {
      return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);
  }
  
  // The world!
  float world_sdf(in vec3 p, inout float _offset) {
    float world = 10.;
    
    p.xy -= camPath(p.z).xy;
    
    _offset = ( triNoise3d(p * .1, 0.03) * 1.3);
    _offset -= smoothstep(0.5, 1., triNoise3d((p - 50.) * .01, 0.) * 2.);
    float n = triNoise3d(p * .01, 0.02);
    _offset -= smoothstep(0.8, 1., n * 2.);
    // _offset += smoothstep(0.3, .1, n * 1.);
    
    // p = floor(p * 5.) / 5.;
    
    float floor = p.y + .6;
    world = 1. - length(p.xy) * (1. + _offset);
    // world = 1. - length(triNoise3d(p, 0.));
    world = smin(world, floor, 50.);
    // world = min(world, floor);
    // world = floor;
    
    offset = _offset * .6;
    
    return world;
  }
  float world_sdf(in vec3 p) {
    float _offset = 0.;
    return world_sdf(p, _offset);
  }
  
  // Fuck yeah, normals!
  vec3 calculate_normal(in vec3 p)
  {
    const vec3 small_step = vec3(0.0001, 0.0, 0.0);
    
    float gradient_x = world_sdf(vec3(p.x + eps, p.y, p.z)) - world_sdf(vec3(p.x - eps, p.y, p.z));
    float gradient_y = world_sdf(vec3(p.x, p.y + eps, p.z)) - world_sdf(vec3(p.x, p.y - eps, p.z));
    float gradient_z = world_sdf(vec3(p.x, p.y, p.z  + eps)) - world_sdf(vec3(p.x, p.y, p.z - eps));
    
    vec3 normal = vec3(gradient_x, gradient_y, gradient_z);

    return normalize(normal);
  }

  // Raymarching.
  float rayMarching( vec3 origin, vec3 dir, float start, float end, inout float field ) {
    
    float sceneDist = 1e4;
    float rayDepth = start;
    for ( int i = 0; i < maxIterations; i++ ) {
      sceneDist = world_sdf( origin + dir * rayDepth ); // Distance from the point along the ray to the nearest surface point in the scene.

      if (( sceneDist < stopThreshold ) || (rayDepth >= end)) {        
        break;
      }
      // We haven't hit anything, so increase the depth by a scaled factor of the minimum scene distance.
      rayDepth += sceneDist * stepScale;
    }
  
    if ( sceneDist >= stopThreshold ) rayDepth = end;
    else rayDepth += sceneDist;
      
    // We've used up our maximum iterations. Return the maximum distance.
    return rayDepth;
  }
  
  // The bump mapping function that gives the surface its bumpiness. Here, we're using two layers of a cheap 3D noise function. "Cheap" is a relative
  // term, hence only two layers. Four layers of Perlin noise would be much nicer, but that can be achieved using textures, which I'll get to soon. 
  // I've provided an example on my site that uses a 3D Voronoi function which is nicer still.
  float bumpFunction(in vec3 p){
    return triNoise3d(p * 4., 0.05);
  }

  // Bump mapping uses similar techniques to those used when obtaining the surface normal. Use the surface point "p" and epsilon value "eps" to obtain 
  // the gradient along each of the individual axes (f(p.x+eps)-f(p.x), etc). That should give you a scaled representation of (df/dx, df/dy, df/dz), 
  // which can be scaled down to a desirable factor. However, this time, instead of indexing the distance function, we're indexing into a bump function - 
  // which can be anything that takes in a 3D point and returns a value. The function can also use a texture, which speedwise, can often be 
  // preferable, but for now we're using a 3D function.  
  //
  // After the scaled gradient of the bump mapping function is attained, we simply combine it with the surface normal "nor" using a "bump factor"
  // - which, oddly enough, controls the bumpiness of the surface - normalize it, then return the new bumped, or perturbed, normal.
  //
  // I should probably point out that this is not the only way to bump map a surface. In fact, there are a few. For speed and efficiency, I prefer to 
  // index into a 2D texture (or 2D function), but that tends to involve textures and uv-mapping, which I didn't want to cover just yet, so I've taken 
  // a different route. However, I'll be dealing with bump mapping from textures next. 
  vec3 doBumpMap( in vec3 p, in vec3 nor, float bumpfactor ){

      //p = mod(p,1.0)-0.5; // If you want all the objects to be bump mapped with the same pattern, uncomment this.

    float ref = bumpFunction( p );
    // Note: To save on calculations, we're stepping to just one side of the position "p," rather than both.
      vec3 grad = vec3( bumpFunction(vec3(p.x+eps, p.y, p.z))-ref,
                        bumpFunction(vec3(p.x, p.y+eps, p.z))-ref,
                        bumpFunction(vec3(p.x, p.y, p.z+eps))-ref )/eps;


      // I tend to favor subtle bump mapping, so since this line has a subtle effect already, I have a bad habit of leaving it out. 
      // However, it should definitely be there, so if you do notice it missing in my other work, send me an email letting me know
      // what a lazy dumbass I am. :)              
      grad -= nor*dot(nor, grad);

      // Note the "-" sign, instead of the "+" one. It all depends on how the "grad" vector above is produced.
      // A lazy way to see if you've done it right is a good old-fashioned visual check.                     
      return normalize( nor - bumpfactor*grad );

  }
  
  /**
   * Lighting
   * This stuff is way way better than the model I was using.
   * Courtesy Shane Warne
   * Reference: http://raymarching.com/
   * */
  
  // Lighting.
  vec3 lighting( vec3 sp, vec3 camPos, int reflectionPass, float dist, float field, vec3 rd) {
    
    // Start with black.
    vec3 sceneColor = vec3(0.0);

    vec3 objColor = vec3(1.0, .5, .5);
    
    objColor = vec3(clamp(offset, 0., 1.));

    // Obtain the surface normal at the scene position "sp."
    vec3 surfNormal = calculate_normal(sp);
    
    surfNormal = doBumpMap(sp, surfNormal, .01);

    // Lighting.

    // lp - Light position. Keeping it in the vacinity of the camera, but away from the objects in the scene.
    vec3 lp = vec3(0., 0.0, -1.0) + movement;
    // ld - Light direction.
    vec3 ld = lp-sp;
    // lcolor - Light color.
    vec3 lcolor = mix(vec3(.9,0.89,0.92) * .8, vec3(1., 1., 1.), offset);
    
     // Light falloff (attenuation).
    float len = length( ld ); // Distance from the light to the surface point.
    ld /= len; // Normalizing the light-to-surface, aka light-direction, vector.
    // float lightAtten = min( 1.0 / ( 0.15*len*len ), 1.0 ); // Removed light attenuation for this because I want the fade to white
    
    float sceneLen = length(camPos - sp); // Distance of the camera to the surface point
    float sceneAtten = min( 1.0 / ( 0.25*sceneLen ), 1.0 ); // Keeps things between 0 and 1.   

    float ambient = .5; //The object's ambient property.
    float diffuse = max( 0.0, dot(surfNormal, ld) ); //The object's diffuse value.
    	
    // Bringing all the lighting components togethr to color the screen pixel.
    sceneColor += (objColor*(diffuse*0.8+ambient))*lcolor*1.3;
    sceneColor = mix(sceneColor, colour_fog, 1.-sceneAtten*sceneAtten); // fog
    
    return sceneColor;
  }

  void main() {
    // Setting up our screen coordinates.
    vec2 aspect = vec2(u_resolution.x/u_resolution.y, 1.0); //
    vec2 uv = (2.0*gl_FragCoord.xy/u_resolution.xy - 1.0)*aspect;
    
    // This just gives us a touch of fisheye
    // uv *= 1. + dot(uv, uv) * 0.4;
    
    // movement
    movement = camPath(u_time * 2.5);
    
    // The sin in here is to make it look like a walk.
    vec3 lookAt = vec3(-0., 0.2, 1.);  // This is the point you look towards, or at, if you prefer.
    vec3 camera_position = vec3(0., 0., -1.0); // This is the point you look from, or camera you look at the scene through. Whichever way you wish to look at it.
    camera_position.y += abs(sin(u_time * 10.)) * .02;
    
    lookAt += camPath(u_time * 2.5 + 1. + sin(u_time) * 2.);
    // lookAt.z += sin(u_time / 10.) * .5;
    // lookAt.x += cos(u_time / 10.) * .5;
    camera_position += movement;
    
    vec3 forward = normalize(lookAt-camera_position); // Forward vector.
    vec3 right = normalize(vec3(forward.z, 0., -forward.x )); // Right vector... or is it left? Either way, so long as the correct-facing up-vector is produced.
    vec3 up = normalize(cross(forward,right)); // Cross product the two vectors above to get the up vector.

    // FOV - Field of view.
    float FOV = 0.4;

    // ro - Ray origin.
    vec3 ro = camera_position; 
    // rd - Ray direction.
    vec3 rd = normalize(forward + FOV*uv.x*right + FOV*uv.y*up);
    
    rd.xy = rot2( camPath(lookAt.z).x * .1 )*rd.xy;
    
    // Ray marching.
    const float clipNear = 0.0;
    const float clipFar = 32.0;
    float field = 0.;
    float dist = rayMarching(ro, rd, clipNear, clipFar, field );
    if ( dist >= clipFar ) {
      gl_FragColor = vec4(colour_fog, 1.0);
    } else {
      // sp - Surface position. If we've made it this far, we've hit something.
      vec3 sp = ro + rd*dist;

      // Light the pixel that corresponds to the surface position. The last entry indicates that it's not a reflection pass
      // which we're not up to yet.
      vec3 sceneColor = lighting( sp, camera_position, 0, dist, field, rd);

      // Clamping the lit pixel, then put it on the screen.
      gl_FragColor = vec4(clamp(sceneColor, 0.0, 1.0), 1.0);
    }
  }
`

const uniforms = {
  u_time: { type: 'f', value: 1.0 },
  u_resolution: { type: 'v2', value: new THREE.Vector2() },
}
uniforms.u_resolution.value.x = window.innerWidth
uniforms.u_resolution.value.y = window.innerHeight

export const material = new THREE.ShaderMaterial({
  uniforms,
  vertexShader,
  fragmentShader
})