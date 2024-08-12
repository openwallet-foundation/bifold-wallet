import { parseSchemaFromId, credentialSchema, parsedSchema } from '../../App/utils/schema'

const schemaWithVersion = 'Y6LRXGU3ZCpm7yzjVRSaGu:2:BasicIdentity:1.0.0'
const schemaNoVersion = 'XUxBrVSALWHLeycAUhrNr9:3:CL:26293:Student Card'
const notASchema = 'XUxBrVSALWHLeycAUhrNr9:Student Card'

const credential = { metadata: { get: jest.fn().mockReturnValue({ schemaId: schemaWithVersion }) } }

describe('orientation', () => {
  test('Extract name and version', async () => {
    const result = parseSchemaFromId(schemaWithVersion)

    expect(result).toStrictEqual({ name: 'BasicIdentity', version: '1.0.0' })
  })

  test('Return the default value', async () => {
    const result = parseSchemaFromId(schemaNoVersion)

    expect(result).toStrictEqual({ name: 'Credential', version: '' })
  })

  test('Return the default value2', async () => {
    const result = parseSchemaFromId(notASchema)

    expect(result).toStrictEqual({ name: 'Credential', version: '' })
  })

  test('Schema ID extracted from credential exchange record', async () => {
    // @ts-ignore
    const result = credentialSchema(credential)

    expect(result).toBe(schemaWithVersion)
  })

  test('Schema parsed from credential record', async () => {
    // @ts-ignore
    const result = parsedSchema(credential)

    expect(result).toStrictEqual({ name: 'BasicIdentity', version: '1.0.0' })
  })
})
