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

menuSwitch()
