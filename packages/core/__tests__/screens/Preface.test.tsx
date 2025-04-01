import { fireEvent, render, screen } from '@testing-library/react-native'
import React from 'react'

import Preface from '../../src/screens/Preface'
import { testIdWithKey } from '../../src/utils/testable'

describe('Preface Screen', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })
  afterEach(() => {
    jest.clearAllTimers()
  })
  test('Renders correctly', async () => {
    const tree = render(<Preface />)
    expect(tree).toMatchSnapshot()
  })
  test('Button enabled by checkbox being checked', async () => {
    render(<Preface />)

    //expect((await screen.findByTestId(testIdWithKey('IAgree')))).toBe(true)
    const checkbox = await screen.findByTestId(testIdWithKey('IAgree'))
    fireEvent(checkbox, 'press')

    expect(screen).toMatchSnapshot()
  })
})
