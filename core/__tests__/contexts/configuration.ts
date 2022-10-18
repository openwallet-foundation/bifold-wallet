import Record from '../../src/components/record/Record'
import { DefaultOCABundleResolver } from '../../src/types/oca'

export default {
  pages: () => [],
  terms: () => null,
  splash: () => null,
  homeContentView: () => null,
  OCABundle: new DefaultOCABundleResolver(),
  useBiometry: () => null,
  record: Record,
}
