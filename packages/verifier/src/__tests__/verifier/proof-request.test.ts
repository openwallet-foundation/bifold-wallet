import { getProofRequestTemplates } from '../../request-templates'
import { buildProofRequestDataForTemplate, hasPredicates } from '../../utils/proof-request'

import SpyInstance = jest.SpyInstance

describe('Helpers', () => {
  let spy: SpyInstance

  beforeAll(() => {
    spy = jest.spyOn(Date, 'now').mockImplementation(() => 1677766511505)
  })
  const templates = getProofRequestTemplates(false)

  test('Build anoncreds proof request from template containing two requested attributes', async () => {
    const template = templates[0]
    const proofRequest = buildProofRequestDataForTemplate(template)
    expect(proofRequest).toMatchSnapshot()
  })

  test('Build anoncreds proof request from template containing two requested attributes and predicate', async () => {
    const template = templates[1]
    const proofRequest = buildProofRequestDataForTemplate(template)
    expect(proofRequest).toMatchSnapshot()
  })

  test('Check if proof has predicates', async () => {
    expect(hasPredicates(templates[0])).toBeFalsy()
    expect(hasPredicates(templates[1])).toBeTruthy()
  })

  afterAll(() => {
    spy.mockRestore()
  })
})
