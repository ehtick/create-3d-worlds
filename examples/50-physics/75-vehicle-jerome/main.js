
startUpTHREEjs(window, {
  // stats : false,
  cameraControls: false
}, demo => {

  // ////////////////////////////////////////////////////////////////////////////
  //                Code Separator
  // ////////////////////////////////////////////////////////////////////////////

  const cameraControls = new THREEx.AmmoVehicleControls(camera)
  onRenderFcts.push(() => {
    cameraControls.update(ammoVehicle)
  })

  // //////////////////////////////////////////////////////////////////////////////
  //          Code Separator
  // //////////////////////////////////////////////////////////////////////////////

  const ammoWorld = new THREEx.AmmoWorld()
  onRenderFcts.push(() => {
    ammoWorld.update()
  })

  // ////////////////////////////////////////////////////////////////////////////////
  //		set 3 point lighting						//
  // ////////////////////////////////////////////////////////////////////////////////

  ;(function() {
    // add a ambient light
    var light	= new THREE.AmbientLight(0x202020)
    // var light	= new THREE.HemisphereLight(0.2)
    scene.add(light)
    // add a light in front
    var light	= new THREE.DirectionalLight('white', 0.5)
    light.position.set(0.2, 0.5, -2)
    scene.add(light)
  })()

  ;(function() {
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8)
    dirLight.position.set(-15, 10, 15).setLength(60)
    dirLight.castShadow = true
    dirLight.shadow.bias = -0.003
    dirLight.shadow.bias = 0.001
    dirLight.shadow.camera.near = 1
    dirLight.shadow.camera.far = 200
    dirLight.shadow.camera.right = 25 * 3
    dirLight.shadow.camera.left = - 25 * 3
    dirLight.shadow.camera.top	= 25
    dirLight.shadow.camera.bottom = - 25
    dirLight.shadow.mapSize.x = 512
    dirLight.shadow.mapSize.y = 512
    scene.add(dirLight)

    // scene.add( new THREE.CameraHelper( dirLight.shadow.camera ) );
  })()

  // ////////////////////////////////////////////////////////////////////////////
  //                add vehicule
  // ////////////////////////////////////////////////////////////////////////////

  // vehicule
  const position = new THREE.Vector3(0, 5, 0)
  const quaternion = new THREE.Quaternion(0, 0, 0, 1).setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI)
  var ammoVehicle = new THREEx.AmmoVehicle(ammoWorld.physicsWorld, position, quaternion)
  onRenderFcts.push(() => {
    if (isGamepadConnected === true)
      ammoVehicle.updateGamepad(vehicleGamepadActions)
    else
      ammoVehicle.updateKeyboard(vehicleKeyboardActions)

  })
  scene.add(ammoVehicle.object3d)

  // Enable to basic look
  // var meshes = buildVehicleSkinBasic(ammoVehicle.parameters)
  // applyMeshesToVehicle(ammoVehicle, meshes)

  // Enable to veyron look
  buildVehicleSkinVeyron(ammoVehicle.parameters, meshes => {
    applyMeshesToVehicle(ammoVehicle, meshes)
  })

  function applyMeshesToVehicle(ammoVehicle, meshes) {
    var container = ammoVehicle.object3d.getObjectByName('chassis')
    container.add(meshes.chassis)
    for (let i = 0; i < 4; i++) {
      var container = ammoVehicle.object3d.getObjectByName('wheel_' + i)
      container.add(meshes.wheels[i])
    }
  }

  // ////////////////////////////////////////////////////////////////////////////
  //                handle keyboard
  // ////////////////////////////////////////////////////////////////////////////
  var vehicleKeyboardActions = {
    'acceleration': false,
    'braking': false,
    'left': false,
    'right': false,
    'jump': false,
  }

  const keysActions = {
    'w': 'acceleration', 'ArrowUp': 'acceleration', 'i': 'acceleration',
    's': 'braking', 'ArrowDown': 'braking', 'k': 'braking',
    'a': 'left', 'ArrowLeft': 'left', 'j': 'left',
    'd': 'right', 'ArrowRight': 'right', 'l': 'right',
    ' ': 'jump'
  }

  window.addEventListener('keydown', event => {
    if (keysActions[event.key] === undefined) return
    vehicleKeyboardActions[keysActions[event.key]] = true
    event.preventDefault()
    event.stopPropagation()
  })
  window.addEventListener('keyup', event => {
    if (keysActions[event.key] === undefined) return
    vehicleKeyboardActions[keysActions[event.key]] = false
    event.preventDefault()
    event.stopPropagation()
  })

  // ////////////////////////////////////////////////////////////////////////////
  //		Gamepad prototype
  // ////////////////////////////////////////////////////////////////////////////

  if (navigator.getGamepads) {
    //     gamepads = navigator.getGamepads();
  } else if (navigator.webkitGetGamepads)
    navigator.getGamepads = navigator.webkitGetGamepads
  else
    navigator.getGamepads = function() {
      return []
    }

  var vehicleGamepadActions = {
    'acceleration': 0,
    'steering': 0,
    'breaking': 0,
    'jump': false,
  }
  // isGamepadConnected = true and use it in the loop to know how to update the vehicle
  var isGamepadConnected = false
  // if ( navigator.getGamepads()[0] !== undefined ) isGamepadConnected = true;

  window.addEventListener('gamepadconnected', event => {
    console.log('Gamepad connected at index %d: %s. %d buttons, %d axes.', event.gamepad.index, event.gamepad.id,
      event.gamepad.buttons.length, event.gamepad.axes.length)
  // isGamepadConnected = true
  })

  window.addEventListener('gamepaddisconnected', e => {
    consolevent.log('Gamepad disconnected from index %d: %s', event.gamepad.index, event.gamepad.id)
  // isGamepadConnected = false
  })

  onRenderFcts.push((function() {
    let button1WasPressed = false
    return function() {
      if (navigator.getGamepads()[0] === undefined) return

      const gamepads = navigator.getGamepads()
      const gamepad = gamepads[0]
      if (gamepad === undefined) 	return
      // for a xbox 360 wired..
      vehicleGamepadActions.steering = -gamepad.axes[0]
      vehicleGamepadActions.acceleration = gamepad.buttons[7].value
      vehicleGamepadActions.breaking = gamepad.buttons[6].value

      // handle button1 with no repeat
      if (button1WasPressed === false && gamepad.buttons[1].pressed === true) {
        vehicleGamepadActions.jump = true
        button1WasPressed = true
      }
      if (button1WasPressed === true && gamepad.buttons[1].pressed === false)
        button1WasPressed = false

    }
  })())

  // ////////////////////////////////////////////////////////////////////////////
  //                update speedometer
  // ////////////////////////////////////////////////////////////////////////////

  const speedometer = document.getElementById('speedometer')
  onRenderFcts.push(() => {
    const speed = ammoVehicle.vehicle.getCurrentSpeedKmHour()

    speedometer.innerHTML = (speed < 0 ? '(R) ' : '') + Math.abs(speed).toFixed(1) + ' km/h'
  })

  // //////////////////////////////////////////////////////////////////////////////
  //          display tremplin
  // //////////////////////////////////////////////////////////////////////////////

  ;(function() {
    // return
    const geometry = new THREE.BoxGeometry(8, 4, 15)
    const material = new THREE.MeshPhongMaterial({
      map: new THREE.TextureLoader().load('textures/grid.png', texture => {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping
        texture.repeat.set(geometry.parameters.width, geometry.parameters.depth)
        texture.anisotropy = renderer.getMaxAnisotropy()
      })
    })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.x = -10
    mesh.position.y = -mesh.geometry.parameters.height / 2 + 1.5
    mesh.position.z = 20
    mesh.receiveShadow = true
    scene.add(mesh)
    mesh.name = 'tremplin'

    const quaternion = new THREE.Quaternion(0, 0, 0, 1)
    quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 15)
    mesh.quaternion.copy(quaternion)

    const ammoControls = new THREEx.AmmoControls(mesh, {
      mass: 0
    })
    ammoWorld.add(ammoControls)
  })()

  // ////////////////////////////////////////////////////////////////////////////
  //                Code Separator
  // ////////////////////////////////////////////////////////////////////////////
  ;(function() {
    // return
    const mesh = THREEx.SportBalls.createFootball()
    mesh.scale.multiplyScalar(2)
    mesh.position.y = 5
    mesh.position.z = -20

    mesh.castShadow = true
    mesh.receiveShadow = true

    mesh.quaternion.set(Math.random(), Math.random(), Math.random(), 1).normalize()

    scene.add(mesh)

    const ammoControls = new THREEx.AmmoControls(mesh, {
      mass: 30
    })
    ammoControls.setFriction(0.9)
    ammoControls.setRestitution(0.95)
    ammoWorld.add(ammoControls)
  })()

  // //////////////////////////////////////////////////////////////////////////////
  //          Pile of crate
  // //////////////////////////////////////////////////////////////////////////////
  ;(function() {
    return
    const geometry = new THREE.BoxGeometry(0.75, 0.75, 0.75)
    const material = new THREE.MeshPhongMaterial({
    })
    const model = new THREE.Mesh(geometry, material)
    model.castShadow = true
    model.receiveShadow = true

    const size = new THREE.Vector3().set(8, 6, 1)
    buildCratesPile(size)

    return

    function buildCratesPile(nCubes) {
      for (let x = 0; x < nCubes.x; x++)
        for (let y = 0; y < nCubes.y; y++)
          for (let z = 0; z < nCubes.z; z++) {
            const mesh = model.clone()

            mesh.position.x = (x - nCubes.x / 2 + 0.5) * mesh.scale.x * geometry.parameters.width
            mesh.position.y = (y - nCubes.y / 2 + 0.5) * mesh.scale.y * geometry.parameters.height
            mesh.position.z = (z - nCubes.z / 2 + 0.5) * mesh.scale.z * geometry.parameters.depth

            mesh.position.y += nCubes.y / 2 * mesh.scale.y * geometry.parameters.height
            mesh.position.z += 6
            scene.add(mesh)

            const ammoControls = new THREEx.AmmoControls(mesh)
            ammoWorld.add(ammoControls)
          }

    }
  })()

  // ////////////////////////////////////////////////////////////////////////////
  //                Code Separator
  // ////////////////////////////////////////////////////////////////////////////
  function buildVehicleSkinBasic(opt) {
    const meshes = {
      chassis: null,
      wheels: []
    }

    // build chassis
    const geometry = new THREE.BoxGeometry(opt.chassisWidth, opt.chassisHeight, opt.chassisLength, 1, 1, 1)
    const material = new THREE.MeshPhongMaterial()
    const mesh = new THREE.Mesh(geometry, material)
    mesh.castShadow = true
    mesh.receiveShadow = true
    meshes.chassis = mesh

    // build wheels
    meshes.wheels.push(buildWheel(opt.wheelRadiusFront, opt.wheelWidthFront, 0))
    meshes.wheels.push(buildWheel(opt.wheelRadiusFront, opt.wheelWidthFront, 1))
    meshes.wheels.push(buildWheel(opt.wheelRadiusBack, opt.wheelWidthBack, 2))
    meshes.wheels.push(buildWheel(opt.wheelRadiusBack, opt.wheelWidthBack, 3))

    return meshes

    function buildWheel(radius, width, index) {
      var geometry = new THREE.CylinderGeometry(radius, radius, width, 24, 1)
      geometry.rotateZ(Math.PI / 2)
      var material = new THREE.MeshPhongMaterial()
      const mesh = new THREE.Mesh(geometry, material)
      mesh.castShadow = true

      var geometry = new THREE.BoxGeometry(width * 1.5, radius * 1.75, radius * .25, 1, 1, 1)
      var material = new THREE.MeshPhongMaterial()
      const boxMesh = new THREE.Mesh(geometry, material)
      mesh.add(boxMesh)

      return mesh
    }
  }

  // ////////////////////////////////////////////////////////////////////////////
  //                Code Separator
  // ////////////////////////////////////////////////////////////////////////////

  function buildVehicleSkinVeyron(opt, onReady) {
    const meshes = {
      chassis: null,
      wheels: []
    }

    const textureCube = new THREE.CubeTextureLoader()
      .setPath('textures/')
      .load(['posx.jpg', 'negx.jpg', 'posy.jpg', 'negy.jpg', 'posz.jpg', 'negz.jpg'])
    const s = 0.02

    const mlib = {

      'Orange': new THREE.MeshLambertMaterial({ color: 0xff6600, envMap: textureCube, combine: THREE.MixOperation, reflectivity: 0.3 }),
      'Blue': new THREE.MeshLambertMaterial({ color: 0x001133, envMap: textureCube, combine: THREE.MixOperation, reflectivity: 0.3 }),
      'Red': new THREE.MeshLambertMaterial({ color: 0x660000, envMap: textureCube, combine: THREE.MixOperation, reflectivity: 0.25 }),
      'Black': new THREE.MeshLambertMaterial({ color: 0x000000, envMap: textureCube, combine: THREE.MixOperation, reflectivity: 0.15 }),
      'White':	new THREE.MeshLambertMaterial({ color: 0xffffff, envMap: textureCube, combine: THREE.MixOperation, reflectivity: 0.25 }),

      'Carmine': new THREE.MeshPhongMaterial({ color: 0x770000, specular: 0xffaaaa, envMap: textureCube, combine: THREE.MultiplyOperation }),
      'Gold': new THREE.MeshPhongMaterial({ color: 0xaa9944, specular: 0xbbaa99, shininess: 50, envMap: textureCube, combine: THREE.MultiplyOperation }),
      'Bronze':	new THREE.MeshPhongMaterial({ color: 0x150505, specular: 0xee6600, shininess: 10, envMap: textureCube, combine: THREE.MixOperation, reflectivity: 0.25 }),
      'Chrome': new THREE.MeshPhongMaterial({ color: 0xffffff, specular: 0xffffff, envMap: textureCube, combine: THREE.MultiplyOperation }),

      'Orange metal': new THREE.MeshLambertMaterial({ color: 0xff6600, envMap: textureCube, combine: THREE.MultiplyOperation }),
      'Blue metal': new THREE.MeshLambertMaterial({ color: 0x001133, envMap: textureCube, combine: THREE.MultiplyOperation }),
      'Red metal': new THREE.MeshLambertMaterial({ color: 0x770000, envMap: textureCube, combine: THREE.MultiplyOperation }),
      'Green metal': new THREE.MeshLambertMaterial({ color: 0x007711, envMap: textureCube, combine: THREE.MultiplyOperation }),
      'Black metal':	new THREE.MeshLambertMaterial({ color: 0x222222, envMap: textureCube, combine: THREE.MultiplyOperation }),

      'Pure chrome': new THREE.MeshLambertMaterial({ color: 0xffffff, envMap: textureCube }),
      'Dark chrome':	new THREE.MeshLambertMaterial({ color: 0x444444, envMap: textureCube }),
      'Darker chrome': new THREE.MeshLambertMaterial({ color: 0x222222, envMap: textureCube }),

      'Black glass': new THREE.MeshLambertMaterial({ color: 0x101016, envMap: textureCube, opacity: 0.975, transparent: true }),
      'Dark glass':	new THREE.MeshLambertMaterial({ color: 0x101046, envMap: textureCube, opacity: 0.25, transparent: true }),
      'Blue glass':	new THREE.MeshLambertMaterial({ color: 0x668899, envMap: textureCube, opacity: 0.75, transparent: true }),
      'Light glass':	new THREE.MeshBasicMaterial({ color: 0x223344, envMap: textureCube, opacity: 0.25, transparent: true, combine: THREE.MixOperation, reflectivity: 0.25 }),

      'Red glass':	new THREE.MeshLambertMaterial({ color: 0xff0000, opacity: 0.75, transparent: true }),
      'Yellow glass':	new THREE.MeshLambertMaterial({ color: 0xffffaa, opacity: 0.75, transparent: true }),
      'Orange glass':	new THREE.MeshLambertMaterial({ color: 0x995500, opacity: 0.75, transparent: true }),

      'Orange glass 50':	new THREE.MeshLambertMaterial({ color: 0xffbb00, opacity: 0.5, transparent: true }),
      'Red glass 50': new THREE.MeshLambertMaterial({ color: 0xff0000, opacity: 0.5, transparent: true }),

      'Fullblack rough':	new THREE.MeshLambertMaterial({ color: 0x000000 }),
      'Black rough':	new THREE.MeshLambertMaterial({ color: 0x050505 }),
      'Darkgray rough':	new THREE.MeshLambertMaterial({ color: 0x090909 }),
      'Red rough':	new THREE.MeshLambertMaterial({ color: 0x330500 }),

      'Darkgray shiny':	new THREE.MeshPhongMaterial({ color: 0x000000, specular: 0x050505 }),
      'Gray shiny':	new THREE.MeshPhongMaterial({ color: 0x050505, shininess: 20 })

    }

    // Vehicle
    const wheelLoader = new THREE.BinaryLoader()
    wheelLoader.load('./obj/veyron_wheel_bin.js', wheelGeometry => {

      const bodyLoader = new THREE.BinaryLoader()
      bodyLoader.load('./obj/veyron_body_bin.js', bodyGeometry => {

        bodyGeometry.applyMatrix(new THREE.Matrix4().makeScale(s, s, s))
        bodyGeometry.computeBoundingBox()
        var bb = bodyGeometry.boundingBox
        bodyGeometry.applyMatrix(new THREE.Matrix4()
          .makeTranslation(
            -(bb.max.x + bb.min.x) * 0.5,
            -(bb.max.y + bb.min.y) * 0.5,
            -(bb.max.z + bb.min.z) * 0.5
          )
        )

        const bodyMaterial = new THREE.MultiMaterial()
        bodyMaterial.materials.push(mlib['Pure chrome']) 		// back / top / front torso
        bodyMaterial.materials.push(mlib['Pure chrome'])		// glass
        bodyMaterial.materials.push(mlib['Pure chrome'])		// sides torso
        bodyMaterial.materials.push(mlib['Pure chrome'])		// backlights
        bodyMaterial.materials.push(mlib['Pure chrome'])		// backsignals
        bodyMaterial.materials.push(mlib['Pure chrome'])		// engine
        bodyMaterial.materials.push(mlib['Pure chrome'])		// backlights
        bodyMaterial.materials.push(mlib['Pure chrome'])	// backsignals

        const bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial)
        bodyMesh.position.y = 0.25
        bodyMesh.castShadow = true
        // bodyMesh.receiveShadow = true

        meshes.chassis = bodyMesh

        const wheelMaterial = new THREE.MultiMaterial()
        wheelMaterial.materials[0] = new THREE.MeshLambertMaterial({
          color: 0xffffff,
          reflectivity: 0.75,
          envMap: textureCube,
          combine: THREE.MixOperation,
        })
        wheelMaterial.materials[1] = new THREE.MeshLambertMaterial({
          color: 0x333333,
        })

        wheelGeometry.applyMatrix(new THREE.Matrix4().makeScale(s, s, s))
        wheelGeometry.computeBoundingBox()
        var bb = wheelGeometry.boundingBox
        wheelGeometry.applyMatrix(new THREE.Matrix4()
          .makeTranslation(
            -(bb.max.x + bb.min.x) * 0.5,
            -(bb.max.y + bb.min.y) * 0.5,
            -(bb.max.z + bb.min.z) * 0.5
          )
        )

        for (let i = 0; i < 4; i++) {
          const wheelmesh = new THREE.Mesh(wheelGeometry, wheelMaterial)
          wheelmesh.castShadow = true
          wheelmesh.receiveShadow = true
          if (i == 0 || i == 3)
            wheelmesh.quaternion.setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI)

          meshes.wheels.push(wheelmesh)
        }

        onReady(meshes)

      })
    })
  };

  // ////////////////////////////////////////////////////////////////////////////
  //		terrain
  // ////////////////////////////////////////////////////////////////////////////
  ;(function() {
    // Heightfield parameters
    const terrain3dWidth = 60
    const terrain3dDepth = 120
    const terrainWidth = 128 * 2
    const terrainDepth = 256 * 2
    const terrainMaxHeight = 24 * 2
    const terrainMinHeight = 0

    const ammoTerrain = new THREEx.AmmoTerrain(terrainWidth, terrainDepth, terrainMinHeight, terrainMaxHeight, terrain3dWidth, terrain3dDepth)

    // ammoWorld.add( ammoTerrain );
    ammoTerrain.body.setRestitution(0.9)
    ammoWorld.physicsWorld.addRigidBody(ammoTerrain.body)
    scene.add(ammoTerrain.object3d)
  })()

  // //////////////////////////////////////////////////////////////////////////////
  //          wall around the terrain
  // //////////////////////////////////////////////////////////////////////////////

  ;(function() {
    const terrain3dWidth = 60
    const terrain3dHeight = 30
    const terrain3dDepth = 120

    // east/west model
    var geometry = new THREE.PlaneGeometry(terrain3dHeight, terrain3dDepth)
    var material = new THREE.MeshLambertMaterial({
      map: new THREE.TextureLoader().load('textures/grid.png', texture => {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping
        texture.repeat.set(geometry.parameters.width, geometry.parameters.height)
        // texture.anisotropy = renderer.getMaxAnisotropy()
      }),

    })
    var model = new THREE.Mesh(geometry, material)
    model.receiveShadow = true

    // east wall
    var mesh = model.clone()
    mesh.position.x = terrain3dWidth / 2
    mesh.position.y = terrain3dHeight / 2
    mesh.rotateX(Math.PI / 2)
    mesh.rotateY(-Math.PI / 2)
    addStaticPlane(mesh)

    // west wall
    var mesh = model.clone()
    mesh.position.x = -terrain3dWidth / 2
    mesh.position.y = terrain3dHeight / 2
    mesh.rotateX(Math.PI / 2)
    mesh.rotateY(Math.PI / 2)
    addStaticPlane(mesh)

    // ////////////////////////////////////////////////////////////////////////////
    //		Code Separator
    // ////////////////////////////////////////////////////////////////////////////

    // north/south model
    var geometry = new THREE.PlaneGeometry(terrain3dHeight, terrain3dWidth)
    var material = new THREE.MeshLambertMaterial({
      map: new THREE.TextureLoader().load('textures/grid.png', texture => {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping
        texture.repeat.set(geometry.parameters.width, geometry.parameters.height)
        // texture.anisotropy = renderer.getMaxAnisotropy()
      }),

    })
    var model = new THREE.Mesh(geometry, material)
    model.receiveShadow = true

    // north wall
    var mesh = model.clone()
    mesh.position.z = -terrain3dDepth / 2
    mesh.position.y = terrain3dHeight / 2
    // mesh.rotateX( Math.PI/2)
    mesh.rotateZ(Math.PI / 2)
    addStaticPlane(mesh)

    // south wall
    var mesh = model.clone()
    mesh.position.z = terrain3dDepth / 2
    mesh.position.y = terrain3dHeight / 2
    mesh.rotateY(Math.PI)
    mesh.rotateZ(Math.PI / 2)
    addStaticPlane(mesh)

    return

    // ////////////////////////////////////////////////////////////////////////////
    //		Code Separator
    // ////////////////////////////////////////////////////////////////////////////

    function addStaticPlane(mesh) {
      scene.add(mesh)
      // Create infinite ground plane 50 meters down. This is to make sure things don't fall down to infinity and irritate our collision detection
      const shape = new Ammo.btStaticPlaneShape(new Ammo.btVector3(0, 0, 1), 0)
      const ammoControls = new THREEx.AmmoControls(mesh, {
        mass: 0,
        shape,
      })
      ammoControls.setRestitution(1.0)
      ammoWorld.add(ammoControls)
    }
  })()

})