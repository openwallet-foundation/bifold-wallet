import { render, fireEvent } from '@testing-library/react-native'
import React from 'react'

import CommonDeclineModal from '../../App/components/modals/CommonDeclineModal'
import { ModalUsage } from '../../App/types/remove'
import { testIdWithKey } from '../../App/utils/testable'

describe('CommonDeclineModal Component', () => {
  test('Rerenders correctly when not visible', async () => {
    const tree = render(<CommonDeclineModal visible={true} usage={ModalUsage.CredentialOfferDecline} />)

    expect(tree).toMatchSnapshot()
  })

  test('Controls trigger callbacks', async () => {
    const onSubmit = jest.fn()
    const onCancel = jest.fn()
    const tree = render(
      <CommonDeclineModal
        onSubmit={onSubmit}
        onCancel={onCancel}
        visible={true}
        usage={ModalUsage.CredentialOfferDecline}
      />
    )

    const confirmButton = tree.getByTestId(testIdWithKey('ConfirmDeclineButton'))
    const cancelDeclineButton = tree.getByTestId(testIdWithKey('CancelDeclineButton'))

    fireEvent(confirmButton, 'press')
    fireEvent(cancelDeclineButton, 'press')

    expect(onSubmit).toBeCalledTimes(1)
    expect(onCancel).toBeCalledTimes(1)
  })

  test('Credential offer decline renders correctly', async () => {
    const tree = render(<CommonDeclineModal visible={true} usage={ModalUsage.CredentialOfferDecline} />)

    expect(tree).toMatchSnapshot()
  })

  test('Proof request decline renders correctly', async () => {
    const tree = render(<CommonDeclineModal visible={true} usage={ModalUsage.ProofRequestDecline} />)

    expect(tree).toMatchSnapshot()
  })

  test('Custom notification decline renders correctly', async () => {
    const tree = render(<CommonDeclineModal visible={true} usage={ModalUsage.CustomNotificationDecline} />)

    expect(tree).toMatchSnapshot()
  })
})
