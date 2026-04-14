import { credentialRegistry, selectOldIdByReplacementId } from '../../../src/modules/openid/refresh/registry'

describe('credentialRegistry', () => {
  beforeEach(() => {
    credentialRegistry.getState().reset()
  })

  test('marks credentials expired with a replacement and accepts the replacement', () => {
    credentialRegistry.getState().upsert({
      id: 'old-cred',
      format: 'jwt_vc' as any,
    })
    credentialRegistry.getState().markExpiredWithReplacement('old-cred', {
      id: 'new-cred',
      format: 'jwt_vc' as any,
    })

    expect(credentialRegistry.getState().expired).toEqual(['old-cred'])
    expect(credentialRegistry.getState().checked).toEqual(['old-cred'])
    expect(selectOldIdByReplacementId('new-cred')).toBe('old-cred')

    credentialRegistry.getState().acceptReplacement('old-cred')

    expect(credentialRegistry.getState().byId).toEqual({
      'new-cred': {
        id: 'new-cred',
        format: 'jwt_vc',
      },
    })
    expect(credentialRegistry.getState().replacements).toEqual({})
    expect(credentialRegistry.getState().expired).toEqual([])
    expect(credentialRegistry.getState().blocked['old-cred']?.reason).toBe('succeeded')
  })

  test('shouldSkip returns true for refreshing, replaced, and blocked credentials', () => {
    credentialRegistry.getState().markRefreshing('cred-refreshing')
    credentialRegistry.getState().markExpiredWithReplacement('cred-replaced', {
      id: 'replacement',
      format: 'jwt_vc' as any,
    })
    credentialRegistry.getState().blockAsFailed('cred-blocked', 'boom')

    expect(credentialRegistry.getState().shouldSkip('cred-refreshing')).toBe(true)
    expect(credentialRegistry.getState().shouldSkip('cred-replaced')).toBe(true)
    expect(credentialRegistry.getState().shouldSkip('cred-blocked')).toBe(true)
    expect(credentialRegistry.getState().shouldSkip('cred-free')).toBe(false)
  })

  test('unblock removes a credential from the blocked set', () => {
    credentialRegistry.getState().blockAsSucceeded('cred-1')
    expect(credentialRegistry.getState().shouldSkip('cred-1')).toBe(true)

    credentialRegistry.getState().unblock('cred-1')

    expect(credentialRegistry.getState().blocked).toEqual({})
    expect(credentialRegistry.getState().shouldSkip('cred-1')).toBe(false)
  })
})
