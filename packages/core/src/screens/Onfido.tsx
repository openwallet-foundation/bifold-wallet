import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  Platform,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Alert
} from 'react-native';
import { Onfido, OnfidoCaptureType } from '@onfido/react-native-sdk';
import { SecondaryHeader } from '../components/IcredyComponents';
import { sendCredentialProposal } from '../utils/helpers';
import { RouteProp, useRoute } from '@react-navigation/core';
import { useAgent } from '@credo-ts/react-hooks';
import { ColorPallet, TextTheme } from '../theme';
import { useNavigation } from '@react-navigation/native';

// Enum to track the verification process steps
enum VerificationStep {
  FORM_INPUT,
  LAUNCH_VERIFICATION,
  VERIFICATION_COMPLETED,
  GENERATING_FILE,
  SEND_PROPOSAL,
}

interface OnfidoState {
  sdkToken: string | null;
  sdkFlowComplete: boolean;
  workflowRunId: string | null;
  loading: boolean;
  firstName: string;
  lastName: string;
  currentStep: VerificationStep;
  timelineFileUrl: string | null;
  applicantId: string | null;
}

type RootStackParamList = {
  Onfido: {
    connectionId: string | undefined;
  };
};

type OnfidoScreenRouteProp = RouteProp<RootStackParamList, 'Onfido'>;

