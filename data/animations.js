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
  idle: 'Ginga',
  run: 'Slow-Run',

  'Armada To Esquiva': 'Armada To Esquiva',
  'Armada': 'Armada',
  'Au To Role': 'Au To Role',
  'Au': 'Au',
  'Backflip': 'Backflip',
  'Bencao': 'Bencao',
  'Chapa Giratoria Back': 'Chapa Giratoria Back',
  'Chapa Giratoria': 'Chapa Giratoria',
  'Chapa': 'Chapa',
  'Chapaeu De Couro': 'Chapaeu De Couro',
  'Cocorinha': 'Cocorinha',
  'Esquiva Baixa': 'Esquiva Baixa',
  'Esquiva Lateral': 'Esquiva Lateral',
  'Macaco Lateral': 'Macaco Lateral',
  'Macaco': 'Macaco',
  'Martelo Do Chau Double': 'Martelo Do Chau Double',
  'Martelo Do Chau Sem Mao': 'Martelo Do Chau Sem Mao',
  'Martelo Do Chau': 'Martelo Do Chau',
  'Martelo': 'Martelo',
  'Meia Lua De Compasso Back': 'Meia Lua De Compasso Back',
  'Meia Lua De Compasso': 'Meia Lua De Compasso',
  'Meia Lua De Frente': 'Meia Lua De Frente',
  'Passo A Frente': 'Passo A Frente',
  'Ponteira': 'Ponteira',
  'Queshada': 'Queshada',
  'Rasteira': 'Rasteira',
  'Troca': 'Troca',
}

// {keycode : state name}
export const kachujinKeys = {
  KeyA: 'Armada',
  KeyB: 'Bencao',
  KeyC: 'Chapa',
  KeyD: 'Chapaeu De Couro',
  KeyE: 'Au',
  KeyG: 'Chapa Giratoria',
  KeyH: 'Chapa Giratoria Back',
  KeyI: 'Meia Lua De Frente',
  KeyJ: 'Meia Lua De Compasso',
  KeyK: 'Meia Lua De Compasso Back',
  KeyL: 'Martelo Do Chau Double',
  KeyM: 'Martelo Do Chau',
  KeyN: 'Martelo Do Chau Sem Mao',
  KeyP: 'Ponteira',
  KeyQ: 'Au To Role',
  KeyR: 'Rasteira',
  KeyS: 'Queshada',
  KeyT: 'Troca',
  KeyW: 'Martelo',
  KeyY: 'Macaco',
  KeyZ: 'Macaco Lateral',

  ArrowUp: 'Passo A Frente',
  ArrowDown: 'Cocorinha',
  ArrowLeft: 'Esquiva Baixa',
  ArrowRight: 'Esquiva Lateral',
  Enter: 'Armada To Esquiva',
  Space: 'Backflip',
}
