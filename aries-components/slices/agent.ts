import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { AgentThunkApiConfig } from '../utils'

export interface AgentState {
  isInitialized: boolean
}

const initialState: AgentState = {
  isInitialized: false,
}

const initializeAgent = createAsyncThunk<boolean, void, AgentThunkApiConfig>(
  'agent/initialize',
  async (_, thunkApi) => {
    await thunkApi.extra.agent.init()
    return true
  }
)

const agentSlice = createSlice({
  name: 'agent',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(initializeAgent.fulfilled, (state, action) => {
      state.isInitialized = true
      return state
    })
  },
})

export { agentSlice, initializeAgent }
