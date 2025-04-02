import { CredentialExchangeRecord as CredentialRecord, CredentialRole, CredentialState } from '@credo-ts/core'
import { useCredentialByState } from '@credo-ts/react-hooks'
import { render } from '@testing-library/react-native'
import React from 'react'

import HomeFooterView from '../../src/components/views/HomeFooterView'
import { BasicAppContext } from '../helpers/app'

describe('HomeFooterView Component', () => {
  test('Renders correctly with no notifications', async () => {
    const tree = render(
      <BasicAppContext>
        <HomeFooterView />
      </BasicAppContext>
    )

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
    // @ts-expect-error useCredentialByState will be replaced with a mock which will have this method
    useCredentialByState.mockReturnValue(testCredentialRecords)

    const tree = render(
      <BasicAppContext>
        <HomeFooterView />
      </BasicAppContext>
    )

    expect(tree).toMatchSnapshot()
  })
})
