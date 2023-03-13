import { StackNavigationProp, StackScreenProps } from '@react-navigation/stack'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { defaultProofRequestTemplates } from '../../verifier/constants'
import { ProofRequestTemplate } from '../../verifier/types/proof-reqeust-template'
import { hasPredicates, isParameterizable } from '../../verifier/utils/proof-request'
import EmptyList from '../components/misc/EmptyList'
import { useConfiguration } from '../contexts/configuration'
import { useTheme } from '../contexts/theme'
import { ProofRequestsStackParams, Screens } from '../types/navigators'
import { MetaOverlay, OverlayType } from '../types/oca'

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
    OCABundleResolver.resolve(undefined, i18n.language, { templateId: template.id }).then((bundle) => {
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

  const records = defaultProofRequestTemplates

  return (
    <SafeAreaView style={style.container} edges={['left', 'right']}>
      <FlatList
        style={{ backgroundColor: ColorPallet.brand.primaryBackground }}
        data={records}
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