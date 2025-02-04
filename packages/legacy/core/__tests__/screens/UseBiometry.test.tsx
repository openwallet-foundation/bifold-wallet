import { render, fireEvent, waitFor } from '@testing-library/react-native'
import React from 'react'
import { AuthContext } from '../../App/contexts/auth'
import UseBiometry from '../../App/screens/UseBiometry'
import { testIdWithKey } from '../../App/utils/testable'
import authContext from '../contexts/auth'
import timeTravel from '../helpers/timetravel'
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
    const Component = () => null;
    Component.displayName = 'Header';
    return Component;
  }),
  HeaderBackButton: jest.fn().mockImplementation(() => {
    const Component = () => null;
    Component.displayName = 'HeaderBackButton';
    return Component;
  }),
  useHeaderHeight: jest.fn().mockReturnValue(150)
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: jest.fn().mockReturnValue({
    top: 25,
    bottom: 25,
    left: 0,
    right: 0
  }),
  SafeAreaView: jest.fn().mockImplementation(({children}) => children)
}));

const customStore = {
  ...testDefaultState,
  preferences: {
    ...testDefaultState.preferences,
    useBiometry: false,
  },
}

describe('UseBiometry Screen', () => {
  beforeAll(() => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    jest.spyOn(global.console, 'error').mockImplementation(() => {})
  })

  beforeEach(() => {
    jest.clearAllMocks()

    authContext.isBiometricsActive = jest.fn().mockResolvedValue(true)
    customStore.preferences.useBiometry = false
    mockedCheck.mockResolvedValue(RESULTS.UNAVAILABLE)
    mockedRequest.mockResolvedValue(RESULTS.BLOCKED)
  })

  test('Renders correctly when biometry available', async () => {
    authContext.isBiometricsActive = jest.fn().mockResolvedValueOnce(true)
    const tree = render(
      <BasicAppContext>
        <AuthContext.Provider value={authContext}>
            <UseBiometry />
        </AuthContext.Provider>
      </BasicAppContext>
    )

    await waitFor(() => {
      timeTravel(1000)
    })

    expect(tree).toMatchSnapshot()
  })

  test('Renders correctly when biometry not available', async () => {
    authContext.isBiometricsActive = jest.fn().mockResolvedValueOnce(false)
    const tree = render(
      <BasicAppContext>
        <AuthContext.Provider value={authContext}>
            <UseBiometry />
        </AuthContext.Provider>
      </BasicAppContext>
    )

    await waitFor(() => {
      timeTravel(1000)
    })

    expect(tree).toMatchSnapshot()
  })

  test('Toggles use biometrics ok', async () => {
    authContext.isBiometricsActive = jest.fn().mockResolvedValueOnce(true)
    const tree = render(
      <BasicAppContext>
        <AuthContext.Provider value={authContext}>
          <UseBiometry />
        </AuthContext.Provider>
      </BasicAppContext>
    )

    const useBiometryToggle = tree.getByTestId(testIdWithKey('ToggleBiometrics'))

    await waitFor(async () => {
      fireEvent(useBiometryToggle, 'valueChange', true)
    })

    const continueButton = tree.getByTestId(testIdWithKey('Continue'))

    await waitFor(async () => {
      fireEvent(continueButton, 'press')
    })

    expect(useBiometryToggle).not.toBeNull()
    expect(continueButton).not.toBeNull()
    expect(authContext.commitPIN).toBeCalledTimes(1)
    expect(tree).toMatchSnapshot()
  })

  describe('ToggleButton Availability', () => {
    test('ToggleButton is enabled when biometry is available', async () => {
      authContext.isBiometricsActive = jest.fn().mockResolvedValueOnce(true)

      const { getByTestId } = render(
        <BasicAppContext>
          <AuthContext.Provider value={authContext}>
            <UseBiometry />
          </AuthContext.Provider>
        </BasicAppContext>
      )

      const toggleButton = getByTestId(testIdWithKey('ToggleBiometrics'))
      expect(toggleButton.props.accessibilityState.disabled).toBe(false)
    })

    test('ToggleButton is enabled even when biometry is not available', async () => {
      authContext.isBiometricsActive = jest.fn().mockResolvedValueOnce(false)

      const { getByTestId } = render(
        <BasicAppContext>
          <AuthContext.Provider value={authContext}>
            <UseBiometry />
          </AuthContext.Provider>
        </BasicAppContext>
      )

      const toggleButton = getByTestId(testIdWithKey('ToggleBiometrics'))
      expect(toggleButton.props.accessibilityState.disabled).toBe(false)
    })
  })

  describe('ToggleSwitch Behavior', () => {
    test('can turn off biometrics regardless of permission status', async () => {
      // Setup with toggle switch is on,
      // and biometric is not available
      customStore.preferences.useBiometry = true
      authContext.isBiometricsActive = jest.fn().mockResolvedValueOnce(false)

      const { getByTestId } = render(
        <StoreProvider initialState={customStore}>
          <BasicAppContext>
            <AuthContext.Provider value={authContext}>
              <UseBiometry />
            </AuthContext.Provider>
          </BasicAppContext>
        </StoreProvider>
      )

      const toggleButton = getByTestId(testIdWithKey('ToggleBiometrics'))

      await waitFor(() => {
        fireEvent(toggleButton, 'press')
      })

      expect(toggleButton.props.accessibilityState.checked).toBe(false)
    })

    test('turns on biometrics when permission is GRANTED', async () => {
      mockedCheck.mockResolvedValueOnce(RESULTS.GRANTED)

      const { getByTestId } = render(
        <StoreProvider initialState={customStore}>
          <BasicAppContext>
            <AuthContext.Provider value={authContext}>
              <UseBiometry />
            </AuthContext.Provider>
          </BasicAppContext>
        </StoreProvider>
      )

      const toggleButton = getByTestId(testIdWithKey('ToggleBiometrics'))

      await waitFor(() => {
        fireEvent(toggleButton, 'press')
      })

      expect(toggleButton.props.accessibilityState.checked).toBe(true)
    })

    test('shows settings popup when permission is UNAVAILABLE', async () => {
      mockedCheck.mockResolvedValueOnce(RESULTS.UNAVAILABLE)

      const { getByTestId, getByText } = render(
        <StoreProvider initialState={customStore}>
          <BasicAppContext>
            <AuthContext.Provider value={authContext}>
              <UseBiometry />
            </AuthContext.Provider>
          </BasicAppContext>
        </StoreProvider>
      )

      const toggleButton = getByTestId(testIdWithKey('ToggleBiometrics'))

      await waitFor(() => {
        fireEvent(toggleButton, 'press')
      })

      expect(getByText('Biometry.SetupBiometricsTitle')).toBeTruthy()
      expect(getByText('Biometry.SetupBiometricsDesc')).toBeTruthy()
      // Toggle should remain off
      expect(toggleButton.props.accessibilityState.checked).toBe(false)
    })

    test('shows settings popup when permission is BLOCKED', async () => {
      mockedCheck.mockResolvedValueOnce(RESULTS.BLOCKED)

      const { getByTestId, getByText } = render(
        <StoreProvider initialState={customStore}>
          <BasicAppContext>
            <AuthContext.Provider value={authContext}>
              <UseBiometry />
            </AuthContext.Provider>
          </BasicAppContext>
        </StoreProvider>
      )

      const toggleButton = getByTestId(testIdWithKey('ToggleBiometrics'))

      await waitFor(() => {
        fireEvent(toggleButton, 'press')
      })

      expect(getByText('Biometry.AllowBiometricsTitle')).toBeTruthy()
      expect(getByText('Biometry.AllowBiometricsDesc')).toBeTruthy()
      // Toggle should remain off
      expect(toggleButton.props.accessibilityState.checked).toBe(false)
    })

    test('requests permission when status is DENIED and enables when request is GRANTED', async () => {
      mockedCheck.mockResolvedValueOnce(RESULTS.DENIED)
      mockedRequest.mockResolvedValueOnce(RESULTS.GRANTED)

      const { getByTestId } = render(
        <StoreProvider initialState={customStore}>
          <BasicAppContext>
            <AuthContext.Provider value={authContext}>
              <UseBiometry />
            </AuthContext.Provider>
          </BasicAppContext>
        </StoreProvider>
      )

      const toggleButton = getByTestId(testIdWithKey('ToggleBiometrics'))

      await waitFor(() => {
        fireEvent(toggleButton, 'press')
      })

      expect(request).toHaveBeenCalledTimes(1)
      expect(toggleButton.props.accessibilityState.checked).toBe(true)
    })
  })

  test('requests permission when status is DENIED and switch stays off when request is BLOCKED', async () => {
    mockedCheck.mockResolvedValueOnce(RESULTS.DENIED)
    mockedRequest.mockResolvedValueOnce(RESULTS.BLOCKED)

    const { getByTestId } = render(
      <StoreProvider initialState={customStore}>
        <BasicAppContext>
          <AuthContext.Provider value={authContext}>
            <UseBiometry />
          </AuthContext.Provider>
        </BasicAppContext>
      </StoreProvider>
    )

    const toggleButton = getByTestId(testIdWithKey('ToggleBiometrics'))

    await waitFor(() => {
      fireEvent(toggleButton, 'press')
    })

    expect(request).toHaveBeenCalledTimes(1)
    // Switch stays off
    expect(toggleButton.props.accessibilityState.checked).toBe(false)
  })

  describe('Settings Popup Behavior', () => {
    test('opens app settings when Open Settings is pressed', async () => {
      // Mock permission check to return BLOCKED to trigger settings popup
      mockedCheck.mockResolvedValueOnce(RESULTS.BLOCKED)

      const { getByTestId, getByText } = render(
        <StoreProvider initialState={customStore}>
          <BasicAppContext>
            <AuthContext.Provider value={authContext}>
              <UseBiometry />
            </AuthContext.Provider>
          </BasicAppContext>
        </StoreProvider>
      )

      // Trigger the settings popup
      const toggleButton = getByTestId(testIdWithKey('ToggleBiometrics'))

      await waitFor(() => {
        fireEvent(toggleButton, 'press')
      })

      // Press the Open Settings button
      const openSettingsButton = getByText('Biometry.OpenSettings')
      await waitFor(() => {
        fireEvent(openSettingsButton, 'press')
      })

      expect(Linking.openSettings).toHaveBeenCalledTimes(1)
    })
  })
})
