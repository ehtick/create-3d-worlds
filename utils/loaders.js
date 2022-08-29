import * as THREE from 'three'
import { OBJLoader } from '/node_modules/three/examples/jsm/loaders/OBJLoader.js'
import { MTLLoader } from '/node_modules/three/examples/jsm/loaders/MTLLoader.js'
import { GLTFLoader } from '/node_modules/three/examples/jsm/loaders/GLTFLoader.js'
import { ColladaLoader } from '/node_modules/three/examples/jsm/loaders/ColladaLoader.js'
import { MD2Loader } from '/node_modules/three/examples/jsm/loaders/MD2Loader.js'
import { FBXLoader } from '/node_modules/three/examples/jsm/loaders/FBXLoader.js'

import { getHeight, centerMesh, adjustHeight } from '/utils/helpers.js'
import { gamaRender } from '/utils/scene.js'

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

const prepareMesh = ({ model, size, angle, axis, animations, shouldCenter, shouldAdjustHeight }) => {
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
  const material = new THREE.MeshLambertMaterial({ map, morphTargets: true }) // morphNormals: true
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
  return prepareMesh({ model, animations: model.animations, ...params })
}

// TODO: refactor to promise all
export async function loadFbxAnimations(names, prefix = '') {
  const animations = []
  if (Array.isArray (names))
    for (const name of names) {
      const res = await loadFbx({ file: prefix + name + '.fbx' })
      res.animations[0].name = name
      animations.push(res.animations[0])
    }

  if (typeof names === 'object')
    for (const name in names) {
      const res = await loadFbx({ file: prefix + names[name] + '.fbx' })
      res.animations[0].name = name
      animations.push(res.animations[0])
    }

  return animations
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
      return loadObj(params)
    case 'glb':
    case 'gltf':
      return loadGlb(params)
    case 'dae':
      return loadDae(params)
    case 'md2':
      return loadMd2(params)
    case 'fbx':
      gamaRender() // hack
      return loadFbx(params)
    default:
      throw new Error(`Unknown file extension: ${ext}`)
  }
}