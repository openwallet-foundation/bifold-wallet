import { act, fireEvent, render, screen } from '@testing-library/react-native'
import React from 'react'

import Preface from '../../App/screens/Preface'
import { testIdWithKey } from '../../App/utils/testable'

describe('Preface Screen', () => {
  test('Renders correctly', async () => {
    const tree = render(<Preface />)
    expect(tree).toMatchSnapshot()
  })

  test('Button enabled by checkbox being checked', async () => {
    render(<Preface />)

    await act(()=>{
      const checkbox = screen.getByTestId(testIdWithKey('IAgree'))
      fireEvent(checkbox, 'press')
      expect(screen).toMatchSnapshot()
    })
  })
})
