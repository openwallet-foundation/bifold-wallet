import { luminanceForHexColor, statusBarStyleForColor } from '../../App/utils/luminance'

describe('Luminance', () => {
  test('Non-hex color strings are not processed', () => {
    const color = '23 Dogs'
    const result = luminanceForHexColor(color)

    expect(result).toBeUndefined()
  })

  test('Compute the luminance for a hex color string', () => {
    const color = '#3399FF'
    const result = luminanceForHexColor(color)

    expect(result).toEqual(139)
  })

  test('Dark hex should yield light style', () => {
    // colours https://www.color-hex.com/
    const eggplant = '#673147'
    const black = '#000000'

    expect(statusBarStyleForColor(black)).toEqual('light-content')
    expect(statusBarStyleForColor(eggplant)).toEqual('light-content')
  })

  test('Light hex should yield dark style', () => {
    // colours https://www.color-hex.com/
    const salmon = '#ff7f50'
    const white = '#FFFFFF'

    expect(statusBarStyleForColor(salmon)).toEqual('dark-content')
    expect(statusBarStyleForColor(white)).toEqual('dark-content')
  })
})
