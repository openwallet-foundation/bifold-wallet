import { Agent } from 'aries-framework'
import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux'

import { agentSlice } from './slices/agent'
import { connectionsSlice } from './slices/connections/connectionsSlice'

const rootReducer = combineReducers({
  agent: agentSlice.reducer,
  connections: connectionsSlice.reducer,
})

type RootState = ReturnType<typeof rootReducer>
const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

const initializeStore = (agent: Agent) => {
  const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        thunk: {
          extraArgument: {
            agent,
          },
        },
      }),
  })

  type AppDispatch = typeof store.dispatch
  const useAppDispatch = () => useDispatch<AppDispatch>()

  return {
    store,
    useAppDispatch,
  }
}

export { initializeStore, useAppSelector }

export type { RootState }
