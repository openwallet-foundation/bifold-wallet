import { CredentialRecord, CredentialState } from '@aries-framework/core'
import { useCredentialByState } from '@aries-framework/react-hooks'
import { useNavigation } from '@react-navigation/core'
import { cleanup, fireEvent, render } from '@testing-library/react-native'
import React from 'react'
import { ReactTestInstance } from 'react-test-renderer'

import { CredentialListItem } from '../../App/components'
import { indyCredentialKey } from '../../App/constants'
import ListCredentials from '../../App/screens/ListCredentials'

interface CredentialContextInterface {
  loading: boolean
  credentials: CredentialRecord[]
}

describe('displays a credentials list screen', () => {
  const testOpenVPCredentialRecord = new CredentialRecord({
    threadId: '1',
    state: CredentialState.Done,
    createdAt: new Date('2020-01-01T00:00:00'),
  })
  testOpenVPCredentialRecord.metadata.set(indyCredentialKey, {
    schemaId: 'Ui6HA36FvN83cEtmYYHxrn:2:unverified_person:0.1.0',
  })
  const testCredential1 = new CredentialRecord({
    threadId: '2',
    state: CredentialState.Done,
    createdAt: new Date('2020-01-01T00:01:00'),
  })
  const testCredential2 = new CredentialRecord({
    threadId: '3',
    state: CredentialState.Done,
    createdAt: new Date('2020-01-02T00:00:00'),
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

      testCredentialRecords.credentials.forEach((credential: CredentialRecord) => {
        credential.credentialId = credential.id
      })
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
      const { findAllByText } = render(<ListCredentials />)

      const credentialItemInstances = await findAllByText('Unverified Person', { exact: false })

      expect(credentialItemInstances.length).toBe(1)

      const credentialItemInstance = credentialItemInstances[0]

      fireEvent(credentialItemInstance, 'press')

      expect(navigation.navigate).toBeCalledWith('Credential Details', { credentialId: testOpenVPCredentialRecord.id })
    })
  })

  /**
   * Scenario: Holder receives a new credential
   * Given the holder receives a new credential
   * When the holder has just completed the credential offer flow
   * And the holder has accepted the credential offer
   * Then the credentials are ordered to most recent to least recent (top to bottom)
   */
  test('credentials should display in descending order of issued date', () => {
    const { UNSAFE_getAllByType } = render(<ListCredentials />)

    const credentialItemInstances = UNSAFE_getAllByType(CredentialListItem)

    expect(credentialItemInstances.length).toBe(3)

    const dates = credentialItemInstances.map((instance: ReactTestInstance) => instance.props.credential.createdAt)

    expect(new Date(dates[0])).toEqual(new Date('2020-01-02T00:00:00'))
    expect(new Date(dates[1])).toEqual(new Date('2020-01-01T00:01:00'))
    expect(new Date(dates[2])).toEqual(new Date('2020-01-01T00:00:00'))
  })
})
