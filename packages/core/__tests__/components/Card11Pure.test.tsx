import React from 'react'
import { render } from '@testing-library/react-native'

import Card11Pure from '../../src/components/misc/Card11Pure'
import { WalletCredentialCardData } from '../../src/wallet/ui-types'
import { BasicAppContext } from '../helpers/app'

const baseData: WalletCredentialCardData = {
  id: 'cred-1',
  issuerName: 'Issuer',
  credentialName: 'Credential',
  branding: { type: 'Branding10', primaryBg: '#003366' },
  brandingType: 'Branding10',
  items: [
    { key: 'given_name', label: 'Given Name', value: 'Jane' },
    { key: 'family_name', label: 'Family Name', value: 'Doe' },
    { key: 'birthdate', label: 'Birthdate', value: '1990-01-01' },
  ],
}

const renderCard = (data: WalletCredentialCardData) =>
  render(
    <BasicAppContext>
      <Card11Pure data={data} />
    </BasicAppContext>
  )

describe('Card11Pure', () => {
  test('outside of proofs, renders only primary and secondary attributes in order', () => {
    const tree = renderCard({ ...baseData, primaryAttributeKey: 'family_name', secondaryAttributeKey: 'given_name' })

    expect(tree.getByText('Family Name')).toBeTruthy()
    expect(tree.getByText('Doe')).toBeTruthy()
    expect(tree.getByText('Given Name')).toBeTruthy()
    expect(tree.getByText('Jane')).toBeTruthy()
    expect(tree.queryByText('Birthdate')).toBeNull()

    const labels = tree.getAllByText(/Name$/).map((n) => n.props.children)
    expect(labels).toEqual(['Family Name', 'Given Name'])
  })

  test('outside of proofs, renders only the primary attribute when no secondary is set', () => {
    const tree = renderCard({ ...baseData, primaryAttributeKey: 'given_name' })

    expect(tree.getByText('Jane')).toBeTruthy()
    expect(tree.queryByText('Family Name')).toBeNull()
    expect(tree.queryByText('Birthdate')).toBeNull()
  })

  test('outside of proofs, renders no attributes when primary and secondary are unset', () => {
    const tree = renderCard(baseData)

    expect(tree.queryByText('Given Name')).toBeNull()
    expect(tree.queryByText('Family Name')).toBeNull()
    expect(tree.queryByText('Birthdate')).toBeNull()
  })

  test('outside of proofs, ignores keys that do not match an attribute', () => {
    const tree = renderCard({ ...baseData, primaryAttributeKey: 'missing', secondaryAttributeKey: 'birthdate' })

    expect(tree.getByText('Birthdate')).toBeTruthy()
    expect(tree.queryByText('Given Name')).toBeNull()
  })

  test('in a proof, renders all attributes', () => {
    const tree = renderCard({ ...baseData, proofContext: true, primaryAttributeKey: 'given_name' })

    expect(tree.getByText('Given Name')).toBeTruthy()
    expect(tree.getByText('Family Name')).toBeTruthy()
    expect(tree.getByText('Birthdate')).toBeTruthy()
  })
})
