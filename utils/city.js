import * as THREE from 'three'
import * as BufferGeometryUtils from '/node_modules/three/examples/jsm/utils/BufferGeometryUtils.js'
import { randomGrayish, getAllCoords, sample, mapRange, maxItems } from '/utils/helpers.js'
import { createTrees } from '/utils/geometry/trees.js'
import { createFloor } from '/utils/ground.js'
import { slogans } from '/utils/data/graffiti.js'

const { randInt, randFloat } = THREE.MathUtils

const basicMaterial = new THREE.MeshStandardMaterial({ vertexColors: true })
const textureLoader = new THREE.TextureLoader()

const loadTexture = (filepath, halfWidth) => {
  const texture = textureLoader.load(filepath)
  if (halfWidth) texture.repeat.set(.5, 1)
  return texture
}

/* TEXTURES */

const getWindowColor = ({ chance = .5 } = {}) => {
  const lightColors = [0xffff00, 0xF5F5DC, 0xFFEA00, 0xF6F1D5, 0xFFFF8F, 0xFFFDD0, 0xFBFFFF]
  const lightColor = lightColors[Math.floor(Math.random() * lightColors.length)]
  const randColor = Math.random() > chance ? 0x000000 : lightColor
  return new THREE.Color(randColor)
}

export function createBuildingTexture({ night = false, wallColor = night ? '#151515' : '#FFFFFF' } = {}) {
  const canvas = document.createElement('canvas')
  canvas.width = 32
  canvas.height = 64
  const context = canvas.getContext('2d')
  context.fillStyle = wallColor
  context.fillRect(0, 0, canvas.width, canvas.height)
  for (let y = 2; y < canvas.height; y += 2)
    for (let x = 0; x < canvas.width; x += 2) {
      context.fillStyle = night
        ? getWindowColor({ chance: .25 }).getStyle()
        : randomGrayish({ min: 0, max: .5, colorful: 0 }).getStyle()
      context.fillRect(x, y, 2, 1)
    }

  const canvas2 = document.createElement('canvas')
  canvas2.width = 512
  canvas2.height = 1024
  const context2 = canvas2.getContext('2d')
  context2.imageSmoothingEnabled = false
  context2.drawImage(canvas, 0, 0, canvas2.width, canvas2.height)

  const texture = new THREE.CanvasTexture(canvas2)
  return texture
}

const webFonts = ['Arial', 'Verdana', 'Trebuchet MS', 'Brush Script MT', 'Brush Script MT']
const fontWeights = ['normal', 'bold', 'lighter']
const fontColors = ['red', 'pink', 'teal', 'black', '#222222', 'green', 'purple']

const sloganLengths = slogans.map(s => s.length)
const minLength = Math.min(...sloganLengths),
  maxLength = Math.max(...sloganLengths)

const getStroke = color => {
  if (Math.random() < .5) return undefined
  const colors = fontColors.filter(c => c !== color)
  return sample(colors)
}

