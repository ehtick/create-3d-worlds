import * as THREE from 'three'
import { randomGrayish, randomInCircle, randomInSquare } from '/utils/helpers.js'
import * as BufferGeometryUtils from '/node_modules/three/examples/jsm/utils/BufferGeometryUtils.js'
import { material as winMaterial } from '/utils/shaders/windows.js'

const { randInt, randFloat } = THREE.MathUtils

const basicMaterial = new THREE.MeshStandardMaterial({
  vertexColors: true,
})

/* TEXTURES */

function createCityTexture() {
  const windowColor = () => {
    const value = randInt(0, 84, true)
    return `rgb(${value}, ${value}, ${value})`
  }

  const canvas = document.createElement('canvas')
  canvas.width = 32
  canvas.height = 64
  const context = canvas.getContext('2d')
  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, 32, 64)
  for (let y = 2; y < 64; y += 2)
    for (let x = 0; x < 32; x += 2) {
      context.fillStyle = windowColor()
      context.fillRect(x, y, 2, 1)
    }

  const canvas2 = document.createElement('canvas')
  canvas2.width = 512
  canvas2.height = 1024
  const context2 = canvas2.getContext('2d')
  context2.imageSmoothingEnabled = false
  context2.drawImage(canvas, 0, 0, canvas2.width, canvas2.height)

  const texture = new THREE.Texture(canvas2)
  texture.needsUpdate = true
  return texture
}

export function createGraffitiTexture({
  width = 256, height = 256, background = 'rgba(255, 255, 255, 0)', color = 'yellow', font = 'bold 30px Arial', text = 'Punk is not dead!', x = width * 0.5, y = height * 0.5, stroke
} = {}) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = background
  ctx.fillRect(0, 0, width, height)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  ctx.fillStyle = color
  ctx.font = font
  ctx.fillText(text, x, y)

  if (stroke) {
    ctx.strokeStyle = stroke
    ctx.strokeText(text, x, y)
  }

  const texture = new THREE.CanvasTexture(canvas)
  return texture
}

/* BUILDING */

function createWindow(windowWidth, windowHeight) {
  const lightColors = [0xffff00, 0xF5F5DC, 0xFFEA00, 0xFDDA0D, 0xFFFF8F, 0xFFFDD0]
  const lightColor = lightColors[Math.floor(Math.random() * lightColors.length)]
  const randColor = Math.random() > 0.5 ? 0x000000 : new THREE.Color(lightColor)

  const geometry = new THREE.PlaneBufferGeometry(windowWidth, windowHeight)

  const colors = []
  for (let i = 0, l = geometry.attributes.position.count; i < l; i ++) {
    const color = new THREE.Color(randColor)
    colors.push(color.r, color.g, color.b)
  }
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))

  return geometry
}

function createWindows(bWidth, bHeight) {
  const windows = []
  const windowWidth = bWidth / 8
  const windowHeight = randFloat(bHeight / 16, bHeight / 8)
  const floors = Math.floor(bHeight / (windowHeight * 2))
  const halfBWidth = bWidth * .5

  const getWindowY = floor => {
    const currY = floor * windowHeight * 2
    const groundLevel = -bHeight * .5 + windowHeight * .5
    const buildingMargins = bHeight - (windowHeight * 2 * floors)
    const y = groundLevel + currY + (buildingMargins / 2) + (windowHeight / 2)
    return y
  }

  const createSideWindows = callback => {
    for (let i = 0; i < bWidth / windowWidth / 2; i++)
      for (let floor = 0; floor < floors; floor++) {
        const geometry = createWindow(windowWidth, windowHeight)
        const currX = windowWidth + i * windowWidth * 2 - halfBWidth
        callback(geometry, currX, floor)
        geometry.translate(0, getWindowY(floor), 0)
        windows.push(geometry)
      }
  }

  createSideWindows((geometry, currX) => {
    geometry.translate(currX, 0, halfBWidth)
  })
  createSideWindows((geometry, currX) => {
    geometry.rotateY(Math.PI)
    geometry.translate(currX, 0, -halfBWidth)
  })
  createSideWindows((geometry, currX) => {
    geometry.rotateY(Math.PI * .5)
    geometry.translate(halfBWidth, 0, currX)
  })
  createSideWindows((geometry, currX) => {
    geometry.rotateY(-Math.PI * .5)
    geometry.translate(-halfBWidth, 0, currX)
  })
  return windows
}

export function createBuildingGeometry({
  color = new THREE.Color(0x000000), width = randInt(10, 20),
  height = randInt(width, width * 4), x = 0, z = 0, y = height * .5, addWindows = true, rotY = 0,
} = {}) {

  const geometry = new THREE.BoxGeometry(width, height, width)

  const colors = []
  for (let i = 0, l = geometry.attributes.position.count; i < l; i ++)
    colors.push(color.r, color.g, color.b)
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))

  const mergedGeometry = addWindows
    ? BufferGeometryUtils.mergeBufferGeometries([geometry, ...createWindows(width, height)])
    : geometry

  mergedGeometry.translate(x, y, z) // needed for merge
  if (rotY) mergedGeometry.rotateY(rotY)

  return mergedGeometry
}

