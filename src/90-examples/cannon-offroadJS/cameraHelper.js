import * as THREE from '/node_modules/three127/build/three.module.js'

export const cameraHelper = {
  init,
  switch: () => {},
  update: () => {},
}

function init(camera, target) {
  let cameraId = 0
  cameraHelper.switch = () => {
    switch (cameraId++) {
      case 0:
        target.remove(camera)
        camera.fov = 50
        cameraHelper.update = initChaseCamera(camera, target)
        break
      case 1:
        cameraHelper.update = () => camera.lookAt(target.position)
        break
      case 2:
        target.add(camera)
        camera.position.set(0, 1.5, 0)
        camera.rotation.set(0, 0, 0)
        camera.fov = 70
        cameraHelper.update = () => {}
        break
      default:
        cameraId = 0
        cameraHelper.switch()
    }
  }
  cameraHelper.switch()
}

function initChaseCamera(camera, target) {
  const cameraMovementSpeed = 0.05
  const cameraLookPositionHeightOffset = 5
  const cameraMountPosition = new THREE.Vector3()
  const cameraLookPosition = new THREE.Vector3()
  const chaseCameraMountPositionHelper = new THREE.Object3D()
  chaseCameraMountPositionHelper.position.set(0, 8, 15)
  target.add(chaseCameraMountPositionHelper)

  return () => {
    chaseCameraMountPositionHelper.getWorldPosition(cameraMountPosition)

    if (cameraMountPosition.y < target.position.y)
      cameraMountPosition.setY(target.position.y)

    camera.position.lerp(cameraMountPosition, cameraMovementSpeed)
    cameraLookPosition.copy(target.position).y += cameraLookPositionHeightOffset
    camera.lookAt(cameraLookPosition)
  }
}
