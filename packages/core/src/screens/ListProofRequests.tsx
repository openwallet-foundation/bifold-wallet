import { ProofRequestTemplate, hasPredicates, isParameterizable } from '@hyperledger/aries-bifold-verifier'
import { ProofRequestTemplateBuilder } from '../utils/customTemplate'
import { MetaOverlay, OverlayType } from '@hyperledger/aries-oca'
import { StackNavigationProp, StackScreenProps } from '@react-navigation/stack'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/MaterialIcons'

import EmptyList from '../components/misc/EmptyList'
import { TOKENS, useServices } from '../container-api'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { useTemplates } from '../hooks/proof-request-templates'
import { ProofRequestsStackParams, Screens } from '../types/navigators'
import { testIdWithKey } from '../utils/testable'
import { ThemedText } from '../components/texts/ThemedText'
import { SecondaryHeader } from '../components/IcredyComponents'

interface ProofRequestsCardProps {
  navigation: StackNavigationProp<ProofRequestsStackParams>
  template: ProofRequestTemplate
  connectionId?: string
}

const ProofRequestsCard: React.FC<ProofRequestsCardProps> = ({ navigation, template, connectionId }) => {
  const { t } = useTranslation()
  const { i18n } = useTranslation()
  const { ListItems } = useTheme()
  const [bundleResolver] = useServices([TOKENS.UTIL_OCA_RESOLVER])
  const style = StyleSheet.create({
    card: {
      ...ListItems.requestTemplateBackground,
      flexDirection: 'row',
      borderRadius: 8,
      padding: 12,
      marginBottom: 10,
    },
    textContainer: {
      flex: 1,
    },
    templateTitle: {
      ...ListItems.requestTemplateTitle,
      marginBottom: 4,
    },
    templateDetails: {
      ...ListItems.requestTemplateDetails,
      marginBottom: 4,
    },
    templateZkpLabel: {
      ...ListItems.requestTemplateZkpLabel,
    },
    iconContainer: {
      alignSelf: 'center',
    },
    icon: {
      ...ListItems.requestTemplateIcon,
    },
  })

  const [meta, setMeta] = useState<MetaOverlay | undefined>(undefined)

  useEffect(() => {
    bundleResolver.resolve({ identifiers: { templateId: template.id }, language: i18n.language }).then((bundle) => {
      const metaOverlay =
        bundle?.metaOverlay ||
        new MetaOverlay({
          capture_base: '',
          type: OverlayType.Meta10,
          name: template.name,
          description: template.description,
          language: i18n.language,
          credential_help_text: '',
          credential_support_url: '',
          issuer: '',
          issuer_description: '',
          issuer_url: '',
        })
      setMeta(metaOverlay)
    })
  }, [bundleResolver, template, i18n.language])

  return meta ? (
    <TouchableOpacity
      style={style.card}
      onPress={() => navigation.navigate(Screens.ProofRequestDetails, { templateId: template.id, connectionId })}
      accessibilityLabel={t('Screens.ProofRequestDetails')}
      accessibilityRole="button"
      testID={testIdWithKey('ProofRequestsCard')}
    >
      <View style={style.textContainer}>
        <ThemedText style={style.templateTitle} numberOfLines={1}>
          {meta.name}
        </ThemedText>
        <ThemedText style={style.templateDetails} numberOfLines={2}>
          {meta.description}
        </ThemedText>
        {hasPredicates(template) && (
          <ThemedText style={style.templateZkpLabel}>{t('Verifier.ZeroKnowledgeProof')}</ThemedText>
        )}
        {isParameterizable(template) && (
          <ThemedText style={style.templateZkpLabel}>{t('Verifier.Parameterizable')}</ThemedText>
        )}
      </View>
      <View style={style.iconContainer}>
        <Icon style={style.icon} name={'chevron-right'} />
      </View>
    </TouchableOpacity>
  ) : null
}

type ListProofRequestsProps = StackScreenProps<ProofRequestsStackParams, Screens.ProofRequests>

const ListProofRequests: React.FC<ListProofRequestsProps> = ({ navigation, route }) => {
  const { t } = useTranslation()
  const { ColorPallet } = useTheme()
  const [store] = useStore()
const [modalVisible, setModalVisible] = useState(false)
  const style = StyleSheet.create({
    container: {
      flexGrow: 1,
      margin: 24,
      elevation: 5,
    },
    buttonContainer: {
      marginBottom: 16,
    },
    modalView: {
      flex: 1,
      backgroundColor: ColorPallet.brand.primaryBackground,
    },
    modalContent: {
      flex: 1,
      padding: 20,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: ColorPallet.brand.primaryBackground,
      backgroundColor: ColorPallet.brand.secondaryBackground,
    },
    modalTitle: {
      // ...TextTheme.normal,
      fontWeight: 'bold',
      fontSize: 18,
    },
    closeButton: {
      padding: 8,
    },
    closeIcon: {
      fontSize: 24,
      color: ColorPallet.brand.primary,
    },
    builderContainer: {
      flex: 1,
    }
  })

  const connectionId = route?.params?.connectionId
  const onProofRequestTemplateBuilderSave =(template: ProofRequestTemplate) => {
    setModalVisible(false)
    console.log('Template saved', template)
    navigation.navigate(Screens.ProofRequestDetails, { directTemplate: template, connectionId:connectionId })
  }
  // if useDevVerifierTemplates not set then exclude dev templates
  const proofRequestTemplates = useTemplates().filter(
    (tem) => store.preferences.useDevVerifierTemplates || !tem.devOnly
  )

  return (
    <SafeAreaView>
       <SecondaryHeader/>
       <View style={style.container}>
          <View style={style.buttonContainer}>
        <Button
          title={t('Global.CreateCustomRequest')}
          onPress={() => setModalVisible(true)}
          testID={testIdWithKey('NewTemplateButton')}
        />
      </View>
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
        testID={testIdWithKey('TemplateBuilderModal')}
      >
        <SafeAreaView style={style.modalView}>
          <View style={style.modalHeader}>
            <Text style={style.modalTitle}>{t('Global.CreateCustomRequest')}</Text>
            <TouchableOpacity 
              style={style.closeButton} 
              onPress={() => setModalVisible(false)}
              testID={testIdWithKey('CloseModalButton')}
            >
              <Icon name="close" style={style.closeIcon} />
            </TouchableOpacity>
          </View>
          <View style={style.modalContent}>
            <View style={style.builderContainer}>
              <ProofRequestTemplateBuilder onSaveTemplate={onProofRequestTemplateBuilderSave} />
            </View>
          </View>
        </SafeAreaView>
      </Modal>
  
     
      <View style={style.container}>
      <FlatList
        style={{ backgroundColor: ColorPallet.brand.primaryBackground }}
        data={proofRequestTemplates}
        keyExtractor={(records) => records.id}
        renderItem={({ item }) => {
          return <ProofRequestsCard template={item} connectionId={connectionId} navigation={navigation} />
        }}
        ListEmptyComponent={() => <EmptyList message={t('Verifier.EmptyList')} />}
      />
      </View>
      </View>
    </SafeAreaView>
  )
}

export default ListProofRequests
