import { CredentialMetadataKeys, CredentialRecord, CredentialState } from '@aries-framework/core'
import { useCredentialById } from '@aries-framework/react-hooks'
import { useNavigation } from '@react-navigation/core'
import { cleanup, fireEvent, render } from '@testing-library/react-native'
import React from 'react'

import { dateFormatOptions } from '../../App/constants'
import CredentialDetails from '../../App/screens/CredentialDetails'

interface CredentialContextInterface {
  loading: boolean
  credentials: CredentialRecord[]
}

jest.mock('@react-navigation/core', () => {
  return require('../../__mocks__/custom/@react-navigation/core')
})
jest.mock('@react-navigation/native', () => {
  return require('../../__mocks__/custom/@react-navigation/native')
})

jest.useRealTimers()

/**
 * Given a credential has been accepted
 * And it is displayed in the list of credentials
 * When the holder taps on a credential
 * Then holder sees the contents of the VC in the credential detail screen
 *
 * VC Contents:
 *  Issuer Name
 *  Credential (Schema) Name
 *  Credential (Schema) Version
 *  Issue Date
 *  List of Claims/Attributes
 *  Attribute names are just capitalized name
 */
describe('displays a credential details screen', () => {
  const testOpenVPCredentialRecord = new CredentialRecord({
    threadId: '1',
    state: CredentialState.Done,
    createdAt: new Date('2020-01-01T00:00:00'),
    credentialAttributes: [
      {
        name: 'family_name',
        value: 'Last',
        toJSON: jest.fn(),
      },
      {
        name: 'given-name',
        value: 'First',
        toJSON: jest.fn(),
      },
      {
        name: 'postalCode',
        value: 'V1V1V1',
        toJSON: jest.fn(),
      },
    ],
  })
  testOpenVPCredentialRecord.metadata.set(CredentialMetadataKeys.IndyCredential, {
    schemaId: 'Ui6HA36FvN83cEtmYYHxrn:2:unverified_person:0.1.0',
  })

  const testCredentialRecords: CredentialContextInterface = {
    loading: false,
    credentials: [testOpenVPCredentialRecord],
  }

  afterEach(() => {
    cleanup()
  })

  describe('with a credential list item', () => {
    beforeEach(() => {
      jest.clearAllMocks()

      testCredentialRecords.credentials.forEach((credential: CredentialRecord) => {
        credential.credentialId = credential.id
      })
      // @ts-ignore
      useCredentialById.mockReturnValue(testCredentialRecords.credentials[0])
    })

    test('a credential name, credential version and issue date is displayed', async () => {
      const { findByText } = render(
        <CredentialDetails
          navigation={useNavigation()}
          route={{ params: { credentialId: testCredentialRecords.credentials[0].id } } as any}
        ></CredentialDetails>
      )

      const credentialName = await findByText('Unverified Person', { exact: false })
      const credentialVersion = await findByText('Version: 0.1.0', { exact: false })
      const credentialIssuedAt = await findByText(
        `CredentialDetails.Issued: ${testOpenVPCredentialRecord.createdAt.toLocaleDateString(
          'en-CA',
          dateFormatOptions
        )}`,
        { exact: false }
      )

      expect(credentialName).not.toBe(null)
      expect(credentialVersion).not.toBe(null)
      expect(credentialIssuedAt).not.toBe(null)
    })
  })

  test('a list of credential details is displayed, attribute names are human readable', async () => {
    const { findByText } = render(
      <CredentialDetails
        navigation={useNavigation()}
        route={{ params: { credentialId: testCredentialRecords.credentials[0].id } } as any}
      ></CredentialDetails>
    )

    const familyName = await findByText('Family Name', { exact: false })
    const givenName = await findByText('Given Name', { exact: false })
    const postalCode = await findByText('Postal Code', { exact: false })

    expect(familyName).not.toBe(null)
    expect(givenName).not.toBe(null)
    expect(postalCode).not.toBe(null)
  })

  test('a list of credential details is displayed, attribute values are hidden by default', async () => {
    const { findAllByText } = render(
      <CredentialDetails
        navigation={useNavigation()}
        route={{ params: { credentialId: testCredentialRecords.credentials[0].id } } as any}
      ></CredentialDetails>
    )

    const hiddenValues = await findAllByText(Array(10).fill('\u2022').join(''))

    expect(hiddenValues.length).toBe(3)
  })

  test('pressing the `Show` button un-hides an attribute value', async () => {
    const { queryByText, findAllByText } = render(
      <CredentialDetails
        navigation={useNavigation()}
        route={{ params: { credentialId: testCredentialRecords.credentials[0].id } } as any}
      ></CredentialDetails>
    )

    let showButtons = await findAllByText('Record.Show')
    let hiddenValues = await findAllByText(Array(10).fill('\u2022').join(''))
    let familyName = await queryByText('Last', { exact: false })

    expect(showButtons.length).toBe(3)
    expect(hiddenValues.length).toBe(3)
    expect(familyName).toBe(null)

    fireEvent(showButtons[0], 'press')

    showButtons = await findAllByText('Record.Show')
    hiddenValues = await findAllByText(Array(10).fill('\u2022').join(''))
    familyName = await queryByText('Last', { exact: false })

    expect(showButtons.length).toBe(2)
    expect(hiddenValues.length).toBe(2)
    expect(familyName).not.toBe(null)
  })

  test('pressing the `Hide all` button hides all un-hidden attribute values`', async () => {
    const { queryAllByText, findAllByText, findByText } = render(
      <CredentialDetails
        navigation={useNavigation()}
        route={{ params: { credentialId: testCredentialRecords.credentials[0].id } } as any}
      ></CredentialDetails>
    )

    let showButtons = await findAllByText('Record.Show')
    let hiddenValues = await findAllByText(Array(10).fill('\u2022').join(''))

    showButtons.forEach((button) => fireEvent(button, 'press'))

    showButtons = await queryAllByText('Record.Show')
    hiddenValues = await queryAllByText(Array(10).fill('\u2022').join(''))

    expect(showButtons.length).toBe(0)
    expect(hiddenValues.length).toBe(0)

    const hideAllButton = await findByText('Record.HideAll')

    expect(hideAllButton).not.toBe(null)

    fireEvent(hideAllButton, 'press')

    showButtons = await findAllByText('Record.Show')
    hiddenValues = await findAllByText(Array(10).fill('\u2022').join(''))

    expect(showButtons.length).toBe(3)
    expect(hiddenValues.length).toBe(3)
  }, 10000)
})
