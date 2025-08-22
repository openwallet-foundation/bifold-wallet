import { parseCredDefFromId } from '../../src/utils/cred-def'

describe('Cred Def Utils', () => {
  test('The correct cred def name is returned for a webvh cred def id', async () => {
    const credDefId = 'did:webvh:QmXysm9EF3kPH4fdCWf48YqCzREgiAe5nFXG3RCXaCShFX:id.test-suite.app:credo:01/resources/zQmedeFDzpfN3o3vmWBKWygVYg4uB74qwYPhU3TNW1bh1uq'
    const credDefName = parseCredDefFromId(credDefId)

    expect(credDefName).toBe('zQmedeFDzpfN3o3vmWBKWygVYg4uB74qwYPhU3TNW1bh1uq')
  })

  test('The correct cred def name is returned for a webvh cred def id with a file extension', async () => {
    const credDefId = 'did:webvh:QmXysm9EF3kPH4fdCWf48YqCzREgiAe5nFXG3RCXaCShFX:id.test-suite.app:credo:01/resources/zQmedeFDzpfN3o3vmWBKWygVYg4uB74qwYPhU3TNW1bh1uq.json'
    const credDefName = parseCredDefFromId(credDefId)

    expect(credDefName).toBe('zQmedeFDzpfN3o3vmWBKWygVYg4uB74qwYPhU3TNW1bh1uq')
  })
})
