import { useAgent } from '@aries-framework/react-hooks'
import fs from 'fs'
import path from 'path'

import { createConnectionInvitation, credentialSortFn, formatIfDate } from '../../App/utils/helpers'

const proofCredentialPath = path.join(__dirname, '../fixtures/proof-credential.json')
const credentials = JSON.parse(fs.readFileSync(proofCredentialPath, 'utf8'))
const connectionInvitationPath = path.join(__dirname, '../fixtures/connection-invitation.json')
const connectionInvitation = JSON.parse(fs.readFileSync(connectionInvitationPath, 'utf8'))

describe('credentialSortFn', () => {
  test('Sorts retrieved credentials by revocation', async () => {
    const key = '0_surname_uuid'
    const { requestedAttributes } = credentials
    const sortedCreds = requestedAttributes[key].sort(credentialSortFn)

    expect(sortedCreds).toMatchSnapshot()
  })
})

describe('formatIfDate', () => {
  let setter = jest.fn()

  beforeEach(() => {
    setter = jest.fn()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('without format', () => {
    formatIfDate(undefined, '20020523', setter)
    expect(setter).toBeCalledTimes(0)
  })

  test('with format and string date', () => {
    formatIfDate('YYYYMMDD', '20020523', setter)
    expect(setter).toBeCalledTimes(1)
  })

  test('with format and number date', () => {
    formatIfDate('YYYYMMDD', 20020523, setter)
    expect(setter).toBeCalledTimes(1)
  })

  test('with format but invalid string date', () => {
    formatIfDate('YYYYMMDD', '203', setter)
    expect(setter).toBeCalledTimes(0)
  })

  test('with format but invalid number date', () => {
    formatIfDate('YYYYMMDD', 203, setter)
    expect(setter).toBeCalledTimes(0)
  })
})

describe('Helper function', () => {
  test('Create connection invitation', async () => {
    const { agent } = useAgent()
    const invitation = {
      ...connectionInvitation,
      outOfBandInvitation: {
        toUrl: jest.fn().mockReturnValueOnce(Promise.resolve('cat')),
      },
    }
    agent!.oob.createInvitation = jest.fn().mockReturnValueOnce(Promise.resolve(invitation))

    const result = await createConnectionInvitation(agent, 'aries.foo')

    expect(result).toMatchSnapshot()
  })

  test('Create connection throws', async () => {
    const { agent } = useAgent()

    await expect(createConnectionInvitation(agent, 'aries.foo')).rejects.toThrow()
  })
})
