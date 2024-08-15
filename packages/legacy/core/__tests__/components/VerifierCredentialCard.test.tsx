import { act, render } from '@testing-library/react-native'
import React from 'react'

import VerifierCredentialCard from '../../App/components/misc/VerifierCredentialCard'
import { BasicAppContext } from '../helpers/app'


const displayItems = [
  {
    name: 'given_names',
    restrictions: [
      { schema_id: '4eCXHS79ykiMv2PoBxPK23:2:unverified_person:0.1.0', issuer_did: '4eCXHS79ykiMv2PoBxPK23' },
      { schema_id: 'HTkhhCW1bAXWnxC1u3YVoa:2:unverified_person:0.1.0', issuer_did: 'HTkhhCW1bAXWnxC1u3YVoa' },
      { schema_id: 'Ui6HA36FvN83cEtmYYHxrn:2:unverified_person:0.1.0', issuer_did: 'Ui6HA36FvN83cEtmYYHxrn' },
    ],
    nonRevoked: { to: 1708583231 },
    value: null,
  },
  {
    name: 'family_name',
    restrictions: [
      { schema_id: '4eCXHS79ykiMv2PoBxPK23:2:unverified_person:0.1.0', issuer_did: '4eCXHS79ykiMv2PoBxPK23' },
      { schema_id: 'HTkhhCW1bAXWnxC1u3YVoa:2:unverified_person:0.1.0', issuer_did: 'HTkhhCW1bAXWnxC1u3YVoa' },
      { schema_id: 'Ui6HA36FvN83cEtmYYHxrn:2:unverified_person:0.1.0', issuer_did: 'Ui6HA36FvN83cEtmYYHxrn' },
    ],
    nonRevoked: { to: 1708583231 },
    value: null,
  },
]

describe('VerifierCredentialCard Component', () => {
  test('Renders correctly', async () => {
    const tree = render(
      <BasicAppContext>
        <VerifierCredentialCard
          schemaId={'4eCXHS79ykiMv2PoBxPK23:2:unverified_person:0.1.0'}
          onChangeValue={jest.fn()}
          displayItems={displayItems}
          elevated
        />
      </BasicAppContext>
    )
    await act(async () => { })
    expect(tree).toMatchSnapshot()
  })
})
