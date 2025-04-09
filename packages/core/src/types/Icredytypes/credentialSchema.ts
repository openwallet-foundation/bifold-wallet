export type LinkedAttachments = {
    attributeName: string;
    attachment: {
        id: string;
        description: string;
        filename: string;
        mimeType: string;
        lastmodTime: string;
        data: {
            links: string[];
        };
    };
  }
export type Schemadetails = {
        schemaId: string,
        schemaName: string,
        schemaVersion: string,
        credentialDefinitionId: string,
        schemaIssuerDid: string,
      }
export type Attributes = {
        name: string,
        value: string,
        mimeType: string
      }