export function generateRandomName() {
  const names1 = [
    'Aspiring', 'Nameless', 'Cautionary', 'Excited',
    'Modest', 'Maniacal', 'Caffeinated', 'Sleepy',
    'Passionate', 'Medical',
  ]
  const names2 = [
    'Painter', 'Cheese Guy', 'Giraffe', 'Snowman',
    'Doberwolf', 'Cocktail', 'Fondler', 'Typist',
    'Noodler', 'Arborist', 'Peeper'
  ]
  const n1 = names1[Math.floor(Math.random() * names1.length)]
  const n2 = names2[Math.floor(Math.random() * names2.length)]
  return n1 + ' ' + n2
}
