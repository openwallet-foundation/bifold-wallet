import { useNavigation } from '@react-navigation/native'
import { render, fireEvent, act } from '@testing-library/react-native'
import React from 'react'
import CameraDisclosureModal from '../../src/components/modals/CameraDisclosureModal'
import { testIdWithKey } from '../../src/utils/testable'

let requestCameraUse = jest.fn(() => Promise.resolve(true))

describe('CameraDisclosureModal Component', () => {
  beforeAll(() => {
    jest.useFakeTimers()
  })
  afterAll(() => {
    jest.useRealTimers()
  })
  beforeEach(() => {
    jest.clearAllMocks()
    requestCameraUse = jest.fn(() => Promise.resolve(true))
  })

  test('Renders correctly', () => {
    const tree = render(<CameraDisclosureModal requestCameraUse={requestCameraUse} />)
    expect(tree).toMatchSnapshot()
  })

  test('Pressing "Continue" triggers requestCameraUse callback', async () => {
    const { getByTestId } = render(<CameraDisclosureModal requestCameraUse={requestCameraUse} />)
    const continueButton = getByTestId(testIdWithKey('Continue'))
    await act(async () => {
      fireEvent(continueButton, 'press')
      expect(requestCameraUse).toHaveBeenCalledTimes(1)
    })
  })

  test('Pressing "Not now" navigates correctly', async () => {
    const navigation = useNavigation()
    const { getByTestId } = render(<CameraDisclosureModal requestCameraUse={requestCameraUse} />)
    const notNowButton = getByTestId(testIdWithKey('NotNow'))
    await act(async () => {
      fireEvent(notNowButton, 'press')
    })
    expect(navigation.navigate).toBeCalled()
    expect(navigation.navigate).toHaveBeenCalledTimes(1)
  })
})
