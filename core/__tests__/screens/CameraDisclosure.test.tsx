import { render, fireEvent } from '@testing-library/react-native'
import React from 'react'

import CameraDisclosure from '../../src/screens/CameraDisclosure'
import { testIdWithKey } from '../../src/utils/testable'

jest.mock('@react-navigation/core', () => {
  return require('../../__mocks__/custom/@react-navigation/core')
})
jest.mock('@react-navigation/native', () => {
  return require('../../__mocks__/custom/@react-navigation/native')
})

describe('CameraDisclosure Screen', () => {
  it('Renders correctly', () => {
    const cb = jest.fn()
    const tree = render(<CameraDisclosure didDismissCameraDisclosure={cb} />)

    expect(tree).toMatchSnapshot()
  })

  it('Okay button triggers callback', () => {
    const cb = jest.fn()
    const { getByTestId } = render(<CameraDisclosure didDismissCameraDisclosure={cb} />)

    const okayButton = getByTestId(testIdWithKey('Okay'))
    fireEvent(okayButton, 'press')

    expect(cb).toBeCalledTimes(1)
  })
})
