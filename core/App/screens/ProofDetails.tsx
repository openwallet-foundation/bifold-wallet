import type { StackScreenProps } from '@react-navigation/stack'

import { ProofExchangeRecord, ProofState } from '@aries-framework/core'
import { useAgent, useProofById } from '@aries-framework/react-hooks'
import { StackNavigationProp } from '@react-navigation/stack'
import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'
import Collapsible from 'react-native-collapsible'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { SvgXml } from 'react-native-svg'

import { ProofCustomMetadata, ProofMetadata } from '../../verifier/types/metadata'
import { markProofAsViewed } from '../../verifier/utils/proof'
import CheckInCircle from '../assets/img/check-in-circle.svg'
import Button, { ButtonType } from '../components/buttons/Button'
import SharedProofData from '../components/misc/SharedProofData'
import { useTheme } from '../contexts/theme'
import { ProofRequestsStackParams, Screens } from '../types/navigators'
import { testIdWithKey } from '../utils/testable'

type ProofDetailsProps = StackScreenProps<ProofRequestsStackParams, Screens.ProofDetails>

const collapsedHeight = 120
const collapsedDuration = 150

interface VerifiedProofProps {
  record: ProofExchangeRecord
  navigation: StackNavigationProp<ProofRequestsStackParams, Screens.ProofDetails>
  isHistory?: boolean
}

interface UnverifiedProofProps {
  record: ProofExchangeRecord
}

const gradientSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="600px" height="200px" >
  <defs>
   <linearGradient id="lgrad" x1="50%" y1="0%" x2="50%" y2="100%" >
    
          <stop offset="0%" style="stop-color:rgb(255,255,255);stop-opacity:0.3" />
          <stop offset="50%" style="stop-color:rgb(255,255,255);stop-opacity:0.5" />
          <stop offset="80%" style="stop-color:rgb(255,255,255);stop-opacity:0.9" />

    </linearGradient>
  </defs>
  <rect x="0" y="0" width="100%" height="100%" fill="url(#lgrad)"/>
</svg>`

const VerifiedProof: React.FC<VerifiedProofProps> = ({ record, navigation, isHistory }: VerifiedProofProps) => {
  const { t } = useTranslation()
  const { ColorPallet } = useTheme()

  const styles = StyleSheet.create({
    header: {
      backgroundColor: ColorPallet.semantic.success,
      paddingHorizontal: 30,
      paddingVertical: 20,
    },
    headerTitleContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
    },
    headerTitle: {
      marginHorizontal: 10,
      color: ColorPallet.grayscale.white,
      fontSize: 34,
      fontWeight: 'bold',
    },
    headerDetails: {
      color: ColorPallet.grayscale.white,
      marginVertical: 10,
      fontSize: 18,
    },
    content: {
      flexGrow: 1,
      marginHorizontal: 30,
      marginTop: 10,
    },
    footer: {
      marginHorizontal: 30,
    },
    footerButton: {
      marginTop: 10,
    },
    gradientContainer: { position: 'absolute', top: 0, width: '100%', height: '100%' },
  })

  const [isCollapsed, setIsCollapsed] = useState<boolean>(!isHistory)

  const onGenerateNew = useCallback(() => {
    const metadata = record.metadata.get(ProofMetadata.customMetadata) as ProofCustomMetadata
    if (metadata.proof_request_template_id) {
      navigation.navigate(Screens.ProofRequesting, { templateId: metadata.proof_request_template_id })
    } else {
      navigation.navigate(Screens.ProofRequests, {})
    }
  }, [navigation])

  return (
    <View>
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <CheckInCircle {...{ height: 45, width: 45 }} />
          <Text style={styles.headerTitle}>{t('Verifier.InformationReceived')}</Text>
        </View>
        <Text style={styles.headerDetails}>{t('Verifier.InformationReceivedDetails')}</Text>
      </View>
      <Collapsible
        collapsed={isCollapsed}
        collapsedHeight={collapsedHeight}
        enablePointerEvents={true}
        duration={collapsedDuration}
      >
        <View style={[styles.content, { position: 'relative' }]}>
          <SharedProofData recordId={record.id} />
          {isCollapsed && (
            <View style={styles.gradientContainer}>
              <SvgXml xml={gradientSVG} width={'100%'} height={collapsedHeight} />
            </View>
          )}
        </View>
      </Collapsible>
      {!isHistory && (
        <View style={styles.footer}>
          <View style={styles.footerButton}>
            <Button
              title={isCollapsed ? t('Verifier.ViewDetails') : t('Verifier.HideDetails')}
              accessibilityLabel={isCollapsed ? t('Verifier.ViewDetails') : t('Verifier.HideDetails')}
              testID={isCollapsed ? testIdWithKey('ViewDetails') : testIdWithKey('HideDetails')}
              buttonType={ButtonType.Primary}
              onPress={() => setIsCollapsed(!isCollapsed)}
            />
          </View>
          <View style={styles.footerButton}>
            <Button
              title={t('Verifier.GenerateNewQR')}
              accessibilityLabel={t('Verifier.GenerateNewQR')}
              testID={testIdWithKey('GenerateNewQR')}
              buttonType={ButtonType.Secondary}
              onPress={onGenerateNew}
            />
          </View>
        </View>
      )}
    </View>
  )
}

const UnverifiedProof: React.FC<UnverifiedProofProps> = ({ record }) => {
  const { t } = useTranslation()
  const { ColorPallet } = useTheme()

  const styles = StyleSheet.create({
    header: {
      flexGrow: 1,
      backgroundColor: ColorPallet.semantic.error,
      paddingHorizontal: 30,
      paddingVertical: 20,
    },
    headerTitleContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
    },
    headerTitle: {
      marginHorizontal: 8,
      color: ColorPallet.grayscale.white,
      fontSize: 34,
      fontWeight: 'bold',
    },
    headerDetails: {
      color: ColorPallet.grayscale.white,
      marginVertical: 10,
      fontSize: 18,
    },
  })

  return (
    <View>
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Icon name="bookmark-remove" size={45} color={'white'} />
          {record.state === ProofState.Abandoned && (
            <Text style={styles.headerTitle}>{t('Verifier.PresentationDeclined')}</Text>
          )}
          {record.isVerified === false && (
            <Text style={styles.headerTitle}>{t('Verifier.ProofVerificationFailed')}</Text>
          )}
        </View>
      </View>
    </View>
  )
}

const ProofDetails: React.FC<ProofDetailsProps> = ({ route, navigation }) => {
  if (!route?.params) {
    throw new Error('ProofRequesting route prams were not set properly')
  }

  const { recordId, isHistory } = route?.params

  const record: ProofExchangeRecord = useProofById(recordId)
  const { agent } = useAgent()

  useEffect(() => {
    if (agent) markProofAsViewed(agent, record)
  }, [])

  return (
    <SafeAreaView style={{ flexGrow: 1 }} edges={['left', 'right']}>
      {record.isVerified && <VerifiedProof record={record} navigation={navigation} isHistory={isHistory} />}
      {!record.isVerified && <UnverifiedProof record={record} />}
    </SafeAreaView>
  )
}

export default ProofDetails
