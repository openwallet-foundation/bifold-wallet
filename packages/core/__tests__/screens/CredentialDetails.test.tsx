import { AnonCredsCredentialMetadataKey } from '@credo-ts/anoncreds'
import { CredentialExchangeRecord, CredentialRole, CredentialState } from '@credo-ts/core'
import { useAgent, useCredentialById } from '@credo-ts/react-hooks'
import { useNavigation } from '@react-navigation/native'
import { cleanup, fireEvent, render, act } from '@testing-library/react-native'
import React from 'react'
import { Screens, Stacks } from '../../src/types/navigators'
import { StoreContext } from '../../src'
import { hiddenFieldValue } from '../../src/constants'
import CredentialDetails from '../../src/screens/CredentialDetails'
import { BasicAppContext } from '../helpers/app'
import { testDefaultState } from '../contexts/store'
import { testIdWithKey } from '../../src/utils/testable'

const buildCredentialExchangeRecord = () => {
  const testOpenVPCredentialRecord = new CredentialExchangeRecord({
    role: CredentialRole.Holder,
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
    credentialRecordType: 'anoncreds',
    credentialRecordId: '',
  })
  testOpenVPCredentialRecord.metadata.set(AnonCredsCredentialMetadataKey, {
    schemaId: 'Ui6HA36FvN83cEtmYYHxrn:2:unverified_person:0.1.0',
  })
  return testOpenVPCredentialRecord
}

