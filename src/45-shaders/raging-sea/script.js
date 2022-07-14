import * as THREE from '/node_modules/three127/build/three.module.js'
import { camera, scene, renderer, clock, createOrbitControls } from '/utils/scene.js'

const controls = createOrbitControls()
camera.position.set(1, 1, 1)

const param = {
  waveDepthColor: '#1e4d40',
  waveSurfaceColor: '#4d9aaa',
  fogNear: 1,
  fogFar: 3,
  fogColor: '#8e99a2'
}

scene.fog = new THREE.Fog(param.fogColor, param.fogNear, param.fogFar)
scene.background = new THREE.Color(param.fogColor)

const waterGeometry = new THREE.PlaneGeometry(12, 12, 512, 512)

const waterMaterial = new THREE.ShaderMaterial({
  vertexShader: document.getElementById('vertexShader').textContent,
  fragmentShader: document.getElementById('fragmentShader').textContent,
  transparent: true,
  fog: true,
  uniforms: {
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2() },
    uBigWavesElevation: { value: 0.2 },
    uBigWavesFrequency: { value: new THREE.Vector2(4, 2) },
    uBigWaveSpeed: { value: 0.75 },
    // Small Waves
    uSmallWavesElevation: { value: 0.15 },
    uSmallWavesFrequency: { value: 3 },
    uSmallWavesSpeed: { value: 0.2 },
    uSmallWavesIterations: { value: 4 },
    // Color
    uDepthColor: { value: new THREE.Color(param.waveDepthColor) },
    uSurfaceColor: { value: new THREE.Color(param.waveSurfaceColor) },
    uColorOffset: { value: 0.08 },
    uColorMultiplier: { value: 5 },

    // Fog, contains fogColor, fogDensity, fogFar and fogNear
    ...THREE.UniformsLib.fog }
})

const water = new THREE.Mesh(waterGeometry, waterMaterial)
water.rotation.x = -Math.PI * 0.5
scene.add(water)

const tick = () => {
  const elapsedTime = clock.getElapsedTime()
  controls.update()
  waterMaterial.uniforms.uTime.value = elapsedTime
  renderer.render(scene, camera)
  window.requestAnimationFrame(tick)
}

tick()