export function createBuilding(params) {
  const geometry = createBuildingGeometry(params)
  return new THREE.Mesh(geometry, basicMaterial)
}

export function createSimpleBuilding({
  width = randFloat(8, 20), height = randFloat(width * 2, width * 4), color,
} = {}) {
  const geometry = new THREE.BoxGeometry(width, height, width)
  const materials = [winMaterial, winMaterial, basicMaterial, basicMaterial, winMaterial, winMaterial]
  const building = new THREE.Mesh(geometry, materials)
  return building
}

/* CITY */

const shouldRotate = (rotateEvery, i) => rotateEvery && i % rotateEvery == 0

const shouldEnlarge = (enlargeEvery, i) => enlargeEvery && i % enlargeEvery == 0

export function createCity({
  numBuildings = 200, size = 200, circle = true, rotateEvery = 0, enlargeEvery = 0,
  addWindows = false, colorParams = { min: 0, max: .1, colorful: .1 }, addTexture = false,
  emptyCenter = 0, castShadow = true, receiveShadow = false,
} = {}) {
  const buildings = []
  for (let i = 0; i < numBuildings; i++) {
    const color = colorParams ? randomGrayish(colorParams) : new THREE.Color(0x000000)
    const { x, z } = circle
      ? randomInCircle(size * .9, emptyCenter)
      : randomInSquare(size, emptyCenter)

    const rotY = shouldRotate(rotateEvery, i) ? Math.random() * Math.PI : 0
    const bWidth = shouldEnlarge(enlargeEvery, i)
      ? randFloat(10, 25)
      : randFloat(10, 20)
    const bHeight = shouldEnlarge(enlargeEvery, i)
      ? randFloat(bWidth * 4, bWidth * 6)
      : randFloat(bWidth, bWidth * 4)

    const geometry = createBuildingGeometry({ color, x, z, rotY, addWindows, width: bWidth, height: bHeight, addTexture })
    buildings.push(geometry)
  }

  const merged = BufferGeometryUtils.mergeBufferGeometries(buildings)
  const material = addTexture
    ? new THREE.MeshLambertMaterial({ map: createCityTexture(), vertexColors: THREE.FaceColors })
    : basicMaterial

  const city = new THREE.Mesh(merged, material)
  city.castShadow = castShadow
  city.receiveShadow = receiveShadow
  return city
}

/* CITY LIGHTS */

function createLamppost({ x = 0, z = 0, height = 40 } = {}) {
  const group = new THREE.Group()

  const sphereGeometry = new THREE.SphereGeometry(2, 12, 16)
  const colors = [0xF5F5DC, 0xdceff5, 0xFFFF8F, 0xFFFDD0]
  const color = colors[Math.floor(Math.random() * colors.length)]
  const sphereMaterial = new THREE.MeshBasicMaterial({ color })
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
  sphere.position.set(x, height, z)
  group.add(sphere)

  const cylinderGeometry = new THREE.CylinderGeometry(.5, .5, height, 6)
  const cylinderMaterial = new THREE.MeshPhongMaterial({ color: 0x242731 })
  const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial)
  cylinder.position.set(x, height * .5, z)
  // cylinder.receiveShadow = true
  group.add(cylinder)

  const lamppost = new THREE.SpotLight(color)
  lamppost.position.set(x, height, z)
  lamppost.target.position.set(x, 0, z)
  lamppost.target.updateMatrixWorld()

  lamppost.angle = randFloat(Math.PI / 6, Math.PI / 3)
  lamppost.intensity = randFloat(.5, 2) // 1.8 // 0-2
  lamppost.penumbra = 0.5
  lamppost.distance = height * 2

  lamppost.castShadow = true
  group.add(lamppost)

  return group
}

export function createLampposts({ size = 200, numLampposts = 10, height = 40, circle = true } = {}) {
  const group = new THREE.Group()
  for (let i = 0; i < numLampposts; i++) {
    const { x, z } = circle ? randomInCircle(size) : randomInSquare(size)
    const lamppost = createLamppost({ x, z, height })
    group.add(lamppost)
  }
  return group
}

export function createCityLights({ size, numLights = 10, height = 10, circle = true } = {}) {
  const group = new THREE.Group()
  for (let i = 0; i < numLights; i++) {
    const light = new THREE.SpotLight(0xF5F5DC)
    const { x, z } = circle ? randomInCircle(size) : randomInSquare(size)
    light.position.set(x, height, z)
    light.castShadow = true
    group.add(light)
  }
  return group
}