import { useAgent } from '@credo-ts/react-hooks'
import React, {useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {  BifoldError } from '../types/error'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  SafeAreaView,
  Alert,
  BackHandler,
} from 'react-native';
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/core';
import {SearchBar} from '../components/IcredyComponents'; 
import { SecondaryHeader } from '../components/IcredyComponents';
import { useServices,TOKENS } from '../container-api'
import { connectFromScanOrDeepLink, removeExistingInvitationsById } from '../utils/helpers'
import { Screens, Stacks } from '../types/navigators'
import { ColorPallet, TextTheme } from '../theme'

type Organization = {
  id: string;
  name: string;
  status: string;
  invitationUrl?: string;
  connectionId?: string;
};

type RootStackParamList = {
  DocumentType: {
    connectionId: string | undefined;
  };
};

const RequestCredential = ({route}) => {
  const { agent } = useAgent()
  const { t } = useTranslation()
  const [{ enableImplicitInvitations, enableReuseConnections }, logger] = useServices([TOKENS.CONFIG, TOKENS.UTIL_LOGGER])
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [searchText, setSearchText] = useState<string>('');
  const { width, height } = useWindowDimensions();
  const [connectingOrg, setConnectingOrg] = useState<string | null>(null);
  // New state to track the selected radio button
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([
    { id: '1', name: 'icredy', status: 'Connect', invitationUrl: 'https://warthog-eager-horribly.ngrok-free.app?oob=eyJAdHlwZSI6ICJodHRwczovL2RpZGNvbW0ub3JnL291dC1vZi1iYW5kLzEuMS9pbnZpdGF0aW9uIiwgIkBpZCI6ICJiODIyNjZmOC05ZTFhLTQ4MDUtODBmOC1hZWE0N2FlOTNkNzEiLCAibGFiZWwiOiAiaUNyZWR5IiwgImhhbmRzaGFrZV9wcm90b2NvbHMiOiBbImh0dHBzOi8vZGlkY29tbS5vcmcvZGlkZXhjaGFuZ2UvMS4xIl0sICJzZXJ2aWNlcyI6IFt7ImlkIjogIiNpbmxpbmUiLCAidHlwZSI6ICJkaWQtY29tbXVuaWNhdGlvbiIsICJyZWNpcGllbnRLZXlzIjogWyJkaWQ6a2V5Ono2TWt1NWlKWUM4R0xoVGZod2VZcEJTUHZmb2ZEYlFxTjNUWUV5VzE4ZmdFUm56ZCN6Nk1rdTVpSllDOEdMaFRmaHdlWXBCU1B2Zm9mRGJRcU4zVFlFeVcxOGZnRVJuemQiXSwgInNlcnZpY2VFbmRwb2ludCI6ICJodHRwczovL3dhcnRob2ctZWFnZXItaG9ycmlibHkubmdyb2stZnJlZS5hcHAifV19',connectionId:"" },
    { id: '2', name: 'anshu', status: 'Connect', invitationUrl: 'https://traction-sandbox-acapy.apps.silver.devops.gov.bc.ca?oob=eyJAdHlwZSI6ICJodHRwczovL2RpZGNvbW0ub3JnL291dC1vZi1iYW5kLzEuMS9pbnZpdGF0aW9uIiwgIkBpZCI6ICI0ZjNiNWMxYi0xZTRmLTQxYzktYTg0NS04ZmRkOTE3Y2RlMjQiLCAibGFiZWwiOiAiYW5zaHUiLCAiaGFuZHNoYWtlX3Byb3RvY29scyI6IFsiaHR0cHM6Ly9kaWRjb21tLm9yZy9kaWRleGNoYW5nZS8xLjAiLCAiaHR0cHM6Ly9kaWRjb21tLm9yZy9jb25uZWN0aW9ucy8xLjAiXSwgImFjY2VwdCI6IFsiZGlkY29tbS9haXAxIiwgImRpZGNvbW0vYWlwMjtlbnY9cmZjMTkiXSwgInNlcnZpY2VzIjogW3siaWQiOiAiI2lubGluZSIsICJ0eXBlIjogImRpZC1jb21tdW5pY2F0aW9uIiwgInJlY2lwaWVudEtleXMiOiBbImRpZDprZXk6ejZNa21aVHFVWUoyczlnWm8zS3JRaFdwMkNGS3lEUEV2bTlLc1hFUVNOZm04eWF3I3o2TWttWlRxVVlKMnM5Z1pvM0tyUWhXcDJDRkt5RFBFdm05S3NYRVFTTmZtOHlhdyJdLCAic2VydmljZUVuZHBvaW50IjogImh0dHBzOi8vdHJhY3Rpb24tc2FuZGJveC1hY2FweS5hcHBzLnNpbHZlci5kZXZvcHMuZ292LmJjLmNhIn1dLCAiZ29hbF9jb2RlIjogIiIsICJnb2FsIjogIiJ9',connectionId:"" },
  ]);
  const connectionId = route.params?.connectionId;

  // Reset only the selected radio button when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      // This will run when the screen is focused (including when navigating back)
      setSelectedOrgId(null);
      
      return () => {
        // Optional cleanup function
      };
    }, [])
  );

  React.useEffect(() => {
    const backAction = () => {
      if (connectionId) {
        // Navigate to the home screen correctly
        navigation.navigate(Screens.HomeScreen);
        return true; // Prevent default back behavior
      }
      return false; // Allow default back behavior
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [connectionId, navigation]);

  // Add to RequestCredential.tsx
  React.useEffect(() => {
    if (connectionId) {
      // Fix bottom tab navigation when on RequestCredential after connection
      const unsubscribe = navigation.addListener('tabPress', (e) => {
        // Let normal tab navigation happen, but ensure we're not stuck in this screen
        navigation.dispatch(
          CommonActions.navigate({
            name: e.target.split('-')[0] // Gets the tab name from the event target
          })
        );
      });

      return unsubscribe;
    }
  }, [connectionId, navigation]);

  useEffect(() => {
    if(!connectionId){
      return
    }
    // When a connectionId is provided, we want to mark that connection as already connected
    const findConnectedOrganization = async () => {
      try {
        const connection = await agent?.connections.findById(connectionId);
        
        if (connection) {
          const orgLabel = connection.theirLabel;
          const updatedOrganizations = organizations.map((org) =>
            org.name === orgLabel?.toLocaleLowerCase()
              ? { ...org, status: 'Connected', connectionId: connectionId }
              : org
          );
          setOrganizations(updatedOrganizations);
          setConnectingOrg(connection.id);
        }
      } catch (error) {
        logger.error('Error finding connected organization:', error);
      }
    };
    
    findConnectedOrganization();
  }, [agent?.connections, connectionId, logger, organizations])

  const handleInvitation = async (value: string) => {
    if (!value) {
      Alert.alert('Error', 'Invalid invitation URL');
      return;
    }
    try {
      const invitation = await agent?.oob.parseInvitation(value);
      if(!invitation){
        throw new Error("not recieved invitation");
      }
      await removeExistingInvitationsById(agent, invitation.id);
      await connectFromScanOrDeepLink(
        value,
        agent,
        logger,
        navigation?.getParent(),
        true,
        enableImplicitInvitations,
        enableReuseConnections
      );      
      
    } catch (err: unknown) {
      const error = new BifoldError(t('Error.Title1031'), t('Error.Message1031'), (err as Error)?.message ?? err, 1031)
      throw error
    }
  }

  const handleConnect = async (organization: Organization) => {
    if (!organization.invitationUrl) return;
    const invitation = await agent?.oob.parseInvitation(organization.invitationUrl);
    if(!invitation){
      throw new Error("not recieved invitation");
    }

    const oobRecord = await agent?.oob.findByReceivedInvitationId(invitation.id)
    if (oobRecord?.id) {
      navigation.navigate(Stacks.ConnectionStack as any, {
        screen: Screens.Connection,
        params: { oobRecordId: oobRecord.id },
      })
    } else {
      await handleInvitation(organization?.invitationUrl);
    }
  };

  const handleRadioPress = (item: Organization) => {
    // Only allow selection if the organization is connected
    if (item.status === 'Connected' && item.connectionId) {
      setSelectedOrgId(item.id);
      navigation.navigate('DocumentType', {
        connectionId: item.connectionId
      });
    } else {
      Alert.alert('Not Connected', 'Please connect with this organization before selecting it.');
    }
  };

  const renderItem = ({ item }: { item: Organization }) => (
    <View style={[styles.itemContainer, { paddingHorizontal: width * 0.05 }]}>
      <TouchableOpacity
        style={[
          styles.radioButton,
          item.status !== 'Connected' && styles.radioButtonDisabled
        ]}
        onPress={() => handleRadioPress(item)}
        disabled={item.status !== 'Connected'}
      >
        <View
          style={[
            styles.radioOuterCircle,
            selectedOrgId === item.id && styles.radioSelected,
            item.status !== 'Connected' && styles.radioOuterCircleDisabled
          ]}
        >
          {selectedOrgId === item.id && <View style={styles.radioInnerCircle} />}
        </View>
      </TouchableOpacity>
      <Text style={[
        styles.organizationName, 
        { width: width * 0.4 },
        item.status !== 'Connected' && styles.disabledText
      ]}>
        {item.name}
      </Text>
      <TouchableOpacity
        style={[
          styles.connectButton,
          item.status === 'Connected' && styles.connectedButton,
        ]}
        onPress={() => handleConnect(item)}
        disabled={item.status === 'Connected'}
      >
        <Text
          style={[
            styles.connectButtonText,
            { color: item.status === 'Connected' ? '#4CAF50' : '#154ABF' },
          ]}
        >
          {item.status === 'Connected' ? 'Connected' : 'Connect'}
        </Text>
      </TouchableOpacity>
    </View>
  );
  
  return (
    <SafeAreaView style={styles.container}>
      {/* <SecondaryHeader /> */}
      <SecondaryHeader
        customBackAction={() => {
          if (connectionId) {
            navigation.navigate(Screens.HomeScreen);
          } else {
            navigation.goBack();
          }
        }}
      />
      <View style={[styles.header, { paddingHorizontal: width * 0.05, marginTop: height * 0.09 }]}>
        <Text style={styles.headerText}>Request for Credential</Text>
      </View>
      <SearchBar
        placeholder="Search"
        value={searchText}
        onChangeText={setSearchText}
        width={width}
        height={height}
      />
      
      <Text style={[styles.subHeader, { marginHorizontal: width * 0.05 }]}>
        List of organisations issuing credential
      </Text>
      <FlatList
        data={organizations}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
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
    textAlign: 'center',
    ...TextTheme.headingFour,
    color: ColorPallet.brand.text,
  },
  subHeader: {
    marginVertical: 10,
    ...TextTheme.normal,
    color: ColorPallet.brand.text,
  },
  listContainer: {
    marginTop: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  radioButton: {
    marginRight: 10,
  },
  radioOuterCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInnerCircle: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: ColorPallet.grayscale.black,
  },
  radioSelected: {
    borderColor: ColorPallet.grayscale.black,
  },
  organizationName: {
    ...TextTheme.normal,
    color: ColorPallet.grayscale.black,
  },
  connectButton: {
    marginLeft: 'auto',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  connectButtonText: {
    ...TextTheme.normal,
  },
  radioButtonDisabled: {
    opacity: 0.5,
  },
  radioOuterCircleDisabled: {
    borderColor: '#cccccc',
  },
  disabledText: {
    color: '#999999',
  },
  connectedButton: {
    backgroundColor: '#e8f5e9',
  }
});

export default RequestCredential;