import { AnonCredsCredentialMetadataKey } from '@credo-ts/anoncreds'
import { CredentialExchangeRecord, CredentialState, SdJwtVcRecord, W3cCredentialRecord } from '@credo-ts/core'
import { useCredentialByState } from '@credo-ts/react-hooks'
import { useNavigation, useIsFocused } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import React, { useEffect ,useState} from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, View,StyleSheet, TouchableOpacity, Text } from 'react-native'

import CredentialCard from '../components/misc/CredentialCard'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { useTour } from '../contexts/tour/tour-context'
import { RootStackParams, Screens } from '../types/navigators'
import { TOKENS, useServices } from '../container-api'
import { EmptyListProps } from '../components/misc/EmptyList'
import { CredentialListFooterProps } from '../types/credential-list-footer'
import { useOpenIDCredentials } from '../modules/openid/context/OpenIDCredentialRecordProvider'
import { GenericCredentialExchangeRecord } from '../types/credentials'
import { CredentialErrors } from '../components/misc/CredentialCard11'
import { BaseTourID } from '../types/tour'
import { OpenIDCredentialType } from '../modules/openid/types'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import { PrimaryHeader } from '../components/IcredyComponents'
import { ColorPallet ,TextTheme} from '../theme'

const ListCredentials: React.FC = () => {
  const { t } = useTranslation()
  const [store, dispatch] = useStore()
  const [activeTab, setActiveTab] = useState("Issued");
  const [
    CredentialListOptions,
    credentialEmptyList,
    credentialListFooter,
    { enableTours: enableToursConfig, credentialHideList },
  ] = useServices([
    TOKENS.COMPONENT_CRED_LIST_OPTIONS,
    TOKENS.COMPONENT_CRED_EMPTY_LIST,
    TOKENS.COMPONENT_CRED_LIST_FOOTER,
    TOKENS.CONFIG,
  ])
  const navigation = useNavigation<StackNavigationProp<RootStackParams>>()
  const { ColorPallet } = useTheme()
  const { start, stop } = useTour()
  const screenIsFocused = useIsFocused()
  const {
    openIdState: { w3cCredentialRecords, sdJwtVcRecords },
  } = useOpenIDCredentials()

  let credentials: GenericCredentialExchangeRecord[] = [
    ...useCredentialByState(CredentialState.CredentialReceived),
    ...useCredentialByState(CredentialState.Done),
    ...w3cCredentialRecords,
    ...sdJwtVcRecords
  ]

  const CredentialEmptyList = credentialEmptyList as React.FC<EmptyListProps>
  const CredentialListFooter = credentialListFooter as React.FC<CredentialListFooterProps>

  // Filter out hidden credentials when not in dev mode
  if (!store.preferences.developerModeEnabled) {
    credentials = credentials.filter((r) => {
      const credDefId = r.metadata.get(AnonCredsCredentialMetadataKey)?.credentialDefinitionId
      
      return !credentialHideList?.includes(credDefId)
    })
  }

  useEffect(() => {
    const shouldShowTour = enableToursConfig && store.tours.enableTours && !store.tours.seenCredentialsTour

    if (shouldShowTour && screenIsFocused) {
      start(BaseTourID.CredentialsTour)
      dispatch({
        type: DispatchAction.UPDATE_SEEN_CREDENTIALS_TOUR,
        payload: [true],
      })
    }
  }, [enableToursConfig, store.tours.enableTours, store.tours.seenCredentialsTour, screenIsFocused, start, dispatch])

  // stop the tour when the screen unmounts
  useEffect(() => {
    return stop
  }, [stop])

  const renderCardItem = (cred: GenericCredentialExchangeRecord) => {
    const isRevoked = (cred as CredentialExchangeRecord).revocationNotification?.revocationDate;

    if ((activeTab === 'Revoked' && !isRevoked) || (activeTab === 'Issued' && isRevoked)) {
      return null; // Don't render if it doesn't belong in the selected tab
    }
    return (
      <CredentialCard
        credential={cred as CredentialExchangeRecord}
        credentialErrors={
          (cred as CredentialExchangeRecord).revocationNotification?.revocationDate && [CredentialErrors.Revoked]
        }
        onPress={() => {
          if (cred instanceof W3cCredentialRecord) {
            navigation.navigate(Screens.OpenIDCredentialDetails, {
              credentialId: cred.id,
              type: OpenIDCredentialType.W3cCredential,
            })
          } else if (cred instanceof SdJwtVcRecord) {
            navigation.navigate(Screens.OpenIDCredentialDetails, {
              credentialId: cred.id,
              type: OpenIDCredentialType.SdJwtVc,
            })
          } else {
            navigation.navigate(Screens.CredentialDetails, { credentialId: cred.id })
          }
        }}
      />
    )
  }
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // setSearchQuery(""); 
};
console.log('credentials', credentials)
  return (
    <View>
      <PrimaryHeader/>
         <View style={styles.tabContainer}>
                          <TouchableOpacity
                              style={[styles.tab, activeTab === "Issued" && styles.activeTab]}
                              onPress={() => handleTabChange("Issued")}
                          >
                              <MaterialIcons
                                  name="business"
                                  size={20}
                                  style={[styles.icon, activeTab === "Issued" && styles.activeIcon]}
                              />
                              <Text style={[styles.tabText, activeTab === "Issued" && styles.activeTabText]}>
                                  Issued
                              </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                              style={[styles.tab, activeTab === "Revoked" && styles.activeTab]}
                              onPress={() => handleTabChange("Revoked")}
                          >
                              <MaterialIcons
                                  name="person"
                                  size={20}
                                  style={[styles.icon, activeTab === "Revoked" && styles.activeIcon]}
                              />
                              <Text style={[styles.tabText, activeTab === "Revoked" && styles.activeTabText]}>
                                  Revoked
                              </Text>
                          </TouchableOpacity>
                      </View>
      <FlatList
        style={{ backgroundColor: ColorPallet.brand.primaryBackground }}
        contentContainerStyle={{ paddingBottom: 100 }}
        data={credentials.sort((a, b) => new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf())}
        keyExtractor={(credential) => credential.id}
        renderItem={({ item: credential, index }) => {
          return (
            <View
              style={{
                marginHorizontal: 15,
                marginTop: 15,
                marginBottom: index === credentials.length - 1 ? 45 : 0,
              }}
            >
              {renderCardItem(credential)}
            </View>
          )
        }}
        ListEmptyComponent={() => <CredentialEmptyList message={t('Credentials.EmptyList')} />}
        ListFooterComponent={() => <CredentialListFooter credentialsCount={credentials.length} />}
      />
      <CredentialListOptions />
    </View>
  )
}
const styles = StyleSheet.create({
    safeContainer: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    mainContainer: {
        flex: 1,
        backgroundColor: "#fff",
    },
    scrollView: {
        flex: 1,
        backgroundColor: "#fff",
    },
    scrollViewContent: {
        flexGrow: 1,
        paddingBottom: 20,
    },
    tabContainer: {
      flexDirection: "row",
      backgroundColor: ColorPallet.brand.primaryBackground,
      borderRadius: 25,
      padding: 5,
      marginHorizontal: 0,
      width: "100%",
      justifyContent: "space-between",
      marginTop: 20,
      marginBottom: 15, 
  },
    searchContainer: {
        paddingHorizontal: 5,
        paddingBottom: 15, // Added padding bottom for spacing
    },
    tab: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 10,
      justifyContent: "center",
      borderRadius: 25,
  },
  activeTab: {
      backgroundColor: ColorPallet.brand.primary,
  },
  tabText: {
      ...TextTheme.bold,
      color: ColorPallet.brand.text,
  },
  activeTabText: {
      color: ColorPallet.grayscale.white,
  },
    icon: {
        marginRight: 5,
        color: ColorPallet.grayscale.black,
    },
    activeIcon: {
        color:ColorPallet.grayscale.white,
    },
});
export default ListCredentials
