import { useNavigation } from '@react-navigation/native'
import { render } from '@testing-library/react-native'
import React from 'react'

import WhatAreContacts from '../../src/screens/WhatAreContacts'

describe('WhatAreContacts Screen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Renders correctly', async () => {
    const tree = render(<WhatAreContacts navigation={useNavigation()} />)
    expect(tree).toMatchSnapshot()
  })
})
