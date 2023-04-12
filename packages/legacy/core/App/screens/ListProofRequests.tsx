import { StackNavigationProp, StackScreenProps } from '@react-navigation/stack'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { ProofRequestTemplate, hasPredicates, isParameterizable } from '../../verifier'
import EmptyList from '../components/misc/EmptyList'
import { useConfiguration } from '../contexts/configuration'
import { useTheme } from '../contexts/theme'
import { useTemplates } from '../hooks/proof-request-templates'
import { ProofRequestsStackParams, Screens } from '../types/navigators'
import { MetaOverlay, OverlayType } from '../types/oca'
import { testIdWithKey } from '../utils/testable'

interface ProofRequestsCardProps {
  navigation: StackNavigationProp<ProofRequestsStackParams>
  template: ProofRequestTemplate
  connectionId?: string
}

const ProofRequestsCard: React.FC<ProofRequestsCardProps> = ({ navigation, template, connectionId }) => {
  const { t } = useTranslation()
  const { i18n } = useTranslation()
  const { ListItems } = useTheme()
  const { OCABundleResolver } = useConfiguration()

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
      fontSize: 16,
      marginBottom: 4,
    },
    templateDetails: {
      ...ListItems.requestTemplateDetails,
      fontSize: 16,
      marginBottom: 4,
    },
    templateZkpLabel: {
      ...ListItems.requestTemplateZkpLabel,
      fontSize: 12,
    },
    iconContainer: {
      alignSelf: 'center',
    },
    icon: {
      ...ListItems.requestTemplateIcon,
      fontSize: 36,
    },
  })

  const [meta, setMeta] = useState<MetaOverlay | undefined>(undefined)

  useEffect(() => {
    OCABundleResolver.resolve({ identifiers: { templateId: template.id }, language: i18n.language }).then((bundle) => {
      const metaOverlay = bundle?.metaOverlay || {
        captureBase: '',
        type: OverlayType.Meta10,
        name: template.name,
        description: template.description,
        language: i18n.language,
      }
      setMeta(metaOverlay)
    })
  }, [template])

  return meta ? (
    <TouchableOpacity
      style={style.card}
      onPress={() => navigation.navigate(Screens.ProofRequestDetails, { templateId: template.id, connectionId })}
      accessibilityLabel={t('Screens.ProofRequestDetails')}
      testID={testIdWithKey('ProofRequestsCard')}
    >
      <View style={style.textContainer}>
        <Text style={style.templateTitle} numberOfLines={1}>
          {meta.name}
        </Text>
        <Text style={style.templateDetails} numberOfLines={2}>
          {meta.description}
        </Text>
        {hasPredicates(template) && <Text style={style.templateZkpLabel}>{t('Verifier.ZeroKnowledgeProof')}</Text>}
        {isParameterizable(template) && <Text style={style.templateZkpLabel}>{t('Verifier.Parameterizable')}</Text>}
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

  const style = StyleSheet.create({
    container: {
      flexGrow: 1,
      margin: 24,
      elevation: 5,
    },
  })

  const { connectionId } = route?.params

  const proofRequestTemplates = useTemplates()

  return (
    <SafeAreaView style={style.container} edges={['left', 'right']}>
      <FlatList
        style={{ backgroundColor: ColorPallet.brand.primaryBackground }}
        data={proofRequestTemplates}
        keyExtractor={(records) => records.id}
        renderItem={({ item }) => {
          return <ProofRequestsCard template={item} connectionId={connectionId} navigation={navigation} />
        }}
        ListEmptyComponent={() => <EmptyList message={t('Verifier.EmptyList')} />}
      />
    </SafeAreaView>
  )
}

export default ListProofRequests
