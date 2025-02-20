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
  removeExistingInvitationsById,
  schemaIdFromRestrictions,
  b64decode,
  b64encode,
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

describe('check rolling base64 encode/decode', () => {
  const b64Lorem =
    'TG9yZW0gaXBzdW0gZG9sb3Igc2l0IGFtZXQsIGNvbnNlY3RldHVyIGFkaXBpc2NpbmcgZWxpdC4gU2VkIHRvcnRvciBtaSwgYmliZW5kdW0gdml0YWUgc2VtIHZpdGFlLCBlZ2VzdGFzIHJob25jdXMgbGVjdHVzLiBJbiBoYWMgaGFiaXRhc3NlIHBsYXRlYSBkaWN0dW1zdC4gQ2xhc3MgYXB0ZW50IHRhY2l0aSBzb2Npb3NxdSBhZCBsaXRvcmEgdG9ycXVlbnQgcGVyIGNvbnViaWEgbm9zdHJhLCBwZXIgaW5jZXB0b3MgaGltZW5hZW9zLiBJbiB0ZW1wdXMgcXVhbSBub24gcXVhbSBkaWduaXNzaW0sIG5lYyB1bGxhbWNvcnBlciB2ZWxpdCBtYXhpbXVzLiBOdWxsYSBmaW5pYnVzIGFyY3Ugc2FwaWVuLCBhIGNvbW1vZG8gbGVvIGFsaXF1ZXQgYWMuIFBlbGxlbnRlc3F1ZSBmaW5pYnVzIGFsaXF1YW0gYW50ZSBub24gYXVjdG9yLiBQaGFzZWxsdXMgZGlnbmlzc2ltIG5pc2kgdml0YWUgbG9yZW0gZGFwaWJ1cyBtYXhpbXVzLiBMb3JlbSBpcHN1bSBkb2xvciBzaXQgYW1ldCwgY29uc2VjdGV0dXIgYWRpcGlzY2luZyBlbGl0LiBQcm9pbiBwb3J0YSB0dXJwaXMgc2l0IGFtZXQgYWxpcXVhbSBmcmluZ2lsbGEuIFNlZCBmaW5pYnVzLCBhdWd1ZSBub24gY29uZGltZW50dW0gY29uZGltZW50dW0sIGFudGUgYXJjdSBmcmluZ2lsbGEgc2VtLCBldSBtb2xsaXMgZXggc2FwaWVuIHZhcml1cyBudWxsYS4gRG9uZWMgdmVzdGlidWx1bSBsYWN1cyB0ZW1wb3IgYXJjdSB0aW5jaWR1bnQsIGF0IHVsdHJpY2llcyBzYXBpZW4gbGFjaW5pYS4gRHVpcyBpZCB0ZW1wdXMgbWF1cmlzLiBTZWQgYmxhbmRpdCBlbGl0IG5vbiBlbGl0IGN1cnN1cyBjb252YWxsaXMuIEluIGluIG1ldHVzIHVsdHJpY2llcywgcmhvbmN1cyBzYXBpZW4gZGlnbmlzc2ltLCB0aW5jaWR1bnQgbWkuIFByYWVzZW50IGV0IHVsdHJpY2llcyBlc3QuIFByYWVzZW50IG1vbGxpcyBhIG5pYmggbm9uIGltcGVyZGlldC4gUXVpc3F1ZSBtYXR0aXMgZW5pbSBpbiBiaWJlbmR1bSB0ZW1wb3IuIFZpdmFtdXMgaW4gZ3JhdmlkYSBmZWxpcy4gUHJhZXNlbnQgdmVsaXQgcXVhbSwgYmliZW5kdW0gYXQgaWFjdWxpcyB2aXRhZSwgdml2ZXJyYSBpZCB1cm5hLiBBZW5lYW4gY3Vyc3VzIGV0IGRvbG9yIGlkIHB1bHZpbmFyLiBTZWQgbG9yZW0gbWV0dXMsIHNjZWxlcmlzcXVlIHV0IG1ldHVzIGluLCBkYXBpYnVzIGZyaW5naWxsYSBkdWkuIE51bGxhIG5pc2kgaXBzdW0sIHVsbGFtY29ycGVyIGF0IGxhY2luaWEgbm9uLCB0cmlzdGlxdWUgc2l0IGFtZXQgb3JjaS4gU2VkIHV0IGx1Y3R1cyBsZWN0dXMuIE51bGxhIGFjIHVybmEgZXQgbGliZXJvIHRlbXB1cyB2ZW5lbmF0aXMuIEV0aWFtIGVnZXQgbmVxdWUgaWQgcmlzdXMgaW50ZXJkdW0gZWdlc3RhcyBhdCBub24gbWkuIFN1c3BlbmRpc3NlIHNlZCBsZW8gZWdldCB0dXJwaXMgY29uZGltZW50dW0gY29udmFsbGlzLiBJbiBoYWMgaGFiaXRhc3NlIHBsYXRlYSBkaWN0dW1zdC4gU2VkIHRyaXN0aXF1ZSBleCBxdWlzIHVsdHJpY2VzIHJ1dHJ1bS4gSW50ZXJkdW0gZXQgbWFsZXN1YWRhIGZhbWVzIGFjIGFudGUgaXBzdW0gcHJpbWlzIGluIGZhdWNpYnVzLiBDdXJhYml0dXIgYXVjdG9yIGFyY3UgYWMgcXVhbSBlbGVpZmVuZCBwcmV0aXVtLiBFdGlhbSBncmF2aWRhIGVyYXQgdml0YWUgcHVydXMgc29sbGljaXR1ZGluIHRyaXN0aXF1ZSBzaXQgYW1ldCBpZCBtYXNzYS4gRHVpcyBjb252YWxsaXMgbW9sZXN0aWUgaXBzdW0uIFBlbGxlbnRlc3F1ZSBuZWMgc2VtIGV1IGxvcmVtIGNvbnNlcXVhdCBtYWxlc3VhZGEgbmVjIGVnZXQgc2VtLiBNYWVjZW5hcyBpZCBuZXF1ZSByaXN1cy4gTmFtIHZlc3RpYnVsdW0gbWF0dGlzIG51bGxhLCBldSBhbGlxdWFtIGxpYmVybyBzb2xsaWNpdHVkaW4gZXQuIFByb2luIHNjZWxlcmlzcXVlIG1ldHVzIHF1aXMgdmFyaXVzIGdyYXZpZGEuIFBlbGxlbnRlc3F1ZSBoYWJpdGFudCBtb3JiaSB0cmlzdGlxdWUgc2VuZWN0dXMgZXQgbmV0dXMgZXQgbWFsZXN1YWRhIGZhbWVzIGFjIHR1cnBpcyBlZ2VzdGFzLiBTZWQgaW1wZXJkaWV0IHBsYWNlcmF0IGxhY3VzLCB0aW5jaWR1bnQgdml2ZXJyYSBhcmN1IGVnZXN0YXMgdmVsLiBTZWQgZWdldCB1bHRyaWNpZXMgbWFzc2EuIFZpdmFtdXMgdm9sdXRwYXQgc2FwaWVuIHF1aXMgZmV1Z2lhdCBydXRydW0uIE1hdXJpcyByaG9uY3VzIGxvcmVtIGV1IGZyaW5naWxsYSB1bGxhbWNvcnBlci4gRHVpcyBoZW5kcmVyaXQgZWdldCBmZWxpcyBxdWlzIGNvbmRpbWVudHVtLiBEdWlzIHNlbXBlciwgcmlzdXMgdml0YWUgcnV0cnVtIHZlc3RpYnVsdW0sIGFyY3UgbnVsbGEgYXVjdG9yIGxhY3VzLCBuZWMgZWdlc3RhcyBhbnRlIGRvbG9yIGVnZXQgdXJuYS4gVXQgYSB0b3J0b3IgbGFvcmVldCwgcG9ydHRpdG9yIGVyb3MgZWdldCwgZGljdHVtIHNlbS4gU2VkIGVnZXQgbWFsZXN1YWRhIGVuaW0uIEV0aWFtIG5vbiBsb3JlbSBzaXQgYW1ldCBkb2xvciBwbGFjZXJhdCBsYWNpbmlhLiBTZWQgaWQgbmliaCBhIHNlbSBkYXBpYnVzIHRpbmNpZHVudCBhdCBldSBzZW0uIEZ1c2NlIGlkIG9kaW8gaXBzdW0uIFByb2luIGZlcm1lbnR1bSBsZW8gaWQgbnVuYyBsYW9yZWV0IGFsaXF1ZXQuIE51bGxhIHBvc3VlcmUgbGlndWxhIG1pLCB1dCBjb25zZWN0ZXR1ciB0b3J0b3IgZXVpc21vZCBwb3N1ZXJlLiBFdGlhbSBwdWx2aW5hciBkb2xvciBhIHRlbXB1cyBpYWN1bGlzLiBNb3JiaSBlcm9zIG5pYmgsIHBoYXJldHJhIHV0IGFyY3Ugdml0YWUsIHJob25jdXMgaW1wZXJkaWV0IHNhcGllbi4gU2VkIGlhY3VsaXMgZXJhdCBsaWd1bGEsIGVnZXQgY29uc2VjdGV0dXIgYXJjdSBldWlzbW9kIHF1aXMuIFBoYXNlbGx1cyBmZWxpcyBkb2xvciwgY3Vyc3VzIGEgbGliZXJvIGluLCB0aW5jaWR1bnQgY29uc2VxdWF0IGRvbG9yLiBVdCBlbGVpZmVuZCB2YXJpdXMgZG9sb3Igc2VkIGdyYXZpZGEuIFBlbGxlbnRlc3F1ZSB2aXRhZSBjb25zZXF1YXQgbmVxdWUuIA=='
  const lorem =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed tortor mi, bibendum vitae sem vitae, egestas rhoncus lectus. In hac habitasse platea dictumst. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. In tempus quam non quam dignissim, nec ullamcorper velit maximus. Nulla finibus arcu sapien, a commodo leo aliquet ac. Pellentesque finibus aliquam ante non auctor. Phasellus dignissim nisi vitae lorem dapibus maximus. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin porta turpis sit amet aliquam fringilla. Sed finibus, augue non condimentum condimentum, ante arcu fringilla sem, eu mollis ex sapien varius nulla. Donec vestibulum lacus tempor arcu tincidunt, at ultricies sapien lacinia. Duis id tempus mauris. Sed blandit elit non elit cursus convallis. In in metus ultricies, rhoncus sapien dignissim, tincidunt mi. Praesent et ultricies est. Praesent mollis a nibh non imperdiet. Quisque mattis enim in bibendum tempor. Vivamus in gravida felis. Praesent velit quam, bibendum at iaculis vitae, viverra id urna. Aenean cursus et dolor id pulvinar. Sed lorem metus, scelerisque ut metus in, dapibus fringilla dui. Nulla nisi ipsum, ullamcorper at lacinia non, tristique sit amet orci. Sed ut luctus lectus. Nulla ac urna et libero tempus venenatis. Etiam eget neque id risus interdum egestas at non mi. Suspendisse sed leo eget turpis condimentum convallis. In hac habitasse platea dictumst. Sed tristique ex quis ultrices rutrum. Interdum et malesuada fames ac ante ipsum primis in faucibus. Curabitur auctor arcu ac quam eleifend pretium. Etiam gravida erat vitae purus sollicitudin tristique sit amet id massa. Duis convallis molestie ipsum. Pellentesque nec sem eu lorem consequat malesuada nec eget sem. Maecenas id neque risus. Nam vestibulum mattis nulla, eu aliquam libero sollicitudin et. Proin scelerisque metus quis varius gravida. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Sed imperdiet placerat lacus, tincidunt viverra arcu egestas vel. Sed eget ultricies massa. Vivamus volutpat sapien quis feugiat rutrum. Mauris rhoncus lorem eu fringilla ullamcorper. Duis hendrerit eget felis quis condimentum. Duis semper, risus vitae rutrum vestibulum, arcu nulla auctor lacus, nec egestas ante dolor eget urna. Ut a tortor laoreet, porttitor eros eget, dictum sem. Sed eget malesuada enim. Etiam non lorem sit amet dolor placerat lacinia. Sed id nibh a sem dapibus tincidunt at eu sem. Fusce id odio ipsum. Proin fermentum leo id nunc laoreet aliquet. Nulla posuere ligula mi, ut consectetur tortor euismod posuere. Etiam pulvinar dolor a tempus iaculis. Morbi eros nibh, pharetra ut arcu vitae, rhoncus imperdiet sapien. Sed iaculis erat ligula, eget consectetur arcu euismod quis. Phasellus felis dolor, cursus a libero in, tincidunt consequat dolor. Ut eleifend varius dolor sed gravida. Pellentesque vitae consequat neque. '
  test('correctly decodes long b64 string', () => {
    const testLorem = b64decode(b64Lorem)
    expect(testLorem).toEqual(lorem)
  })
  test('correctly encodes long string', () => {
    const testb64Lorem = b64encode(lorem)
    expect(testb64Lorem).toEqual(b64Lorem)
  })
})

