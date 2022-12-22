# Create 3D worlds

Create 3D worlds with Three.js.

## Start

```
npm i
npx live-server
```

### Physics
- da kamera ne gleda ispod terena
vozilo:
  - reuse AmmoWorld i ostalo, delete dupes
  - dodati fiziku na steam tenk ili lokomotivu
  - da gazi i gura prepreke
- isprobati dodavanje sile na kuglu: applyForce, applyImpulse or setLinearVelocity
  https://medium.com/@bluemagnificent/moving-objects-in-javascript-3d-physics-using-ammo-js-and-three-js-6e39eff6d9e5
- napraviti sletanje na mesec 3d
- dodati fiziku u vučenje kocki

### Scenes & examples
- mojsije otvara more

- probati dim čestice na lokomotivu, voz da prati putanju

- [ ] Savo / Nemesis / FPS
  - srediti koliziju
  - dodati NPC karaktere (vidi nemesis i ai modele)
    - https://www.script-tutorials.com/demos/474/index3.html
  - dodati neke modele vozila i kuca
  - dodati tenk kako prolazi
  - dodati munje https://threejs.org/examples/?q=light#webgl_lightningstrike
  - dodati pucanje
  - integrisati fps i nemesis
  - kiša da prati igraca

- Svemir 
  - dodati model ring space-arcology
  - dodati zvezdani svod
  - bolja distribucija zvezda (perlin noise)
  - probati letenje kroz zvezde
  - sletanje na platformu (naći 2d primer)
    - sletanje na mesec (textured moon)
  - dodati proceduralnu planetu http://colordodge.com/ProceduralPlanet/?seed=Ridi%20Genow
  - mozda iskoristiti astronauta da luta po planeti https://codepen.io/b29/pen/LoaRKx

- Grad
  - dodati park ili trg u centru
  - dodati drveće, za zeleni grad
  - ubaciti prvo lice u scenu
  - neki random primer https://thatfrenchgamedev.com/citydemo.html#

- Fantasy scena
  - dodati modele (vidi rad-sa-modelima)
  - cepelin u vazduhu (vinci aerial screw, santos dumont airship)
  - karakter dolazi do kuće i ulazi (vidi 50-rad-sa-modelima/35-kuca-unutrasnost)
  - uzima predmete (50-rad-sa-modelima/80-uzimanje-predmeta/)
  - oblaci, životinje, zamak (vidi 80-primeri/90-simulacija-sveta)

- 1943
  - dodati izbor aviona
  - dodati drveće
  - dodati objekte

Tenk (Vozilo)
- tenk da se trese kada ide
- vozilo da se okreću točkovi kada ide
- ispitati modele, jel moguće upravljati točkovima, kupolom ili nečim

- Endless runner
  - probati konja ili dabra

- Partizani
  - napraviti 2d scenu u 3d, ideja https://codepen.io/davekwiatkowski/pen/pWPVpX

### Polishing

- dodati UI komande redom
- popraviti HTML margine
- optimizacija 
  - https://twitter.com/mrdoob/status/966609115140128768
  - https://attackingpixels.com/tips-tricks-optimizing-three-js-performance/
- probati VR
  - https://threejs.org/docs/#manual/en/introduction/How-to-create-VR-content
  - https://ski-mountain-vr.herokuapp.com/
- dodati preloader (ima u 3D-RPG-Game-With-THREE.js)

## Helpers

Raycaster helper:

```
scene.add(new THREE.ArrowHelper(raycaster.ray.direction, raycaster.ray.origin, 300))
```

Box helper:

```
const box = new THREE.BoxHelper(mesh, 0xffff00)
scene.add(box)
```

Axes helper (X axis is red, Y is green, Z is blue):

```
scene.add(new THREE.AxesHelper(50))
```

Ako je teren jednobojan, bez svetla, uraditi:

```
geometry.computeVertexNormals()
```

## Documentation

All libraries in `/libs` folder are updated manually to support ES6 export.

### OrbitControls

Prevent OrbitControls bellow ground:

```
controls.maxPolarAngle = Math.PI / 2 - 0.1
```

### updateMatrix

https://stackoverflow.com/questions/27022160/three-js-can-i-apply-position-rotation-and-scale-to-the-geometry

Default order of transform: scale, rotate, translate (Three.js ignores order in code?)

If we want to apply multiple transform:

```
gameObj.matrix = new THREE.Matrix4(....) // with params
gameObj.matrixAutoUpdate = false // don't use internal transform system
```

### Ammo Physics

Some methods:

```js
body.setFriction(.9)
body.setRestitution(.95)
body.setAngularVelocity( btVector3 )
body.setLinearVelocity( btVector3 )
body.applyForce()
body.applyImpulse()
```

Jump:
```js
const impulse = new Ammo.btVector3(0, mass * .5, 0)
this.chassisBody.applyCentralImpulse(impulse)
```

## Sources

Examples are from theese great books and tutorials:

* 3D Game Programming for Kids (Chris Strom)
* [Interactive 3D Graphics](https://in.udacity.com/course/interactive-3d-graphics--cs291/) (Eric Haines)
* [Three.js tutorials by example](http://stemkoski.github.io/Three.js/) (Lee Stemkoski)
* [WebGL and Three.js Fundamentals](https://github.com/alexmackey/threeJsBasicExamples) (Alex Mackey)
* [Examples created by Yomotsu using THREE.js](http://yomotsu.github.io/threejs-examples/) (Akihiro Oyamada)
* [Learning Threejs](https://github.com/josdirksen/learning-threejs) (Jos Dirksen)
* [Essential Three.js](https://github.com/josdirksen/essential-threejs) (Jos Dirksen)
* [Three.js Cookbook](https://github.com/josdirksen/threejs-cookbook) (Jos Dirksen)
* [How to Design 3D Games with Web Technology - Book 01: Three. Js - HTML5 and WebGL](https://thefiveplanets.org/b01/) (Jordi Josa)

Free 3D Models are from: 
- 3dwarehouse.sketchup.com
- sketchfab.com
- turbosquid.com 
- mixamo.com
- archive3d.net
- rigmodels.com
and other respected sites.

Geodata:
- visinske mape za ceo svet https://tangrams.github.io/heightmapper/#8.3724/43.3401/19.5293
- weighted random https://pixelero.wordpress.com/2008/04/24/various-functions-and-various-distributions-with-mathrandom/
