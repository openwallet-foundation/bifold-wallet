import { useNavigation } from '@react-navigation/core'
import { render, fireEvent, act } from '@testing-library/react-native'
import React from 'react'

import CameraDisclosureModal from '../../App/components/modals/CameraDisclosureModal'
import { testIdWithKey } from '../../App/utils/testable'

let requestCameraUse = jest.fn(() => Promise.resolve(true))
jest.mock('@react-navigation/core', () => {
  return require('../../__mocks__/custom/@react-navigation/core')
})
jest.mock('@react-navigation/native', () => {
  return require('../../__mocks__/custom/@react-navigation/native')
})

describe('CameraDisclosureModal Component', () => {
  beforeAll(()=>{
    jest.useFakeTimers()
  })
  afterAll(()=>{
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
