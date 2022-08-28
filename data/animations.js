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
  'Au To Role': 'Au To Role',
  'Au': 'Au',
  'Chapa Giratoria Back': 'Chapa Giratoria Back',
  'Chapa Giratoria': 'Chapa Giratoria',
  'Chapaeu De Couro': 'Chapaeu De Couro',
  'Macaco': 'Macaco',
  'Esquiva Baixa': 'Esquiva Baixa',
  'Cocorinha': 'Cocorinha',
  'Passo A Frente': 'Passo A Frente',
  'Esquiva Lateral': 'Esquiva Lateral',
  'Macaco Lateral': 'Macaco Lateral',
  'Martelo Do Chau Double': 'Martelo Do Chau Double',
  'Martelo Do Chau': 'Martelo Do Chau',
  'Meia Lua De Compasso Back': 'Meia Lua De Compasso Back',
  'Meia Lua De Compasso': 'Meia Lua De Compasso',
  'Meia Lua De Frente': 'Meia Lua De Frente',
  Armada: 'Armada',
  Bencao: 'Bencao',
  Chapa: 'Chapa',
  Martelo: 'Martelo',
  Queshada: 'Queshada',
  Troca: 'Troca',
}

// keycode : state name
export const kachujinMoves = {
  Space: 'Backflip',
  KeyQ: 'Au To Role',
  KeyE: 'Au',
  // Enter

  KeyA: 'Armada',
  KeyB: 'Bencao',
  KeyC: 'Chapa',
  KeyF: 'Chapaeu De Couro',
  KeyG: 'Chapa Giratoria',
  KeyH: 'Chapa Giratoria Back',
  KeyJ: 'Meia Lua De Frente',
  KeyK: 'Meia Lua De Compasso',
  KeyL: 'Meia Lua De Compasso Back',
  KeyM: 'Martelo',
  KeyN: 'Martelo Do Chau',
  KeyO: 'Macaco',
  KeyP: 'Macaco Lateral',
  KeyT: 'Troca',
  KeyV: 'Queshada',
  KeyX: 'Martelo Do Chau Double',

  ArrowUp: 'Passo A Frente',
  ArrowDown: 'Cocorinha',
  ArrowLeft: 'Esquiva Baixa',
  ArrowRight: 'Esquiva Lateral',
}
