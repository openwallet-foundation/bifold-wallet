import { useNavigation } from '@react-navigation/core'
import { render } from '@testing-library/react-native'
import React from 'react'

import WhatAreContacts from '../../App/screens/WhatAreContacts'

jest.mock('@react-navigation/core', () => {
  return require('../../__mocks__/custom/@react-navigation/core')
})
jest.mock('@react-navigation/native', () => {
  return require('../../__mocks__/custom/@react-navigation/native')
})

describe('WhatAreContacts Screen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Renders correctly', async () => {
    const tree = render(<WhatAreContacts navigation={useNavigation()} />)
    expect(tree).toMatchSnapshot()
  })
})
