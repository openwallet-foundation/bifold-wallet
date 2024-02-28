import { useCredentialByState } from '@credo-ts-ext/react-hooks'
import { CredentialExchangeRecord as CredentialRecord, CredentialState } from '@credo-ts/core'
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
