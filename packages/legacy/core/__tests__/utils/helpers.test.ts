import { useAgent } from '@aries-framework/react-hooks'
import fs from 'fs'
import path from 'path'

import {
  isTablet,
  orientation,
  Orientation,
  createConnectionInvitation,
  credentialSortFn,
  formatIfDate,
  formatTime,
} from '../../App/utils/helpers'

const proofCredentialPath = path.join(__dirname, '../fixtures/proof-credential.json')
const credentials = JSON.parse(fs.readFileSync(proofCredentialPath, 'utf8'))
const connectionInvitationPath = path.join(__dirname, '../fixtures/connection-invitation.json')
const connectionInvitation = JSON.parse(fs.readFileSync(connectionInvitationPath, 'utf8'))

describe('orientation', () => {
  test('Not tablet aspect ratio', async () => {
    const width = 1000
    const height = 800
    const result = isTablet(width, height)

    expect(result).toBeTruthy()
  })

  test('Is tablet aspect ratio', async () => {
    const width = 1000
    const height = 600
    const result = isTablet(width, height)

    expect(result).toBeTruthy()
  })

  test('Is landscape', async () => {
    const width = 1000
    const height = 600
    const result = orientation(width, height)

    expect(result).toBe(Orientation.Landscape)
  })

  test('Is portrait', async () => {
    const width = 600
    const height = 1000
    const result = orientation(width, height)

    expect(result).toBe(Orientation.Portrait)
  })
})

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
