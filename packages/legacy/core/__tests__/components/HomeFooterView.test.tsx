import { CredentialExchangeRecord as CredentialRecord, CredentialRole, CredentialState } from '@credo-ts/core'
import { useCredentialByState } from '@credo-ts/react-hooks'
import { render } from '@testing-library/react-native'
import React from 'react'

import HomeFooterView from '../../App/components/views/HomeFooterView'

describe('HomeFooterView Component', () => {
  test('Renders correctly with no notifications', async () => {
    const tree = render(<HomeFooterView />)

    expect(tree).toMatchSnapshot()
  })

  test('Renders correctly with notifications', async () => {
    const testCredentialRecords: CredentialRecord[] = [
      new CredentialRecord({
        role: CredentialRole.Holder,
        threadId: '1',
        state: CredentialState.OfferReceived,
        protocolVersion: 'v1',
      }),
    ]
    // @ts-ignore
    useCredentialByState.mockReturnValue(testCredentialRecords)

    const tree = render(<HomeFooterView />)

    expect(tree).toMatchSnapshot()
  })
})