const OnfidoScreen: React.FC = () => {
  const route = useRoute<OnfidoScreenRouteProp>();
  const { connectionId } = route.params;
  const { agent } = useAgent();
  const navigation = useNavigation();

  const [state, setState] = useState<OnfidoState>({
    sdkToken: null,
    sdkFlowComplete: false,
    workflowRunId: null,
    loading: false,
    firstName: '',
    lastName: '',
    currentStep: VerificationStep.FORM_INPUT,
    timelineFileUrl: null,
    applicantId: null,
  });

  const handleInputChange = (field: 'firstName' | 'lastName', value: string) => {
    setState(prevState => ({ ...prevState, [field]: value }));
  };

  const initializeSDK = async (): Promise<void> => {
    const { firstName, lastName } = state;

    if (!firstName || !lastName) {
      Alert.alert('Please enter both first and last name');
      return;
    }

    try {
      setState(prevState => ({ ...prevState, loading: true }));
      // const apiToken = 'api_live_ca.WLv-Dr6rxyM.3tqhj3ObYp-CSG4Go876AQCZxyy7XhtO';
      const apiToken = 'api_sandbox_ca.BAkCwyz8yfb.0zyi1MM5xmuOThZwUBdzviaZaUjQToWY';
      const workflowId = 'eeaa94b3-0ac9-4d2b-a534-a4dd8155e85c';
      const applicationId = Platform.OS === 'ios' ? 'org.icredy.com' : 'com.icredy';

      const applicant = { first_name: firstName, last_name: lastName };
      const applicantResponse = await fetch('https://api.ca.onfido.com/v3/applicants', {
        method: 'POST',
        headers: {
          Authorization: 'Token token=' + apiToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicant),
      });

      const applicantData = await applicantResponse.json();
      const applicantId = applicantData.id;
      console.log("Applicant id:", applicantId);

      const sdkRequestBody = { applicant_id: applicantId, application_id: applicationId };3
      const sdkTokenResponse = await fetch('https://api.ca.onfido.com/v3/sdk_token', {
        method: 'POST',
        headers: {
          Authorization: 'Token token=' + apiToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sdkRequestBody),
      });

      const sdkToken = (await sdkTokenResponse.json()).token;
      let workflowRunId: string | null = null;

      if (workflowId) {
        const workflowRunIdBody = { workflow_id: workflowId, applicant_id: applicantId };
        const workflowRunIdResponse = await fetch('https://api.ca.onfido.com/v3.5/workflow_runs', {
          method: 'POST',
          headers: {
            Authorization: 'Token token=' + apiToken,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(workflowRunIdBody),
        });

        if (workflowRunIdResponse.ok) {
          workflowRunId = (await workflowRunIdResponse.json()).id;
        }
      }

      setState(prevState => ({ 
        ...prevState,
        sdkToken, 
        workflowRunId, 
        loading: false,
        currentStep: VerificationStep.LAUNCH_VERIFICATION,
        applicantId
      }));
    } catch (error: any) {
      setState(prevState => ({ ...prevState, loading: false }));
      Alert.alert('Error', 'Failed to initialize verification');
      console.error(error);
    }
  };

  const startSDK = (): void => {
    const { sdkToken, workflowRunId } = state;

    if (!sdkToken) return;

    Onfido.start({
      sdkToken,
      workflowRunId,
      flowSteps: {
        captureDocument: {},
        captureFace: { type: OnfidoCaptureType.VIDEO },
      },
    })
    .then(() => {
      setState(prevState => ({ 
        ...prevState,
        sdkFlowComplete: true,
        currentStep: VerificationStep.VERIFICATION_COMPLETED 
      }));
    })
    .catch((error) => {
      Alert.alert('Error', 'Verification process failed');
      console.error(error);
    });
  };

  const createTimelineFile = async () => {
    const { workflowRunId } = state;
    if (!workflowRunId) return;

    try {
      setState(prevState => ({ 
        ...prevState,
        loading: true, 
        currentStep: VerificationStep.GENERATING_FILE 
      }));
      
      const apiToken = 'api_sandbox_ca.BAkCwyz8yfb.0zyi1MM5xmuOThZwUBdzviaZaUjQToWY';
      const response = await fetch(`https://api.ca.onfido.com/v3.6/workflow_runs/${workflowRunId}/timeline_file`, {
        method: 'POST',
        headers: {
          Authorization: `Token token=${apiToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Wait for webhook response with the file URL
        pollForWebhookResponse();
      } else {
        const errorData = await response.json();
        setState(prevState => ({ ...prevState, loading: false }));
        Alert.alert('Error creating timeline file: ' + JSON.stringify(errorData));
      }
    } catch (error) {
      setState(prevState => ({ ...prevState, loading: false }));
      Alert.alert('Failed to create timeline file');
    }
  };

  const pollForWebhookResponse = async () => {
    const maxAttempts = 30; // Poll for maximum 30 attempts (5 minutes total if interval is 10 seconds)
    const pollingInterval = 10000; // 10 seconds
    let attempts = 0;
    
    const poll = () => {
      setTimeout(async () => {
        try {
          const ngrokUrl = 'https://15f2-2405-201-5c00-2175-7553-59f6-7373-56b9.ngrok-free.app'; // Replace with your actual ngrok URL
          const response = await fetch(`${ngrokUrl}/webhook-data`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
      
          if (response.ok) {
            const data = await response.json();
            const timelineFileDownloadUrl = data?.payload?.resource?.timeline_file_download_url;
            
            if (timelineFileDownloadUrl) {
              console.log('Timeline File Download URL:', timelineFileDownloadUrl);
              setState(prevState => ({ 
                ...prevState,
                timelineFileUrl: timelineFileDownloadUrl,
                loading: false,
                currentStep: VerificationStep.SEND_PROPOSAL
              }));
              Alert.alert('Success', 'Timeline file generated successfully');
              return;
            }
          }
          
          attempts++;
          if (attempts < maxAttempts) {
            poll();
          } else {
            setState(prevState => ({ ...prevState, loading: false }));
            Alert.alert('Timeout', 'Could not get webhook response after several attempts');
          }
        } catch (error) {
          setState(prevState => ({ ...prevState, loading: false }));
          Alert.alert('Error', 'Failed to fetch webhook data');
        }
      }, pollingInterval);
    };
    
    poll();
  };

  const sendProposal = async () => {
    const { applicantId, timelineFileUrl } = state;
    
    if (!applicantId || !timelineFileUrl) {
      Alert.alert('Error', 'Missing applicant ID or timeline file URL');
      return;
    }
    
    try {
      setState(prevState => ({ ...prevState, loading: true }));
      
      // Create attributes array similar to EmployementDocumentScreen
      const attributes = [
        {
          name: "Document Type",
          mimeType: "text/plain",
          value: "Identity Verification"
        },
        {
          name: "Description",
          mimeType: "text/plain",
          value: "Onfido Identity Verification"
        },
        {
          name: "issuanceDate",
          mimeType: "text/plain",
          value: new Date().toISOString(),
        },
        {
          name: "Issuer",
          mimeType: "text/plain",
          value: "Onfido"
        },
        {
          name: "Applicant ID",
          mimeType: "text/plain",
          value: applicantId
        },
        {
          name: "Links",
          mimeType: "text/plain",
          value: timelineFileUrl
        },
      ];
      
      await sendCredentialProposal(
        agent, 
        connectionId,
        attributes,
        "Identity Verification Document",
        navigation
      );
      
      setState(prevState => ({ 
        ...prevState,
        loading: false,
        currentStep: VerificationStep.FORM_INPUT, 
      }));
      
      Alert.alert('Success', 'Proposal sent successfully');
      
    } catch (error) {
      console.error("Error sending proposal:", error);
      setState(prevState => ({ ...prevState, loading: false }));
      Alert.alert('Proposal Failed', error instanceof Error ? error.message : 'Unknown error occurred');
    }
  };

  const handlePrimaryButtonPress = () => {
    const { currentStep } = state;
    
    switch (currentStep) {
      case VerificationStep.FORM_INPUT:
        initializeSDK();
        break;
      case VerificationStep.LAUNCH_VERIFICATION:
        startSDK();
        break;
      case VerificationStep.VERIFICATION_COMPLETED:
        createTimelineFile();
        break;
      case VerificationStep.SEND_PROPOSAL:
        sendProposal();
        break;
      default:
        break;
    }
  };

  const renderButtonText = () => {
    const { currentStep } = state;
    
    switch (currentStep) {
      case VerificationStep.FORM_INPUT:
        return 'Start Verification';
      case VerificationStep.LAUNCH_VERIFICATION:
        return 'Launch Verification';
      case VerificationStep.VERIFICATION_COMPLETED:
        return 'Generate File';
      case VerificationStep.GENERATING_FILE:
        return 'Generating...';
      case VerificationStep.SEND_PROPOSAL:
        return 'Send Proposal';
      default:
        return 'Start Verification';
    }
  };

  const renderContent = () => {
    const { loading, firstName, lastName, currentStep, timelineFileUrl, applicantId } = state;
    
    if (currentStep === VerificationStep.FORM_INPUT || currentStep === VerificationStep.LAUNCH_VERIFICATION) {
      return (
        <>
          <Text style={styles.title}>Identity Verification</Text>
          <Text style={styles.label}>First Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g John"
            placeholderTextColor="#AAB7C4"
            value={firstName}
            onChangeText={(value) => handleInputChange('firstName', value)}
            editable={currentStep === VerificationStep.FORM_INPUT && !loading}
          />

          <Text style={styles.label}>Last Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g Smith"
            placeholderTextColor="#AAB7C4"
            value={lastName}
            onChangeText={(value) => handleInputChange('lastName', value)}
            editable={currentStep === VerificationStep.FORM_INPUT && !loading}
          />
        </>
      );
    } else if (currentStep === VerificationStep.VERIFICATION_COMPLETED || currentStep === VerificationStep.GENERATING_FILE) {
      return (
        <>
          <Text style={styles.title}>Verification Completed</Text>
          <Text style={styles.subtitle}>Generating timeline file...</Text>
        </>
      );
    } else if (currentStep === VerificationStep.SEND_PROPOSAL) {
      return (
        <>
          <Text style={styles.title}>Verification Completed</Text>
          {timelineFileUrl && (
            <View style={styles.successContainer}>
              <Text style={styles.successText}>Timeline file generated successfully!</Text>
              <Text style={styles.infoText}>Click "Send Proposal" to complete the process</Text>
            </View>
          )}
        </>
      );
    }
    
    return null;
  };

  const { loading, currentStep } = state;
  const buttonDisabled = loading;

  return (
    <SafeAreaView style={styles.container}>
      <SecondaryHeader/>
      <View style={styles.content}>
        {renderContent()}
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#154ABF" />
            <Text style={styles.loadingText}>
              {currentStep === VerificationStep.GENERATING_FILE 
                ? 'Generating file and waiting for response...' 
                : 'Loading...'}
            </Text>
          </View>
        ) : (
          <TouchableOpacity 
            style={[styles.button, buttonDisabled && styles.buttonDisabled]} 
            onPress={handlePrimaryButtonPress}
            disabled={buttonDisabled}
          >
            <Text style={styles.buttonText}>{renderButtonText()}</Text>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    ...TextTheme.headingThree,
    color: ColorPallet.brand.primary,
    marginBottom: 24,
    marginTop: '-15%',
    textAlign: 'center',
  },
  subtitle: {
    ...TextTheme.normal,
    color: ColorPallet.brand.primary,
    marginBottom: 24,
    textAlign: 'center',
  },
  label: {
    ...TextTheme.bold,
    color: ColorPallet.brand.primary,
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderColor: '#AAB7C4',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 12,
    backgroundColor: '#F0F5FA',
    color: ColorPallet.grayscale.black,
  },
  button: {
    backgroundColor: ColorPallet.brand.primary,
    borderRadius: 8,
    paddingVertical: 16,
    marginTop: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  buttonDisabled: {
    backgroundColor: ColorPallet.brand.primaryDisabled,
  },
  buttonText: {
    ...TextTheme.bold,
    color:ColorPallet.grayscale.white,
  },
  loadingContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: ColorPallet.brand.primary,
    fontSize: 14,
  },
  successContainer: {
    backgroundColor: '#E6F7EE',
    borderColor: '#28A745',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  successText: {
    color: '#28A745',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    color: '#555555',
    fontSize: 14,
    marginBottom: 4,
  },
  urlText: {
    color: '#555555',
    fontSize: 14,
  }
});

export default OnfidoScreen;