import { IndyVdrPoolConfig } from '@credo-ts/indy-vdr'

// @ts-expect-error TODO: fix this, was previously ignored due to an error in our tsconfig
import _ledgers from './ledgers.json'

// type-check the json
const ledgers: IndyVdrPoolConfig[] = _ledgers

export default ledgers
