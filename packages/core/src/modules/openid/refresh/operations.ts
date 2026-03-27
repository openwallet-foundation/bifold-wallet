import { Agent } from '@credo-ts/core'
import { BifoldLogger } from '../../../services/logger'
import { OpenIDCredentialRecord, toOpenIDCredentialLite } from '../credentialRecord'
import { refreshAccessToken } from './refreshToken'
import { credentialRegistry } from './registry'
import { reissueCredentialWithAccessToken } from './reIssuance'
import { RefreshOrchestratorOpts } from './types'

type QueueReplacementOptions = {
  agent: Agent
  logger: BifoldLogger
  record: OpenIDCredentialRecord
  toLite?: NonNullable<RefreshOrchestratorOpts['toLite']>
}

export async function refreshAndQueueReplacement({
  agent,
  logger,
  record,
  toLite = toOpenIDCredentialLite,
}: QueueReplacementOptions) {
  const token = await refreshAccessToken({ logger, cred: record, agentContext: agent.context })
  if (!token) {
    return undefined
  }

  const newRecord = await reissueCredentialWithAccessToken({
    agent,
    logger,
    record,
    tokenResponse: token,
  })

  if (!newRecord) {
    return undefined
  }

  credentialRegistry.getState().markExpiredWithReplacement(record.id, toLite(newRecord))
  return newRecord
}
