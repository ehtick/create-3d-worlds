import * as THREE from '/node_modules/three127/build/three.module.js'
import { scene, camera, renderer } from '/utils/scene.js'

import { entity } from '../../../ecs/entity.js'

const vertexShader = `
  varying vec3 vWorldPosition;
  
  void main() {
    vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
    vWorldPosition = worldPosition.xyz;
  
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  }`

const fragmentShader = `
  uniform vec3 color1;
  uniform vec3 color2;
  uniform float offset;
  uniform float exponent;
  uniform samplerCube background;
  
  varying vec3 vWorldPosition;
  
  void main() {
    vec3 viewDirection = normalize(vWorldPosition - cameraPosition);
    vec3 stars = textureCube(background, viewDirection).xyz;
  
    float h = normalize(vWorldPosition + offset).y;
    float t = max(pow(max(h, 0.0), exponent), 0.0);
  
    float f = exp(min(0.0, -vWorldPosition.y * 0.00125));
  
    vec3 sky = mix(stars, color2, f);
    gl_FragColor = vec4(sky, 1.0);
  }`

export class ThreeJSController extends entity.Component {
  InitEntity() {
    THREE.ShaderChunk.fog_fragment = `
      #ifdef USE_FOG
        vec3 fogOrigin = cameraPosition;
        vec3 fogDirection = normalize(vWorldPosition - fogOrigin);
        float fogDepth = distance(vWorldPosition, fogOrigin);
  
        fogDepth *= fogDepth;
  
        float heightFactor = 0.05;
        float fogFactor = heightFactor * exp(-fogOrigin.y * fogDensity) * (
            1.0 - exp(-fogDepth * fogDirection.y * fogDensity)) / fogDirection.y;
        fogFactor = saturate(fogFactor);
  
        gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
      #endif`

    THREE.ShaderChunk.fog_pars_fragment = `
      #ifdef USE_FOG
        uniform float fogTime;
        uniform vec3 fogColor;
        varying vec3 vWorldPosition;
        #ifdef FOG_EXP2
          uniform float fogDensity;
        #else
          uniform float fogNear;
          uniform float fogFar;
        #endif
      #endif`

    THREE.ShaderChunk.fog_vertex = `
      #ifdef USE_FOG
        vWorldPosition = (modelMatrix * vec4(transformed, 1.0 )).xyz;
      #endif`

    THREE.ShaderChunk.fog_pars_vertex = `
      #ifdef USE_FOG
        varying vec3 vWorldPosition;
      #endif`

    renderer.outputEncoding = THREE.sRGBEncoding
    renderer.gammaFactor = 2.2

    camera.position.set(25, 10, 25)
    scene.fog = new THREE.FogExp2(0x89b2eb, 0.00002)

    const light = new THREE.DirectionalLight(0x8088b3, 0.7)
    light.position.set(-10, 500, 10)
    light.target.position.set(0, 0, 0)
    light.castShadow = true
    light.shadow.bias = -0.001
    light.shadow.mapSize.width = 4096
    light.shadow.mapSize.height = 4096
    light.shadow.camera.near = 0.1
    light.shadow.camera.far = 1000.0
    light.shadow.camera.left = 100
    light.shadow.camera.right = -100
    light.shadow.camera.top = 100
    light.shadow.camera.bottom = -100
    scene.add(light)

    this.sun_ = light
    this.LoadSky_()
  }

  LoadSky_() {
    const hemiLight = new THREE.HemisphereLight(0x424a75, 0x6a88b5, 0.7)
    scene.add(hemiLight)

    const loader = new THREE.CubeTextureLoader()
    const texture = loader.load([
      '/assets/textures/terrain/space-posx.jpg',
      '/assets/textures/terrain/space-negx.jpg',
      '/assets/textures/terrain/space-posy.jpg',
      '/assets/textures/terrain/space-negy.jpg',
      '/assets/textures/terrain/space-posz.jpg',
      '/assets/textures/terrain/space-negz.jpg',
    ])
    texture.encoding = THREE.sRGBEncoding

    const uniforms = {
      'color1': { value: new THREE.Color(0x000000) },
      'color2': { value: new THREE.Color(0x5d679e) },
      'offset': { value: -500 },
      'exponent': { value: 0.3 },
      'background': { value: texture },
    }

    scene.fog.color.copy(uniforms.color2.value)

    const skyGeo = new THREE.SphereBufferGeometry(5000, 32, 15)
    const skyMat = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      side: THREE.BackSide
    })

    const sky = new THREE.Mesh(skyGeo, skyMat)
    scene.add(sky)
  }

  Update(_) {
    const player = this.FindEntity('player')
    if (!player)
      return

    const pos = player._position

    this.sun_.position.copy(pos)
    this.sun_.position.add(new THREE.Vector3(-50, 200, -10))
    this.sun_.target.position.copy(pos)
    this.sun_.updateMatrixWorld()
    this.sun_.target.updateMatrixWorld()
  }
}