// This is a difficult function to test completely because of the i18n
describe('formatTime', () => {
  test('without params', () => {
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

describe('removeExistingInvitationsById', () => {
  const invitationId = '1'
  const { agent } = useAgent()
  const findAllByQueryMock = jest.fn()
  agent!.oob.findAllByQuery = findAllByQueryMock
  const deleteByIdMock = jest.fn()
  agent!.oob.deleteById = deleteByIdMock

  test('without an existing invitation', async () => {
    await removeExistingInvitationsById(agent, invitationId)

    expect(deleteByIdMock).not.toHaveBeenCalled()
  })

  test('with a single existing invitation', async () => {
    findAllByQueryMock.mockReturnValueOnce(Promise.resolve([{ id: '2' }]))

    await removeExistingInvitationsById(agent, invitationId)

    expect(deleteByIdMock).toHaveBeenCalledTimes(1)
    expect(deleteByIdMock).toHaveBeenCalledWith('2')
  })
  
  test('with multiple existing invitations', async () => {
    deleteByIdMock.mockReset()
    findAllByQueryMock.mockReturnValueOnce(Promise.resolve([{ id: '2' }, { id: '3' }]))

    await removeExistingInvitationsById(agent, invitationId)

    expect(deleteByIdMock).toHaveBeenCalledTimes(2)
    expect(deleteByIdMock).toHaveBeenCalledWith('2')
    expect(deleteByIdMock).toHaveBeenCalledWith('3')
  })
})

describe('connectFromInvitation', () => {
  test('ordinary connection, default options', async () => {
    const { agent } = useAgent()
    const record = {
      connectionRecord: {},
      outOfBandRecord: { id: '123' },
    }
    const uri = 'http://foo.com?c_i=abc123'
    const parseInvitation = jest.fn().mockReturnValueOnce(Promise.resolve({ id: '123' }))
    agent!.oob.parseInvitation = parseInvitation
    const receiveInvitation = jest.fn().mockReturnValueOnce(Promise.resolve(record))
    agent!.oob.receiveInvitation = receiveInvitation

    const result = await connectFromInvitation(uri, agent)

    expect(parseInvitation).toBeCalled()
    expect(receiveInvitation).toBeCalled()
    expect(result).toBe(record.outOfBandRecord)
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
