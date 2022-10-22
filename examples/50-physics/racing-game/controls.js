function camSwitcher(i) {
  camid = i
  switch (camid) {
    case 0: // follow car closely, but without following tilt of car
      if (!camFollowCar) {
        camFollowCar = true; chaseCammer = false; dirLight.target = carModel[cci][0]
      }
      break
    case 1: // follow car loosely, but follow tilt of car
      if (!chaseCammer) {
        chaseCammer = true
        chaseStarter = true
        camFollowCar = false
        dirLight.target = carModel[cci][0]
      }
      break
    case 2: // stopped camera, still looks at controlled car
      if (camFollowCar || chaseCammer) {
        camFollowCar = false
        chaseCammer = false
        dirLight.target = camera
      } else {
        camid = 1
        chaseCammer = true
        chaseStarter = true
        camFollowCar = false
        dirLight.target = carModel[cci][0]
      }
      break
  }

}// end cam switcher

function menuSwitch() {
  showMui = !showMui
  if (showMui) {
    const muiWidth = '220px'
    const muiHeight = SCREEN_HEIGHT * .9
    el('mui').style.visibility = 'visible'
    el('mui').style.width = muiWidth + 'px'
    el('mui').style.height = muiHeight + 'px'
    el('mui').style.left = '20px'
    el('mui').style.top = SCREEN_HEIGHT / 2 - muiHeight / 2 + 'px'
  } else
    el('mui').style.visibility = 'hidden'

}// end mui switch

function decalRayCast() {
  if (typeof worldModel.children[0] !== 'undefined' && typeof worldMat.materials.w3 !== 'undefined') {

    let cp = new Ammo.btVector3(coordx[cci][coordi[cci]], 600, coordz[cci][coordi[cci]])
    let cpDownRayDir = new Ammo.btVector3(cp.x(), (cp.y() - 2000), cp.z())
    let cpDownRay = new Ammo.ClosestRayResultCallback(cp, cpDownRayDir)
    dynamicsWorld.rayTest(cp, cpDownRayDir, cpDownRay)

    if (cpDownRay.hasHit()) {
      // decalsMandala.forEach( function(d){scene.remove(d);} );
      for (let i = 0; i < decalsMandala.length; i++)
        scene.remove(decalsMandala[i])

      decalsMandala = []
      let tp = cpDownRay.get_m_hitPointWorld()
      const tp3 = new THREE.Vector3(tp.x(), tp.y(), tp.z())
      decalPosition.copy(tp3)

      const md = new THREE.Mesh(new THREE.DecalGeometry(worldModel.children[0], decalPosition, decalOrientation, decalSizer), decalMaterialMandala)
      decalsMandala.push(md)
      md.receiveShadow = true
      scene.add(md)

      markerSphere.position.set(decalPosition.x, decalPosition.y + 15, decalPosition.z)
      pointLight.position.set(decalPosition.x, decalPosition.y + 50, decalPosition.z)

      Ammo.destroy(tp); tp = null

      mandalaSet = true

    }// end have hit

    Ammo.destroy(cp); cp = null
    Ammo.destroy(cpDownRayDir); cpDownRayDir = null
    Ammo.destroy(cpDownRay); cpDownRay = null

  }// ! undefined
}// end decal ray cast

menuSwitch()
