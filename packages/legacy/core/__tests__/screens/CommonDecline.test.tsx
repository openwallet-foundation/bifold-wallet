import {
  CredentialExchangeRecord as CredentialRecord,
  CredentialState,
  ProofExchangeRecord,
  ProofState,
} from '@aries-framework/core'
import { useCredentialById, useProofById, useAgent } from '@aries-framework/react-hooks'
import { useNavigation } from '@react-navigation/core'
import { render, fireEvent, waitFor } from '@testing-library/react-native'
import fs from 'fs'
import path from 'path'
import React from 'react'
import { act } from 'react-test-renderer'

import { ConfigurationContext } from '../../App/contexts/configuration'
import CommonDecline from '../../App/screens/CommonDecline'
import { DeclineType } from '../../App/types/decline'
import { testIdWithKey } from '../../App/utils/testable'
import configurationContext from '../contexts/configuration'

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')
jest.mock('@react-navigation/core', () => {
  return require('../../__mocks__/custom/@react-navigation/core')
})
jest.mock('@react-navigation/native', () => {
  return require('../../__mocks__/custom/@react-navigation/native')
})
// eslint-disable-next-line @typescript-eslint/no-empty-function
jest.mock('react-native-localize', () => {})

const credentialPath = path.join(__dirname, '../fixtures/degree-credential.json')
const credential = JSON.parse(fs.readFileSync(credentialPath, 'utf8'))

const proofPath = path.join(__dirname, '../fixtures/degree-proof.json')
const proof = JSON.parse(fs.readFileSync(proofPath, 'utf8'))

