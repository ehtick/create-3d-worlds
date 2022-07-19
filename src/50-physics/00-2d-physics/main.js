/* eslint-disable no-use-before-define */
// https://gamedevelopment.tutsplus.com/tutorials/when-worlds-collide-simulating-circle-circle-collisions--gamedev-769
// import { ctx, canvas } from '../core/io/canvas.js'
import Canvas from '/classes/2d/Canvas.js'

const canvas = new Canvas()
const { ctx } = canvas

let then = Date.now()

class Vektor {
  constructor(x, y, z = 0) {
    this.x = x
    this.y = y
    this.z = z
  }

  stop() {
    this.x = 0
    this.y = 0
    this.z = 0
  }

  dodaj(vektor) {
    this.x += vektor.x
    this.y += vektor.y
    this.z += vektor.z
  }

  skaliraj(skalar) {
    this.x *= skalar
    this.y *= skalar
    this.z *= skalar
  }

  primeniOtpor(procenat) {
    this.skaliraj(1 - procenat)
  }
}

function skaliraj(vektor, skalar) {
  return {
    x: vektor.x * skalar,
    y: vektor.y * skalar,
    z: vektor.z * skalar
  }
}

class Krug {
  /*
  * param polozaj: Vektor object
  */
  constructor(r, polozaj) {
    this.oblik = 'krug'
    this.r = r
    this.centar = polozaj
    this.dubina = 10
  }

  get povrsina() {
    return Math.PI * this.r * this.r
  }

  get zapremina() {
    return this.povrsina * this.dubina
  }

  render(x = this.centar.x, y = this.centar.y, r = this.r) {
    ctx.beginPath()
    ctx.arc(x, y, r, 0, 2 * Math.PI)
    ctx.fill()
  }
}

/*
* Predmet podrazumevano ima oblik Kruga
*/
class Predmet {
  constructor(visina = 100, x = Math.random() * canvas.width, y = Math.random() * 100) {
    this.visina = visina
    this.polaVisine = visina / 2
    this.polozaj = new Vektor(x, y)
    this.oblik = new Krug(this.visina / 2, this.polozaj)
    this.fizika = true
    this.gustina = 700
    this.zapremina = this.oblik.zapremina
    this.sila = new Vektor(0, 0, 0)
    this.ubrzanje = new Vektor(0, 0)
    this.brzina = new Vektor(0, 0)
    this.trenjeS = 0.74
    this.trenjeK = 0.57
    this.odskocivost = 0.7
  }

  get masa() {
    return this.gustina * this.zapremina
  }

  get trenje() {
    return this.brzina.x === 0 ? this.trenjeS : this.trenjeK
  }

  render() {
    this.oblik.render()
  }
}

class Scena {
  constructor() {
    this.predmeti = []
    this.tlo = canvas.height
    this.vetar = new Vektor(1, 0)
    this.vuca = 0.001
    this.loopID = null
  }

  add(...premeti) {
    this.predmeti.push(...premeti)
  }

  /* GAME LOGIC */

  integracija(predmet, dt) {
    predmet.sila.dodaj(this.vetar)
    predmet.sila.dodaj(gravitacija)
    predmet.sila.primeniOtpor(this.diraTlo(predmet) ? predmet.trenje : this.vuca)

    predmet.ubrzanje = skaliraj(predmet.sila, 1 / predmet.masa)
    predmet.brzina.dodaj(skaliraj(predmet.ubrzanje, dt))
    predmet.polozaj.dodaj(skaliraj(predmet.brzina, dt))
  }

  proveriTlo(predmet) {
    if (!this.diraTlo(predmet)) return
    this.sudarniOdgovor(predmet)
  }

  diraTlo(predmet) {
    return predmet.polozaj.y + predmet.polaVisine >= this.tlo
  }

  sudarniOdgovor(predmet) {
    predmet.polozaj.y = this.tlo - predmet.polaVisine
    predmet.brzina.y *= -1
    predmet.brzina.y *= predmet.odskocivost
  }

  /* PETLJA */

  update(dt) {
    this.predmeti.map(predmet => {
      if (!predmet.fizika) return
      this.integracija(predmet, dt)
      this.proveriTlo(predmet)
    })
  }

  loop() {
    this.loopID = window.requestAnimationFrame(this.loop.bind(this))
    const now = Date.now()
    const delta = now - then
    this.update(delta)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    this.render()
    then = now
  }

  start() {
    if (this.loopID) return
    this.loop()
  }

  stop() {
    if (!this.loopID) return
    window.cancelAnimationFrame(this.loopID)
    this.loopID = null
  }

  /* RENDER */

  render() {
    this.predmeti.map(predmet => predmet.render())
  }
}

/* INIT */

const gravitacija = new Vektor(0, 98)

const krug1 = new Predmet(100)
const krug2 = new Predmet(80)
const krug3 = new Predmet(120)

const predmeti = []
predmeti.push(krug1, krug2, krug3)

const scena = new Scena()
scena.add(krug1, krug2, krug3)
scena.start()
