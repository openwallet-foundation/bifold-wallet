import { CredentialExchangeRecord as CredentialRecord, CredentialState } from '@credo-ts/core'
import { useCredentialById } from '@credo-ts/react-hooks'
import { render, waitFor } from '@testing-library/react-native'
import fs from 'fs'
import path from 'path'
import React from 'react'

import CredentialOfferAccept from '../../App/screens/CredentialOfferAccept'
import { testIdWithKey } from '../../App/utils/testable'
import timeTravel from '../helpers/timetravel'
import { BasicAppContext } from '../helpers/app'

const credentialId = '123'
const credentialPath = path.join(__dirname, '../fixtures/degree-credential.json')
const credential = JSON.parse(fs.readFileSync(credentialPath, 'utf8'))
const credentialRecord = new CredentialRecord(credential)
// TODO:(jl) Make a fn to revive JSON dates properly and pass to `parse`
credentialRecord.createdAt = new Date(credentialRecord.createdAt)

// @ts-expect-error useCredentialById will be replaced with a mock which does have this method
useCredentialById.mockReturnValue(credentialRecord)

describe('CredentialOfferAccept Screen', () => {
  test('renders correctly', () => {
    const tree = render(
      <BasicAppContext>
        <CredentialOfferAccept visible={true} credentialId={credentialId} />
      </BasicAppContext>
    )

    const doneButton = tree.queryByTestId('Done')

    expect(tree).toMatchSnapshot()
    expect(doneButton).toBeNull()
    expect(useCredentialById).toBeCalledWith(credentialId)
  })

  test('transitions to taking too delay message', async () => {
    const tree = render(
      <BasicAppContext>
        <CredentialOfferAccept visible={true} credentialId={credentialId} />
      </BasicAppContext>
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
      <BasicAppContext>
        <CredentialOfferAccept visible={true} credentialId={credentialId} />
      </BasicAppContext>
    )

    const doneButton = tree.getByTestId(testIdWithKey('Done'))
    const backToHomeButton = tree.queryByTestId(testIdWithKey('BackToHome'))

    expect(tree).toMatchSnapshot()
    expect(doneButton).not.toBeNull()
    expect(backToHomeButton).toBeNull()
  })
})
