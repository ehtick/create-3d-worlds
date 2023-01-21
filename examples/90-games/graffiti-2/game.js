import * as THREE from 'three'
import { scene, renderer, camera, createOrbitControls } from '/utils/scene.js'
import { createGraffitiTexture } from '/utils/city.js'
import { createSun } from '/utils/light.js'

createOrbitControls()
scene.add(createSun())

const uniforms = {
  y: { value: 0.0 },
  graffiti: { value: createGraffitiTexture({ stroke: 'red' }) }
}

const getFragmentShader = defaultFragmentShader => /* glsl */`
uniform float y;
uniform sampler2D graffiti;

${defaultFragmentShader}

`.replace('#include <map_fragment>', `
  #include <map_fragment>
  
  vec4 textCol = texture(graffiti, (vUv * 2. - 0.5) + vec2(-2., y));
  vec3 col = mix(diffuseColor.rgb, textCol.rgb, textCol.a);
  diffuseColor = vec4( col, opacity );
`)

const material = new THREE.MeshLambertMaterial({
  map: new THREE.TextureLoader().load('https://threejs.org/examples/textures/floors/FloorsCheckerboard_S_Diffuse.jpg', texture => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(3, 1)
  }),
  onBeforeCompile: shader => {
    shader.uniforms.y = uniforms.y
    shader.uniforms.graffiti = uniforms.graffiti
    shader.fragmentShader = getFragmentShader(shader.fragmentShader)
  }
})

const geometry = new THREE.CylinderGeometry(2, 2, 4.5, 36, 1, true)
geometry.rotateY(Math.PI)

const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

renderer.setAnimationLoop(() => {
  renderer.render(scene, camera)
})
