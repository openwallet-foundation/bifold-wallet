import { useNavigation } from '@react-navigation/core'
import { render, fireEvent, act } from '@testing-library/react-native'
import React from 'react'

import CameraDisclosureModal from '../../App/components/modals/CameraDisclosureModal'
import { Screens } from '../../App/types/navigators'
import { testIdWithKey } from '../../App/utils/testable'

let requestCameraUse = jest.fn(() => Promise.resolve(true))
jest.mock('@react-navigation/core', () => {
  return require('../../__mocks__/custom/@react-navigation/core')
})
jest.mock('@react-navigation/native', () => {
  return require('../../__mocks__/custom/@react-navigation/native')
})

describe('CameraDisclosureModal Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    requestCameraUse = jest.fn(() => Promise.resolve(true))
  })

  test('Renders correctly', () => {
    const tree = render(<CameraDisclosureModal requestCameraUse={requestCameraUse} />)
    expect(tree).toMatchSnapshot()
  })

  test('Pressing "Allow" triggers requestCameraUse callback', async () => {
    const { getByTestId } = render(<CameraDisclosureModal requestCameraUse={requestCameraUse} />)
    const allowButton = getByTestId(testIdWithKey('Allow'))
    await act(async () => {
      fireEvent(allowButton, 'press')
      expect(requestCameraUse).toHaveBeenCalledTimes(1)
    })
  })

  test('Pressing "Not now" navigates correctly', () => {
    const navigation = useNavigation()
    const { getByTestId } = render(<CameraDisclosureModal requestCameraUse={requestCameraUse} />)
    const notNowButton = getByTestId(testIdWithKey('NotNow'))
    fireEvent(notNowButton, 'press')

    expect(navigation.navigate).toBeCalledWith(Screens.Home)
    expect(navigation.navigate).toHaveBeenCalledTimes(1)
  })
})
