import { ScreenLayoutConfig, Screens } from '../types/navigators'

export const DefaultScreenLayoutOptions: ScreenLayoutConfig = {
  [Screens.Terms]: {
    customEdges: ['top', 'left', 'right'],
  },
  [Screens.OpenIDCredentialDetails]: {
    customEdges: ['left', 'right'],
  },
  [Screens.OpenIDCredentialOffer]: {
    customEdges: ['left', 'right', 'bottom'],
  },
  [Screens.OpenIDProofPresentation]: {
    customEdges: ['left', 'right', 'bottom'],
  },
  //TODO: Add more screens here
}
