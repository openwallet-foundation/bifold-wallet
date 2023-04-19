export default interface IOverlayBundleMetadata {
  name: {
    [key: string]: string;
  };
  description: {
    [key: string]: string;
  };
  credentialHelpText?: {
    [key: string]: string;
  };
  credentialSupportUrl?: {
    [key: string]: string;
  };
  issuer?: {
    [key: string]: string;
  };
  issuerDescription?: {
    [key: string]: string;
  };
  issuerUrl?: {
    [key: string]: string;
  };
}
