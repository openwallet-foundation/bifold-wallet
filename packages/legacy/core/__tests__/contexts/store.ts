import { State } from '../../App/types/state'
import { defaultState } from '../../App/contexts/store'

export const testDefaultState: State = {
  ...defaultState,
  preferences: {
    ...defaultState.preferences,
    walletName: 'test-wallet',
  },
  stateLoaded: true,
}
