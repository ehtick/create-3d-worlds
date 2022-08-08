# Create a 3D game with Three.js

Create a 3D game with Three.js.

## Start

```
npm i
npx live-server
```

## TODO

- prebaciti teren iz MMO u RPG

Shaders
  - The Book of Shaders https://thebookofshaders.com/

Modeli
- model gleda kursor https://tympanus.net/codrops/2019/10/14/how-to-create-an-interactive-3d-character-with-three-js/

VOZILA:
- ammo terenska voznja:
  https://alteredqualia.com/xg/examples/animation_physics_terrain.html
  https://alteredqualia.com/xg/examples/animation_physics_level.html
- spojiti physijs teren + kola

VISINSKE MAPE:
- visinske mape za ceo svet https://tangrams.github.io/heightmapper/#8.3724/43.3401/19.5293
- srediti boje mapa ovako https://elevationmap.net/

Konačni automat
- uskladiti animacije sa mrdanjem igrača
  - mrdati igrača napred za neke napade
  - onemogućiti mrdanje u skoku?

- ažurirati verziju na poslednju (ukinuli su relativne importe pa puca, koristiti importmap)
  - probati nakon ažuriranja: https://threejs.org/examples/#webgl_points_nodes

Čišćenje smeća:
- modeli i ostalo iz simon-dev primera
- assets/textures/terrain

### Particles

- kiša da prati igraca

### Physics

- ujednačiti createTerrain i druga fizička pomagala sa standardnim
- Razaranje zamka topom (možda može i model)
  - dodati proceduralni zamak (vidi zamak-fizika, gradjevina-physijs)
  - dodati top (ima model)
  - top puca i rusi zidine (vidi ball-trowing)
    https://rawgit.com/mmmovania/Physijs_Tutorials/master/Shooting.html
- Steampunk vozilo
  - dodati fiziku na steam tenk ili lokomotivu (vidi vozilo-physijs)
  - da gazi i gura prepreke
- mozda korisno za ball-throwing-physijs https://codepen.io/tjoen/pen/BKxZMQ
- napraviti sletanje na mesec 3d
- dodati fiziku u vučenje kocki

### AI

- odvojiti ai pomagala
- postaviti ai scenu sa modelima

### Scenes & examples

- [ ] Savo / FPS
  - dodati NPC karaktere (vidi 80-primeri/80-nemesis)
    - https://www.script-tutorials.com/demos/474/index3.html
  - dodati neke modele vozila i kuca
  - dodati tenk kako prolazi
  - dodati munje https://threejs.org/examples/?q=light#webgl_lightningstrike
  - dodati pucanje
  - integrisati fps i nemesis

- Nemesis / FPS
  - srediti koliziju
  - dodati ai modele

- Svemir 
  - dodati model ring space-arcology
  - dodati zvezdani svod
  - bolja distribucija zvezda (perlin noise)
  - probati letenje kroz zvezde
  - sletanje na platformu (naći 2d primer)
    - sletanje na mesec (textured moon)
  - dodati proceduralnu planetu http://colordodge.com/ProceduralPlanet/?seed=Ridi%20Genow

- Grad
  - dodati park ili trg u centru
  - dodati drveće, za zeleni grad
  - ubaciti prvo lice u scenu

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

- Endless runner
  - probati konja ili dabra

- Partizani
  - napraviti 2d scenu u 3d, ideja https://codepen.io/davekwiatkowski/pen/pWPVpX

### Ostalo

- dodati UI komande redom
- popraviti HTML margine
- optimizacija 
  - https://twitter.com/mrdoob/status/966609115140128768
  - https://attackingpixels.com/tips-tricks-optimizing-three-js-performance/
- probati VR
  - https://threejs.org/docs/#manual/en/introduction/How-to-create-VR-content
  - https://ski-mountain-vr.herokuapp.com/
- dodati preloader (ima u 3D-RPG-Game-With-THREE.js)

## Documentation

Raycaster arrow helper:

```
scene.add(new THREE.ArrowHelper(raycaster.ray.direction, raycaster.ray.origin, 300))
```

Axes helper (X axis is red, Y is green, Z is blue):

```
scene.add(new THREE.AxesHelper(50))
```

All libraries in `/libs` folder are updated manually to support ES6 export.

Prevent OrbitControls bellow ground:

```
controls.maxPolarAngle = Math.PI / 2 - 0.1
```

updateMatrix:
https://stackoverflow.com/questions/27022160/three-js-can-i-apply-position-rotation-and-scale-to-the-geometry

Default order of transform: scale, rotate, translate (Three.js ignores order in code?)

If we want to apply multiple transform:

```
gameObj.matrix = new THREE.Matrix4(....) // with params
gameObj.matrixAutoUpdate = false // don't use internal transform system
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

Free 3D Models are from 3dwarehouse.sketchup.com, sketchfab.com, mixamo.com, archive3d.net, turbosquid.com and other respected sites.

Textures
- Geometry airplane: https://classroom.udacity.com/courses/cs291/lessons/a06bfa94-60e2-403e-ab13-8e55009120b6/concepts/9408e461-2c9b-4cbb-a825-827051f5ed98