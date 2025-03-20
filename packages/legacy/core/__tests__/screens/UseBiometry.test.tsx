import { render, fireEvent, waitFor } from '@testing-library/react-native'
import React from 'react'
import { AuthContext } from '../../App/contexts/auth'
import UseBiometry from '../../App/screens/UseBiometry'
import { testIdWithKey } from '../../App/utils/testable'
import authContext from '../contexts/auth'
import { BasicAppContext } from '../helpers/app'
import { Linking } from 'react-native'
import { testDefaultState } from '../contexts/store'
import { StoreProvider } from '../../App/contexts/store'
import { RESULTS, check, request } from 'react-native-permissions'

jest.mock('react-native-permissions', () => require('react-native-permissions/mock'))
const mockedCheck = check as jest.MockedFunction<typeof check>
const mockedRequest = request as jest.MockedFunction<typeof request>

jest.spyOn(Linking, 'openSettings').mockImplementation(() => Promise.resolve())

jest.mock('@react-navigation/elements', () => ({
  Header: jest.fn().mockImplementation(() => {
    const Component = () => null
    Component.displayName = 'Header'
    return Component
  }),
  HeaderBackButton: jest.fn().mockImplementation(() => {
    const Component = () => null
    Component.displayName = 'HeaderBackButton'
    return Component
  }),
  useHeaderHeight: jest.fn().mockReturnValue(150),
}))

const customStore = {
  ...testDefaultState,
  preferences: {
    ...testDefaultState.preferences,
    useBiometry: false,
  },
}

