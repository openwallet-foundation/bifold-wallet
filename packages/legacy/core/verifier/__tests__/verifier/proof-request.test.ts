import { defaultProofRequestTemplates } from '../../request-templates'
import { buildProofRequestDataForTemplate, hasPredicates } from '../../utils/proof-request'

import SpyInstance = jest.SpyInstance

describe('Helpers', () => {
  let spy: SpyInstance

  beforeAll(() => {
    spy = jest.spyOn(Date, 'now').mockImplementation(() => 1677766511505)
  })

  test('Build indy proof request from template containing two requested attributes', async () => {
    const template = defaultProofRequestTemplates[0]
    const proofRequest = buildProofRequestDataForTemplate(template)
    expect(proofRequest).toMatchSnapshot()
  })

  test('Build indy proof request from template containing two requested attributes and predicate', async () => {
    const template = defaultProofRequestTemplates[1]
    const proofRequest = buildProofRequestDataForTemplate(template)
    expect(proofRequest).toMatchSnapshot()
  })

  test('Check if proof has predicates', async () => {
    expect(hasPredicates(defaultProofRequestTemplates[0])).toBeFalsy()
    expect(hasPredicates(defaultProofRequestTemplates[1])).toBeTruthy()
  })

  afterAll(() => {
    spy.mockRestore()
  })
})
