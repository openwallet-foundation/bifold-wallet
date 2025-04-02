import { State } from '../../src/types/state'
import { defaultState } from '../../src/contexts/store'

export const testDefaultState: State = {
  ...defaultState,
  preferences: {
    ...defaultState.preferences,
    walletName: 'test-wallet',
  },
  stateLoaded: true,
}
