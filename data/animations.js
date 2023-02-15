/**
 * ANIM DICTS
 * map finite machine state to model animation
 */

export const robotkoAnimations = {
  idle: 'Idle',
  walk: 'Walking',
  run: 'Running',
  jump: 'Jump',
  attack: 'Punch',
  special: 'Wave',
  death: 'Death',
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
  special: 'Zombie Scream', // Spell Casting
}

export const witcherAnimations = {
  idle: 'Idle',
  walk: 'Walking',
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

export const thiefAnimation = {
  idle: 'Crouch Torch Idle 02',
  walk: 'Crouch Torch Walk Forward'
}

export const bigfootAnimations = {
  idle: 'Goalkeeper Idle',
  walk: 'Mutant Walking',
  attack: 'Zombie Punching',
}

export const germanSoldierAnimations = {
  idle: 'Rifle Aiming Idle',
  walk: 'Rifle Walk',
  pursue: 'Walk With Rifle',
  run: 'Rifle Run',
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

export const naziMachineGunnerAnimations = {
  idle: 'Rifle Idle',
  walk: 'Walk With Rifle',
  attack: 'Gunplay', // Crouch Rapid Fire
}

export const naziAgentAnimations = {
  idle: 'Standing Idle',
  walk: 'Standard Walk',
  attack: 'Shooting',
  pursue: 'Pistol Walk',
  pain: 'Hit Reaction',
  death: 'Dying',
}

export const orcAnimations = {
  idle: 'Unarmed Idle',
  walk: 'Orc Walk',
  attack: 'Zombie Attack', // Zombie Kicking
  special: 'Zombie Scream',
  death: 'Death From The Back',
}

export const orcOgreAnimations = {
  idle: 'Unarmed Idle',
  walk: 'Mutant Walking',
  run: 'Mutant Run',
  attack: 'Mutant Swiping', // Zombie Attack
  special: 'Zombie Scream',
  death: 'Zombie Dying',
}

export const robotSoldierAnimations = {
  idle: 'Rifle Idle',
  walk: 'Walk With Rifle',
  run: 'Rifle Run',
  attack: 'Rifle Punch',
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

export const soldierAnimations = {
  idle: 'Rifle Idle',
  walk: 'Walk With Rifle',
  // run: 'Rifle Run',
  // attack: 'Firing Rifle',
  // special: 'Fire Rifle',
}

export const nudeVictimAnimations = {
  idle: 'Unarmed Idle',
  walk: 'Drunk Run Forward',
  attack: 'Terrified',
  special: 'Zombie Agonizing',
}

export const skaterAnimations = {
  idle: 'Skateboarding',
  jump: 'Jumping',
}

export const treemanAnimations = {
  idle: 'Idle',
  walk: 'Mutant Walking',
  attack: 'Zombie Attack',
}

export const trollLowpolyAnimations = {
  idle: 'Mutant Breathing Idle',
  death: 'Mutant Dying',
  run: 'Mutant Run',
  attack: 'Mutant Swiping',
  walk: 'Mutant Walking',
}

export const trollAnimations = {
  idle: 'Unarmed Idle',
  walk: 'Mutant Walking',
  attack: 'Zombie Attack',
  pain: 'Shove Reaction',
  death: 'Mutant Dying',
}

export const zombieCopAnimations = {
  idle: 'Zombie Idle',
  walk: 'Zombie Walk',
  attack: 'Zombie Neck Bite',
  special: 'Zombie Punching',
  pain: 'Hit Reaction',
  death: 'Zombie Death',
}

export const zombieGirlAnimations = {
  idle: 'Zombie Idle',
  walk: 'Walking',
  attack: 'Zombie Neck Bite Mirror',
  special: 'Zombie Attack',
}

export const zombieDocAnimations = {
  idle: 'Zombie Idle',
  walk: 'Walking',
  attack: 'Zombie Neck Bite',
  death: 'Zombie Dying',
}

export const ghostAnimations = {
  idle: 'Take 001'
}

export const jungleScoutAnimations = {
  idle: 'Rifle Idle',
  walk: 'Walk With Rifle',
  run: 'Rifle Run',
  attack: 'Firing Rifle',
  death: 'Rifle Death',
}

export const barbarianAnimations = {
  idle: 'Unarmed Idle',
  walk: 'Dwarf Walk',
  // wounded: Zombie Crawl
  run: 'Running',
  attack: 'Standing Melee Attack 360 Low', // Mma Kick, Kicking, Standing Melee Kick, Chapa 2
  pain: 'Standing React Large From Right',
  death: 'Falling Back Death',
  special: 'Standing 2H Magic Attack 05',
}
