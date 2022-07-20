# Create a 3D game with Three.js

Create a 3D game with Three.js.

## Start

```
npm i
live-server
```

## TODO

### General

- [ ] prebaciti teren iz MMO u RPG
- [ ] napraviti 2d scenu u 3d, ideja https://codepen.io/davekwiatkowski/pen/pWPVpX
- [ ] napraviti sletanje na mesec 3d
- https://github.com/skolakoda/teorija-razvoja-igara
- [ ] probati storybook https://github.com/jasonsturges/storybook-for-threejs
- [ ] pathfinding https://github.com/NikLever/three-pathfinding
- [ ] pathfinding https://github.com/NikLever/ThreeJS-PathFinding-Examples
- maze generator https://codepen.io/dragonir/pen/XgawQE
- fireball shader https://alteredqualia.com/three/examples/webgl_shader_fireball.html
- city https://alteredqualia.com/three/examples/webgl_city.html
- let kroz svemir https://alteredqualia.com/xg/examples/deferred_particles_nebula.html

Shaders
  - [x] shaders https://youtu.be/C8Cuwq1eqDw
  - [x] shaders https://youtu.be/uwzEqeMd7uQ
  - [ ] The Book of Shaders https://thebookofshaders.com/

Modeli
- [ ] model gleda kursor https://tympanus.net/codrops/2019/10/14/how-to-create-an-interactive-3d-character-with-three-js/
- [ ] model simplifier https://codepen.io/nik-lever/pen/dymoKmz
  i exporter https://threejs.org/examples/misc_exporter_gltf

VOZILA:
- ammo terenska voznja:
  https://alteredqualia.com/xg/examples/animation_physics_terrain.html
  https://alteredqualia.com/xg/examples/animation_physics_level.html
- [ ] spojiti physijs teren + kola

VISINSKE MAPE:
- visinske mape za ceo svet https://tangrams.github.io/heightmapper/#8.3724/43.3401/19.5293
- srediti boje mapa ovako https://elevationmap.net/

Konačni automat
  - [x] nakačiti kachujin na konačni automat
  - [x] dodati kapuera animacije, bez mrdanja igrača
  - [x] ispratiti tutorijal https://r105.threejsfundamentals.org/threejs/lessons/threejs-game.html
  - [ ] uskladiti animacije sa mrdanjem igrača
    - [ ] mrdati igrača napred za neke napade
    - [ ] onemogućiti mrdanje u skoku?

- [x] ažurirati verziju (na 119)
- [x] ažurirati verziju (na 127)
  - [x] fix towers
  - [x] fix and optimize city (merge geometries)
  - [x] fix distort in createWorldSphere (ili napraviti alternativu)
  - [x] fix terrainFromHeightmap
- [ ] ažurirati verziju na poslednju (ukinuli su relativne importe pa puca, koristiti importmap)
  - [ ] probati nakon ažuriranja: https://threejs.org/examples/#webgl_points_nodes

### Geometry

- [x] create a box
- [x] create a lot of boxes
- [x] create other basic shapes
- [x] add texture
- [x] dodati primere drveća u geometriju
- [x] spojiti nature u geometry
- [x] ovcu u primere
- [x] box-bump u pomagala
- [x] oblake u pomagala
- [x] organize geometry utils (barrels, boxes, balls...)
- [x] organize shapes utils (createAirplane, sheep, train...)
- [x] srediti createBox i sve zavisne strukture
- [x] dovesti veličine u razmeru 1px : 1m
- [x] napraviti osnovne geometrije
  - [x] buriće metalne 
  - [x] buriće drvene
  - [x] zgrade sa texturama iz ww2 aseta

### Particles

- [x] napraviti 3D kišu
  - [ ] kiša da prati igraca
- [x] napraviti sneg
  - [x] zastariti Snow, ukloniti iz savo
- [x] probati eksplozije
- [x] odvojiti pomagala za čestice
- [x] implementirati BufferGeometry
  - [x] handle different vertex velocity

### Tilemaps

- [x] napraviti nekoliko *tilemap*-a
  - [x] implementirati algoritam za pravljenje lavirinta
- [x] renderovati mapu u 2d
- [x] renderovati mapu u 3d
  - [x] renderovati mapu sa teksturama
  - [x] dodati parametar za niže zidove
- [x] prikazati polozaj igraca iz 3D mape na 2D mapi
  - [x] da radi i kad je negativno izvorište 3D mape
- [x] spojiti 3D i 2D Tilemap
- [x] reuse randomWalls method

### Terrain (procedural generation, heightmap, textures)

- [x] napraviti tlo
- [x] dodati koliziju na tlo
- [x] proceduralno kreirati okruženje
  - [x] dodati drveće, zgrade
  - [x] dodati sanduke sa teksturom
