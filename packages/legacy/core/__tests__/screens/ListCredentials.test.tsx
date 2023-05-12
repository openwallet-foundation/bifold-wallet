import { CredentialMetadataKeys, CredentialExchangeRecord, CredentialState } from '@aries-framework/core'
import { useCredentialByState } from '@aries-framework/react-hooks'
import { useNavigation } from '@react-navigation/core'
import { act, cleanup, fireEvent, render } from '@testing-library/react-native'
import React from 'react'
import { ReactTestInstance } from 'react-test-renderer'

import CredentialCard from '../../App/components/misc/CredentialCard'
import { ConfigurationContext } from '../../App/contexts/configuration'
import ListCredentials from '../../App/screens/ListCredentials'
import configurationContext from '../contexts/configuration'

interface CredentialContextInterface {
  loading: boolean
  credentials: CredentialExchangeRecord[]
}

jest.mock('@react-navigation/core', () => {
  return require('../../__mocks__/custom/@react-navigation/core')
})
jest.mock('@react-navigation/native', () => {
  return require('../../__mocks__/custom/@react-navigation/native')
})
// eslint-disable-next-line @typescript-eslint/no-empty-function
jest.mock('react-native-localize', () => {})

describe('displays a credentials list screen', () => {
  const testOpenVPCredentialRecord = new CredentialExchangeRecord({
    threadId: '1',
    state: CredentialState.Done,
    createdAt: new Date('2020-01-01T00:00:00'),
    protocolVersion: 'v1',
  })
  testOpenVPCredentialRecord.metadata.set(CredentialMetadataKeys.IndyCredential, {
    schemaId: 'Ui6HA36FvN83cEtmYYHxrn:2:unverified_person:0.1.0',
  })
  testOpenVPCredentialRecord.credentials.push({
    credentialRecordType: 'indy',
    credentialRecordId: '',
  })
  const testCredential1 = new CredentialExchangeRecord({
    threadId: '2',
    state: CredentialState.Done,
    createdAt: new Date('2020-01-01T00:01:00'),
    protocolVersion: 'v1',
  })
  const testCredential2 = new CredentialExchangeRecord({
    threadId: '3',
    state: CredentialState.Done,
    createdAt: new Date('2020-01-02T00:00:00'),
    protocolVersion: 'v1',
  })
  const testCredentialRecords: CredentialContextInterface = {
    loading: false,
    credentials: [testOpenVPCredentialRecord, testCredential1, testCredential2],
  }

  afterEach(() => {
    cleanup()
  })

  describe('with a list of credentials', () => {
    beforeEach(() => {
      jest.clearAllMocks()

      // @ts-ignore
      useCredentialByState.mockImplementation((state) =>
        testCredentialRecords.credentials.filter((c) => c.state === state)
      )
    })

    /**
     * Scenario: Holder selects a credential
     * Given the holder is in the credential list screen
     * When the holder taps on a credential
     * Then the holder is taken to the credential detail screen of that credential
     */
    test('pressing on a credential in the list takes the holder to a credential detail screen', async () => {
      const navigation = useNavigation()
      const { findAllByText } = render(
        <ConfigurationContext.Provider value={configurationContext}>
          <ListCredentials />
        </ConfigurationContext.Provider>
      )

      await act(async () => {
        const credentialItemInstances = await findAllByText('Person', { exact: false })

        expect(credentialItemInstances.length).toBe(1)

        const credentialItemInstance = credentialItemInstances[0]

        fireEvent(credentialItemInstance, 'press')

        expect(navigation.navigate).toBeCalledWith('Credential Details', {
          credential: testOpenVPCredentialRecord,
        })
      })
    })
  })

  /**
   * Scenario: Holder receives a new credential
   * Given the holder receives a new credential
   * When the holder has just completed the credential offer flow
   * And the holder has accepted the credential offer
   * Then the credentials are ordered to most recent to least recent (top to bottom)
   */
  test('credentials should display in descending order of issued date', async () => {
    const tree = render(
      <ConfigurationContext.Provider value={configurationContext}>
        <ListCredentials />
      </ConfigurationContext.Provider>
    )
    await act(async () => {
      const credentialCards = tree.UNSAFE_getAllByType(CredentialCard)

      expect(credentialCards.length).toBe(3)

      const createdAtDates = credentialCards.map((instance: ReactTestInstance) => instance.props.credential.createdAt)

      expect(new Date(createdAtDates[0])).toEqual(new Date('2020-01-02T00:00:00'))
      expect(new Date(createdAtDates[1])).toEqual(new Date('2020-01-01T00:01:00'))
      expect(new Date(createdAtDates[2])).toEqual(new Date('2020-01-01T00:00:00'))
    })
  })
})
