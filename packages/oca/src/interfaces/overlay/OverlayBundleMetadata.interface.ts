export default interface IOverlayBundleMetadata {
  name: Record<string, string>
  description: Record<string, string>
  credentialHelpText?: Record<string, string>
  credentialSupportUrl?: Record<string, string>
  issuer: Record<string, string>
  issuerDescription?: Record<string, string>
  issuerUrl?: Record<string, string>
}
