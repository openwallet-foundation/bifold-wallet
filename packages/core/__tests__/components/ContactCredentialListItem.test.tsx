import { render, waitFor } from '@testing-library/react-native'
import fs from 'fs'
import path from 'path'
import React from 'react'

import ContactCredentialListItem from '../../src/components/listItems/ContactCredentialListItem'
import { BasicAppContext } from '../helpers/app'
import { CredentialExchangeRecord } from '@credo-ts/core'

const credentialPath = path.join(__dirname, '../fixtures/degree-credential.json')
const credential = JSON.parse(fs.readFileSync(credentialPath, 'utf8'))

describe('ContactCredentialListItem Component', () => {
  test('Renders correctly', async () => {
    const credentialRecord = new CredentialExchangeRecord(credential)
    credentialRecord.credentials.push({
      credentialRecordType: 'anoncreds',
      credentialRecordId: '',
    })
    credentialRecord.createdAt = new Date(credentialRecord.createdAt)
    const tree = render(
      <BasicAppContext>
        <ContactCredentialListItem credential={credentialRecord} onPress={() => {}} />
      </BasicAppContext>
    )

    await waitFor(async () => {
      expect(tree).toMatchSnapshot()
    })
  })
})
