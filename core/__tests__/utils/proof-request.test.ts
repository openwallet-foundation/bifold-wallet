import { defaultProofRequestTemplates } from '../../App/constants'
import { buildProofRequestDataByTemplate } from '../../App/utils/proof-request'
import SpyInstance = jest.SpyInstance

describe('Helpers', () => {
  let spy: SpyInstance

  beforeAll(() => {
    spy = jest.spyOn(Date, 'now').mockImplementation(() => 1677766511505)
  })

  test('Build indy proof request from template containing two requested attributes', async () => {
    const template = defaultProofRequestTemplates[0]
    const proofRequest = buildProofRequestDataByTemplate(template)
    expect(proofRequest).toMatchSnapshot()
  })

  test('Build indy proof request from template containing two requested attributes and predicate', async () => {
    const template = defaultProofRequestTemplates[1]
    const proofRequest = buildProofRequestDataByTemplate(template)
    expect(proofRequest).toMatchSnapshot()
  })

  test('Build indy proof request from template containing attributes group', async () => {
    const template = defaultProofRequestTemplates[3]
    const proofRequest = buildProofRequestDataByTemplate(template)
    expect(proofRequest).toMatchSnapshot()
  })

  afterAll(() => {
    spy.mockRestore()
  })
})
