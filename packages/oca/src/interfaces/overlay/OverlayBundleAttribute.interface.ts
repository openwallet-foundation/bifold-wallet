export default interface IOverlayBundleAttribute {
  name: string;
  type: string;
  information?: {
    [key: string]: string;
  };
  label?: {
    [key: string]: string;
  };
  format?: string;
}
