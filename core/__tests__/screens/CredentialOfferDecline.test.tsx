import { CredentialRecord, CredentialState } from '@aries-framework/core'
import { useCredentialById } from '@aries-framework/react-hooks'
import { useNavigation } from '@react-navigation/core'
import { render, waitFor, fireEvent } from '@testing-library/react-native'
import fs from 'fs'
import path from 'path'
import React from 'react'

import CredentialOfferDecline from '../../App/screens/CredentialOfferDecline'
import { testIdWithKey } from '../../App/utils/testable'

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')
jest.useFakeTimers('legacy')
jest.spyOn(global, 'setTimeout')

const onGoBackTouched = jest.fn()
const onDeclinedConformationTouched = jest.fn()

// const credentialPath = path.join(__dirname, '../fixtures/degree-credential.json')
// const credential = JSON.parse(fs.readFileSync(credentialPath, 'utf8'))
// const credentialRecord = new CredentialRecord(credential)
// // TODO:(jl) Make a fn to revive JSON dates properly and pass to `parse`
// credentialRecord.createdAt = new Date(credentialRecord.createdAt)

// // @ts-ignore
// useCredentialById.mockReturnValue(credentialRecord)

describe('displays a credential decline screen', () => {
  beforeEach(() => {
    onGoBackTouched.mockReset()
    onDeclinedConformationTouched.mockReset()
  })

  test('renders correctly', () => {
    const tree = render(
      <CredentialOfferDecline
        visible={true}
        didDeclineOffer={false}
        onGoBackTouched={onGoBackTouched}
        onDeclinedConformationTouched={onDeclinedConformationTouched}
      />
    )

    const confirmDeclineButton = tree.getByTestId(testIdWithKey('ConfirmDeclineCredential'))
    const abortDeclineButton = tree.getByTestId(testIdWithKey('AbortDeclineCredential'))

    expect(tree).toMatchSnapshot()
    expect(confirmDeclineButton).not.toBeNull()
    expect(abortDeclineButton).not.toBeNull()
  })

  test('user confirms decline', () => {
    const tree = render(
      <CredentialOfferDecline
        visible={true}
        didDeclineOffer={false}
        onGoBackTouched={onGoBackTouched}
        onDeclinedConformationTouched={onDeclinedConformationTouched}
      />
    )

    const confirmDeclineButton = tree.getByTestId(testIdWithKey('ConfirmDeclineCredential'))

    fireEvent(confirmDeclineButton, 'press')

    expect(onGoBackTouched).toBeCalledTimes(0)
    expect(onDeclinedConformationTouched).toBeCalledTimes(1)
  })

  test('user aborts decline', () => {
    const tree = render(
      <CredentialOfferDecline
        visible={true}
        didDeclineOffer={false}
        onGoBackTouched={onGoBackTouched}
        onDeclinedConformationTouched={onDeclinedConformationTouched}
      />
    )

    const abortDeclineButton = tree.getByTestId(testIdWithKey('AbortDeclineCredential'))

    fireEvent(abortDeclineButton, 'press')

    expect(onGoBackTouched).toBeCalledTimes(1)
    expect(onDeclinedConformationTouched).toBeCalledTimes(0)
  })
})
