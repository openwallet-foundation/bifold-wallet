import { CredentialExchangeRecord } from '@credo-ts/core'
import mockRNCNetInfo from '@react-native-community/netinfo/jest/netinfo-mock'
import '@testing-library/jest-native/extend-expect'
import { fireEvent, render } from '@testing-library/react-native'
import fs from 'fs'
import path from 'path'
import React from 'react'

import CredentialCard11 from '../../App/components/misc/CredentialCard11'
import { ConfigurationContext } from '../../App/contexts/configuration'
import { testIdWithKey } from '../../App/utils/testable'
import configurationContext from '../contexts/configuration'
import { Linking } from 'react-native'

jest.mock('../../App/container-api')
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter')
jest.mock('@react-native-community/netinfo', () => mockRNCNetInfo)
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')
jest.mock('@hyperledger/anoncreds-react-native', () => ({}))
jest.mock('@hyperledger/aries-askar-react-native', () => ({}))
jest.mock('@hyperledger/indy-vdr-react-native', () => ({}))
jest.useFakeTimers({ legacyFakeTimers: true })
jest.spyOn(global, 'setTimeout')

const credentialPath = path.join(__dirname, '../fixtures/degree-credential.json')
const credential = JSON.parse(fs.readFileSync(credentialPath, 'utf8'))

describe('CredentialCard11 component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('In proof form', () => {
    test('With existing credential and alt credentials', async () => {
      const credentialRecord = new CredentialExchangeRecord(credential)
      credentialRecord.credentials.push({
        credentialRecordType: 'anoncreds',
        credentialRecordId: '',
      })
      credentialRecord.createdAt = new Date(credentialRecord.createdAt)

      const handleAltCredChange = jest.fn()

      const { findByTestId } = render(
        <ConfigurationContext.Provider value={configurationContext}>
          <CredentialCard11
            credential={credentialRecord}
            credDefId={'cred_def_id'}
            proof
            error={false}
            handleAltCredChange={handleAltCredChange}
            hasAltCredentials
          />
        </ConfigurationContext.Provider>
      )

      const changeCredentialButton = await findByTestId(testIdWithKey('ChangeCredential'))

      expect(changeCredentialButton).toBeTruthy()

      fireEvent(changeCredentialButton, 'press')
      expect(handleAltCredChange).toBeCalled()
    })

    test('Missing credential with help action (cred def ID)', async () => {
      Linking.openURL = jest.fn()
      const { findByTestId } = render(
        <ConfigurationContext.Provider
          value={{
            ...configurationContext,
          }}
        >
          <CredentialCard11 proof credDefId={'XUxBrVSALWHLeycAUhrNr9:3:CL:26293:Student Card'} error={true} />
        </ConfigurationContext.Provider>
      )

      const getThisCredentialButton = await findByTestId(testIdWithKey('GetThisCredential'))

      expect(getThisCredentialButton).toBeTruthy()

      fireEvent(getThisCredentialButton, 'press')
      expect(Linking.openURL).toBeCalled()
    })

    test('Missing credential with help action (schema ID)', async () => {
      Linking.openURL = jest.fn()

      const { findByTestId } = render(
        <ConfigurationContext.Provider
          value={{
            ...configurationContext,
          }}
        >
          <CredentialCard11 proof schemaId={'XUxBrVSALWHLeycAUhrNr9:2:student_card:1.0'} error={true} />
        </ConfigurationContext.Provider>
      )

      const getThisCredentialButton = await findByTestId(testIdWithKey('GetThisCredential'))

      expect(getThisCredentialButton).toBeTruthy()

      fireEvent(getThisCredentialButton, 'press')
      expect(Linking.openURL).toBeCalled()
    })
  })
})
