import Record from '../../App/components/record/Record'
import { DefaultOCABundleResolver } from '../../App/types/oca'

export default {
  pages: () => [],
  terms: () => null,
  splash: () => null,
  homeContentView: () => null,
  OCABundle: new DefaultOCABundleResolver(),
  useBiometry: () => null,
  record: Record,
  settings: [],
}