- [x] prebaciti da tlo bude okruglo (moze samo kad je ravna podloga)
- [x] heightmap
- [x] heightmap with texture
- [x] kreirati stepenice u krug od kocki
- [x] kreirati funkciju similarColor
- [x] upotrebiti hromu u nekom terenu
- [x] odvojiti pomagala za drveće na terenu

### 2D Renderer

- [x] crtati prvo lice
  - [x] crtati nisan u centru ekrana
  - [x] weapon shaking
  - [x] crtati 3d igraca na 2d maloj mapi
- [x] razdvojiti CanvasRenderer klasu na Map2DRenderer i FPSRenderer
- [x] malu mapu iscrtavati samo nakon promene tipki

### Camera

- [x] dodati kameru iz prvog lica (fps)
- [x] dodati kameru odozgo (orbit)
- [x] menjati kamere na taster
- [x] srediti redom kamere po scenama
- [x] da moze da gleda levo-desno i gore-dole i sl. (vidi stairway-to-heaven)

### Player

- [x] dodati igraca
- [x] prikazati polozaj igraca na mapi
- [x] omogućiti 2d kretanje kroz mapu
- [x] omogućiti 3d kretanje kroz mapu
- [x] dodati skakanje
  - [x] srediti skok i padanje
  - [x] srediti penjanje uz stepenice
- [x] dodati kontrole i na strelice
- [x] dodati dugme (m) za otvaranje/zatvaranje mape
- [x] dodati koliziju kako se ne bi prolazilo kroz predmete
  - [x] probati koliziju bacanjem zraka
  - [x] probati koliziju geometrijom
- [x] postaviti lavirint sa kolizijom
- [x] srediti Player handleInput
- [x] spojiti animacije sa pokretom
- [x] ukloniti argument transparent, srediti Savo
- [x] napraviti bolji skok

### 3D Models

- [x] dodati 3d model
- [x] dodati animirani 3d model
  - [x] ucitati fbx zensku iz rpg-a
  - [x] kontrolama menjati animacije (kretanje, trčanje, skok...)
- [x] srediti pufnicu (dodati jos malo geometrije i neku boju, materijal, teksturu...)
  - [x] probati da Avatar bude od lave (vidi shader example)
- [x] odvojiti klase Player i Model
- [x] napraviti izvedene klase koje nasledjuju Model (Dupechesh, Robotko, Girl i sl)
- [x] spojiti klase Avatar i Player
- [x] spojiti klase Player i Model
  - [x] obrisati naslednice
- [x] srediti da se ne ponavlja animacija skakanja
- [x] srediti da se ne ponavljaju jednokratne animacije (napad, specijal, itd) 
- [x] ako je skok blokiran da pada
- [x] da ne korača u skoku kad ide napred
- [x] srediti animacije modela (vidi stairway-girl)
- [x] ubrzati animaciju po potrebi (u odnosu na brzinu, nazad sporije i sl.)
- [x] isprobati nove 3d modele
  - [x] organizovati modele tematski
  - [x] izbaciti nightelf-priest
- [x] ažurirati linkove ka novim modelima
- [x] zameniti modele manjima
- [x] probati fbx animacije
  - [x] izabrati animacije za mixamo modele: Kachujin G Rosales (girl), Arissa, Steve, Maw J Laygo
  - [x] primer tranzicije https://sbcode.net/threejs/fbx-animation/
  - [x] probati animacije i konačni automat https://youtu.be/EkPfhzIbp2g
  - [x] zakačiti fbx animacije na Player

### Physics

- [x] videti threejs catapult projekt
- [x] videti bus-derby
- [x] odvojiti fizička pomagala
- [ ] ujednačiti createTerrain i druga fizička pomagala sa standardnim
- [x] videti nove primere
  - [x] lomi materijale https://threejs.org/examples/?q=physics#physics_ammo_break
- [-] domine: da manja obara veću
- [ ] Razaranje zamka topom (možda može i model)
  - [ ] dodati proceduralni zamak (vidi zamak-fizika, gradjevina-physijs)
  - [ ] dodati top (ima model)
  - [ ] top puca i rusi zidine (vidi ball-trowing)
    https://rawgit.com/mmmovania/Physijs_Tutorials/master/Shooting.html
- [ ] Steampunk vozilo
  - [ ] dodati fiziku na steam tenk ili lokomotivu (vidi vozilo-physijs)
  - [ ] da gazi i gura prepreke
- mozda korisno za ball-throwing-physijs https://codepen.io/tjoen/pen/BKxZMQ

### AI

- [x] probati ai https://github.com/erosmarcon/three-steer
- [ ] odvojiti ai pomagala
- [ ] postaviti ai scenu sa modelima

### Scenes & examples

