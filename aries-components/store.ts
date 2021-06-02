import { combineReducers, configureStore, ReducersMapObject } from '@reduxjs/toolkit'
import { Agent } from 'aries-framework'
import { createAgent } from './agent-test'
import { agentSlice, connectionsSlice, fetchAllConnections, initializeAgent } from './slices'


/* Inspiration
 * 1. Might be nice to have a guard statement in our middleware as shown here:
 *    https://www.newline.co/fullstack-react/30-days-of-react/day-21/ to ensure
 *    the agent is only added to the store when the dispatch function actually
 *    involved the agent.
 */
const initializeStore = (agent: Agent, reducers: ReducersMapObject) => {
  const rootReducer = combineReducers(reducers)

  // Infer the `RootState` and `AppDispatch` types from the store itself
  type RootState = ReturnType<typeof rootReducer>

  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        thunk: {
          extraArgument: {
            agent
          }
        }
      })

  })
}

const run = async () => {
  const agent = await createAgent()
  const store = initializeStore(
    agent,
    {
      agent: agentSlice.reducer,
      connections: connectionsSlice.reducer

    }
  )

  await store.dispatch(initializeAgent())
  await store.dispatch(fetchAllConnections())
  console.log(store.getState())
}

run().then(() => console.log('done'))

// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
// export type AppDispatch = typeof store.dispatch
