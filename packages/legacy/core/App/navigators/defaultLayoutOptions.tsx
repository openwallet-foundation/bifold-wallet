import { ScreenLayoutConfig, Screens } from '../types/navigators'

export const DefaultScreenLayoutOptions: ScreenLayoutConfig = {
  [Screens.Terms]: {
    customEdges: ['top', 'left', 'right'],
  },
  [Screens.OpenIDCredentialDetails]: {
    customEdges: ['left', 'right'],
  },
  //TODO: Add more screens here
}