- [x] Savo (fps)
  - [x] dodati kišu
  - [x] srediti boju kiše
  - [x] srediti skok: pada kada udari u zid, pada ravno naniže kad pusti space
  - [ ] dodati NPC karaktere (vidi 80-primeri/80-nemesis)
    - https://www.script-tutorials.com/demos/474/index3.html
  - [ ] dodati neke modele vozila i kuca
  - [ ] dodati tenk kako prolazi
  - [ ] dodati munje https://threejs.org/examples/?q=light#webgl_lightningstrike
  - [ ] dodati pucanje
  - [ ] integrisati fps i nemesis

- [ ] Nemesis
  - [x] dodati igrača
  - [x] probati utils/player u nemesis
  - [ ] srediti koliziju
  - [ ] dodati ai modele

- [ ] FPS
  - [x] dodati nišan iz savo na fps primer

- [ ] Svemir 
  - [ ] dodati model ring space-arcology
  - [ ] dodati zvezdani svod
  - [ ] bolja distribucija zvezda (perlin noise)
  - [ ] probati letenje kroz zvezde
  - [ ] sletanje na platformu (naći 2d primer)
    - [ ] sletanje na mesec (textured moon)
  - [ ] dodati proceduralnu planetu http://colordodge.com/ProceduralPlanet/?seed=Ridi%20Genow

- [x] Avion leti
  - [x] dodati suncevu svetlost (https://threejs.org/examples/webgl_lights_hemisphere.html)
  - [x] dodati senku i maglu (vidi 3d-warplane)
  - [x] dodati sunce
  - [x] srediti komande: skretanje, spuštanje, dizanje, brzinu
  - [-] dodati oblake (teško)
  - [x] dodati drveće

- [x] Zepelin leti
  - [x] dodati raycast
  - [x] dodati teren-dinamicki
  - [x] probati raycast za teren-dinamicki (ne mere)
  - [x] automatski podizati ako je preblizu zemlje
  - [x] srediti sletanje
  - [x] prikazati komande
  - [x] probati pticu
  - [x] cepelin da prvo poleti pa ubrza (avion prvo ubrza pa poleti)

- [ ] Grad
  - [x] srediti grad
  - [x] promeniti boju krova
  - [x] srediti grad-prozori
  - [x] optimizovati grad-prozori
  - [x] srediti uličnu rasvetu
  - [x] srediti rotaciju spojenih zgrada
  - [x] ostaviti prostor za park ili trg u centru grada (logika za krug i kvadrat)
  - [ ] dodati park ili trg u centru
  - [ ] dodati drveće, za zeleni grad
  - [ ] ubaciti prvo lice u scenu

- [ ] Fantasy scena
  - [ ] dodati modele (vidi rad-sa-modelima)
  - [ ] cepelin u vazduhu (vinci aerial screw, santos dumont airship)
  - [ ] karakter dolazi do kuće i ulazi (vidi 50-rad-sa-modelima/35-kuca-unutrasnost)
  - [ ] uzima predmete (50-rad-sa-modelima/80-uzimanje-predmeta/)
  - [ ] oblaci, životinje, zamak (vidi 80-primeri/90-simulacija-sveta)

- [ ] 1943
  - [x] integrisati u projekat
  - [x] srediti model aviona
  - [ ] dodati izbor aviona
  - [ ] dodati drveće
  - [ ] dodati objekte
  - [x] pomeriti u scene
  - [x] move 1943 ground to helpers

- [ ] Endless runner
  - [x] prikazivati poene
  - [ ] probati konja ili dabra

- [x] Solar system
  - [x] ubaciti planete sa teksturom
  - [x] napraviti sunce sa teksturom

### Ostalo

- [x] isprobati lagani prelaz (lerp ili tween.js)
- [ ] dodati UI komande redom
- [ ] popraviti HTML margine
- [ ] optimizacija 
  - https://twitter.com/mrdoob/status/966609115140128768
  - https://attackingpixels.com/tips-tricks-optimizing-three-js-performance/
- [ ] probati VR
  - https://threejs.org/docs/#manual/en/introduction/How-to-create-VR-content
  - https://ski-mountain-vr.herokuapp.com/
- [ ] dodati preloader (ima u 3D-RPG-Game-With-THREE.js)
- [x] naci vismapu sutjeske
- [x] dodati lavu (dodato na lava-avatar)

## Documentation

Raycaster arrow helper:

```
scene.add(new THREE.ArrowHelper(raycaster.ray.direction, raycaster.ray.origin, 300))
```

Axes helper:

```
scene.add(new THREE.AxesHelper(50))
```

All libraries in `/libs` folder are updated manually to support ES6 export.

Prevent OrbitControls bellow ground:

```
controls.maxPolarAngle = Math.PI / 2 - 0.1
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
- free textures with normalMaps https://opengameart.org/content/50-free-textures-4-normalmaps