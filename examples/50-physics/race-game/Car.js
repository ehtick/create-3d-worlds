import { loadModel } from '/utils/loaders.js'
import { makeVehicle } from '/utils/vehicle2.js'

export class Car {
  constructor({ objFile, tireFile, scale = .57, physicsWorld }) {
    return (async() => {
      const { mesh } = await loadModel({ file: `racing/${objFile}.obj`, mtl: `racing/${objFile}.mtl`, scale })
      const { mesh: tireMesh } = await loadModel({ file: `racing/${tireFile}.obj`, mtl: `racing/${tireFile}.mtl`, scale })
      const { vehicle, body } = makeVehicle({ physicsWorld })

      mesh.userData.body = body
      this.mesh = mesh
      this.vehicle = vehicle
      this.tires = [...Array(4)].map(() => tireMesh.clone())

      return this
    })()
  }
}
