/**
 * ANIM DICTS
 * maps state to animation
 * keys: idle, walk, run, jump, fall, attack, attack2, special, pain, wounded, death
 */

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

export const demonAnimations = {
  idle: 'Mutant Breathing Idle',
  walk: 'Mutant Walking',
  jump: 'Mutant Jumping',
  attack: 'Zombie Attack',
  special: 'Zombie Scream',
}

export const blackKnightAnimations = {
  idle: 'Great Sword Idle',
  walk: 'Great Sword Walk',
  attack: 'Great Sword Slash',
}

export const witchAnimations = {
  idle: 'Crouch Idle',
  walk: 'Crouched Walking',
  run: 'Run',
  attack: 'Standing 2H Magic Attack 01',
  attack2: 'Spell Casting',
  special: 'Zombie Scream',
}

export const ironGiantAnimations = {
  idle: 'Idle',
  walk: 'Walking',
  jump: 'Mutant Jumping',
  attack: 'Zombie Attack',
}

export const goblinAnimations = {
  idle: 'Great Sword Idle',
  walk: 'Great Sword Walk',
  attack: 'Great Sword Slash',
  death: 'Two Handed Sword Death',
}

export const golemAnimation = {
  idle: 'Unarmed Idle',
  walk: 'Mutant Walking',
  attack: 'Zombie Kicking',
  special: 'Mutant Swiping',
  pain: 'Zombie Reaction Hit',
  death: 'Standing Death Forward 01',
}

export const bigfootAnimations = {
  idle: 'Goalkeeper Idle',
  walk: 'Mutant Walking',
  attack: 'Zombie Punching',
}

export const orcAnimations = {
  idle: 'Unarmed Idle',
  walk: 'Orc Walk',
  attack: 'Zombie Attack',
  attack2: 'Zombie Kicking',
  special: 'Zombie Scream',
  death: 'Death From The Back',
}

export const orcOgreAnimations = {
  idle: 'Unarmed Idle',
  walk: 'Mutant Walking',
  run: 'Mutant Run',
  attack: 'Mutant Swiping',
  attack2: 'Zombie Attack',
  special: 'Zombie Scream',
  death: 'Zombie Dying',
}

export const sorceressAnimations = {
  idle: 'Standing Idle',
  walk: 'Standing Walk Forward',
  run: 'Standing Sprint Forward',
  attack: 'Standing 1H Magic Attack 01',
  special: 'Standing 2H Magic Attack 04',
}

export const skeletonAnimation = {
  special: 'Zombie Scream',
  run: 'Flying',
  walk: 'Walking',
  idle: 'Zombie Idle',
  attack: 'Zombie Neck Bite',
}

export const trollAnimations = {
  idle: 'Unarmed Idle',
  walk: 'Mutant Walking',
  attack: 'Zombie Attack',
  pain: 'Shove Reaction',
  death: 'Mutant Dying',
}

export const ghostAnimations = {
  idle: 'Take 001'
}

export const robotSoldierAnimations = {
  idle: 'Rifle Idle',
  walk: 'Walk With Rifle',
  run: 'Rifle Run',
  attack: 'Rifle Punch',
}

export const skaterAnimations = {
  idle: 'Skateboarding',
  jump: 'Jumping',
}

export const nudeVictimAnimations = {
  idle: 'Unarmed Idle',
  walk: 'Drunk Run Forward',
  attack: 'Terrified',
  special: 'Zombie Agonizing',
}

export const barbarianAnimations = {
  idle: 'Unarmed Idle',
  walk: 'Dwarf Walk',
  run: 'Running',
  attack: 'Mma Kick',
  attack2: 'Standing Melee Kick',
  jump: 'Kicking',
  special: 'Standing 2H Magic Attack 05',
  pain: 'Standing React Large From Right',
  wounded: 'Zombie Crawl',
  death: 'Falling Back Death',
}

/* ZOMBIES */

