// http://jsfiddle.net/0couqp27/9/

window.onload = function() {
  const canvas = document.getElementById('c')
  const ctx = canvas.getContext('2d')

  ctx.font = '48px Lobster'
  ctx.fillStyle = 'teal'
  ctx.textBaseline = 'top'
  ctx.fillText('This is the Lobster font', 0, 10)
}
