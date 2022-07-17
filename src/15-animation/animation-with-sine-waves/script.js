import * as THREE from '/node_modules/three127/build/three.module.js'

const r = 4
let s_r = r / 20 + Math.sin(0) * r / 20
const num_of_corners = 7
const obj_resolution = 360
const linewidth = 0.04

const _w = window.innerWidth
const _h = window.innerHeight

let counter = 0
let vertices

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(65, _w / _h, 0.1, 1000)
camera.position.z = 10
const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setClearColor(new THREE.Color(0x221f26, 1.0))
renderer.setSize(_w, _h)
document.getElementById('webgl_canvas').appendChild(renderer.domElement)

const group = new THREE.Object3D()
const sub_group = new THREE.Object3D()
const all_vertices = []

const objects = []
const num = 3
const colors = [0x379392, 0x2E4952, 0x0BC9C7]

for (let i = 0; i < num; i++) {
  const obj = create_mesh(colors[i], 1 + linewidth * 0.8 * i, all_vertices, i)
  objects.push(obj)
  sub_group.add(obj)
  obj.rotation.y = Math.PI / 180 * 180
}

group.rotation.x = sub_group.rotation.x = Math.PI / 180 * 360
scene.add(group)
scene.add(sub_group)

function create_mesh(clr, r_coof, ver_arr, wave_type) {
  const geometry = new THREE.BufferGeometry()
  const points = generate_points(r, s_r, 5, wave_type)
  const points2 = generate_points(r * (1 - linewidth), s_r, 5, wave_type)
  const vertices = generate_vertices(points, points2)
  ver_arr.push(vertices)
  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
  const material = new THREE.MeshBasicMaterial({ color: clr, wireframe: false })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.anim_shape = num_of_corners
  mesh.anim = -1
  mesh.r_coof = r_coof
  mesh.wave_type = wave_type
  return mesh
}

function generate_points(radius, wave_height, anim_shape, wave_type) {

  const new_poistions = []
  for (let i = 0; i <= obj_resolution; i++) {
    const angle = 2 * Math.PI / obj_resolution * i
    let raidus_addon = 0
    const speed_incrementer = counter / 40
    const sine_pct = 0.5

    if (i < sine_pct * obj_resolution || i == obj_resolution) {
      const smoothing_amount = 0.14
      let smooth_pct = 1
      if (i < sine_pct * obj_resolution * smoothing_amount) smooth_pct = i / (sine_pct * obj_resolution * smoothing_amount)
      if (i > sine_pct * obj_resolution * (1 - smoothing_amount) && i <= sine_pct * obj_resolution) smooth_pct = (sine_pct * obj_resolution - i) / (sine_pct * obj_resolution * smoothing_amount)
      if (i == obj_resolution) smooth_pct = 0

      if (wave_type == 1) raidus_addon = wave_height * smooth_pct * Math.cos((angle + speed_incrementer) * anim_shape)
      if (wave_type == 0) raidus_addon = wave_height * smooth_pct * Math.sin((angle + speed_incrementer) * anim_shape)
      if (wave_type == 2) raidus_addon = wave_height * smooth_pct * Math.cos((angle + Math.PI / 180 * 120 + speed_incrementer) * anim_shape)
    }

    const x = (radius + raidus_addon) * Math.cos(angle + speed_incrementer)
    const y = (radius + raidus_addon) * Math.sin(angle + speed_incrementer)
    const z = 0
    new_poistions.push([x, y, z])
  }
  return new_poistions
}

function generate_vertices(points, points2) {
  const vertexPositions = []

  for (let i = 0; i < points.length - 1; i++) {
    vertexPositions.push(points[i], points2[i], points[i + 1])
    vertexPositions.push(points2[i], points2[i + 1], points[i + 1])
  }
  vertexPositions.push(points[points.length - 1], points2[points.length - 1], points[0])
  vertices = new Float32Array(vertexPositions.length * 3)

  for (let i = 0; i < vertexPositions.length; i++) {
    vertices[i * 3 + 0] = vertexPositions[i][0]
    vertices[i * 3 + 1] = vertexPositions[i][1]
    vertices[i * 3 + 2] = vertexPositions[i][2]
  }
  return vertices
}

function update_vertices_v_2(points, points2, my_arr) {
  const vertexPositions = []

  for (let i = 0; i < points.length - 1; i++) {
    vertexPositions.push(points[i], points2[i], points[i + 1])
    vertexPositions.push(points2[i], points2[i + 1], points[i + 1])
  }

  vertexPositions.push(points[points.length - 1], points2[points.length - 1], points[0])

  for (let i = 0; i < vertexPositions.length; i++) {
    my_arr[i * 3 + 0] = vertexPositions[i][0]
    my_arr[i * 3 + 1] = vertexPositions[i][1]
    my_arr[i * 3 + 2] = vertexPositions[i][2]
  }
}

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  for (let k = 0; k < objects.length; k++) {
    const obj = objects[k]
    const rad = r * obj.r_coof
    s_r = rad / 15
    const points = generate_points(rad, s_r, obj.anim_shape, obj.wave_type)
    const points2 = generate_points(rad * (1 - linewidth), s_r, obj.anim_shape, obj.wave_type)
    update_vertices_v_2(points, points2, all_vertices[k])
    obj.geometry.attributes.position.needsUpdate = true
  }
  renderer.render(scene, camera)
  counter++
}()
