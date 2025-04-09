import RNFetchBlob from 'react-native-blob-util';
import { Alert , Platform} from 'react-native';
import { GOOGLE_DRIVE_CONFIG } from '../constants/googleDriveConfig';


interface File {
  uri: string;
  name: string;
  type: string;
}

interface UploadOptions {
  onProgress?: (key: string, responseData: any) => void;
  fileTypeFilter?: (file: File) => boolean;
  metadataTransformer?: (file: File, folderId: string) => Record<string, any>;
}

interface UploadResult {
  key: string;
  fileName: string;
  fileId: string;
  folderLink?: string;
  zipLink?: string;
}

interface FolderResult {
  id: string;
  name: string;
  webViewLink: string;
}

class GoogleDriveUploadService {
  private accessToken: string;
  private tokenExpirationTime: number;
  private static TOKEN_EXPIRY_BUFFER = 5 * 60 * 1000; // 5 minutes buffer

  constructor(accessToken: string) {
    this.accessToken = accessToken;
    this.tokenExpirationTime = Date.now() + 3600000;
  }

  private async ensureValidToken(): Promise<void> {
    try {
      console.log('Checking token validity...');
      try {
        const testResponse = await RNFetchBlob.fetch(
          'GET',
          'https://www.googleapis.com/drive/v3/about?fields=user',
          {
            Authorization: `Bearer ${this.accessToken}`,
          }
        );
        
        const testData = await testResponse.json();
        if (testData.error) {
          throw new Error('Token validation failed');
        }
      } catch (error) {
        const newToken = await GoogleDriveUploadService.refreshAccessToken();
        this.accessToken = newToken;
        this.tokenExpirationTime = Date.now() + 3600000;
      }
    } catch (error) {
      throw new Error('Failed to ensure valid token');
    }
  }

  private async createUserFolder(parentFolderId: string): Promise<FolderResult> {
    const randomFolderName = `user_${Math.random().toString(36).substring(2, 15)}`;
    
    const metadata = {
      name: randomFolderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentFolderId]
    };

    const response = await RNFetchBlob.fetch(
      'POST',
      'https://www.googleapis.com/drive/v3/files',
      {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      JSON.stringify(metadata)
    );

    const responseData = await response.json();
    if (responseData.error) {
      throw new Error(JSON.stringify(responseData.error));
    }

    // Set folder permissions to anyone with the link can view
    await this.setFolderPermissions(responseData.id);

    // Get the shareable link
    const folderLink = await this.getFolderLink(responseData.id);

    return {
      id: responseData.id,
      name: randomFolderName,
      webViewLink: folderLink
    };
  }

