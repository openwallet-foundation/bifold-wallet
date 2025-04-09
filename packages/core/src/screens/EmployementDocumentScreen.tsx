import React, {useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useAgent } from '@credo-ts/react-hooks';
import { useRoute, RouteProp } from '@react-navigation/native';
import GoogleDriveUploadService from '../services/googleDrive';
import { GOOGLE_DRIVE_CONFIG } from '../constants/googleDriveConfig';
import { SecondaryHeader } from '../components/IcredyComponents';
import SearchBar from '../components/IcredyComponents/SearchBar';
import { sendCredentialProposal } from '../utils/helpers';
import { Attributes, LinkedAttachments, Schemadetails } from 'types/Icredytypes/credentialSchema';
import { ColorPallet, TextTheme } from '../theme'
import { useNavigation } from '@react-navigation/native';

// Define interfaces for better type safety
interface DocumentOption {
  id: string;
  name: string;
}

interface UploadedFiles {
  [key: string]: {
    uri: string;
    name: string;
    type: string;
  } | undefined;
}

type RootStackParamList = {
  EmployementDocument: {
    connectionId: string | undefined;
  };
};

type RouteProps = RouteProp<RootStackParamList, 'EmployementDocument'>;

const EmployementDocumentScreen = () => {
  const { width, height } = useWindowDimensions();
  const route = useRoute<RouteProps>();
  const { connectionId } = route.params;
  const { agent } = useAgent();
  const navigation = useNavigation();

  const [driveFolderLink, setDriveFolderLink] = useState<string>('');
  // State management
  const [searchText, setSearchText] = useState<string>('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFiles>({});
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const [processStatus, setProcessStatus] = useState<{
    step: 'idle' | 'uploading' | 'uploaded' | 'proposing' | 'completed' | 'error';
    message: string;
  }>({ step: 'idle', message: '' });

  const FOLDER_ID = '1Dce_QVLVy5OHcaHns9zNWLLBC9p-Yk42';

  const DocumentOption: DocumentOption[] = [
    { id: '1', name: 'Employment Letter' },
    { id: '2', name: 'Salary Slip' },
  ];

  // const schemadetails: Schemadetails = {
  //   schemaId: "UsXVNHcx2LCBaUyexnFXur:2:student_id:1.0.0",
  //   schemaName: "student_id",
  //   schemaVersion: "1.0.0",
  //   credentialDefinitionId: "UsXVNHcx2LCBaUyexnFXur:3:CL:2693054:studentid",
  //   schemaIssuerDid: "UsXVNHcx2LCBaUyexnFXur",
  // };

  const attributes: Attributes[] = [
    {
      name: "Document Type",
      mimeType: "text/plain",
      value: "Aadhaar"
    },
    {
      name: "Description",
      mimeType: "text/plain",
      value: "Credential Issuance Proposal"
    },
    {
      name: "issuanceDate",
      mimeType: "text/plain",
      value: new Date().toISOString(),
    },
    {
      name: "Issuer",
      mimeType: "text/plain",
      value: "RsRMYhU3jYLhYEVZjBq1jC"
    },
    {
      name: "Links",
      mimeType: "text/plain",
      value: driveFolderLink
    }

  ];

  


  // Handle document selection
  const handleUpload = async (itemId: string) => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.images, DocumentPicker.types.pdf],
        });
        
        const file = {
        uri: result[0].uri,
        name: result[0].name || 'unknown',
        type: result[0].type || 'application/octet-stream',
        };
        

      setUploadedFiles((prev) => ({
        ...prev,
        [itemId]: file,
      }));
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('Document picker cancelled');
      } else {
        Alert.alert('Error', 'Failed to upload the document.');
      }
    }
  };
  const sendProposal = async () => {
    try {
      setProcessStatus({ step: 'proposing', message: 'Sending credential proposal...' });
  
      // if(!folderLink) {
      //   setProcessStatus({ step: 'error', message: 'Failed to send proposal' });
      //   Alert.alert('Proposal Failed', 'Drive folder link not found');
      //   return;
      // }
      
      // const linkedAttachments: LinkedAttachments[] = Object.entries(uploadedFiles).map(([key, file]) => ({
      //   attributeName: 'documents',
      //   attachment: {
      //   id: `doc-${key}`,
      //   description: `Employment Document ${key}`,
      //   filename: file?.name || 'unknown',
      //   mimeType: file?.type || 'application/octet-stream',
      //   lastmodTime: new Date().toISOString(),
      //   data: {
      //   links: [driveFolderLink] // Include the drive link
      //   }
      //   }
      //   }))
        
    
      await sendCredentialProposal(
        agent,
        connectionId,
        // schemadetails,
        // linkedAttachments,
        attributes,
        "Employment Document",
        navigation
      );
      
      setProcessStatus({ step: 'completed', message: 'Process complete' });
    } catch (error) {
      console.error("Error sending proposal:", error);
      setProcessStatus({ step: 'error', message: 'Failed to send proposal' });
      Alert.alert('Proposal Failed', error instanceof Error ? error.message : 'Unknown error occurred');
    }
  };

  const uploadFilesToDrive = async () => {
    try {
      setIsUploading(true);
      setProcessStatus({ step: 'uploading', message: 'Uploading files to Google Drive...' });
      
      const uploadService = new GoogleDriveUploadService(GOOGLE_DRIVE_CONFIG.ACCESS_TOKEN);
  

      const metadataTransformer = (file: { name: string; type: string }, folderId: string) => ({
        name: `EmployeeDoc_${file.name}`,
        mimeType: file.type,
        parents: [folderId],
        description: 'Employee Document',
        });
        
        const fileTypeFilter = (file: { type: string }): boolean => {
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg'];
        return allowedTypes.includes(file.type);
        };
        
        const uploadResults = await uploadService.uploadFiles(
        uploadedFiles as Record<string, { uri: string; name: string; type: string }>,
        FOLDER_ID,
        {
        fileTypeFilter,
        metadataTransformer,
        onProgress: (key: string, response: any) => {
        }
        }
        );
      // Get the folder link
      if (uploadResults.length > 0 && uploadResults[0].folderLink) {
        const folderLink = uploadResults[0].folderLink;
      setDriveFolderLink(folderLink);
      GoogleDriveUploadService.showUploadAlert(uploadResults);
      setIsUploading(false);
        setProcessStatus({ step: 'uploaded', message: 'Files uploaded successfully' });
        // Pass the link directly to sendProposal
        // await sendProposal(folderLink);
      } else {
        throw new Error("No folder link was returned from the upload service");
      }

      
    } catch (error) {
      console.error('Upload error:', error);
      setProcessStatus({ step: 'error', message: 'Failed to upload files' });
      Alert.alert('Upload Failed', error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsUploading(false);
    }
  };
  // Determine primary action based on current status
  const handlePrimaryAction = async ()=> {
    // If we're in error state or idle or completed, start with upload
    if (['idle', 'error', 'completed'].includes(processStatus.step)) {
      await uploadFilesToDrive();
    } 
    // If upload is complete but proposal failed, retry proposal
    else if (processStatus.step === 'uploaded') {
      await sendProposal();
    }
  };

  // Determine button text based on current status
  const getButtonText = () => {
    switch (processStatus.step) {
      case 'uploading':
        return 'Uploading...';
      case 'proposing':
        return 'Sending Proposal...';
      case 'uploaded':
        return 'Send Proposal';
      case 'error':
        return 'Retry';
      default:
        return 'Upload & Send';
    }
  };

  const renderItem = ({ item }: { item: DocumentOption }) => (
    <View style={[styles.itemContainer, { paddingHorizontal: width * 0.05 }]}>
      <View style={styles.row}>
        <TouchableOpacity
          style={styles.radioButton}
          onPress={() => { }}
        >
          <View
            style={[
              styles.radioOuterCircle,
              uploadedFiles[item.id] && styles.radioSelected,
            ]}
          >
            {uploadedFiles[item.id] && <View style={styles.radioInnerCircle} />}
          </View>
        </TouchableOpacity>
        <Text style={[styles.documentTypeName, { width: width * 0.8 }]}>{item.name}</Text>
      </View>

      <TouchableOpacity
  style={styles.uploadContainer}
  onPress={() => handleUpload(item.id)}
  disabled={isUploading || ['uploaded', 'proposing'].includes(processStatus.step)}
>
  <View
    style={[
      styles.uploadBox,
      uploadedFiles[item.id] && { borderWidth: 0 },
      ['uploaded', 'proposing'].includes(processStatus.step) && { opacity: 0.6 }
    ]}
  >
    {uploadedFiles[item.id] ? (
      <View style={styles.uploadSuccessContainer}>
        <MaterialIcons name="check-circle-outline" size={30} color="green" />
        <Text style={styles.uploadText}>Uploaded</Text>
      </View>
    ) : (
      <>
        <MaterialIcons name="cloud-upload" size={40} color="#154ABF" />
        <Text style={styles.uploadText}>Upload or drag file here</Text>
      </>
    )}
  </View>
</TouchableOpacity>

    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <SecondaryHeader />

      <View style={[styles.header, { paddingHorizontal: width * 0.05, marginTop: height * 0.03 }]}>
        <Text style={styles.headerText}>Upload and Send Proposal</Text>
      </View>

      {processStatus.step !== 'idle' && (
        <View style={styles.statusContainer}>
          <Text style={[
            styles.statusText,
            processStatus.step === 'error' ? styles.errorText : 
            processStatus.step === 'completed' ? styles.successText : styles.infoText
          ]}>
            {processStatus.message}
          </Text>
        </View>
      )}

      <FlatList
        data={DocumentOption}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />

<View style={styles.buttonContainer}>
  {processStatus.step !== 'uploaded' ? (
    <TouchableOpacity
      style={[
        styles.uploadButton,
        (isUploading || Object.keys(uploadedFiles).length !== DocumentOption.length) 
          && styles.disabledButton
      ]}
      onPress={handlePrimaryAction}
      disabled={isUploading || Object.keys(uploadedFiles).length !== DocumentOption.length}
    >
      {isUploading || processStatus.step === 'proposing' ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#fff" />
          <Text style={[styles.buttonText, {marginLeft: 10}]}>
            {getButtonText()}
          </Text>
        </View>
      ) : (
        <Text style={styles.buttonText}>{getButtonText()}</Text>
      )}
    </TouchableOpacity>
  ) : (
    <TouchableOpacity onPress={() => sendProposal()} style={styles.uploadButton}>
      <Text style={styles.buttonText}>Send Proposal</Text>
    </TouchableOpacity>
  )}
</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ColorPallet.brand.primaryBackground,
  },
  header: {
    marginVertical: 20,
  },
  headerText: {
    ...TextTheme.headingFour,
    color: ColorPallet.brand.text,
    textAlign: 'center',
  },
  statusContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  statusText: {
    ...TextTheme.normal,
    color: ColorPallet.brand.text,
    textAlign: 'center',
  },
  infoText: {
    color: ColorPallet.brand.primary,
  },
  errorText: {
    color: '#D32F2F',
  },
  successText: {
    color: '#388E3C',
  },
  listContainer: {
    marginTop: 10,
  },
  itemContainer: {
    marginBottom: 25,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioButton: {
    marginRight: 10,
  },
  radioOuterCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: ColorPallet.grayscale.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInnerCircle: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor:  ColorPallet.grayscale.black,
  },
  radioSelected: {
    borderColor: ColorPallet.grayscale.black,
  },
  documentTypeName: {
    ...TextTheme.normal,
    color: ColorPallet.brand.text,
  },
  uploadContainer: {
    marginTop: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadBox: {
    height: 150,
    width: '90%',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: ColorPallet.grayscale.darkGrey,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    backgroundColor: ColorPallet.grayscale.white,
  },
  uploadText: {
    ...TextTheme.labelSubtitle,
    color: ColorPallet.brand.text,
  },
  uploadSuccessContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    marginTop: -50,
    paddingHorizontal: 38,
  },
  uploadButton: {
    backgroundColor: ColorPallet.brand.primary,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -20
  },
  disabledButton: {
    backgroundColor: '#9E9E9E',
  },
  buttonText: {
    ...TextTheme.bold,
    color: ColorPallet.grayscale.white,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  }
});

export default EmployementDocumentScreen;