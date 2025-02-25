import '@testing-library/jest-native/extend-expect'
import { render } from '@testing-library/react-native'
import React from 'react'

import CredentialActionFooter from '../../App/components/misc/CredentialCard11ActionFooter'
import { BasicAppContext } from '../helpers/app'

describe('CredentialCard11ActionFooter Component', () => {
  test('Matches snapshot', async () => {
    const tree = render(
      <BasicAppContext>
        <CredentialActionFooter testID={'test'} text={'sample'} onPress={jest.fn()} />
      </BasicAppContext>
    )

    expect(tree).toMatchSnapshot()
  })
})