jest.mock('@credo-ts/react-hooks')
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
describe('CredentialDetails Screen', () => {
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useAgent as jest.Mock).mockReturnValue({
      agent: {
        credentials: {
          getById: jest.fn().mockResolvedValue(mock_testOpenVPCredentialRecord),
        },
      },
    })
    // @ts-expect-error useCredentialById will be replaced with a mock which does have this method
    useCredentialById.mockReturnValue(mock_testOpenVPCredentialRecord)
  })

  describe('with a credential list item (CardLayout aries/overlays/branding/0.1)', () => {
    test('a credential name and issued by is displayed', async () => {
      const { findByText } = render(
        <BasicAppContext>
          <CredentialDetails
            navigation={useNavigation()}
            route={{ params: { credentialId: mock_testOpenVPCredentialRecord.id } } as any}
          ></CredentialDetails>
        </BasicAppContext>
      )

      const credentialName = await findByText('Unverified Person', { exact: false })
      const credentialIssuedBy = await findByText('CredentialDetails.IssuedBy')

      expect(credentialName).not.toBe(null)
      expect(credentialIssuedBy).not.toBe(null)
    })
  })

  describe('with a credential list item (CardLayout aries/overlays/branding/1.0)', () => {
    test('a credential name is displayed', async () => {
      const { findByText } = render(
        <BasicAppContext>
          <CredentialDetails
            navigation={useNavigation()}
            route={{ params: { credentialId: mock_testOpenVPCredentialRecord.id } } as any}
          ></CredentialDetails>
        </BasicAppContext>
      )

      const credentialName = await findByText('Unverified Person', { exact: false })

      expect(credentialName).not.toBe(null)
    })
  })

  test('a list of credential details is displayed, attribute names are human readable', async () => {
    const { findByText } = render(
      <BasicAppContext>
        <CredentialDetails
          navigation={useNavigation()}
          route={{ params: { credentialId: mock_testOpenVPCredentialRecord.id } } as any}
        ></CredentialDetails>
      </BasicAppContext>
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
      <BasicAppContext>
        <CredentialDetails
          navigation={useNavigation()}
          route={{ params: { credentialId: mock_testOpenVPCredentialRecord.id } } as any}
        ></CredentialDetails>
      </BasicAppContext>
    )

    const hiddenValues = await findAllByText(hiddenFieldValue)

    expect(hiddenValues).toHaveLength(3)
  })

  test('pressing the `Show` button un-hides an attribute value', async () => {
    const { queryByText, findAllByText } = render(
      <BasicAppContext>
        <CredentialDetails
          navigation={useNavigation()}
          route={{ params: { credentialId: mock_testOpenVPCredentialRecord.id } } as any}
        ></CredentialDetails>
      </BasicAppContext>
    )

    let showButtons = await findAllByText('Record.Show')
    let hiddenValues = await findAllByText(hiddenFieldValue)
    let familyName = await queryByText('Last', { exact: false })

    expect(showButtons).toHaveLength(3)
    expect(hiddenValues).toHaveLength(3)
    expect(familyName).toBe(null)

    fireEvent(showButtons[0], 'press')

    showButtons = await findAllByText('Record.Show')
    hiddenValues = await findAllByText(hiddenFieldValue)
    familyName = await queryByText('Last', { exact: false })

    expect(showButtons).toHaveLength(2)
    expect(hiddenValues).toHaveLength(2)
    expect(familyName).not.toBe(null)
  })

  test('pressing the `Hide all` button hides all un-hidden attribute values`', async () => {
    const { queryAllByText, findAllByText, findByText } = render(
      <BasicAppContext>
        <CredentialDetails
          navigation={useNavigation()}
          route={{ params: { credentialId: mock_testOpenVPCredentialRecord.id } } as any}
        ></CredentialDetails>
      </BasicAppContext>
    )

    let showButtons = await findAllByText('Record.Show')
    let hiddenValues = await findAllByText(hiddenFieldValue)

    expect(showButtons).toHaveLength(3)
    expect(hiddenValues).toHaveLength(3)

    for (const button of showButtons) {
      await act(async () => {
        fireEvent(button, 'press')
      })
    }

    showButtons = await queryAllByText('Record.Show')
    hiddenValues = await queryAllByText(hiddenFieldValue)

    expect(showButtons).toHaveLength(0)
    expect(hiddenValues).toHaveLength(0)

    const hideAllButton = await findByText('Record.HideAll')
    expect(hideAllButton).not.toBe(null)

    await act(async () => {
      fireEvent(hideAllButton, 'press')
    })

    showButtons = await findAllByText('Record.Show')
    hiddenValues = await findAllByText(hiddenFieldValue)

    expect(showButtons).toHaveLength(3)
    expect(hiddenValues).toHaveLength(3)
  })
  test('JSON Detail button exists when dev mode is enabled', async () => {
    const customState = {
      ...testDefaultState,
      preferences: {
        ...testDefaultState.preferences,
        developerModeEnabled: true,
      },
    }
    const tree = render(
      <BasicAppContext>
        <StoreContext.Provider
          value={[
            customState,
            () => {
              return
            },
          ]}
        >
          <CredentialDetails
            navigation={useNavigation()}
            route={{ params: { credentialId: mock_testOpenVPCredentialRecord.id } } as any}
          ></CredentialDetails>
        </StoreContext.Provider>
      </BasicAppContext>
    )
    const jsonDetailsButton = tree.getByTestId(testIdWithKey('JSONDetails'))
    expect(jsonDetailsButton).not.toBeNull()
  })

  test('JSON Details button does not exist when dev mode is disabled', async () => {
    const customState = {
      ...testDefaultState,
      preferences: {
        ...testDefaultState.preferences,
        developerModeEnabled: false,
      },
    }
    const tree = render(
      <BasicAppContext>
        <StoreContext.Provider
          value={[
            customState,
            () => {
              return
            },
          ]}
        >
          <CredentialDetails
            navigation={useNavigation()}
            route={{ params: { credentialId: mock_testOpenVPCredentialRecord.id } } as any}
          ></CredentialDetails>
        </StoreContext.Provider>
      </BasicAppContext>
    )
    expect(() => tree.getByTestId(testIdWithKey('JSONDetails'))).toThrow()
  })

  test('JSON Details button navigates', async () => {
    const navigate = jest.fn()
    const navigation = { navigate } as any
    const credential = mock_testOpenVPCredentialRecord

    const customState = {
      ...testDefaultState,
      preferences: {
        ...testDefaultState.preferences,
        developerModeEnabled: true,
      },
    }
    const tree = render(
      <BasicAppContext>
        <StoreContext.Provider
          value={[
            customState,
            () => {
              return
            },
          ]}
        >
          <CredentialDetails
            navigation={navigation}
            route={{ params: { credentialId: mock_testOpenVPCredentialRecord.id } } as any}
          />
        </StoreContext.Provider>
      </BasicAppContext>
    )
    const jsonDetailsButton = await tree.findByTestId(testIdWithKey('JSONDetails'))

    await act(async () => {
      fireEvent.press(jsonDetailsButton)
      expect(navigation.navigate).toHaveBeenCalledWith(Stacks.ContactStack, {
        screen: Screens.JSONDetails,
        params: { jsonBlob: JSON.stringify(credential, null, 2) },
      })
    })
  })

  test('Isseud date is displayed when dev mode is enabled', async () => {
    const customState = {
      ...testDefaultState,
      preferences: {
        ...testDefaultState.preferences,
        developerModeEnabled: true,
      },
    }
    const tree = render(
      <BasicAppContext>
        <StoreContext.Provider
          value={[
            customState,
            () => {
              return
            },
          ]}
        >
          <CredentialDetails
            navigation={useNavigation()}
            route={{ params: { credentialId: mock_testOpenVPCredentialRecord.id } } as any}
          ></CredentialDetails>
        </StoreContext.Provider>
      </BasicAppContext>
    )
    const issuedDate = await tree.findByTestId(testIdWithKey('IssuedDate'))
    expect(issuedDate).not.toBeNull()
  })
  test('Issued date is not displayed when dev mode is disabled', async () => {
    const customState = {
      ...testDefaultState,
      preferences: {
        ...testDefaultState.preferences,
        developerModeEnabled: false,
      },
    }
    const tree = render(
      <BasicAppContext>
        <StoreContext.Provider
          value={[
            customState,
            () => {
              return
            },
          ]}
        >
          <CredentialDetails
            navigation={useNavigation()}
            route={{ params: { credentialId: mock_testOpenVPCredentialRecord.id } } as any}
          ></CredentialDetails>
        </StoreContext.Provider>
      </BasicAppContext>
    )
    await expect(tree.findByTestId(testIdWithKey('IssuedDate'))).rejects.toThrow()
  })
})
