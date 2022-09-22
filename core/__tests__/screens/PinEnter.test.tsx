import { render } from '@testing-library/react-native'
import React from 'react'

import { AuthContext } from '../../App/contexts/auth'
import PinEnter from '../../App/screens/PinEnter'

jest.mock('react-native-device-info', () => {
  return {
    isEmulatorSync: () => {
      return true
    },
  }
})

describe('displays a pin create screen', () => {
  test.skip('pin create renders correctly', () => {
    // const tree = render(
    //   <AuthContext.Provider
    //     value={{
    //       getWalletCredentials: jest.fn(),
    //       checkPIN: jest.fn(),
    //       commitPIN: jest.fn(),
    //       setPIN: jest.fn(),
    //       isBiometricsActive: jest.fn(),
    //     }}
    //   >
    //     <PinEnter setAuthenticated={jest.fn()} />
    //   </AuthContext.Provider>
    // )
    expect(tree).toMatchSnapshot()
  })
})
