import { AnonCredsCredentialMetadataKey } from '@credo-ts/anoncreds'
import { CredentialExchangeRecord, CredentialRole, CredentialState } from '@credo-ts/core'
import { useCredentialByState } from '@credo-ts/react-hooks'
import { useNavigation } from '@react-navigation/native'
import { act, cleanup, fireEvent, render } from '@testing-library/react-native'
import React from 'react'

import CredentialCard from '../../src/components/misc/CredentialCard'
import { StoreProvider, defaultState } from '../../src/contexts/store'
import ListCredentials from '../../src/screens/ListCredentials'
import { ReactTestInstance } from 'react-test-renderer'
import { BasicAppContext } from '../helpers/app'

interface CredentialContextInterface {
  loading: boolean
  credentials: CredentialExchangeRecord[]
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
jest.mock('react-native-localize', () => {})

const credentialDefinitionId = 'xxxxxxxxxxxxxxxxxx:3:CL:11111:default'

describe('CredentialList Screen', () => {
  const testOpenVPCredentialRecord = new CredentialExchangeRecord({
    role: CredentialRole.Holder,
    threadId: '1',
    state: CredentialState.Done,
    createdAt: new Date('2020-01-01T00:00:00'),
    protocolVersion: 'v1',
  })
  testOpenVPCredentialRecord.metadata.set(AnonCredsCredentialMetadataKey, {
    schemaId: 'Ui6HA36FvN83cEtmYYHxrn:2:unverified_person:0.1.0',
    credentialDefinitionId,
  })
  testOpenVPCredentialRecord.credentials.push({
    credentialRecordType: 'anoncreds',
    credentialRecordId: '',
  })
  const testCredential1 = new CredentialExchangeRecord({
    role: CredentialRole.Holder,
    threadId: '2',
    state: CredentialState.Done,
    createdAt: new Date('2020-01-01T00:01:00'),
    protocolVersion: 'v1',
  })
  const testCredential2 = new CredentialExchangeRecord({
    role: CredentialRole.Holder,
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

      // @ts-expect-error useCredentialByState will be replaced with a mock which does have this method
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
        <BasicAppContext>
          <ListCredentials />
        </BasicAppContext>
      )

      await act(async () => {
        const credentialItemInstances = await findAllByText('Person', { exact: false })

        expect(credentialItemInstances).toHaveLength(1)

        const credentialItemInstance = credentialItemInstances[0]

        fireEvent(credentialItemInstance, 'press')

        expect(navigation.navigate).toBeCalledWith('Credential Details', {
          credentialId: testOpenVPCredentialRecord.id,
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
      <BasicAppContext>
        <ListCredentials />
      </BasicAppContext>
    )
    await act(async () => {
      const credentialCards = tree.UNSAFE_getAllByType(CredentialCard)

      expect(credentialCards).toHaveLength(3)

      const createdAtDates = credentialCards.map((instance: ReactTestInstance) => instance.props.credential.createdAt)

      expect(new Date(createdAtDates[0])).toEqual(new Date('2020-01-02T00:00:00'))
      expect(new Date(createdAtDates[1])).toEqual(new Date('2020-01-01T00:01:00'))
      expect(new Date(createdAtDates[2])).toEqual(new Date('2020-01-01T00:00:00'))
    })
  })

  test('Hide list filters out specific credentials', async () => {
    const tree = render(
      <StoreProvider
        initialState={{
          ...defaultState,
          preferences: {
            ...defaultState.preferences,
            developerModeEnabled: false,
          },
        }}
      >
        <BasicAppContext>
          <ListCredentials />
        </BasicAppContext>
      </StoreProvider>
    )
    await act(async () => {
      const credentialCards = tree.UNSAFE_getAllByType(CredentialCard)

      expect(credentialCards).toHaveLength(3)
    })
  })

  test('Hide list does not filter out specific credentials when developer mode is enabled', async () => {
    const tree = render(
      <StoreProvider
        initialState={{
          ...defaultState,
          preferences: {
            ...defaultState.preferences,
            developerModeEnabled: true,
          },
        }}
      >
        <BasicAppContext>
          <ListCredentials />
        </BasicAppContext>
      </StoreProvider>
    )
    await act(async () => {
      const credentialCards = tree.UNSAFE_getAllByType(CredentialCard)

      expect(credentialCards).toHaveLength(3)
    })
  })
})
