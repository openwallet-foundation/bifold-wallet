import { render, fireEvent, waitFor } from '@testing-library/react-native'
import React from 'react'

import { AuthContext } from '../../App/contexts/auth'
import UseBiometry from '../../App/screens/UseBiometry'
import { testIdWithKey } from '../../App/utils/testable'
import authContext from '../contexts/auth'
import timeTravel from '../helpers/timetravel'

jest.mock('react-native-fs', () => ({}))
jest.mock('@hyperledger/anoncreds-react-native', () => ({}))
jest.mock('@hyperledger/aries-askar-react-native', () => ({}))
jest.mock('@hyperledger/indy-vdr-react-native', () => ({}))
jest.mock('../../App/contexts/configuration', () => ({
  useConfiguration: jest
    .fn()
    .mockReturnValue({ enablePushNotifications: { setup: jest.fn(), toggle: jest.fn(), status: jest.fn() } }),
}))

describe('UseBiometry Screen', () => {
  beforeAll(() => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    jest.spyOn(global.console, 'error').mockImplementation(() => {})
  })

  test('Renders correctly when biometry available', async () => {
    authContext.isBiometricsActive = jest.fn().mockResolvedValueOnce(true)
    const tree = render(
      <AuthContext.Provider value={authContext}>
        <UseBiometry />
      </AuthContext.Provider>
    )

    await waitFor(() => {
      timeTravel(1000)
    })

    expect(tree).toMatchSnapshot()
  })

  test('Renders correctly when biometry not available', async () => {
    authContext.isBiometricsActive = jest.fn().mockResolvedValueOnce(false)
    const tree = render(
      <AuthContext.Provider value={authContext}>
        <UseBiometry />
      </AuthContext.Provider>
    )

    await waitFor(() => {
      timeTravel(1000)
    })

    expect(tree).toMatchSnapshot()
  })

  test('Toggles use biometrics ok', async () => {
    authContext.isBiometricsActive = jest.fn().mockResolvedValueOnce(true)
    const tree = render(
      <AuthContext.Provider value={authContext}>
        <UseBiometry />
      </AuthContext.Provider>
    )

    await waitFor(() => {
      timeTravel(1000)
    })

    const useBiometryToggle = await tree.getByTestId(testIdWithKey('ToggleBiometrics'))

    await waitFor(async () => {
      await fireEvent(useBiometryToggle, 'valueChange', true)
    })

    const continueButton = await tree.getByTestId(testIdWithKey('Continue'))

    await waitFor(async () => {
      await fireEvent(continueButton, 'press')
    })

    expect(useBiometryToggle).not.toBeNull()
    expect(continueButton).not.toBeNull()
    expect(authContext.commitPIN).toBeCalledTimes(1)
    expect(tree).toMatchSnapshot()
  })
})
