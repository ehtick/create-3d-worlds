export const utils = (function() {
  return {
    DictIntersection(dictA, dictB) {
      const intersection = {}
      for (const k in dictB)
        if (k in dictA)
          intersection[k] = dictA[k]

      return intersection
    },

    DictDifference(dictA, dictB) {
      const diff = { ...dictA }
      for (const k in dictB)
        delete diff[k]

      return diff
    }
  }
})()
