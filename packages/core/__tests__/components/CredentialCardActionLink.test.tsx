import React from 'react'
import { fireEvent, render } from '@testing-library/react-native'

import Card10Pure from '../../src/components/misc/Card10Pure'
import Card11Pure from '../../src/components/misc/Card11Pure'
import CredentialCardActionLink from '../../src/components/misc/CredentialCardActionLink'
import { testIdWithKey } from '../../src/utils/testable'
import { WalletCredentialCardData } from '../../src/wallet/ui-types'
import { BasicAppContext } from '../helpers/app'

const data: WalletCredentialCardData = {
  id: 'cred-1',
  issuerName: 'Issuer',
  credentialName: 'Credential',
  branding: { type: 'Branding10', primaryBg: '#003366' },
  brandingType: 'Branding10',
  items: [{ key: 'given_name', label: 'Given Name', value: 'Jane' }],
  proofContext: true,
}

describe('CredentialCardActionLink', () => {
  test('labels the change credential link with the translated string', () => {
    const tree = render(
      <BasicAppContext>
        <CredentialCardActionLink hasAltCredentials onChangeAlt={jest.fn()} />
      </BasicAppContext>
    )

    const link = tree.getByTestId(testIdWithKey('ChangeCredential'))
    expect(link.props.accessibilityLabel).toBe('ProofRequest.ChangeCredential')
    expect(tree.getByText('ProofRequest.ChangeCredential')).toBeTruthy()
  })
})

// The card is one element to screen readers, so the link inside it is offered as an action instead.
describe.each([
  ['Card10Pure', Card10Pure],
  ['Card11Pure', Card11Pure],
])('%s change credential accessibility', (_name, Card) => {
  const renderCard = (props: Partial<React.ComponentProps<typeof Card>>) =>
    render(
      <BasicAppContext>
        <Card data={data} {...props} />
      </BasicAppContext>
    )

  // The element screen readers focus: the card body, labelled from the issuer, name and attributes.
  const getCard = (tree: ReturnType<typeof renderCard>) => tree.getByLabelText(/^Issued by Issuer, Credential/)

  test('offers change credential as an action on the card', () => {
    const onChangeAlt = jest.fn()
    const tree = renderCard({ hasAltCredentials: true, onChangeAlt })

    const card = getCard(tree)
    expect(card.props.accessibilityActions).toEqual([
      { name: 'changeCredential', label: 'ProofRequest.ChangeCredential' },
    ])

    fireEvent(card, 'accessibilityAction', { nativeEvent: { actionName: 'changeCredential' } })
    expect(onChangeAlt).toHaveBeenCalledTimes(1)
  })

  test('ignores other actions', () => {
    const onChangeAlt = jest.fn()
    const tree = renderCard({ hasAltCredentials: true, onChangeAlt })

    fireEvent(getCard(tree), 'accessibilityAction', { nativeEvent: { actionName: 'activate' } })
    expect(onChangeAlt).not.toHaveBeenCalled()
  })

  test('offers no action when there is nothing to change to', () => {
    const tree = renderCard({ onChangeAlt: jest.fn() })

    expect(getCard(tree).props.accessibilityActions).toBeUndefined()
  })

  test('passes the accessibility role and state to the card', () => {
    const tree = renderCard({ accessibilityRole: 'button', accessibilityState: { selected: true } })

    expect(tree.getByRole('button', { selected: true })).toBeTruthy()
  })
})
