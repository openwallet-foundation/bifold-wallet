import React from 'react'
import { StackScreenProps } from '@react-navigation/stack'
import { DeliveryStackParams, Screens, TabStacks } from '../../../types/navigators'
import { getCredentialForDisplay } from '../display'
import { Edge, SafeAreaView } from 'react-native-safe-area-context'
import CommonRemoveModal from '../../../components/modals/CommonRemoveModal'
import { ModalUsage } from '../../../types/remove'
import { useState } from 'react'
import { DeviceEventEmitter, FlatList, StyleSheet, Text, View } from 'react-native'
import { TextTheme } from '../../../theme'
import { useTranslation } from 'react-i18next'
import Button, { ButtonType } from '../../../components/buttons/Button'
import { testIdWithKey } from '../../../utils/testable'
import RecordHeader from '../../../components/record/RecordHeader'
import RecordFooter from '../../../components/record/RecordFooter'
import { useTheme } from '../../../contexts/theme'
import OpenIDCredentialCard from '../components/OpenIDCredentialCard'
import { buildFieldsFromOpenIDTemplate } from '../utils/utils'
import RecordField from '../../../components/record/RecordField'
import { BifoldError } from '../../../types/error'
import { EventTypes } from '../../../constants'
import { useAgent } from '@credo-ts/react-hooks'
import CredentialOfferAccept from '../../../screens/CredentialOfferAccept'
import RecordRemove from '../../../components/record/RecordRemove'
import { useOpenIDCredentials } from '../context/OpenIDCredentialRecordProvider'

export enum OpenIDCredScreenMode {
  offer,
  details,
}

type OpenIDCredentialDetailsProps = StackScreenProps<DeliveryStackParams, Screens.OpenIDCredentialDetails>

