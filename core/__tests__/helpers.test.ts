import { sortCredentialsForAutoSelect } from '../App/utils/helpers'
import path from 'path'
import fs from 'fs'

const proofCredentialPath = path.join(__dirname, './fixtures/proof-credential.json')
const credentials = JSON.parse(fs.readFileSync(proofCredentialPath, 'utf8'))

describe('Helpers', () => {
  test('Sorts credentials for auto select', async () => {
    const sortedCreds = sortCredentialsForAutoSelect(credentials)

    expect(sortedCreds).toMatchSnapshot()
  })
})