export const zombieCopAnimations = {
  idle: 'Zombie Idle',
  walk: 'Zombie Walk',
  run: 'Zombie Run',
  attack: 'Zombie Neck Bite',
  attack2: 'Zombie Attack Two Hand',
  pain: 'Hit Reaction',
  death: 'Zombie Death',
}

export const zombieDocAnimations = {
  idle: 'Thriller Idle',
  walk: 'Walking',
  run: 'Zombie Running',
  attack: 'Zombie Attack',
  attack2: 'Zombie Scream',
  pain: 'Zombie Reaction Hit',
  death: 'Zombie Dying',
}

export const zombieBarefootAnimations = {
  idle: 'Zombie Scratch Idle',
  walk: 'Zombie Walk',
  run: 'Zombie Running',
  attack: 'Zombie Punching',
  attack2: 'Zombie Kicking',
  pain: 'Zombie Reaction Hit Back',
  death: 'Zombie Death',
}

export const zombieGuardAnimations = {
  idle: 'Zombie Idle',
  walk: 'Walking',
  run: 'Zombie Running',
  attack: 'Zombie Kicking',
  attack2: 'Zombie Attack',
  pain: 'Zombie Reaction Hit',
  death: 'Zombie Dying',
}

export const zombieCrawlAnimations = {
  idle: 'Sleeping Idle',
  walk: 'Zombie Crawl',
  run: 'Running Crawl',
  attack: 'Zombie Biting',
  death: 'Prone Death',
}

/* SOLDIERS */

export const germanSoldierAnimations = {
  idle: 'Rifle Aiming Idle',
  walk: 'Rifle Walk',
  pursue: 'Walk With Rifle Aim',
  run: 'Rifle Run Aim',
  attack: 'Firing Rifle',
  death: 'Dying'
}

export const germanSoldierCrouchAnimations = {
  idle: 'Crouch Idle',
  walk: 'Walk Crouching Forward',
  attack: 'Fire Rifle Crouch',
  death: 'Crouch Death',
}

export const germanSoldierProneAnimations = {
  idle: 'Prone Idle',
  walk: 'Prone Forward',
  attack: 'Prone Firing Rifle',
  death: 'Prone Death',
}

export const naziAnimations = {
  idle: 'Rifle Aiming Idle',
  attack: 'Firing Rifle',
  walk: 'Walk With Rifle',
  pain: 'Hit Reaction',
  death: 'Death Crouching Headshot Front',
}

export const naziCrouchAnimations = {
  idle: 'Crouch Idle',
  walk: 'Crouched Run',
  attack: 'Fire Rifle Crouch',
  death: 'Crouch Death',
}

export const naziProneAnimations = {
  idle: 'Prone Idle',
  walk: 'Prone Forward',
  attack: 'Prone Firing Rifle',
  special: 'Throw Grenade',
  death: 'Prone Death',
}

export const naziOfficerAnimations = {
  idle: 'Dwarf Idle',
  walk: 'Pistol Walk',
  attack: 'Shooting',
  special: 'Yelling',
}

export const germanMachineGunnerAnimations = {
  idle: 'Machine Gun Idle',
  walk: 'Walk With Rifle',
  attack: 'Crouch Rapid Fire'
}

export const naziAgentAnimations = {
  idle: 'Standing Idle',
  walk: 'Standard Walk',
  attack: 'Shooting',
  pursue: 'Pistol Walk',
  pain: 'Pistol Hit Reaction',
  death: 'Dying',
}

export const partisanAnimations = {
  idle: 'Rifle Idle',
  walk: 'Walk With Rifle',
  jump: 'Jump Forward',
  attack: 'Firing Rifle',
  special: 'Toss Grenade',
  pain: 'Reaction',
  death: 'Dying',
}

export const sovietPartisanAnimations = {
  idle: 'Rifle Idle',
  walk: 'Walk With Rifle',
  attack: 'Gunplay',
}
