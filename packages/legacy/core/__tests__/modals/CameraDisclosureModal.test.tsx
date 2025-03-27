import { useNavigation } from '@react-navigation/native'
import { render, fireEvent, act } from '@testing-library/react-native'
import React from 'react'
import CameraDisclosureModal from '../../App/components/modals/CameraDisclosureModal'
import { testIdWithKey } from '../../App/utils/testable'
import { BasicAppContext } from '../helpers/app'

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
    const tree = render(
      <BasicAppContext>
        <CameraDisclosureModal requestCameraUse={requestCameraUse} />
      </BasicAppContext>
    )
    expect(tree).toMatchSnapshot()
  })

  test('Pressing "Continue" triggers requestCameraUse callback', async () => {
    const { getByTestId } = render(
      <BasicAppContext>
        <CameraDisclosureModal requestCameraUse={requestCameraUse} />
      </BasicAppContext>
    )
    const continueButton = getByTestId(testIdWithKey('Continue'))
    await act(async () => {
      fireEvent(continueButton, 'press')
      expect(requestCameraUse).toHaveBeenCalledTimes(1)
    })
  })

  test('Pressing "Not now" navigates correctly', async () => {
    const navigation = useNavigation()
    const { getByTestId } = render(
      <BasicAppContext>
        <CameraDisclosureModal requestCameraUse={requestCameraUse} />
      </BasicAppContext>
    )
    const notNowButton = getByTestId(testIdWithKey('NotNow'))
    await act(async () => {
      fireEvent(notNowButton, 'press')
    })
    expect(navigation.navigate).toBeCalled()
    expect(navigation.navigate).toHaveBeenCalledTimes(1)
  })
})
