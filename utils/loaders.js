import * as THREE from 'three'
import { OBJLoader } from '/node_modules/three/examples/jsm/loaders/OBJLoader.js'
import { MTLLoader } from '/node_modules/three/examples/jsm/loaders/MTLLoader.js'
import { GLTFLoader } from '/node_modules/three/examples/jsm/loaders/GLTFLoader.js'
import { ColladaLoader } from '/node_modules/three/examples/jsm/loaders/ColladaLoader.js'
import { MD2Loader } from '/node_modules/three/examples/jsm/loaders/MD2Loader.js'
import { FBXLoader } from '/node_modules/three/examples/jsm/loaders/FBXLoader.js'

import { fixColors } from '/utils/scene.js'
import { getHeight, centerMesh, adjustHeight } from '/utils/helpers.js'
import { mawLaygoAnimations } from '/data/animations.js'

const textureLoader = new THREE.TextureLoader()

/* HELPERS */

const getScale = (mesh, newHeight) => {
  const height = getHeight(mesh)
  const scale = newHeight / height
  return scale
}

export const getMixer = (mesh, animations, i = 0) => {
  const mixer = new THREE.AnimationMixer(mesh)
  const action = mixer.clipAction(animations[i])
  action.play()
  return mixer
}

/* group preserves model orientation */
const createGroup = model => {
  const group = new THREE.Group()
  group.add(model)
  return group
}

const prepareMesh = ({ model, size = 2, angle, axis = [0, 1, 0], animations, shouldCenter, shouldAdjustHeight }) => {
  const scale = size ? getScale(model, size) : 1
  model.scale.set(scale, scale, scale)

  // https://stackoverflow.com/questions/28848863/
  if (shouldCenter) centerMesh(model)
  if (shouldAdjustHeight) adjustHeight(model)

  model.traverse(child => {
    if (child.isMesh) child.castShadow = child.receiveShadow = true
  })
  if (angle) model.rotateOnWorldAxis(new THREE.Vector3(...axis), angle)

  const mixer = animations && animations.length ? getMixer(model, animations) : null

  return { mesh: createGroup(model), animations, mixer }
}

/* OBJ */

export const loadObj = async params => {
  const { file, mtl } = params
  const objLoader = new OBJLoader()
  const mtlLoader = new MTLLoader()
  mtlLoader.setMaterialOptions({ side: THREE.DoubleSide })

  if (mtl) {
    const materials = await mtlLoader.loadAsync(`/assets/models/${mtl}`)
    objLoader.setMaterials(materials)
  }
  const model = await objLoader.loadAsync(`/assets/models/${file}`)
  return prepareMesh({ model, ...params })
}

/* GLB */

export async function loadGlb(params) {
  const gtflLoader = new GLTFLoader()
  const { scene, animations } = await gtflLoader.loadAsync(`/assets/models/${params.file}`)
  return prepareMesh({ model: scene, animations, ...params })
}

/* DAE */

export async function loadDae(params) {
  const colladaLoader = new ColladaLoader()
  const { scene } = await colladaLoader.loadAsync(`/assets/models/${params.file}`)
  return prepareMesh({ model: scene, animations: scene.animations, ...params })
}

/* MD2 */

export async function loadMd2(params) {
  const { file, texture } = params
  const loader = new MD2Loader()
  const map = await textureLoader.loadAsync(`/assets/models/${texture}`)
  const geometry = await loader.loadAsync(`/assets/models/${file}`)
  const { animations } = geometry
  const material = new THREE.MeshLambertMaterial({ map })
  const model = new THREE.Mesh(geometry, material)
  return prepareMesh({ model, animations, ...params })
}

/* FBX */

export async function loadFbx(params) {
  const loader = new FBXLoader()
  const { file, texture } = params
  const model = await loader.loadAsync(`/assets/models/${file}`)
  if (texture) {
    const map = await textureLoader.loadAsync(`/assets/models/${texture}`)
    model.traverse(child => {
      if (child.isMesh) child.material.map = map
    })
  }
  if (model.animations.length)
    model.animations[0].name = params.name

  return prepareMesh({ model, animations: model.animations, ...params })
}

export async function loadFbxAnimations(names, prefix = '') {
  const promises = []

  if (Array.isArray (names))
    for (const name of names) {
      const promise = loadFbx({ name, file: prefix + name + '.fbx' })
      promises.push(promise)
    } else if (typeof names === 'object')
    for (const key in names) {
      const promise = loadFbx({ name: names[key], file: prefix + names[key] + '.fbx' })
      promises.push(promise)
    }

  const responses = await Promise.all(promises)
  return responses.map(res => res.animations[0])
}

/* MASTER LOADER */

/*
* Handle model load, resize, rotate, etc.
* param could be:
*   string (filepath) OR
*   object { file, size, texture, mtl, angle, axis, shouldCenter, shouldAdjustHeight }
* returns a promise that resolves with the { mesh, animations, mixer }
*/
export const loadModel = param => {
  const params = typeof param === 'object' ? param : { file: param }
  const ext = params.file.split('.').pop()
  switch (ext) {
    case 'obj':
      fixColors()
      return loadObj(params)
    case 'glb':
    case 'gltf':
      fixColors()
      return loadGlb(params)
    case 'dae':
      return loadDae(params)
    case 'md2':
      return loadMd2(params)
    case 'fbx':
      fixColors()
      return loadFbx(params)
    default:
      throw new Error(`Unknown file extension: ${ext}`)
  }
}

/* ALIASES */

export const loadRobotko = () =>
  loadModel({ file: 'character/robot/robot.glb', size: 1.2, angle: Math.PI })

export const loadMawLaygo = async(params = {}) => {
  const { mesh } = await loadModel({ file: 'character/maw_j_laygo/maw_j_laygo.fbx', angle: Math.PI, ...params })
  const animations = await loadFbxAnimations(mawLaygoAnimations, 'character/maw_j_laygo/')
  return { mesh, animations }
}