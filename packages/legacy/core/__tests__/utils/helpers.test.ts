import { ConnectionRecord } from '@credo-ts/core'
import { useAgent } from '@credo-ts/react-hooks'
import fs from 'fs'
import path from 'path'

import {
  connectFromInvitation,
  createConnectionInvitation,
  credDefIdFromRestrictions,
  credentialSortFn,
  formatIfDate,
  formatTime,
  getConnectionName,
  removeExistingInvitationIfRequired,
  schemaIdFromRestrictions,
} from '../../App/utils/helpers'

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

// This is a difficult function to test completely because of the i18n
describe('formatTime', () => {
  test.skip('without params', () => {
    const result = formatTime(new Date('December 17, 2012 03:24:00'))
    // This would be December 17, 2012 but the i18n is not working in Jest
    expect(result).toBe('Dec 17, 2012')
  })

  test('shortMonth', () => {
    const result = formatTime(new Date('December 17, 2012 03:24:00'), { shortMonth: true })
    expect(result).toBe('Dec 17, 2012')
  })

  test('includeHour', () => {
    const result = formatTime(new Date('December 17, 2012 03:24:00'), { includeHour: true })
    expect(result).toBe('Dec 17, 2012, 3:24 am')
  })

  test('trim with current year', () => {
    const currentYear = new Date().getFullYear()
    const result = formatTime(new Date(`January 1, ${currentYear} 03:24:00`), { trim: true })
    expect(result).toBe('Jan 1')
  })

  test('trim with previous year', () => {
    const result = formatTime(new Date('January 1, 2012 03:24:00'), { trim: true })
    expect(result).toBe('Jan 1, 2012')
  })

  test('format', () => {
    const result = formatTime(new Date(`January 1, 2012 03:24:00`), { format: 'D MMM YYYY' })
    expect(result).toBe('1 Jan 2012')
  })
})

describe('formatIfDate', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  test('without format', () => {
    const result = formatIfDate(undefined, '20020523')
    expect(result).toEqual('20020523')
  })

  test('with format and string date', () => {
    const result = formatIfDate('YYYYMMDD', '20020523')
    expect(result).toEqual('May 23, 2002')
  })

  test('with format and number date', () => {
    const result = formatIfDate('YYYYMMDD', 20020523)
    expect(result).toEqual('May 23, 2002')
  })

  test('with format but invalid string date', () => {
    const result = formatIfDate('YYYYMMDD', '203')
    expect(result).toEqual('203')
  })

  test('with format but invalid number date', () => {
    const result = formatIfDate('YYYYMMDD', 203)
    expect(result).toEqual(203)
  })
})

describe('createConnectionInvitation', () => {
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

describe('removeExistingInvitationIfRequired', () => {
  test('without an existing oobRecord', async () => {
    const { agent } = useAgent()
    const invitationId = '1'
    agent!.oob.findByReceivedInvitationId = jest
      .fn()
      .mockReturnValueOnce(Promise.reject('No received invitation with this id exists'))
    const deleteById = jest.fn()
    agent!.oob.deleteById = deleteById

    await removeExistingInvitationIfRequired(agent, invitationId)

    expect(deleteById).not.toBeCalled()
  })
  test('with an existing oobRecord', async () => {
    const { agent } = useAgent()
    const invitationId = '1'
    agent!.oob.findByReceivedInvitationId = jest.fn().mockReturnValueOnce(Promise.resolve({ id: '123' }))
    const deleteById = jest.fn()
    agent!.oob.deleteById = deleteById

    await removeExistingInvitationIfRequired(agent, invitationId)

    expect(deleteById).toBeCalledWith('123')
  })
})

describe('connectFromInvitation', () => {
  test('ordinary connection, default options', async () => {
    const { agent } = useAgent()
    const uri = ''
    const parseInvitation = jest.fn().mockReturnValueOnce(Promise.resolve({ id: '123' }))
    agent!.oob.parseInvitation = parseInvitation
    const record = {}
    const receiveInvitation = jest.fn().mockReturnValueOnce(Promise.resolve(record))
    agent!.oob.receiveInvitation = receiveInvitation
    const result = await connectFromInvitation(uri, agent)
    expect(parseInvitation).toBeCalled()
    expect(receiveInvitation).toBeCalled()
    expect(result).toBe(record)
  })
})

describe('getConnectionName', () => {
  test('With all properties and alternate name', async () => {
    const connection = { id: '1', theirLabel: 'Mike', alias: 'Mikey' }
    const alternateContactNames = { '1': 'Mikeroni' }

    const result = getConnectionName(connection as ConnectionRecord, alternateContactNames)
    expect(result).toBe('Mikeroni')
  })
  test('With all properties and no alternate name', async () => {
    const connection = { id: '1', theirLabel: 'Mike', alias: 'Mikey' }
    const alternateContactNames = {}

    const result = getConnectionName(connection as ConnectionRecord, alternateContactNames)
    expect(result).toBe('Mike')
  })
  test('With no theirLabel but an alias', async () => {
    const connection = { id: '1', alias: 'Mikey' }
    const alternateContactNames = {}

    const result = getConnectionName(connection as ConnectionRecord, alternateContactNames)
    expect(result).toBe('Mikey')
  })
  test('With no theirLabel or alias', async () => {
    const connection = { id: '1' }
    const alternateContactNames = {}

    const result = getConnectionName(connection as ConnectionRecord, alternateContactNames)
    expect(result).toBe('1')
  })
  test('With undefined connection', async () => {
    const connection = undefined
    const alternateContactNames = {}

    const result = getConnectionName(connection as unknown as ConnectionRecord, alternateContactNames)
    expect(result).toBe('')
  })
})

describe('credDefIdFromRestrictions', () => {
  test('With no cred_def_id in any restrictions', async () => {
    const expected = ''
    const restrictions = [{}, {}]

    const result = credDefIdFromRestrictions(restrictions)
    expect(result).toBe(expected)
  })

  test('With cred_def_id in restriction', async () => {
    const expected = 'cred_def_id'
    const restrictions = [{ cred_def_id: expected }]

    const result = credDefIdFromRestrictions(restrictions)
    expect(result).toBe(expected)
  })

  test('With cred_def_id in later restriction', async () => {
    const expected = 'cred_def_id'
    const restrictions = [{}, { cred_def_id: expected }]

    const result = credDefIdFromRestrictions(restrictions)
    expect(result).toBe(expected)
  })
})

describe('schemaIdFromRestrictions', () => {
  test('With no schema_id or schema ID subproperties in any restrictions', async () => {
    const expected = ''
    const restrictions = [{}, {}]

    const result = schemaIdFromRestrictions(restrictions)
    expect(result).toBe(expected)
  })

  test('With schema_id in restriction', async () => {
    const expected = 'schema_id'
    const restrictions = [{}, { schema_id: expected }]

    const result = schemaIdFromRestrictions(restrictions)
    expect(result).toBe(expected)
  })

  test('With all subproperties of schema ID in restriction', async () => {
    const expected = 'abc123:2:Student Card:1.0'
    const restrictions = [{ schema_name: 'Student Card', schema_version: '1.0', issuer_did: 'abc123' }]

    const result = schemaIdFromRestrictions(restrictions)
    expect(result).toBe(expected)
  })

  test('With only some subproperties of schema ID in restriction', async () => {
    const expected = ''
    const restrictions = [{ schema_name: 'Student Card', issuer_did: 'abc123' }]

    const result = schemaIdFromRestrictions(restrictions)
    expect(result).toBe(expected)
  })
})
