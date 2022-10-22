const numButtons = 13
for (let i = 0; i < numButtons; i++) setButtonColors('button' + i)

function setButtonColors(divid) {
  el(divid).onmouseover = function() {
    this.style.backgroundColor = '#535353'
  }
  el(divid).onmouseout = function() {
    this.style.backgroundColor = '#000000'
  }
  el(divid).onmousedown = function() {
    this.style.backgroundColor = '#787878'
  }
  el(divid).onmouseup = function() {
    this.style.backgroundColor = '#535353'
  }

}// end set button colors

function score(c) {
  if (showScore && !scoreUpdated[c]) {
    scoreUpdated[c] = true
    let scoreList = ''
    carPlaces.sort(sortPlaces)
    for (let k = 0; k < numCars; k++)
      if (carPlaces[k].name == carNames[cci])
        scoreList += '<span style="color:yellow;">' + carPlaces[k].name + ': ' + carPlaces[k].place + '</span><BR>'
      else
        scoreList += carPlaces[k].name + ': ' + carPlaces[k].place + '<BR>'

    da('score', scoreList)
  }// end if show score
}// end score

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

function muiSwitch() {
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

function shortcutSwitch() {
  showShortcuts = !showShortcuts
  if (showShortcuts) {
    const scWidth = 400
    const scHeight = SCREEN_HEIGHT * .8
    el('shortcuts').style.visibility = 'visible'
    el('shortcuts').style.width = scWidth + 'px'
    el('shortcuts').style.height = scHeight + 'px'
    el('shortcuts').style.left = SCREEN_WIDTH / 2 - scWidth / 2 + 'px'
    el('shortcuts').style.top = SCREEN_HEIGHT / 2 - scHeight / 2 + 'px'
    el('shortcuts').style.visibility = 'visible'
  } else el('shortcuts').style.visibility = 'hidden'
}// end short cut switch

function decalRayCast() {
  if (typeof worldModel.children[0] !== 'undefined' && typeof worldMat[0].materials.w3 !== 'undefined') {

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

function toggleScore() {
  showScore = !showScore
  for (let c = 0; c < numCars; c++) score(c)
  if (showScore) el('score').style.visibility = 'visible'; else el('score').style.visibility = 'hidden'
}// end toggle score

muiSwitch()
shortcutSwitch()