export function createGraffitiTexture({
  width = 128, height = 256, background = 'gray', color = sample(fontColors), text = sample(slogans), fontWeight = sample(fontWeights), fontSize = mapRange(text.length, minLength, maxLength, width * .075, width * .025), fontFamily = sample(webFonts), x = width * 0.5, y = height * mapRange(text.length, minLength, maxLength, .9, .7), stroke = getStroke(color)
} = {}) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = background
  ctx.fillRect(0, 0, width, height)

  if (Math.random() > .66) {
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = color
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`
    if (stroke) ctx.strokeStyle = stroke

    const lines = text.split('\n')
    for (let i = 0; i < lines.length; i++) {
      ctx.rotate(Math.random() > .4 ? randFloat(-.05, .05) : 0)
      ctx.fillText(lines[i], x, y + (i * fontSize))

      if (stroke) {
        ctx.rotate(Math.random() > .4 ? randFloat(-.01, .01) : 0)
        ctx.translate(Math.random(), Math.random())
        ctx.strokeText(lines[i], x, y + (i * fontSize))
      }
    }
  }
  // reset transformation to identity matrix
  ctx.setTransform(1, 0, 0, 1, 0, 0)

  return new THREE.CanvasTexture(canvas)
}

/* WINDOWS */

function createWindow(windowWidth, windowHeight) {
  const geometry = new THREE.PlaneGeometry(windowWidth, windowHeight)
  const color = getWindowColor()

  const colors = []
  for (let i = 0, l = geometry.attributes.position.count; i < l; i++)
    colors.push(color.r, color.g, color.b)

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

/* BUILDING */

export function createBuildingGeometry({
  color = randomGrayish({ min: .3, max: .6 }), width = randInt(10, 20), height = randInt(width, width * 4), depth = width, x = 0, z = 0, y = height * .5, addWindows = false, rotY = 0,
} = {}) {

  const geometry = new THREE.BoxGeometry(width, height, depth)

  if (color?.isColor) { // is THREE.Color
    const colors = []
    for (let i = 0, l = geometry.attributes.position.count; i < l; i++)
      colors.push(color.r, color.g, color.b)
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
  }

  const mergedGeometry = addWindows
    ? BufferGeometryUtils.mergeBufferGeometries([geometry, ...createWindows(width, height)])
    : geometry

  mergedGeometry.translate(x, y, z) // needed for merge
  if (rotY) mergedGeometry.rotateY(rotY)

  return mergedGeometry
}

export function createBuilding(params = {}) {
  const { map, color, ...rest } = params
  const geometry = createBuildingGeometry(rest)

  const materialParams = { vertexColors: !color }
  if (map) materialParams.map = map
  if (color) materialParams.color = color
  const material = new THREE.MeshLambertMaterial(materialParams)

  return new THREE.Mesh(geometry, material)
}

export function createTexturedBuilding({ width = 2, height = 1, depth = width, color = 0x999999, path = '/assets/textures/', files = [], defaultFile, halfOnSides = false } = {}) {

  const getDefaultTexture = half => defaultFile
    ? loadTexture(path + defaultFile, half)
    : createBuildingTexture()

  const maps = files.map((file, i) => file
    ? loadTexture(path + file, halfOnSides && (i == 0 || i == 1))  // right || left
    : null
  )

  const geometry = createBuildingGeometry({ width, height, depth })
  const materials = [
    new THREE.MeshPhongMaterial({ map: maps[0] || getDefaultTexture(halfOnSides) }),  // 0: right
    new THREE.MeshPhongMaterial({ map: maps[1] || getDefaultTexture(halfOnSides) }),  // 1: left
    new THREE.MeshPhongMaterial({ color, map: maps[2] || null }),                     // 2: top
    new THREE.MeshBasicMaterial({ color }),                                           // no bottom
    new THREE.MeshPhongMaterial({ map: maps[3] || getDefaultTexture() }),             // 3: front
    new THREE.MeshPhongMaterial({ map: maps[4] || getDefaultTexture() }),             // 4: back
  ]

  const mesh = new THREE.Mesh(geometry, materials)
  return mesh
}

export function createGraffitiBuilding(params = {}) {
  const { color, chance = .25, ...rest } = params
  const geometry = createBuildingGeometry(rest)
  const { width, height } = geometry.parameters
  const materials = []

  for (let i = 0; i < 6; i++) {
    const materialParams = { vertexColors: !color }
    if (color) materialParams.color = color

    if (i !== 2 && i !== 3)  // not top and bottom
      if (Math.random() < chance)
        materialParams.map = createGraffitiTexture({
          background: new THREE.Color(color).getStyle(), width: width * 12, height: height * 12
        })
      else
        materialParams.map = createBuildingTexture()

    const material = new THREE.MeshLambertMaterial(materialParams)
    materials.push(material)
  }

  const mesh = new THREE.Mesh(geometry, materials)
  mesh.castShadow = true
  mesh.receiveShadow = true
  return mesh
}

/* CITY */

const shouldRotate = (rotateEvery, i) => rotateEvery && i % rotateEvery == 0

const shouldEnlarge = (enlargeEvery, i) => enlargeEvery && i % enlargeEvery == 0

export function createCity({
  mapSize = 400, fieldSize = 20, numBuildings = maxItems(mapSize, fieldSize) / 2, emptyCenter = 0, coords = getAllCoords({ mapSize, fieldSize, emptyCenter }), rotateEvery = 9, enlargeEvery = 0, addWindows = false, colorParams = { min: 0, max: .1, colorful: .1 }, map, castShadow = true, receiveShadow = true, numLampposts = 0, numTrees = 0
} = {}) {
  const buildings = []

  for (let i = 0; i < numBuildings; i++) {
    const color = colorParams ? randomGrayish(colorParams) : new THREE.Color(0x000000)
    const { x, z } = coords.pop()

    const rotY = shouldRotate(rotateEvery, i) ? Math.random() * Math.PI : 0
    const bWidth = shouldEnlarge(enlargeEvery, i)
      ? randFloat(fieldSize * .5, fieldSize * 1.25)
      : randFloat(fieldSize * .5, fieldSize)
    const bHeight = shouldEnlarge(enlargeEvery, i)
      ? randFloat(bWidth * 4, bWidth * 6)
      : randFloat(bWidth, bWidth * 4)

    const geometry = createBuildingGeometry({ color, x, z, rotY, addWindows, width: bWidth, height: bHeight })
    buildings.push(geometry)
  }

  const merged = BufferGeometryUtils.mergeBufferGeometries(buildings)
  const material = map
    ? new THREE.MeshLambertMaterial({ map, vertexColors: true })
    : basicMaterial

  const city = new THREE.Mesh(merged, material)
  city.castShadow = castShadow
  city.receiveShadow = receiveShadow

  if (numLampposts)
    city.add(createLampposts({ coords, numLampposts }))

  if (numTrees)
    city.add(createTrees({ coords, n: numTrees }))

  return city
}

export const createNightCity = ({ addWindows = true, colorParams = null, numLampposts = 15, ...rest } = {}) =>
  createCity({ addWindows, colorParams, numLampposts, ...rest })

export function createGraffitiCity({ mapSize, coords = getAllCoords({ mapSize }), nTrees = 20, nFirTrees = 10 } = {}) {
  const group = new THREE.Group()
  const floor = createFloor({ size: mapSize * 1.2, color: 0x509f53 })
  group.add(floor)

  const trees = createTrees({ coords, n: nTrees, nFirTrees })
  group.add(trees)

  for (let i = 0; i < 50; i++) {
    const { x, z } = coords.pop()
    const building = createGraffitiBuilding({ x, z })
    group.add(building)
  }
  return group
}

/* CITY LIGHTS */

function createLamppost({ x = 0, z = 0, height = 20 } = {}) {
  const group = new THREE.Group()

  const sphereGeometry = new THREE.SphereGeometry(1.5, 12, 16)
  const colors = [0xF5F5DC, 0xdceff5, 0xFFFF8F, 0xFFFDD0]
  const color = colors[Math.floor(Math.random() * colors.length)]
  const sphereMaterial = new THREE.MeshBasicMaterial({ color })
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
  sphere.position.set(x, height, z)
  group.add(sphere)

  const cylinderGeometry = new THREE.CylinderGeometry(.25, .25, height, 6)
  const cylinderMaterial = new THREE.MeshPhongMaterial({ color: 0x242731 })
  const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial)
  cylinder.position.set(x, height * .5, z)
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

export function createLampposts({ mapSize = 200, coords = getAllCoords({ mapSize }), numLampposts = 10, height } = {}) {
  const group = new THREE.Group()
  for (let i = 0; i < numLampposts; i++) {
    const { x, z } = coords.pop()
    const lamppost = createLamppost({ x, z, height })
    group.add(lamppost)
  }
  return group
}

export function createCityLights({ mapSize, coords = getAllCoords({ mapSize }), numLights = 4, height = 10 } = {}) {
  const group = new THREE.Group()
  for (let i = 0; i < numLights; i++) {
    const light = new THREE.SpotLight(0xF5F5DC)
    const { x, z } = coords.pop()
    light.position.set(x, height, z)
    light.castShadow = true
    group.add(light)
  }
  return group
}