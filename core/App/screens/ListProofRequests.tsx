import { StackNavigationProp } from '@react-navigation/stack'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { defaultProofRequestTemplates } from '../../verifier/constants'
import { ProofRequestTemplate } from '../../verifier/types/proof-reqeust-template'
import { hasPredicates } from '../../verifier/utils/proof-request'
import { useConfiguration } from '../contexts/configuration'
import { useTheme } from '../contexts/theme'
import { ProofRequestsStackParams, Screens } from '../types/navigators'
import { MetaOverlay, OverlayType } from '../types/oca'

interface ProofRequestsCardProps {
  navigation: StackNavigationProp<ProofRequestsStackParams>
  template: ProofRequestTemplate
}

const iconSize = 35
const iconName = 'chevron-right'

const ProofRequestsCard: React.FC<ProofRequestsCardProps> = ({ navigation, template }) => {
  const { t } = useTranslation()
  const { i18n } = useTranslation()
  const { ListItems } = useTheme()
  const { OCABundleResolver } = useConfiguration()

  const style = StyleSheet.create({
    recordButton: {
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
      marginBottom: 6,
    },
    templateDetails: {
      ...ListItems.requestTemplateDetails,
      marginBottom: 4,
    },
    templateZkpLabel: {
      ...ListItems.requestTemplateZkpLabel,
      fontSize: 11,
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

  if (!meta) return null

  return (
    <TouchableOpacity
      style={style.recordButton}
      onPress={() => navigation.navigate(Screens.ProofRequestDetails, { templateId: template.id })}
    >
      <View style={style.textContainer}>
        <Text style={style.templateTitle} numberOfLines={1}>
          {meta.name}
        </Text>
        <Text style={style.templateDetails} numberOfLines={2}>
          {meta.description}
        </Text>
        {hasPredicates(template) && <Text style={style.templateZkpLabel}>{t('Verifier.ZeroKnowledgeProof')}</Text>}
      </View>
      <View style={style.iconContainer}>
        <Icon style={style.icon} size={iconSize} name={iconName} />
      </View>
    </TouchableOpacity>
  )
}

interface ListProofRequestsProps {
  navigation: StackNavigationProp<ProofRequestsStackParams>
}

const ListProofRequests: React.FC<ListProofRequestsProps> = ({ navigation }) => {
  const style = StyleSheet.create({
    container: {
      margin: 24,
    },
  })

  const records = defaultProofRequestTemplates

  return (
    <View style={style.container}>
      {records.map((record) => (
        <ProofRequestsCard template={record} navigation={navigation} />
      ))}
    </View>
  )
}

export default ListProofRequests
