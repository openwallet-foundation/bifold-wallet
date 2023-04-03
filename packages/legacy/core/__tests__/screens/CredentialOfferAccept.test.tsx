import { CredentialExchangeRecord as CredentialRecord, CredentialState } from '@aries-framework/core'
import { useCredentialById } from '@aries-framework/react-hooks'
import { render, waitFor } from '@testing-library/react-native'
import fs from 'fs'
import path from 'path'
import React from 'react'

import { ConfigurationContext } from '../../App/contexts/configuration'
import CredentialOfferAccept from '../../App/screens/CredentialOfferAccept'
import { testIdWithKey } from '../../App/utils/testable'
import configurationContext from '../contexts/configuration'
import timeTravel from '../helpers/timetravel'

jest.mock('@react-navigation/core', () => {
  return require('../../__mocks__/custom/@react-navigation/core')
})
jest.mock('@react-navigation/native', () => {
  return require('../../__mocks__/custom/@react-navigation/native')
})

const credentialId = '123'
const credentialPath = path.join(__dirname, '../fixtures/degree-credential.json')
const credential = JSON.parse(fs.readFileSync(credentialPath, 'utf8'))
const credentialRecord = new CredentialRecord(credential)
// TODO:(jl) Make a fn to revive JSON dates properly and pass to `parse`
credentialRecord.createdAt = new Date(credentialRecord.createdAt)

// @ts-ignore
useCredentialById.mockReturnValue(credentialRecord)

describe('displays a credential accept screen', () => {
  test('renders correctly', () => {
    const tree = render(
      <ConfigurationContext.Provider value={configurationContext}>
        <CredentialOfferAccept visible={true} credentialId={credentialId} />
      </ConfigurationContext.Provider>
    )

    const doneButton = tree.queryByTestId('Done')

    expect(tree).toMatchSnapshot()
    expect(doneButton).toBeNull()
    expect(useCredentialById).toBeCalledWith(credentialId)
  })

  test('transitions to taking too delay message', async () => {
    const tree = render(
      <ConfigurationContext.Provider value={configurationContext}>
        <CredentialOfferAccept visible={true} credentialId={credentialId} />
      </ConfigurationContext.Provider>
    )

    await waitFor(() => {
      timeTravel(11000)
    })

    const backToHomeButton = tree.getByTestId(testIdWithKey('BackToHome'))
    const doneButton = tree.queryByTestId(testIdWithKey('Done'))

    expect(tree).toMatchSnapshot()
    expect(backToHomeButton).not.toBeNull()
    expect(doneButton).toBeNull()
  })

  test('transitions to offer accepted', () => {
    credentialRecord.state = CredentialState.CredentialReceived

    const tree = render(
      <ConfigurationContext.Provider value={configurationContext}>
        <CredentialOfferAccept visible={true} credentialId={credentialId} />
      </ConfigurationContext.Provider>
    )

    const doneButton = tree.getByTestId(testIdWithKey('Done'))
    const backToHomeButton = tree.queryByTestId(testIdWithKey('BackToHome'))

    expect(tree).toMatchSnapshot()
    expect(doneButton).not.toBeNull()
    expect(backToHomeButton).toBeNull()
  })
})
