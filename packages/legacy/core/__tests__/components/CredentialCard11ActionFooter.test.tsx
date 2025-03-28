import '@testing-library/jest-native/extend-expect'
import { render } from '@testing-library/react-native'
import React from 'react'

import CredentialActionFooter from '../../App/components/misc/CredentialCard11ActionFooter'

describe('CredentialCard11ActionFooter Component', () => {
  test('Matches snapshot', async () => {
    const tree = render(<CredentialActionFooter testID={'test'} text={'sample'} onPress={jest.fn()} />)

    expect(tree).toMatchSnapshot()
  })
})
