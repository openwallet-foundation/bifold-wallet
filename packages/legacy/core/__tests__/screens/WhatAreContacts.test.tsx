import { useNavigation } from '@react-navigation/native'
import { render } from '@testing-library/react-native'
import React from 'react'

import WhatAreContacts from '../../App/screens/WhatAreContacts'
import { BasicAppContext } from '../helpers/app'

describe('WhatAreContacts Screen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Renders correctly', async () => {
    const tree = render(
      <BasicAppContext>
        <WhatAreContacts navigation={useNavigation()} />
      </BasicAppContext>
    )
    expect(tree).toMatchSnapshot()
  })
})
