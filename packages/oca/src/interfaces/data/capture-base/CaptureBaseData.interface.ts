export default interface ICaptureBaseData {
  type: string
  classification: string
  attributes: Record<string, string>
  flagged_attributes: string[]
  digest?: string
}
