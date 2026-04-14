import { RefreshOrchestrator } from '../../../src/modules/openid/refresh/refreshOrchestrator'
import { AgentBridge } from '../../../src/services/AgentBridge'
import { credentialRegistry } from '../../../src/modules/openid/refresh/registry'
import { verifyCredentialStatus } from '../../../src/modules/openid/refresh/verifyCredentialStatus'
import { refreshAndQueueReplacement } from '../../../src/modules/openid/refresh/operations'
import {
  getRefreshCredentialMetadata,
  markOpenIDCredentialStatus,
  persistCredentialRecord,
  setRefreshCredentialMetadata,
} from '../../../src/modules/openid/metadata'
import { OpenIDCredentialRefreshFlowType, RefreshStatus } from '../../../src/modules/openid/refresh/types'

jest.mock('../../../src/modules/openid/refresh/verifyCredentialStatus', () => ({
  verifyCredentialStatus: jest.fn(),
}))

jest.mock('../../../src/modules/openid/refresh/operations', () => ({
  refreshAndQueueReplacement: jest.fn(),
}))

jest.mock('../../../src/modules/openid/metadata', () => ({
  getRefreshCredentialMetadata: jest.fn(),
  markOpenIDCredentialStatus: jest.fn(),
  persistCredentialRecord: jest.fn(),
  setRefreshCredentialMetadata: jest.fn(),
}))

const mockVerifyCredentialStatus = verifyCredentialStatus as jest.Mock
const mockRefreshAndQueueReplacement = refreshAndQueueReplacement as jest.Mock
const mockGetRefreshCredentialMetadata = getRefreshCredentialMetadata as jest.Mock
const mockMarkOpenIDCredentialStatus = markOpenIDCredentialStatus as jest.Mock
const mockPersistCredentialRecord = persistCredentialRecord as jest.Mock
const mockSetRefreshCredentialMetadata = setRefreshCredentialMetadata as jest.Mock

describe('RefreshOrchestrator', () => {
  const logger = {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    credentialRegistry.getState().reset()
  })

  test('skips runOnce when the agent is not ready', async () => {
    const bridge = new AgentBridge()
    const orchestrator = new RefreshOrchestrator(logger as any, bridge, {
      autoStart: false,
      listRecords: async () => [{ id: 'cred-1' }],
    })

    await orchestrator.runOnce('manual')

    expect(logger.warn).toHaveBeenCalledWith('⚠️ [RefreshOrchestrator] runOnce skipped: agent not ready')
  })

  test('records invalid credentials in invalid-then-on-demand mode', async () => {
    const bridge = new AgentBridge()
    const agent = {
      isInitialized: true,
      context: { id: 'agent-context' },
    }
    const rec = { id: 'cred-1' }
    const orchestrator = new RefreshOrchestrator(logger as any, bridge, {
      autoStart: false,
      flowType: OpenIDCredentialRefreshFlowType.InvalidThenOnDemand,
      listRecords: async () => [rec],
      toLite: (record) => ({ id: record.id, format: 'jwt_vc' as any }),
    })

    mockVerifyCredentialStatus.mockResolvedValue(RefreshStatus.Invalid)
    mockGetRefreshCredentialMetadata.mockReturnValue({
      attemptCount: 1,
    })

    bridge.setAgent(agent as any)
    await orchestrator.runOnce('manual')

    expect(mockSetRefreshCredentialMetadata).toHaveBeenCalledWith(
      rec,
      expect.objectContaining({
        lastCheckResult: RefreshStatus.Invalid,
        attemptCount: 2,
      })
    )
    expect(mockPersistCredentialRecord).toHaveBeenCalledWith(agent.context, rec)
    expect(credentialRegistry.getState().expired).toEqual(['cred-1'])
    expect(credentialRegistry.getState().checked).toEqual(['cred-1'])
  })

  test('attempts full replacement for invalid credentials and stores the new record in memory', async () => {
    const bridge = new AgentBridge()
    const agent = {
      isInitialized: true,
      context: { id: 'agent-context' },
    }
    const rec = { id: 'cred-2' }
    const newRecord = { id: 'cred-2-new' }
    const orchestrator = new RefreshOrchestrator(logger as any, bridge, {
      autoStart: false,
      flowType: OpenIDCredentialRefreshFlowType.FullReplacement,
      listRecords: async () => [rec],
      toLite: (record) => ({ id: record.id, format: 'jwt_vc' as any }),
    })

    mockVerifyCredentialStatus.mockResolvedValue(RefreshStatus.Invalid)
    mockRefreshAndQueueReplacement.mockResolvedValue(newRecord)

    bridge.setAgent(agent as any)
    await orchestrator.runOnce('manual')

    expect(mockMarkOpenIDCredentialStatus).toHaveBeenCalledWith({
      credential: rec,
      status: RefreshStatus.Invalid,
      agentContext: agent.context,
    })
    expect(mockRefreshAndQueueReplacement).toHaveBeenCalledWith({
      agent,
      logger,
      record: rec,
      toLite: expect.any(Function),
    })
    expect(credentialRegistry.getState().blocked['cred-2']?.reason).toBe('succeeded')
    expect(orchestrator.resolveFull('cred-2-new')).toBe(newRecord)
  })

  test('marks refresh errors without attempting re-issuance when verification errors in full replacement mode', async () => {
    const bridge = new AgentBridge()
    const agent = {
      isInitialized: true,
      context: { id: 'agent-context' },
    }
    const rec = { id: 'cred-3' }
    const orchestrator = new RefreshOrchestrator(logger as any, bridge, {
      autoStart: false,
      flowType: OpenIDCredentialRefreshFlowType.FullReplacement,
      listRecords: async () => [rec],
      toLite: (record) => ({ id: record.id, format: 'jwt_vc' as any }),
    })

    mockVerifyCredentialStatus.mockResolvedValue(RefreshStatus.Error)

    bridge.setAgent(agent as any)
    await orchestrator.runOnce('manual')

    expect(mockMarkOpenIDCredentialStatus).toHaveBeenCalledWith({
      credential: rec,
      status: RefreshStatus.Error,
      agentContext: agent.context,
    })
    expect(mockRefreshAndQueueReplacement).not.toHaveBeenCalled()
  })
})
