import * as THREE from '/node_modules/three127/build/three.module.js'
import { scene, camera, renderer } from '/utils/scene.js'
import { createSunLight, sunFollow } from '/utils/light.js'
import { Component } from '../ecs/component.js'

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

export class SkyController extends Component {
  InitEntity() {
    renderer.outputEncoding = THREE.sRGBEncoding
    renderer.gammaFactor = 2.2

    camera.position.set(25, 10, 25)

    this.sun_ = createSunLight()
    scene.add(this.sun_)
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

    scene.fog = new THREE.FogExp2(uniforms.color2.value, 0.00002)

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
    if (!player) return
    sunFollow(this.sun_, player._position)
  }
}
