/**
 * Converts a hexidecimal color string into a luminance value
 * @param hex color string in hexidecimal format
 * @returns { number | undefined } between 0 and 255
 */
const luminanceForHexColor = (hex: string): number | undefined => {
  if (!/^#([A-Fa-f0-9]{6})$/.test(hex)) {
    return
  }

  const hexAsNumber = Number(`0x${hex.slice(1)}`)
  const [r, g, b] = [(hexAsNumber >> 16) & 255, (hexAsNumber >> 8) & 255, hexAsNumber & 255]
  // Scalars below defined [here](https://en.wikipedia.org/wiki/Relative_luminance)
  const y = 0.2126 * r + 0.7152 * g + 0.0722 * b

  return Math.round(y)
}

export default luminanceForHexColor
