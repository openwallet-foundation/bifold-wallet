export default interface ICaptureBaseData {
  type: string;
  classification: string;
  attributes: {
    [key: string]: string;
  };
  flagged_attributes: string[];
  digest?: string;
}
