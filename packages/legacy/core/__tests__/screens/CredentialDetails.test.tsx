import { CredentialMetadataKeys, CredentialExchangeRecord, CredentialState } from '@aries-framework/core'
import { useCredentialById } from '@aries-framework/react-hooks'
import { useNavigation } from '@react-navigation/core'
import { act, cleanup, fireEvent, render } from '@testing-library/react-native'
import React from 'react'

import { hiddenFieldValue } from '../../App/constants'
import { ConfigurationContext } from '../../App/contexts/configuration'
import CredentialDetails from '../../App/screens/CredentialDetails'
import { formatTime } from '../../App/utils/helpers'
import configurationContext from '../contexts/configuration'

const buildCredentialExchangeRecord = () => {
  const testOpenVPCredentialRecord = new CredentialExchangeRecord({
    protocolVersion: 'v1',
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
  testOpenVPCredentialRecord.credentials.push({
    credentialRecordType: 'indy',
    credentialRecordId: '',
  })
  testOpenVPCredentialRecord.metadata.set(CredentialMetadataKeys.IndyCredential, {
    schemaId: 'Ui6HA36FvN83cEtmYYHxrn:2:unverified_person:0.1.0',
  })
  return testOpenVPCredentialRecord
}
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
jest.mock('react-native-localize', () => {
  return require('../../__mocks__/custom/react-native-localize')
})
jest.useRealTimers()

const mock_testOpenVPCredentialRecord = buildCredentialExchangeRecord()

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
describe.skip('displays a credential details screen', () => {
  const testCredentialRecords: CredentialContextInterface = {
    loading: false,
    credentials: [mock_testOpenVPCredentialRecord],
  }

  afterEach(() => {
    cleanup()
  })

  describe('with a credential list item', () => {
    beforeEach(() => {
      jest.clearAllMocks()

      // @ts-ignore
      useCredentialById.mockReturnValue(mock_testOpenVPCredentialRecord)
    })

    test('a credential name and issue date is displayed', async () => {
      const { findByText } = render(
        <ConfigurationContext.Provider value={configurationContext}>
          <CredentialDetails
            navigation={useNavigation()}
            route={{ params: { credentialId: testCredentialRecords.credentials[0].id } } as any}
          ></CredentialDetails>
        </ConfigurationContext.Provider>
      )

      const credentialName = await findByText('Unverified Person', { exact: false })
      const credentialIssuedAt = await findByText(
        `CredentialDetails.Issued: ${formatTime(mock_testOpenVPCredentialRecord.createdAt, { format: 'MMM D, YYYY' })}`,
        { exact: false }
      )

      expect(credentialName).not.toBe(null)
      expect(credentialIssuedAt).not.toBe(null)
    })
  })

  test('a list of credential details is displayed, attribute names are human readable', async () => {
    const { findByText } = render(
      <ConfigurationContext.Provider value={configurationContext}>
        <CredentialDetails
          navigation={useNavigation()}
          route={{ params: { credentialId: testCredentialRecords.credentials[0].id } } as any}
        ></CredentialDetails>
      </ConfigurationContext.Provider>
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
      <ConfigurationContext.Provider value={configurationContext}>
        <CredentialDetails
          navigation={useNavigation()}
          route={{ params: { credentialId: testCredentialRecords.credentials[0].id } } as any}
        ></CredentialDetails>
      </ConfigurationContext.Provider>
    )

    const hiddenValues = await findAllByText(hiddenFieldValue)

    expect(hiddenValues.length).toBe(3)
  })

  test('pressing the `Show` button un-hides an attribute value', async () => {
    const { queryByText, findAllByText } = render(
      <ConfigurationContext.Provider value={configurationContext}>
        <CredentialDetails
          navigation={useNavigation()}
          route={{ params: { credentialId: testCredentialRecords.credentials[0].id } } as any}
        ></CredentialDetails>
      </ConfigurationContext.Provider>
    )

    let showButtons = await findAllByText('Record.Show')
    let hiddenValues = await findAllByText(hiddenFieldValue)
    let familyName = await queryByText('Last', { exact: false })

    expect(showButtons.length).toBe(3)
    expect(hiddenValues.length).toBe(3)
    expect(familyName).toBe(null)

    fireEvent(showButtons[0], 'press')

    showButtons = await findAllByText('Record.Show')
    hiddenValues = await findAllByText(hiddenFieldValue)
    familyName = await queryByText('Last', { exact: false })

    expect(showButtons.length).toBe(2)
    expect(hiddenValues.length).toBe(2)
    expect(familyName).not.toBe(null)
  })

  test('pressing the `Hide all` button hides all un-hidden attribute values`', async () => {
    const { queryAllByText, findAllByText, findByText } = await render(
      <ConfigurationContext.Provider value={configurationContext}>
        <CredentialDetails
          navigation={useNavigation()}
          route={{ params: { credentialId: testCredentialRecords.credentials[0].id } } as any}
        ></CredentialDetails>
      </ConfigurationContext.Provider>
    )
    await act(async () => {
      let showButtons = await findAllByText('Record.Show')
      let hiddenValues = await findAllByText(hiddenFieldValue)

      showButtons.forEach((button) => fireEvent(button, 'press'))

      showButtons = await queryAllByText('Record.Show')
      hiddenValues = await queryAllByText(hiddenFieldValue)

      expect(showButtons.length).toBe(0)
      expect(hiddenValues.length).toBe(0)

      const hideAllButton = await findByText('Record.HideAll')

      expect(hideAllButton).not.toBe(null)

      fireEvent(hideAllButton, 'press')

      showButtons = await findAllByText('Record.Show')
      hiddenValues = await findAllByText(hiddenFieldValue)

      expect(showButtons.length).toBe(3)
      expect(hiddenValues.length).toBe(3)
    })
  }, 10000)
})
