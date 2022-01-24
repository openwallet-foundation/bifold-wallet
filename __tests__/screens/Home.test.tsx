import { CredentialRecord, CredentialState, ProofRecord } from '@aries-framework/core'
import * as hooks from '@aries-framework/react-hooks'
import { cleanup, fireEvent, render } from '@testing-library/react-native'
import React from 'react'
import { FlatList, Text } from 'react-native'
import TestRenderer from 'react-test-renderer'

import ModularView from '../../App/components/views/ModularView'
import Home from '../../App/screens/Home'

import { NotificationCredentialListItem } from 'components'

jest.mock('@aries-framework/react-hooks')

const mockT = jest.fn((key: string) => key)
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: mockT }),
}))

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

describe('displays a home screen', () => {
  afterEach(() => {
    cleanup()
  })

  describe('with a notifications module', () => {
    beforeEach(() => {
      jest.spyOn(hooks, 'useCredentialByState').mockReturnValue([] as CredentialRecord[])
      jest.spyOn(hooks, 'useProofByState').mockReturnValue([] as ProofRecord[])
    })

    it('is not null', () => {
      const testRenderer = TestRenderer.create(<Home />)
      const rootInstance = testRenderer.root
      const modularViewInstance = rootInstance.findByType(ModularView)

      expect(modularViewInstance).not.toBeNull()
    })

    it('has a title', () => {
      const testRenderer = TestRenderer.create(<Home />)
      const rootInstance = testRenderer.root
      const modularViewInstance = rootInstance.findByType(ModularView)

      expect(modularViewInstance.props.title).toBe('Home.Notifications')
    })

    it('has no credential offer notifications(s) by default', () => {
      const testRenderer = TestRenderer.create(<Home />)
      const rootInstance = testRenderer.root
      const modularViewInstance = rootInstance.findByType(ModularView)
      const flatListInstance = modularViewInstance.findByType(FlatList)

      expect(flatListInstance.findByType(Text).props.children).toBe('Home.NoNewUpdates')
    })
  })

  describe('with a notifications module, when an issuer sends a credential offer', () => {
    const testCredentialRecords: CredentialRecord[] = [
      new CredentialRecord({
        threadId: '1',
        state: CredentialState.OfferReceived,
      }),
    ]
    const testProofRecords: ProofRecord[] = []

    beforeEach(() => {
      jest.spyOn(hooks, 'useCredentialByState').mockReturnValue(testCredentialRecords)
      jest.spyOn(hooks, 'useProofByState').mockReturnValue(testProofRecords)
    })

    /**
     * Scenario: Holder receives a credential offer
     * Given the holder has a connection with an issuer
     * When the issuer sends a credential offer
     * Then the credential offer will arrive in the form of a notification in the home screen
     */
    it(`has ${testCredentialRecords.length} credential offer notifications(s)`, () => {
      const testRenderer = TestRenderer.create(<Home />)
      const rootInstance = testRenderer.root
      const modularViewInstance = rootInstance.findByType(ModularView)
      const flatListInstance = modularViewInstance.findByType(FlatList)

      expect(flatListInstance.findAllByType(NotificationCredentialListItem)).toHaveLength(1)
    })

    /**
     * Scenario: Holder selects a credential offer
     * Given the holder has received a credential offer from a connected issuer
     * When the holder selects on the credential offer
     * When the holder is taken to the credential offer screen/flow
     */
    test('pressing the notification takes the holder to the credential offer screen/flow', async () => {
      const { findByText } = render(<Home />)
      const notificationCredentialListItemInstance = await findByText('Credential')

      fireEvent(notificationCredentialListItemInstance, 'press')

      expect(mockNavigate).toHaveBeenCalledWith('Credential Offer', { credentialId: testCredentialRecords[0].id })
    })
  })
})
