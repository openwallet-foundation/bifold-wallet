import { AsyncThunk, AsyncThunkPayloadCreator, createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ConnectionRecord } from 'aries-framework'
import { Agent } from 'aries-framework'
import { Connection } from 'aries-framework'
// import type { RootState } from '../store'

// Define a type for the slice state
export interface CounterState {
  value: number
}

// Define the initial state using that type
const initialState: CounterState = {
  value: 0,
}

export const counterSlice = createSlice({
  name: 'counter',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    increment: (state) => {
       state.value += 1
    },
    decrement: (state) => {
      state.value -= 1
    },
    // Use the PayloadAction type to declare the contents of `action.payload`
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload
    },
  },
  extraReducers: {
    [fetchConnections.fulfilled as any]: (state, action) => {
      console.log('state', state)
      console.log('action', action)
    },
    [fetchConnections.rejected as any]: (state, action) => {
      console.log('An error ocurred', action)
    }
  }
})

export const { increment, decrement, incrementByAmount } = counterSlice.actions

// Other code such as selectors can use the imported `RootState` type
// export const selectCount = (state: RootState) => state.counter.values

export default counterSlice.reducer
