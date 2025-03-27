import { render, fireEvent } from '@testing-library/react-native'
import React from 'react'

import CommonRemoveModal from '../../App/components/modals/CommonRemoveModal'
import { ModalUsage } from '../../App/types/remove'
import { testIdWithKey } from '../../App/utils/testable'
import { BasicAppContext } from '../helpers/app'

describe('CommonRemoveModal Component', () => {
  test('Rerenders correctly when not visible', async () => {
    const tree = render(
      <BasicAppContext>
        <CommonRemoveModal visible={true} usage={ModalUsage.ContactRemove} />
      </BasicAppContext>
    )

    expect(tree).toMatchSnapshot()
  })

  test('Controls trigger callbacks', async () => {
    const onSubmit = jest.fn()
    const onCancel = jest.fn()
    const tree = render(
      <BasicAppContext>
        <CommonRemoveModal onSubmit={onSubmit} onCancel={onCancel} visible={true} usage={ModalUsage.ContactRemove} />
      </BasicAppContext>
    )

    const confirmButton = tree.getByTestId(testIdWithKey('ConfirmRemoveButton'))
    const cancelDeclineButton = tree.getByTestId(testIdWithKey('CancelRemoveButton'))

    fireEvent(confirmButton, 'press')
    fireEvent(cancelDeclineButton, 'press')

    expect(onSubmit).toBeCalledTimes(1)
    expect(onCancel).toBeCalledTimes(1)
  })

  test('Remove contact renders correctly', async () => {
    const tree = render(
      <BasicAppContext>
        <CommonRemoveModal visible={true} usage={ModalUsage.ContactRemove} />
      </BasicAppContext>
    )

    expect(tree).toMatchSnapshot()
  })

  test('Remove contact renders correctly2', async () => {
    const tree = render(
      <BasicAppContext>
        <CommonRemoveModal visible={true} usage={ModalUsage.ContactRemoveWithCredentials} />
      </BasicAppContext>
    )

    expect(tree).toMatchSnapshot()
  })

  test('Remove credential renders correctly', async () => {
    const tree = render(
      <BasicAppContext>
        <CommonRemoveModal visible={true} usage={ModalUsage.CredentialRemove} />
      </BasicAppContext>
    )

    expect(tree).toMatchSnapshot()
  })

  test('Credential offer decline renders correctly', async () => {
    const tree = render(
      <BasicAppContext>
        <CommonRemoveModal visible={true} usage={ModalUsage.CredentialOfferDecline} />
      </BasicAppContext>
    )

    expect(tree).toMatchSnapshot()
  })

  test('Proof request decline renders correctly', async () => {
    const tree = render(
      <BasicAppContext>
        <CommonRemoveModal visible={true} usage={ModalUsage.ProofRequestDecline} />
      </BasicAppContext>
    )

    expect(tree).toMatchSnapshot()
  })

  test('Custom notification decline renders correctly', async () => {
    const tree = render(
      <BasicAppContext>
        <CommonRemoveModal visible={true} usage={ModalUsage.CustomNotificationDecline} />
      </BasicAppContext>
    )

    expect(tree).toMatchSnapshot()
  })
})
