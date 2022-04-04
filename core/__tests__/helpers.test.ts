import { isRedirection } from '../App/utils/helpers'

describe('Helpers', () => {
  it('URL with c_i is not a redirect', () => {
    const url = 'https://example.com?c_i=blarb'
    const result = isRedirection(url)

    expect(result).toBeFalsy()
  })

  it('URL with d_m is not a redirect', () => {
    const url = 'https://example.com?d_m=blarb'
    const result = isRedirection(url)

    expect(result).toBeFalsy()
  })

  it('URL with is redirect', () => {
    const url = 'https://example.com?x_x=blarb'
    const result = isRedirection(url)

    expect(result).toBeTruthy()
  })
})
