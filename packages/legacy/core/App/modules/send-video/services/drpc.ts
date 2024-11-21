import { Agent, ConnectionRecord } from '@credo-ts/core'
import { DrpcRequest, DrpcResponseObject } from '@credo-ts/drpc'

export type DrpcResponsePromise<T> = (responseTimeout: number) => Promise<T>
export const defaultResponseTimeoutInMs = 10000 // DRPC response timeout
export const jsonrpcVersion = '2.0'

export type ActionPrompt = {
  id: string
  text: string
  type: string
}

export type StartSessionDrpcResponse = DrpcResponseObject & {
  result?: {
    created_at: string
    expires_at: string
    id: string
    prompts: ActionPrompt[]
    version: string
  }
}

// These are the methods that the DRPC server supports. They
// should map to a handler on the controller.
const DrpcMethod = {
  StartSession: 'start_new_session_v1',
} as const

export const sendDrpcRequest = async (
  agent: Agent,
  connectionId: string,
  request: Partial<DrpcRequest>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<DrpcResponsePromise<any>> => {
  const requestWithId = {
    jsonrpc: jsonrpcVersion,
    id: Math.floor(Math.random() * 900000) + 100000,
    ...request,
  }

  return await agent.modules.drpc.sendRequest(connectionId, requestWithId)
}

export const requestStartSessionDrpc = async (
  agent: Agent,
  connectionRecord: ConnectionRecord
): Promise<DrpcResponsePromise<StartSessionDrpcResponse>> => {
  const request: Partial<DrpcRequest> = {
    method: DrpcMethod.StartSession,
  }

  return await sendDrpcRequest(agent, connectionRecord.id, request)
}
