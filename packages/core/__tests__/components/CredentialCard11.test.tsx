import { CredentialExchangeRecord } from '@credo-ts/core'
import mockRNCNetInfo from '@react-native-community/netinfo/jest/netinfo-mock'
import '@testing-library/jest-native'
import { fireEvent, render, waitFor } from '@testing-library/react-native'
import fs from 'fs'
import path from 'path'
import React from 'react'

import CredentialCard11, { CredentialErrors } from '../../src/components/misc/CredentialCard11'
import { testIdWithKey } from '../../src/utils/testable'
import { Linking } from 'react-native'
import { BasicAppContext } from '../helpers/app'
import { Attribute, Predicate } from '@hyperledger/aries-oca/build/legacy'
import timeTravel from '../helpers/timetravel'

jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter')
jest.mock('@react-native-community/netinfo', () => mockRNCNetInfo)
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')
jest.useFakeTimers({ legacyFakeTimers: true })
jest.spyOn(global, 'setTimeout')

const credentialPath = path.join(__dirname, '../fixtures/degree-credential.json')
const credential = JSON.parse(fs.readFileSync(credentialPath, 'utf8'))

describe('CredentialCard11 component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  //
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
        <BasicAppContext>
          <CredentialCard11
            credential={credentialRecord}
            credDefId={'cred_def_id'}
            proof
            credentialErrors={[]}
            handleAltCredChange={handleAltCredChange}
            hasAltCredentials
          />
        </BasicAppContext>
      )

      const changeCredentialButton = await findByTestId(testIdWithKey('ChangeCredential'))

      expect(changeCredentialButton).toBeTruthy()

      fireEvent(changeCredentialButton, 'press')
      expect(handleAltCredChange).toHaveBeenCalled()
    })

    test('Missing credential with help action (cred def ID)', async () => {
      Linking.openURL = jest.fn()
      const { findByTestId } = render(
        <BasicAppContext>
          <CredentialCard11
            proof
            credDefId={'XUxBrVSALWHLeycAUhrNr9:3:CL:26293:Student Card'}
            credentialErrors={[CredentialErrors.NotInWallet]}
          />
        </BasicAppContext>
      )

      const getThisCredentialButton = await findByTestId(testIdWithKey('GetThisCredential'))

      expect(getThisCredentialButton).toBeTruthy()

      fireEvent(getThisCredentialButton, 'press')
      expect(Linking.openURL).toHaveBeenCalled()
    })

    test('Missing credential with help action (schema ID)', async () => {
      Linking.openURL = jest.fn()

      const { findByTestId } = render(
        <BasicAppContext>
          <CredentialCard11
            proof
            schemaId={'XUxBrVSALWHLeycAUhrNr9:2:student_card:1.0'}
            credentialErrors={[CredentialErrors.NotInWallet]}
          />
        </BasicAppContext>
      )

      const getThisCredentialButton = await findByTestId(testIdWithKey('GetThisCredential'))

      expect(getThisCredentialButton).toBeTruthy()

      fireEvent(getThisCredentialButton, 'press')
      expect(Linking.openURL).toHaveBeenCalled()
    })

    test('Credential is Revoked', async () => {
      const { findByTestId } = render(
        <BasicAppContext>
          <CredentialCard11
            proof={true}
            schemaId={'XUxBrVSALWHLeycAUhrNr9:2:student_card:1.0'}
            credentialErrors={[CredentialErrors.Revoked]}
          />
        </BasicAppContext>
      )

      const errorText = await findByTestId(testIdWithKey('RevokedOrNotAvailable'))
      expect(errorText).not.toBeUndefined()
    })

    test('Credential in proof is valid', async () => {
      const credentialRecord = new CredentialExchangeRecord(credential)
      credentialRecord.credentials.push({
        credentialRecordType: 'anoncreds',
        credentialRecordId: '',
      })
      const attributes: (Attribute | Predicate)[] = [
        {
          name: 'name',
          value: 'Alice Smith',
        },
        {
          name: 'degree',
          value: 'Maths',
        },
      ]
      const { findAllByTestId } = render(
        <BasicAppContext>
          <CredentialCard11
            credential={credentialRecord}
            displayItems={attributes}
            proof={true}
            schemaId={'XUxBrVSALWHLeycAUhrNr9:2:student_card:1.0'}
            credentialErrors={[]}
          />
        </BasicAppContext>
      )

      const values = await findAllByTestId(testIdWithKey('AttributeValue'))
      const labels = await findAllByTestId(testIdWithKey('AttributeName'))
      expect(labels).toHaveLength(2)
      expect(values).toHaveLength(2)
    })

    test('Credential in proof is missing attribute', async () => {
      const credentialRecord = new CredentialExchangeRecord(credential)
      credentialRecord.credentials.push({
        credentialRecordType: 'anoncreds',
        credentialRecordId: '',
      })
      const attributes: (Attribute | Predicate)[] = [
        {
          name: 'name',
          value: 'Alice Smith',
        },
        {
          name: 'degree',
          value: 'Maths',
        },
        {
          name: 'student_id',
          value: null,
          hasError: true,
        },
      ]
      const { findByTestId, queryByText } = render(
        <BasicAppContext>
          <CredentialCard11
            credential={credentialRecord}
            displayItems={attributes}
            proof={true}
            schemaId={'XUxBrVSALWHLeycAUhrNr9:2:student_card:1.0'}
            credentialErrors={[]}
          />
        </BasicAppContext>
      )

      const errorIcon = await findByTestId(testIdWithKey('AttributeErrorIcon'))
      const errorText = await findByTestId(testIdWithKey('AttributeErrorText'))
      const missingAttribute = queryByText('ProofRequest.MissingAttribute', { exact: false })
      expect(missingAttribute).toBeTruthy()
      expect(errorText).toBeTruthy()
      expect(errorIcon).toBeTruthy()
    })

    test('Credential in proof is missing from users wallet', async () => {
      const credentialRecord = new CredentialExchangeRecord(credential)
      credentialRecord.credentials.push({
        credentialRecordType: 'anoncreds',
        credentialRecordId: '',
      })
      const attributes: (Attribute | Predicate)[] = [
        {
          name: 'name',
          value: 'Alice Smith',
        },
        {
          name: 'degree',
          value: 'Maths',
        },
      ]
      const { findByTestId, queryByText, findAllByTestId, queryByTestId, queryAllByTestId } = render(
        <BasicAppContext>
          <CredentialCard11
            credential={credentialRecord}
            displayItems={attributes}
            proof={true}
            schemaId={'XUxBrVSALWHLeycAUhrNr9:2:student_card:1.0'}
            credentialErrors={[CredentialErrors.NotInWallet]}
          />
        </BasicAppContext>
      )

      const errorLabelIcon = await findAllByTestId(testIdWithKey('AttributeNameErrorIcon'))
      const errorValueText = await queryAllByTestId(testIdWithKey('AttributeValue'))
      const errorIcon = await queryByTestId(testIdWithKey('AttributeErrorIcon'))
      const errorText = await queryByTestId(testIdWithKey('AttributeErrorText'))
      const errorHeader = await findByTestId(testIdWithKey('RevokedOrNotAvailable'))
      const missingAttribute = await queryByText('ProofRequest.MissingAttribute', { exact: false })
      expect(errorHeader).toBeTruthy()
      expect(errorLabelIcon).toBeTruthy()
      expect(errorLabelIcon).toHaveLength(2)
      expect(errorValueText).toHaveLength(0)
      expect(errorText).toBeNull()
      expect(errorIcon).toBeNull()
      expect(missingAttribute).toBeNull()
    })

    test('Credential in proof has a predicate error', async () => {
      const credentialRecord = new CredentialExchangeRecord(credential)
      credentialRecord.credentials.push({
        credentialRecordType: 'anoncreds',
        credentialRecordId: '',
      })
      const attributes: (Attribute | Predicate)[] = [
        {
          name: 'name',
          value: 'Alice Smith',
        },
        {
          name: 'degree',
          value: 'Maths',
        },
        {
          pValue: '19920101',
          pType: 'date',
          name: 'birthdate_dateint',
          satisfied: false,
        },
      ]
      const { queryByText, queryByTestId, queryAllByTestId } = render(
        <BasicAppContext>
          <CredentialCard11
            credential={credentialRecord}
            displayItems={attributes}
            proof={true}
            schemaId={'XUxBrVSALWHLeycAUhrNr9:2:student_card:1.0'}
            credentialErrors={[]}
          />
        </BasicAppContext>
      )

      await waitFor(() => {
        timeTravel(1000)
      })

      const errorLabelIcon = await queryAllByTestId(testIdWithKey('AttributeNameErrorIcon'))
      const errorIcon = await queryByTestId(testIdWithKey('AttributeErrorIcon'))
      const errorText = await queryByTestId(testIdWithKey('AttributeErrorText'))
      const notSatisfied = await queryByText('ProofRequest.PredicateNotSatisfied', { exact: false })
      expect(errorLabelIcon).toBeTruthy()
      expect(notSatisfied).toBeTruthy()
      expect(errorText).toBeTruthy()
      expect(errorIcon).toBeTruthy()
    })
  })
})