  private async setFolderPermissions(folderId: string): Promise<void> {
    const permissionMetadata = {
      role: 'writer',
      type: 'anyone'
    };

    await RNFetchBlob.fetch(
      'POST',
      `https://www.googleapis.com/drive/v3/files/${folderId}/permissions`,
      {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      JSON.stringify(permissionMetadata)
    );
  }

  private async getFolderLink(folderId: string): Promise<string> {
    const response = await RNFetchBlob.fetch(
      'GET',
      `https://www.googleapis.com/drive/v3/files/${folderId}?fields=webViewLink`,
      {
        Authorization: `Bearer ${this.accessToken}`
      }
    );

    const responseData = await response.json();
    if (responseData.error) {
      throw new Error(JSON.stringify(responseData.error));
    }

    return responseData.webViewLink;
  }

  async uploadFiles(
    files: Record<string, File>,
    parentFolderId: string,
    options: UploadOptions = {}
  ): Promise<UploadResult[]> {
    const { onProgress, fileTypeFilter = null, metadataTransformer = null } = options;

    if (Object.keys(files).length === 0) {
      throw new Error('No files to upload');
    }

    const uploadResults: UploadResult[] = [];

    try {
      await this.ensureValidToken();
      
      const userFolder = await this.createUserFolder(parentFolderId);
      console.log(`Created user folder: ${userFolder.name} with ID: ${userFolder.id}`);

      for (const [key, file] of Object.entries(files)) {
        if (fileTypeFilter && !fileTypeFilter(file)) {
          console.log(`Skipping file ${file.name} due to filter`);
          continue;
        }

        const filePath = this._normalizeFilePath(file.uri);
        console.log('Processing file:', file.name);
        console.log('Normalized file path:', filePath);

        let fileData: string;
        try {
          if (Platform.OS === 'android' && filePath.startsWith('content://')) {
            fileData = await RNFetchBlob.fs.readFile(filePath, 'base64');
          } else {
            const fileExists = await RNFetchBlob.fs.exists(
              Platform.OS === 'android' ? filePath.replace('file://', '') : filePath
            );
            
            if (!fileExists) {
              throw new Error(`File ${file.name} does not exist at path: ${filePath}`);
            }
            
            fileData = await RNFetchBlob.fs.readFile(
              Platform.OS === 'android' ? filePath.replace('file://', '') : filePath,
              'base64'
            );
          }
        } catch (error) {
          console.error(`Error reading file ${file.name}:`, error);
          throw error;
        }

        const metadata = metadataTransformer
          ? metadataTransformer(file, userFolder.id)
          : this._defaultMetadataBuilder(file, userFolder.id);

        const formData = [
          {
            name: 'metadata',
            data: JSON.stringify(metadata),
            type: 'application/json',
          },
          {
            name: 'file',
            filename: file.name,
            data: fileData,
            type: file.type,
          },
        ];

        let retryCount = 0;
        const maxRetries = 2;

        while (retryCount < maxRetries) {
          try {
            await this.ensureValidToken();
            
            const response = await RNFetchBlob.fetch(
              'POST',
              'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
              {
                Authorization: `Bearer ${this.accessToken}`,
                'Content-Type': 'multipart/form-data',
              },
              formData
            );

            const responseData = await response.json();
            if (responseData.error) {
              throw new Error(JSON.stringify(responseData.error));
            }

            if (onProgress) {
              onProgress(key, responseData);
            }

            uploadResults.push({
              key,
              fileName: file.name,
              fileId: responseData.id,
              folderLink: userFolder.webViewLink
            });

            console.log(`File ${file.name} uploaded successfully to folder ${userFolder.name}`);
            break;

          } catch (error: any) {
            console.error(`Upload attempt ${retryCount + 1} failed:`, error);
            
            if (retryCount === maxRetries - 1) {
              throw error;
            }
            
            await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
            retryCount++;
          }
        }
      }

      return uploadResults;

    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }


  private _normalizeFilePath(uri: string): string {
    try {
      if (Platform.OS === 'android') {
        if (uri.startsWith('content://')) {
          return uri;
        }
        else if (uri.startsWith('file://')) {
          return uri;
        }
        else {
          return `file://${uri}`;
        }
      }
      return decodeURIComponent(
        uri.startsWith('file://') ? uri.replace('file://', '') : uri
      );
    } catch (error) {
      console.error('Error normalizing file path:', error);
      throw new Error(`Failed to normalize file path: ${uri}`);
    }
  }

  private _defaultMetadataBuilder(file: File, folderId: string): Record<string, any> {
    return {
      name: file.name,
      mimeType: file.type,
      parents: [folderId],
    };
  }

  static async refreshAccessToken(): Promise<string> {
    try {
      if (!GOOGLE_DRIVE_CONFIG.REFRESH_TOKEN) {
        throw new Error('No refresh token available in GOOGLE_DRIVE_CONFIG');
      }
  
      // Prepare the request body
      const requestBody = [
        `grant_type=refresh_token`,
        `client_id=${encodeURIComponent(GOOGLE_DRIVE_CONFIG.CLIENT_ID)}`,
        `client_secret=${encodeURIComponent(GOOGLE_DRIVE_CONFIG.CLIENT_SECRET)}`,
        `refresh_token=${encodeURIComponent(GOOGLE_DRIVE_CONFIG.REFRESH_TOKEN)}`,
      ].join('&');
  
      // Make the request
      const response = await RNFetchBlob.fetch(
        'POST',
        'https://oauth2.googleapis.com/token',
        {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        requestBody
      );
  
      // Parse the response
      const responseData = JSON.parse(response.data); // Use `response.data` directly with RNFetchBlob
  
      // Validate the response
      if (responseData && responseData.access_token) {
        GOOGLE_DRIVE_CONFIG.ACCESS_TOKEN = responseData.access_token; // Update the config with the new token
        return responseData.access_token;
      } else if (responseData.error) {
        throw new Error(
          `Failed to refresh access token: ${responseData.error_description || 'Unknown error'}`
        );
      } else {
        throw new Error('Failed to refresh access token: No access token in response');
      }
    } catch (error: any) {
      console.error('Error refreshing access token:', error.message || error);
      throw new Error('Failed to refresh the access token. Please check your configuration and network.');
    }
  }
  

  static showUploadAlert(
    uploadResults: UploadResult[],
    successMessage: string = 'Files uploaded successfully'
  ): void {
    if (uploadResults.length > 0) {
      Alert.alert('Success', successMessage);
    }
  }
}

export default GoogleDriveUploadService;