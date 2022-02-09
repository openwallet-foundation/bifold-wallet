import { CredentialRecord, CredentialState } from '@aries-framework/core'
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

const mockNavigate = jest.fn()
jest.mock('@react-navigation/core', () => {
  const module = jest.requireActual('@react-navigation/core')
  return {
    ...module,
    useNavigation: () => ({
      navigate: mockNavigate,
    }),
  }
})

const mockOpenVPCredentialRecord = new CredentialRecord({
  threadId: '1',
  state: CredentialState.Done,
  createdAt: new Date('2020-01-01T00:00:00'),
})
mockOpenVPCredentialRecord.metadata.set(indyCredentialKey, {
  schemaId: 'Ui6HA36FvN83cEtmYYHxrn:2:unverified_person:0.1.0',
})
const mockCredential1 = new CredentialRecord({
  threadId: '2',
  state: CredentialState.Done,
  createdAt: new Date('2020-01-01T00:01:00'),
})
const mockCredential2 = new CredentialRecord({
  threadId: '3',
  state: CredentialState.Done,
  createdAt: new Date('2020-01-02T00:00:00'),
})
const mockTestCredentialRecords: CredentialContextInterface = {
  loading: false,
  credentials: [mockOpenVPCredentialRecord, mockCredential1, mockCredential2],
}
jest.mock('@aries-framework/react-hooks', () => {
  const module = jest.requireActual('@aries-framework/react-hooks')
  return {
    ...module,
    useCredentials: () => mockTestCredentialRecords,
  }
})

describe('displays a credentials list screen', () => {
  afterEach(() => {
    cleanup()
  })

  describe('with a list of credentials', () => {
    beforeEach(() => {
      mockTestCredentialRecords.credentials.forEach((credential: CredentialRecord) => {
        credential.credentialId = credential.id
      })
    })

    /**
     * Scenario: Holder selects a credential
     * Given the holder is in the credential list screen
     * When the holder taps on a credential
     * Then the holder is taken to the credential detail screen of that credential
     */
    it.skip('pressing on a credential in the list takes the holder to a credential detail screen', async () => {
      const { findAllByText } = render(<ListCredentials />)

      const credentialItemInstances = await findAllByText('Unverified Person', { exact: false })

      expect(credentialItemInstances.length).toBe(1)

      const credentialItemInstance = credentialItemInstances[0]

      fireEvent(credentialItemInstance, 'press')

      expect(mockNavigate).toBeCalledWith('Credential Details', { credentialId: mockOpenVPCredentialRecord.id })
    })
  })

  /**
   * Scenario: Holder receives a new credential
   * Given the holder receives a new credential
   * When the holder has just completed the credential offer flow
   * And the holder has accepted the credential offer
   * Then the credentials are ordered to most recent to least recent (top to bottom)
   */
  it.skip('credentials should display in descending order of issued date', () => {
    const { UNSAFE_getAllByType } = render(<ListCredentials />)

    const credentialItemInstances = UNSAFE_getAllByType(CredentialListItem)

    expect(credentialItemInstances.length).toBe(3)

    const dates = credentialItemInstances.map((instance: ReactTestInstance) => instance.props.credential.createdAt)

    expect(new Date(dates[0])).toEqual(new Date('2020-01-02T00:00:00'))
    expect(new Date(dates[1])).toEqual(new Date('2020-01-01T00:01:00'))
    expect(new Date(dates[2])).toEqual(new Date('2020-01-01T00:00:00'))
  })
})
