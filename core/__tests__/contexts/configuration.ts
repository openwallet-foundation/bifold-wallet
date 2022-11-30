import { ConfigurationContext } from '../../App'
import Record from '../../App/components/record/Record'
import { DefaultOCABundleResolver } from '../../App/types/oca'

const configurationContext: ConfigurationContext = {
  pages: () => [],
  terms: () => null,
  splash: () => null,
  homeContentView: () => null,
  OCABundle: new DefaultOCABundleResolver(),
  useBiometry: () => null,
  record: Record,
  settings: [],
  developer: () => null,
  scan: () => null,
  indyLedgers: [],
}

export default configurationContext
