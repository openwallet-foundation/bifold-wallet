import { fireEvent, render, screen } from '@testing-library/react-native'
import React from 'react'

import Preface from '../../App/screens/Preface'
import { testIdWithKey } from '../../App/utils/testable'
import { BasicAppContext } from '../helpers/app'

describe('Preface Screen', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })
  afterEach(() => {
    jest.clearAllTimers()
  })
  test('Renders correctly', async () => {
    const tree = render(
      <BasicAppContext>
        <Preface />
      </BasicAppContext>
    )
    expect(tree).toMatchSnapshot()
  })
  test('Button enabled by checkbox being checked', async () => {
    render(
      <BasicAppContext>
        <Preface />
      </BasicAppContext>
    )

    //expect((await screen.findByTestId(testIdWithKey('IAgree')))).toBe(true)
    const checkbox = await screen.findByTestId(testIdWithKey('IAgree'))
    fireEvent(checkbox, 'press')

    expect(screen).toMatchSnapshot()
  })
})
