import { render, fireEvent } from '@testing-library/react-native'

import React from 'react'

import CommonDecline, { DeclineType } from '../../App/screens/CommonDecline'
import { testIdWithKey } from '../../App/utils/testable'

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')
jest.mock('@react-navigation/core', () => {
  return require('../../__mocks__/custom/@react-navigation/core')
})
jest.mock('@react-navigation/native', () => {
  return require('../../__mocks__/custom/@react-navigation/native')
})

const onGoBackTouched = jest.fn()
const onDeclinedConformationTouched = jest.fn()

describe('common decline screen', () => {
  beforeEach(() => {
    onGoBackTouched.mockReset()
    onDeclinedConformationTouched.mockReset()
  })

  test('decline proof renders correctly', () => {
    const tree = render(
      <CommonDecline
        visible={true}
        declineType={DeclineType.ProofRequest}
        didDeclineOfferOrProof={false}
        onGoBackTouched={onGoBackTouched}
        onDeclinedConformationTouched={onDeclinedConformationTouched}
      />
    )

    const confirmDeclineButton = tree.getByTestId(testIdWithKey('ConfirmDeclineButton'))
    const abortDeclineButton = tree.getByTestId(testIdWithKey('AbortDeclineButton'))

    expect(tree).toMatchSnapshot()
    expect(confirmDeclineButton).not.toBeNull()
    expect(abortDeclineButton).not.toBeNull()
  })

  test('user confirms decline', () => {
    const tree = render(
      <CommonDecline
        visible={true}
        declineType={DeclineType.ProofRequest}
        didDeclineOfferOrProof={false}
        onGoBackTouched={onGoBackTouched}
        onDeclinedConformationTouched={onDeclinedConformationTouched}
      />
    )

    const confirmDeclineButton = tree.getByTestId(testIdWithKey('ConfirmDeclineButton'))

    fireEvent(confirmDeclineButton, 'press')

    expect(onGoBackTouched).toBeCalledTimes(0)
    expect(onDeclinedConformationTouched).toBeCalledTimes(1)
  })

  test('user aborts decline', () => {
    const tree = render(
      <CommonDecline
        visible={true}
        declineType={DeclineType.ProofRequest}
        didDeclineOfferOrProof={false}
        onGoBackTouched={onGoBackTouched}
        onDeclinedConformationTouched={onDeclinedConformationTouched}
      />
    )

    const abortDeclineButton = tree.getByTestId(testIdWithKey('AbortDeclineButton'))

    fireEvent(abortDeclineButton, 'press')

    expect(onGoBackTouched).toBeCalledTimes(1)
    expect(onDeclinedConformationTouched).toBeCalledTimes(0)
  })

  test('decline offer renders correctly', () => {
    const tree = render(
      <CommonDecline
        visible={true}
        declineType={DeclineType.CredentialOffer}
        didDeclineOfferOrProof={false}
        onGoBackTouched={onGoBackTouched}
        onDeclinedConformationTouched={onDeclinedConformationTouched}
      />
    )

    const confirmDeclineButton = tree.getByTestId(testIdWithKey('ConfirmDeclineButton'))
    const abortDeclineButton = tree.getByTestId(testIdWithKey('AbortDeclineButton'))

    expect(tree).toMatchSnapshot()
    expect(confirmDeclineButton).not.toBeNull()
    expect(abortDeclineButton).not.toBeNull()
  })
})
