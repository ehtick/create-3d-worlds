
const random = {
  rnd: Math.random,

  from(arr) {
    return arr[~~(this.rnd() * arr.length)]
  },

  range(min = 0, max = 1) {
    return this.rnd() * (max - min) + min
  },

  seed(seed) {
    this.rnd = () => {
      const x = Math.sin(seed++) * 10000
      return x - Math.floor(x)
    }

    return this
  },
}

export default random
