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
  attack: 'Bencao',
  idle: 'Ginga', // Dwarf-Idle
  jump: 'Jump', // Jumping
  run: 'Slow-Run',
  special: 'Queshada',
  walk: 'Walking',
}

// {state name : file name}
export const kachujinAnimations = {
  attack: 'Armada To Esquiva',
  idle: 'Ginga',
  jump: 'Backflip', // Jump
  run: 'Slow-Run',
  walk: 'Walking',

  'Au To Role': 'Au To Role',
  'Au': 'Au',
  'Chapa Giratoria Back': 'Chapa Giratoria Back',
  'Chapa Giratoria': 'Chapa Giratoria',
  'Chapaeu De Couro': 'Chapaeu De Couro',
  'Cocorinha': 'Cocorinha',
  'Esquiva Baixa': 'Esquiva Baixa',
  'Esquiva Lateral': 'Esquiva Lateral',
  'Macaco Lateral': 'Macaco Lateral',
  'Macaco': 'Macaco',
  'Martelo Do Chau Double': 'Martelo Do Chau Double',
  'Martelo Do Chau Sem Mao': 'Martelo Do Chau Sem Mao',
  'Martelo Do Chau': 'Martelo Do Chau',
  'Meia Lua De Compasso Back': 'Meia Lua De Compasso Back',
  'Meia Lua De Compasso': 'Meia Lua De Compasso',
  'Meia Lua De Frente': 'Meia Lua De Frente',
  'Passo A Frente': 'Passo A Frente',
  Armada: 'Armada',
  Bencao: 'Bencao',
  Chapa: 'Chapa',
  Martelo: 'Martelo',
  Ponteira: 'Ponteira',
  Queshada: 'Queshada',
  Rasteira: 'Rasteira',
  Troca: 'Troca',
}

// {keycode : state name}
export const kachujinKeys = {
  KeyQ: 'Au To Role',
  KeyE: 'Au',

  KeyA: 'Armada',
  KeyB: 'Bencao',
  KeyC: 'Chapa',
  KeyD: 'Chapaeu De Couro',
  // KeyF
  KeyG: 'Chapa Giratoria',
  KeyH: 'Chapa Giratoria Back',
  KeyI: 'Meia Lua De Frente',
  KeyJ: 'Meia Lua De Compasso',
  KeyK: 'Meia Lua De Compasso Back',
  KeyL: 'Martelo',
  KeyM: 'Martelo Do Chau',
  KeyN: 'Martelo Do Chau Sem Mao',
  KeyP: 'Ponteira',
  KeyR: 'Rasteira',
  KeyT: 'Troca',
  // KeyU
  KeyV: 'Queshada',
  KeyX: 'Martelo Do Chau Double',
  KeyY: 'Macaco',
  KeyZ: 'Macaco Lateral',

  ArrowUp: 'Passo A Frente',
  ArrowDown: 'Cocorinha',
  ArrowLeft: 'Esquiva Baixa',
  ArrowRight: 'Esquiva Lateral',
}