const OpenIDCredentialDetails: React.FC<OpenIDCredentialDetailsProps> = ({ navigation, route }) => {
  // FIXME: change params to accept credential id to avoid 'non-serializable' warnings
  const { credential, screenMode } = route.params
  const credentialDisplay = getCredentialForDisplay(credential)
  const { display, attributes } = credentialDisplay
  const fields = buildFieldsFromOpenIDTemplate(attributes)
  const { t } = useTranslation()
  const { ColorPallet } = useTheme()
  const { agent } = useAgent()
  const { storeCredential, removeCredential } = useOpenIDCredentials()

  const [isRemoveModalDisplayed, setIsRemoveModalDisplayed] = useState(false)
  const [buttonsVisible, setButtonsVisible] = useState(true)
  const [acceptModalVisible, setAcceptModalVisible] = useState(false)

  const styles = StyleSheet.create({
    headerTextContainer: {
      paddingHorizontal: 25,
      paddingVertical: 16,
    },
    headerText: {
      ...TextTheme.normal,
      flexShrink: 1,
    },
    footerButton: {
      paddingTop: 10,
    },
  })

  const toggleDeclineModalVisible = () => setIsRemoveModalDisplayed(!isRemoveModalDisplayed)

  const handleDeclineTouched = async () => {
    toggleDeclineModalVisible()
    if (screenMode === OpenIDCredScreenMode.offer)
      navigation.getParent()?.navigate(TabStacks.HomeStack, { screen: Screens.Home })
    else handleRemove()
  }

  const handleAcceptTouched = async () => {
    try {
      if (!agent) {
        return
      }
      await storeCredential(credential)
      setAcceptModalVisible(true)
    } catch (err: unknown) {
      setButtonsVisible(true)
      const error = new BifoldError(t('Error.Title1024'), t('Error.Message1024'), (err as Error)?.message ?? err, 1024)
      DeviceEventEmitter.emit(EventTypes.ERROR_ADDED, error)
    }
  }

  const handleRemove = async () => {
    try {
      await removeCredential(credential)
      navigation.pop()
    } catch (err) {
      const error = new BifoldError(t('Error.Title1025'), t('Error.Message1025'), (err as Error)?.message ?? err, 1025)
      DeviceEventEmitter.emit(EventTypes.ERROR_ADDED, error)
    }
  }

  const footerButton = (
    title: string,
    buttonPress: () => void,
    buttonType: ButtonType,
    testID: string,
    accessibilityLabel: string
  ) => {
    return (
      <View style={styles.footerButton}>
        <Button
          title={title}
          accessibilityLabel={accessibilityLabel}
          testID={testID}
          buttonType={buttonType}
          onPress={buttonPress}
          disabled={!buttonsVisible}
        />
      </View>
    )
  }

  const header = () => {
    return (
      <>
        {screenMode === OpenIDCredScreenMode.offer && (
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerText} testID={testIdWithKey('HeaderText')}>
              <Text>{display.issuer.name || t('ContactDetails.AContact')}</Text>{' '}
              {t('CredentialOffer.IsOfferingYouACredential')}
            </Text>
          </View>
        )}

        {credential && (
          <View style={{ marginHorizontal: 15, marginBottom: 16 }}>
            <OpenIDCredentialCard credentialDisplay={display} />
          </View>
        )}
      </>
    )
  }

  const footer = () => {
    const paddingHorizontal = 24
    const paddingVertical = 16
    const paddingBottom = 26
    return (
      <View style={{ marginBottom: 50 }}>
        {screenMode === OpenIDCredScreenMode.offer ? (
          <View
            style={{
              paddingHorizontal: paddingHorizontal,
              paddingVertical: paddingVertical,
              paddingBottom: paddingBottom,
              backgroundColor: ColorPallet.brand.secondaryBackground,
            }}
          >
            {footerButton(
              t('Global.Accept'),
              handleAcceptTouched,
              ButtonType.Primary,
              testIdWithKey('AcceptCredentialOffer'),
              t('Global.Accept')
            )}
            {footerButton(
              t('Global.Decline'),
              toggleDeclineModalVisible,
              ButtonType.Secondary,
              testIdWithKey('DeclineCredentialOffer'),
              t('Global.Decline')
            )}
          </View>
        ) : (
          <>
            <View
              style={{
                backgroundColor: ColorPallet.brand.secondaryBackground,
                marginTop: paddingVertical,
                paddingHorizontal,
                paddingVertical,
              }}
            >
              <Text testID={testIdWithKey('IssuerName')}>
                <Text style={[TextTheme.title]}>{t('CredentialDetails.IssuedBy') + ' '}</Text>
                <Text style={[TextTheme.normal]}>{display.issuer.name || t('ContactDetails.AContact')}</Text>
              </Text>
            </View>
            <RecordRemove onRemove={toggleDeclineModalVisible} />
          </>
        )}
      </View>
    )
  }

  const body = () => {
    return (
      <FlatList
        data={fields}
        keyExtractor={({ name }, index) => name || index.toString()}
        renderItem={({ item: attr, index }) => (
          <RecordField
            field={attr}
            hideFieldValue={false}
            shown={true}
            hideBottomBorder={index === fields.length - 1}
          />
        )}
        ListHeaderComponent={<RecordHeader>{header()}</RecordHeader>}
        ListFooterComponent={footer ? <RecordFooter>{footer()}</RecordFooter> : null}
      />
    )
  }

  const screenEdges: Edge[] =
    screenMode === OpenIDCredScreenMode.offer ? ['bottom', 'left', 'right'] : ['left', 'right']

  return (
    <SafeAreaView style={{ flexGrow: 1 }} edges={screenEdges}>
      {body()}
      {screenMode === OpenIDCredScreenMode.offer && (
        <CredentialOfferAccept visible={acceptModalVisible} credentialId={''} confirmationOnly={true} />
      )}
      <CommonRemoveModal
        usage={
          screenMode === OpenIDCredScreenMode.offer ? ModalUsage.CredentialOfferDecline : ModalUsage.CredentialRemove
        }
        visible={isRemoveModalDisplayed}
        onSubmit={handleDeclineTouched}
        onCancel={toggleDeclineModalVisible}
      />
    </SafeAreaView>
  )
}

export default OpenIDCredentialDetails
