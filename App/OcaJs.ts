import { createStructure } from './use_cases/createStructure'
import { Structure } from './entities/Structure'
import type { OCA } from 'oca.js'

export type Config = {
  dataVaults?: string[]
  ocaRepositories?: string[]
}

export class OcaJs {
  config: Config

  constructor(config: Config) {
    this.config = config
  }

  async createStructure(oca: OCA): Promise<Structure> {
    return await createStructure(oca, this.config)
  }

  updateOcaRepositories(ocaRepositories: Config['ocaRepositories']) {
    this.config.ocaRepositories = ocaRepositories
  }

  updateDataVaults(dataVaults: Config['dataVaults']) {
    this.config.dataVaults = dataVaults
  }
}
