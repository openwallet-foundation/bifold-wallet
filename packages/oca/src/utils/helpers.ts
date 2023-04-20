/**
 * Generates a numerical hash based on a given string
 * @see https://stackoverflow.com/questions/3426404/create-a-hexadecimal-colour-based-on-a-string-with-javascript
 * @param { string } s given string
 * @returns { number } numerical hash value
 */
export const hashCode = (s: string): number => {
  return s.split('').reduce((hash, char) => char.charCodeAt(0) + ((hash << 5) - hash), 0)
}

/**
 * Generates a pseudorandom number between 0 and 1 based on a seed
 * @see https://gist.github.com/tommyettinger/46a874533244883189143505d203312c
 * @see https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
 * @param { number } seed any number
 * @returns { number } pseudorandom number between 0 and 1
 */
const mulberry32 = (seed: number) => {
  let t = (seed += 0x6d2b79f5)
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

/**
 * Converts a numerical hash into a hexidecimal color string
 * @see https://helderesteves.com/generating-random-colors-js/#Generating_random_dark_colors
 * @param { number } hash numerical hash value (generated by hashCode function above)
 * @returns { string } hexidecimal string eg. #32d3cc
 */
export const hashToRGBA = (hash: number) => {
  let color = '#'
  const colorRangeUpperBound = 256

  // once for r, g, b
  for (let i = 0; i < 3; i++) {
    // append a pseudorandom two-char hexidecimal value from the lower half of the color spectrum (to limit to darker colors)
    color += ('0' + Math.floor((mulberry32(hash + i) * colorRangeUpperBound) / 2).toString(16)).slice(-2)
  }

  return color
}