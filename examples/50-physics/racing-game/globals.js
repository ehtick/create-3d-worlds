function loadingText() {
  document.write('<div id="loadiv" style="padding:20px;color:black;font-size:40px;font-family:monospace;font-weight:bold;;">Loading...<span style="font-size:20px;color:#ffe764;">(about 10MB)</span></div>')
}
loadingText()

function el(a) {
  return document.getElementById(a)
}
function da(a, b) {
  if (el(a)) el(a).innerHTML = b
}
function elv(a) {
  return document.getElementById(a).value
}
function els(a) {
  return document.getElementById(a).style
}
function fixAngleDeg(a) {
  if (a > 180) a -= 360; else if (a < -Math.PI / 2) a += 360; return a
}
function fixAngleRad(a) {
  if (a > Math.PI) a -= Math.PI * 2; else if (a < -Math.PI) a += Math.PI * 2; return a
}

const heightLimit = 1
const widthLimit = 1
const SCREEN_HEIGHT = window.innerHeight * heightLimit
const SCREEN_WIDTH = window.innerWidth * widthLimit
