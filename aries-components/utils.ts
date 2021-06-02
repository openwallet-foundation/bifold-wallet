import { AsyncThunkPayloadCreator, createAsyncThunk } from "@reduxjs/toolkit"
import { Agent } from "aries-framework"


export interface AgentThunkApiConfig {
  extra: {
    agent: Agent
  }
}

export function createAsyncAgentThunk<Returned, ThunkArg = void>(typePrefix: string, payloadCreator: AsyncThunkPayloadCreator<Returned, ThunkArg, AgentThunkApiConfig>) {
  return createAsyncThunk<Returned, ThunkArg, AgentThunkApiConfig>(
    typePrefix,
    async (thunkArg, thunkApi) => {
        if (!thunkApi.extra.agent) return thunkApi.rejectWithValue('Agent not set')
        if (!thunkApi.extra.agent.isInitialized) return thunkApi.rejectWithValue('Agent not initialized, call agent.init()')
        return payloadCreator(thunkArg, thunkApi)
    },
  )
}
