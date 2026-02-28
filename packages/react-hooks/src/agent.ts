import {
  DidCommModule
} from '@credo-ts/didcomm'

import {
  Agent
} from '@credo-ts/core'

type GetAgentModules = () => {
  didcomm: DidCommModule
}

export type BifoldAgent = Agent<ReturnType<GetAgentModules>>
