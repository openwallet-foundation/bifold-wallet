import { DidCommCredentialExchangeRecord as CredentialRecord, DidCommCredentialRole, DidCommCredentialState } from '@credo-ts/didcomm'
import { useCredentialByState } from '@bifold/react-hooks'
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
        role: DidCommCredentialRole.Holder,
        threadId: '1',
        state: DidCommCredentialState.OfferReceived,
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
