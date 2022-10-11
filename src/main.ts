import './main.css'
import * as THREE from 'three'
import { camera, lights, renderer, run, scene, composer, update, } from 'three-kit'
import Debug from 'three-debug'

camera.position.set(1, 1, 1)
camera.lookAt(0, 0, 0)
camera.zoom = 25
camera.near = -200
camera.far = 200

{
  const light = lights.createDirectional()
  scene.add(light)
}

{
  const light = lights.createAmbient()
  scene.add(light)
}

{
  lights.godrayDir.name = 'Godray dir'
  scene.add(lights.godrayDir)
}

const boardSize = Number.parseInt(localStorage.getItem('boardSize') ?? '20', 10)
const length = boardSize
const width = boardSize
const count = length * width
const size = 1

const color = new THREE.Color()
const geometry = new THREE.BoxGeometry(size, size, size)
const material = new THREE.MeshStandardMaterial({ color: 'hotpink' })
const cubes = new THREE.InstancedMesh(geometry, material, count)
cubes.name = 'Cubes'
cubes.castShadow = true
cubes.receiveShadow = true
scene.add(cubes)

const v3 = new THREE.Vector3()
const m4 = new THREE.Matrix4()
const margin = 0.3
const offset = -width * (margin)

let index = 0
for (let i = 0; i < width; i += 1) {
  const x = (i * (size + margin)) + offset * 2

  for (let j = 0; j < length; j += 1) {
    const z = (j * (size + margin)) + offset * 2
    m4.setPosition(x, 0, z)
    cubes.setMatrixAt(index, m4)

    color.set('hotpink')
    cubes.setColorAt(index, color)

    index += 1
  }
}

run()

let cells = new Uint8Array(length * length)

for (let i = 0; i < length; i += 1) {
  for (let j = 0; j < length; j += 1) {
    cells[(i * length) + j] = Math.round(Math.random())
  }
}

const getNeighbors = (x: number, y: number) => {
  let count = 0

  let prevRow = x - 1 > -1 ? x - 1 : length - 1
  let nextRow = x + 1 < length ? x + 1 : 0

  let prevCol = y - 1 > -1 ? y - 1 : length - 1
  let nextCol = y + 1 < length ? y + 1 : 0

  count += cells[(prevRow * length) + prevCol]
  count += cells[(prevRow * length) + y]
  count += cells[(prevRow * length) + nextCol]

  count += cells[(x * length) + prevCol]
  count += cells[(x * length) + nextCol]

  count += cells[(nextRow * length) + prevCol]
  count += cells[(nextRow * length) + y]
  count += cells[(nextRow * length) + nextCol]

  return count
}

const generation = () => {
  const copy = new Uint8Array(cells)

  for (let x = 0; x < length; x += 1) {
    for (let y = 0; y < length; y += 1) {
      const count = getNeighbors(x, y)

      if (count < 2 || count > 3) {
        copy[(x * length) + y] = 0
      } else if (count === 3) {
        copy[(x * length) + y] = 1
      }
    }
  }

  cells = copy
}

setInterval(() => {
  generation()
}, 100)

if (localStorage.getItem('debug') !== null) {
  const debug = new Debug(THREE, scene, camera, renderer, composer)
  const pane = debug.addPane('Game')

  const params = { size: boardSize }
  pane.addInput(params, 'size').on('change', () => {
    localStorage.setItem('boardSize', String(params.size))
    location.reload()
  })
}

update(() => {
  let index = 0
  for (let i = 0; i < width; i += 1) {
    for (let j = 0; j < length; j += 1) {
      const alive = cells[(i * length) + j] === 1

      cubes.getMatrixAt(index, m4)
      v3.setFromMatrixPosition(m4)
      //alive ? 0.2 : 0
      if (alive) v3.y += 0.01

      m4.setPosition(v3.x, v3.y, v3.z)
      cubes.setMatrixAt(index, m4)

      color.set(alive ? 'yellow' : 'hotpink')
      cubes.setColorAt(index, color)

      index += 1
    }
  }

  cubes.instanceColor!.needsUpdate = true
  cubes.instanceMatrix.needsUpdate = true
})

document.body.append(renderer.domElement)