describe('UseBiometry Screen', () => {
  beforeAll(() => {
    jest.spyOn(global.console, 'error').mockImplementation(() => null)
  })

  beforeEach(() => {
    authContext.isBiometricsActive = jest.fn().mockResolvedValue(true)
    customStore.preferences.useBiometry = false
    mockedCheck.mockClear()
    mockedRequest.mockClear()
    mockedCheck.mockResolvedValue(RESULTS.DENIED) // DENIED essentially means available but user decision has not been made
    mockedRequest.mockResolvedValue(RESULTS.BLOCKED) // BLOCKED means user has actively rejected biometry use
  })

  test('renders correctly when biometry available', async () => {
    const tree = render(
      <BasicAppContext>
        <AuthContext.Provider value={authContext}>
          <UseBiometry />
        </AuthContext.Provider>
      </BasicAppContext>
    )

    await tree.findByText('Biometry.EnabledText1')
    expect(tree).toMatchSnapshot()
  })

  test('renders correctly when biometry unavailable', async () => {
    authContext.isBiometricsActive = jest.fn().mockResolvedValue(false)
    const tree = render(
      <BasicAppContext>
        <AuthContext.Provider value={authContext}>
          <UseBiometry />
        </AuthContext.Provider>
      </BasicAppContext>
    )

    await tree.findByText('Biometry.NotEnabledText1')
    expect(tree).toMatchSnapshot()
  })

  test('toggle is enabled when biometry is available', async () => {
    const { findByTestId, findByText } = render(
      <BasicAppContext>
        <AuthContext.Provider value={authContext}>
          <UseBiometry />
        </AuthContext.Provider>
      </BasicAppContext>
    )

    await findByText('Biometry.EnabledText1')
    const toggleButton = await findByTestId(testIdWithKey('ToggleBiometrics'))
    expect(toggleButton.props.accessibilityState.disabled).toBe(false)
  })

  test('toggle is enabled even when biometry is not available', async () => {
    authContext.isBiometricsActive = jest.fn().mockResolvedValue(false)

    const { findByTestId, findByText } = render(
      <BasicAppContext>
        <AuthContext.Provider value={authContext}>
          <UseBiometry />
        </AuthContext.Provider>
      </BasicAppContext>
    )

    await findByText('Biometry.NotEnabledText1')
    const toggleButton = await findByTestId(testIdWithKey('ToggleBiometrics'))
    expect(toggleButton.props.accessibilityState.disabled).toBe(false)
  })

  test('can toggle off if on', async () => {
    // Setup with toggle switch on
    customStore.preferences.useBiometry = true

    const { findByTestId, findByText } = render(
      <StoreProvider initialState={customStore}>
        <BasicAppContext>
          <AuthContext.Provider value={authContext}>
            <UseBiometry />
          </AuthContext.Provider>
        </BasicAppContext>
      </StoreProvider>
    )

    await findByText('Biometry.EnabledText1')
    const toggleButton = await findByTestId(testIdWithKey('ToggleBiometrics'))

    await waitFor(() => {
      fireEvent(toggleButton, 'press')
    })
    expect(toggleButton.props.accessibilityState.checked).toBe(false)
  })

  test('can toggle on when biometrics available and permission is GRANTED', async () => {
    mockedCheck.mockResolvedValue(RESULTS.GRANTED)

    const { findByTestId, findByText } = render(
      <StoreProvider initialState={customStore}>
        <BasicAppContext>
          <AuthContext.Provider value={authContext}>
            <UseBiometry />
          </AuthContext.Provider>
        </BasicAppContext>
      </StoreProvider>
    )

    await findByText('Biometry.EnabledText1')
    const toggleButton = await findByTestId(testIdWithKey('ToggleBiometrics'))

    await waitFor(() => {
      fireEvent(toggleButton, 'press')
    })
    expect(toggleButton.props.accessibilityState.checked).toBe(true)
  })

  test('shows settings popup when permission is UNAVAILABLE', async () => {
    mockedCheck.mockResolvedValue(RESULTS.UNAVAILABLE)

    const { findByTestId, findByText } = render(
      <StoreProvider initialState={customStore}>
        <BasicAppContext>
          <AuthContext.Provider value={authContext}>
            <UseBiometry />
          </AuthContext.Provider>
        </BasicAppContext>
      </StoreProvider>
    )

    const toggleButton = await findByTestId(testIdWithKey('ToggleBiometrics'))

    await waitFor(() => {
      fireEvent(toggleButton, 'press')
    })
    expect(await findByText('Biometry.SetupBiometricsTitle')).toBeTruthy()
    expect(await findByText('Biometry.SetupBiometricsDesc')).toBeTruthy()

    expect(toggleButton.props.accessibilityState.checked).toBe(false)
  })

  test('shows settings popup when permission is BLOCKED', async () => {
    mockedCheck.mockResolvedValueOnce(RESULTS.BLOCKED)

    const { findByTestId, findByText } = render(
      <StoreProvider initialState={customStore}>
        <BasicAppContext>
          <AuthContext.Provider value={authContext}>
            <UseBiometry />
          </AuthContext.Provider>
        </BasicAppContext>
      </StoreProvider>
    )

    await findByText('Biometry.EnabledText1')
    const toggleButton = await findByTestId(testIdWithKey('ToggleBiometrics'))

    await waitFor(() => {
      fireEvent(toggleButton, 'press')
    })
    expect(await findByText('Biometry.AllowBiometricsTitle')).toBeTruthy()
    expect(await findByText('Biometry.AllowBiometricsDesc')).toBeTruthy()

    expect(toggleButton.props.accessibilityState.checked).toBe(false)
  })

  test('shows settings popup and "Open settings" button works', async () => {
    mockedCheck.mockResolvedValue(RESULTS.BLOCKED)

    const { findByTestId, findByText } = render(
      <StoreProvider initialState={customStore}>
        <BasicAppContext>
          <AuthContext.Provider value={authContext}>
            <UseBiometry />
          </AuthContext.Provider>
        </BasicAppContext>
      </StoreProvider>
    )

    await findByText('Biometry.EnabledText1')
    const toggleButton = await findByTestId(testIdWithKey('ToggleBiometrics'))

    await waitFor(() => {
      fireEvent(toggleButton, 'press')
    })
    const openSettingsButton = await findByText('Biometry.OpenSettings')
    
    fireEvent(openSettingsButton, 'press')
    expect(Linking.openSettings).toHaveBeenCalledTimes(1)
  })

  test('requests permission when biometrics is available but permission is DENIED and toggles on when permission becomes GRANTED', async () => {
    mockedRequest.mockResolvedValue(RESULTS.GRANTED)

    const { findByTestId, findByText } = render(
      <StoreProvider initialState={customStore}>
        <BasicAppContext>
          <AuthContext.Provider value={authContext}>
            <UseBiometry />
          </AuthContext.Provider>
        </BasicAppContext>
      </StoreProvider>
    )

    await findByText('Biometry.EnabledText1')
    const toggleButton = await findByTestId(testIdWithKey('ToggleBiometrics'))

    await waitFor(() => {
      fireEvent(toggleButton, 'press')
    })
    expect(mockedRequest).toHaveBeenCalledTimes(1)
    expect(toggleButton.props.accessibilityState.checked).toBe(true)
  })

  test('requests permission when biometrics is available but permission is DENIED and toggle stays off when permission becomes BLOCKED', async () => {
    const { findByTestId, findByText } = render(
      <StoreProvider initialState={customStore}>
        <BasicAppContext>
          <AuthContext.Provider value={authContext}>
            <UseBiometry />
          </AuthContext.Provider>
        </BasicAppContext>
      </StoreProvider>
    )

    await findByText('Biometry.EnabledText1')
    const toggleButton = await findByTestId(testIdWithKey('ToggleBiometrics'))

    await waitFor(() => {
      fireEvent(toggleButton, 'press')
    })
    expect(mockedRequest).toHaveBeenCalledTimes(1)
    expect(toggleButton.props.accessibilityState.checked).toBe(false)
  })

  test('can toggle on and correctly continue when biometrics is available and permission is GRANTED', async () => {
    mockedCheck.mockResolvedValue(RESULTS.GRANTED)

    const { findByTestId, findByText } = render(
      <BasicAppContext>
        <AuthContext.Provider value={authContext}>
          <UseBiometry />
        </AuthContext.Provider>
      </BasicAppContext>
    )

    await findByText('Biometry.EnabledText1')
    const toggleButton = await findByTestId(testIdWithKey('ToggleBiometrics'))
    await waitFor(() => {
      fireEvent(toggleButton, 'press')
    })

    expect(mockedCheck).toHaveBeenCalledTimes(1)

    const continueButton = await findByTestId(testIdWithKey('Continue'))
    await waitFor(() => {
      fireEvent(continueButton, 'press')
    })

    expect(authContext.commitPIN).toHaveBeenCalledTimes(1)
  })
})
