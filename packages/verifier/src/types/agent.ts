import {
  AnonCredsModule,
} from '@credo-ts/anoncreds'

import {
  DidCommModule
} from '@credo-ts/didcomm'

import {
  Agent
} from '@credo-ts/core'

type GetAgentModules = () => {
  //askar: AskarModule
  //anoncredsRs: AnonCredsRsModule
  anoncreds: AnonCredsModule
  didcomm: DidCommModule
}

export type BifoldAgent = Agent<ReturnType<GetAgentModules>>