describe('common decline screen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('decline proof renders correctly', () => {
    // @ts-ignore
    useProofById.mockReturnValueOnce(new ProofExchangeRecord(proof))

    const props = { params: { declineType: DeclineType.ProofRequest, itemId: 'b04060c8-902a-4f62-9390-7b8bb2204f13' } }
    const tree = render(<CommonDecline route={props as any} navigation={useNavigation()} />)
    const confirmDeclineButton = tree.getByTestId(testIdWithKey('ConfirmDeclineButton'))
    const abortDeclineButton = tree.getByTestId(testIdWithKey('AbortDeclineButton'))

    expect(tree).toMatchSnapshot()
    expect(confirmDeclineButton).not.toBeNull()
    expect(abortDeclineButton).not.toBeNull()
  })

  test('decline proof triggers AFJ', () => {
    // @ts-ignore
    useProofById.mockReturnValueOnce(new ProofExchangeRecord(proof))

    const props = {
      params: { declineType: DeclineType.ProofRequest, itemId: 'b04060c8-902a-4f62-9390-7b8bb2204f13' },
    }
    const { getByTestId } = render(<CommonDecline route={props as any} navigation={useNavigation()} />)
    const confirmDeclineButton = getByTestId(testIdWithKey('ConfirmDeclineButton'))
    const { agent } = useAgent()

    fireEvent(confirmDeclineButton, 'press')

    expect(agent?.proofs.declineRequest).toBeCalledWith('b04060c8-902a-4f62-9390-7b8bb2204f13')
  })

  test('did decline proof renders correctly', async () => {
    const rec = new ProofExchangeRecord(proof)
    rec.state = ProofState.Declined

    // @ts-ignore
    useProofById.mockReturnValueOnce(rec)

    const props = { params: { declineType: DeclineType.ProofRequest, itemId: 'b04060c8-902a-4f62-9390-7b8bb2204f13' } }
    const tree = render(<CommonDecline route={props as any} navigation={useNavigation()} />)
    const doneButton = tree.getByTestId(testIdWithKey('Done'))
    const didDeclineText = tree.getByTestId(testIdWithKey('RequestOrOfferDeclined'))

    expect(tree).toMatchSnapshot()
    expect(doneButton).not.toBeNull()
    expect(didDeclineText).not.toBeNull()
  })

  test('navigate home after decline proof', async () => {
    const rec = new ProofExchangeRecord(proof)
    rec.state = ProofState.Declined

    // @ts-ignore
    useProofById.mockReturnValueOnce(rec)

    const props = { params: { declineType: DeclineType.ProofRequest, itemId: 'b04060c8-902a-4f62-9390-7b8bb2204f13' } }
    const { getByTestId } = render(<CommonDecline route={props as any} navigation={useNavigation()} />)
    const doneButton = getByTestId(testIdWithKey('Done'))

    fireEvent(doneButton, 'press')

    const navigation = useNavigation()

    expect(navigation.navigate).toBeCalledWith('Tab Home Stack', { screen: 'Home' })
  })

  test('decline offer renders correctly', async () => {
    const rec = new CredentialRecord(credential)
    rec.credentials.push({
      credentialRecordType: 'indy',
      credentialRecordId: '',
    })
    // TODO:(jl) Make a fn to revive JSON dates properly and pass to `parse`
    rec.createdAt = new Date(rec.createdAt)

    // @ts-ignore
    useCredentialById.mockReturnValueOnce(rec)

    const props = {
      params: { declineType: DeclineType.CredentialOffer, itemId: '0683de72-2d24-4c76-a471-424c832e4b93' },
    }
    const tree = render(
      <ConfigurationContext.Provider value={configurationContext}>
        <CommonDecline route={props as any} navigation={useNavigation()} />
      </ConfigurationContext.Provider>
    )

    await act(async () => {
      // wait for appearance inside an assertion
      await waitFor(
        () => {
          expect(tree.getByTestId(testIdWithKey('ShowCredentialDetails'))).toBeDefined()
        },
        { timeout: 50000 }
      )
      const confirmDeclineButton = tree.getByTestId(testIdWithKey('ConfirmDeclineButton'))
      const abortDeclineButton = tree.getByTestId(testIdWithKey('AbortDeclineButton'))

      expect(confirmDeclineButton).not.toBeNull()
      expect(abortDeclineButton).not.toBeNull()
      expect(tree).toMatchSnapshot()
    })
  })

  test('decline offer triggers AFJ', async () => {
    const rec = new CredentialRecord(credential)
    // TODO:(jl) Make a fn to revive JSON dates properly and pass to `parse`
    rec.createdAt = new Date(rec.createdAt)

    // @ts-ignore
    useCredentialById.mockReturnValueOnce(rec)

    const props = {
      params: { declineType: DeclineType.CredentialOffer, itemId: '0683de72-2d24-4c76-a471-424c832e4b93' },
    }
    const { getByTestId } = render(
      <ConfigurationContext.Provider value={configurationContext}>
        <CommonDecline route={props as any} navigation={useNavigation()} />
      </ConfigurationContext.Provider>
    )

    await act(async () => {
      const confirmDeclineButton = getByTestId(testIdWithKey('ConfirmDeclineButton'))
      const { agent } = useAgent()

      fireEvent(confirmDeclineButton, 'press')

      expect(agent?.credentials.declineOffer).toBeCalledWith('0683de72-2d24-4c76-a471-424c832e4b93')
    })
  })

  test('did decline offer renders correctly', () => {
    const rec = new CredentialRecord(credential)
    rec.state = CredentialState.Declined
    // TODO:(jl) Make a fn to revive JSON dates properly and pass to `parse`
    rec.createdAt = new Date(rec.createdAt)

    // @ts-ignore
    useCredentialById.mockReturnValueOnce(rec)

    // @ts-ignore
    useCredentialById.mockReturnValueOnce(rec)

    const props = {
      params: { declineType: DeclineType.CredentialOffer, itemId: '0683de72-2d24-4c76-a471-424c832e4b93' },
    }
    const tree = render(
      <ConfigurationContext.Provider value={configurationContext}>
        <CommonDecline route={props as any} navigation={useNavigation()} />
      </ConfigurationContext.Provider>
    )
    const doneButton = tree.getByTestId(testIdWithKey('Done'))
    const didDeclineText = tree.getByTestId(testIdWithKey('RequestOrOfferDeclined'))

    expect(tree).toMatchSnapshot()
    expect(doneButton).not.toBeNull()
    expect(didDeclineText).not.toBeNull()
  })

  test('navigate home after decline offer', () => {
    const rec = new CredentialRecord(credential)
    rec.state = CredentialState.Declined
    // TODO:(jl) Make a fn to revive JSON dates properly and pass to `parse`
    rec.createdAt = new Date(rec.createdAt)

    // @ts-ignore
    useCredentialById.mockReturnValueOnce(rec)

    const props = {
      params: { declineType: DeclineType.CredentialOffer, itemId: '0683de72-2d24-4c76-a471-424c832e4b93' },
    }
    const { getByTestId } = render(
      <ConfigurationContext.Provider value={configurationContext}>
        <CommonDecline route={props as any} navigation={useNavigation()} />
      </ConfigurationContext.Provider>
    )
    const doneButton = getByTestId(testIdWithKey('Done'))

    fireEvent(doneButton, 'press')

    const navigation = useNavigation()

    expect(navigation.navigate).toBeCalledWith('Tab Home Stack', { screen: 'Home' })
  })
})
