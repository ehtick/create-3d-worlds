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
