import AI from '/utils/player/AI.js'
import { loadSovietPartisan } from '/utils/loaders.js'

const { mesh, animations, animDict } = await loadSovietPartisan()

export function crateEnemy({ solids, target, coords } = {}) {
  return new AI({ mesh, animations, animDict, basicState: 'wander', solids, target, attackStyle: 'LOOP', coords })
}
