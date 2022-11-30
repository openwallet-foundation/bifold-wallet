/* eslint-disable @typescript-eslint/no-unused-vars */
// import { render, fireEvent, waitFor } from '@testing-library/react-native'
import React from 'react'

// import { AuthContext } from '../../App/contexts/auth'
// import UseBiometry from '../../App/screens/UseBiometry'
// import { testIdWithKey } from '../../App/utils/testable'
// import authContext from '../contexts/auth'

// jest.mock('@react-navigation/core', () => {
//   return require('../../__mocks__/custom/@react-navigation/core')
// })
// jest.mock('@react-navigation/native', () => {
//   return require('../../__mocks__/custom/@react-navigation/native')
// })
// jest.mock('react-native-device-info', () => {
//   return {
//     isEmulatorSync: () => {
//       return true
//     },
//   }
// })

describe('UseBiometry Screen', () => {
  test.skip('FIXME', () => {
    return
  })
  // test.skip('Renders correctly when biometry available', () => {
  //   const tree = render(
  //     <AuthContext.Provider value={authContext}>
  //       <UseBiometry />
  //     </AuthContext.Provider>
  //   )
  //   expect(tree).toMatchSnapshot()
  // })
  // test.skip('Renders correctly when biometry not available', () => {
  //   const tree = render(
  //     <AuthContext.Provider value={authContext}>
  //       <UseBiometry />
  //     </AuthContext.Provider>
  //   )
  //   expect(tree).toMatchSnapshot()
  // })
  // test.skip('Toggles use biometrics ok', async () => {
  //   const tree = render(
  //     <AuthContext.Provider value={authContext}>
  //       <UseBiometry />
  //     </AuthContext.Provider>
  //   )
  //   const useBiometryToggle = await tree.getByTestId(testIdWithKey('ToggleBiometrics'))
  //   await waitFor(async () => {
  //     await fireEvent(useBiometryToggle, 'valueChange', true)
  //   })
  //   const continueButton = await tree.getByTestId(testIdWithKey('Continue'))
  //   await waitFor(async () => {
  //     await fireEvent(continueButton, 'press')
  //   })
  //   expect(useBiometryToggle).not.toBeNull()
  //   expect(continueButton).not.toBeNull()
  //   expect(authContext.commitPIN).toBeCalledTimes(1)
  //   expect(tree).toMatchSnapshot()
  // })
})
