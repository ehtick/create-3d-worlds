/* ANIM NAMES */

export const robotAnimations = {
  idle: 'Idle',
  walk: 'Walking',
  run: 'Running',
  jump: 'Jump',
  attack: 'Punch',
  death: 'Death',
  special: 'Wave',
  // ThumbsUp, WalkJump, Yes, No, Dance
}

export const dupecheshAnimations = {
  idle: 'stand',
  walk: 'run',
  run: 'run',
  jump: 'jump', // wavealt
  fall: 'bumflop',
  attack: 'salute_alt', // attack, crattack
  death: 'deathc', // deatha, deathb, deathc, crdeath
  special: 'flip', // sniffsniff
  // paina, painb, painc, crpain
}

/* ANIM KACHUJIN */

export const girlAnimations = {
  idle: 'Ginga', // Dwarf-Idle, Ginga, Ginga-Variation-2
  run: 'Slow-Run',
  walk: 'Walking',
  jump: 'Jump', // Jumping
  attack: 'Bencao',
  special: 'Queshada',
}

// state name : file name
export const kachujinAnimations = {
  idle: 'Ginga', // Dwarf-Idle, Ginga, Ginga-Variation-2
  run: 'Slow-Run',
  walk: 'Walking',
  Backflip: 'Backflip', // Jump
  'walk backward': 'Walking',
  'Au Left': 'Au',
  'Au Right': 'Au',
  Martelo: 'Martelo',
  Bencao: 'Bencao',
  Armada: 'Armada',
  Chapa: 'Chapa',
  'Esquiva Left': 'Esquiva',
  'Esquiva Right': 'Esquiva',
  'Meia Lua De Frente': 'Meia Lua De Frente',
  'Meia Lua De Compasso Back': 'Meia Lua De Compasso Back',
  Queshada: 'Queshada',
  'Chapa Giratoria': 'Chapa Giratoria',
  'Chapa Giratoria Back': 'Chapa Giratoria Back',
  'Chapaeu De Couro': 'Chapaeu De Couro',
  'Esquiva Back': 'Esquiva Back',
  'Esquiva Front': 'Esquiva Front',
  'Esquiva Down': 'Esquiva Down',
  'Martelo Do Chau': 'Martelo Do Chau',
  'Meia Lua De Compasso': 'Meia Lua De Compasso',
  'Martelo Do Chau Double': 'Martelo Do Chau Double',
  'Troca': 'Troca',
  'Macaco Side': 'Macaco Side',
}

// keycode : state name
export const kachujinMoves = {
  Space: 'Backflip',
  Enter: 'Bencao',
  KeyQ: 'Au Left',
  KeyE: 'Au Right',
  KeyV: 'Queshada',
  KeyX: 'Martelo',
  KeyB: 'Armada',
  KeyZ: 'Meia Lua De Frente',
  KeyH: 'Meia Lua De Compasso',
  KeyF: 'Meia Lua De Compasso Back',
  KeyC: 'Chapa',
  KeyN: 'Chapa Giratoria',
  KeyT: 'Chapa Giratoria Back',
  KeyM: 'Chapaeu De Couro',
  KeyG: 'Martelo Do Chau',
  KeyJ: 'Martelo Do Chau Double',
  KeyK: 'Troca',
  KeyL: 'Macaco Side',
  ArrowUp: 'Esquiva Front',
  ArrowDown: 'Esquiva Down',
  ArrowLeft: 'Esquiva Left',
  ArrowRight: 'Esquiva Right',
  ShiftRight: 'Esquiva Back',
}
