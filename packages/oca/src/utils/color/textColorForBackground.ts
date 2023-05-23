import luminanceForHexColor from './luminanceForHexColor'

export const textColorForBackground = (background: string): string => {
  const spectrum = {
    black: '#000000',
    darkGrey: '#313132',
    mediumGrey: '#606060',
    lightGrey: '#D3D3D3',
    veryLightGrey: '#F2F2F2',
    white: '#FFFFFF',
  }

  const midpoint = 255 / 2
  if ((luminanceForHexColor(background ?? '') ?? 0) >= midpoint) {
    return spectrum.darkGrey
  }
  return spectrum.white
}
