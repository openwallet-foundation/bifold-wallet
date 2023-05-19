export default interface IOverlayBundleAttribute {
  name: string
  type: string
  information?: Record<string, string>
  label?: Record<string, string>
  format?: string
  characterEncoding?: string
  standard?: string
}
