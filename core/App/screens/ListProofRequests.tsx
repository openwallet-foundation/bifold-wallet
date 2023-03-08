import { StackNavigationProp } from '@react-navigation/stack'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { defaultProofRequestTemplates } from '../../verifier/constants'
import { hasPredicates } from '../../verifier/utils/proof-request'
import { useTheme } from '../contexts/theme'
import { ProofRequestsStackParams, Screens } from '../types/navigators'

interface ListProofRequestsProps {
  navigation: StackNavigationProp<ProofRequestsStackParams>
}

const ListProofRequests: React.FC<ListProofRequestsProps> = ({ navigation }) => {
  const { t } = useTranslation()
  const { ListItems } = useTheme()

  const style = StyleSheet.create({
    container: {
      margin: 24,
    },
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

  const records = defaultProofRequestTemplates

  return (
    <View style={style.container}>
      {records.map((record) => (
        <TouchableOpacity style={style.recordButton} onPress={() => navigation.navigate(Screens.ProofRequestDetails)}>
          <View style={style.textContainer}>
            <Text style={style.templateTitle} numberOfLines={1}>
              {record.title}
            </Text>
            <Text style={style.templateDetails} numberOfLines={2}>
              {record.details}
            </Text>
            {hasPredicates(record) && <Text style={style.templateZkpLabel}>{t('Verifier.ZeroKnowledgeProof')}</Text>}
          </View>
          <View style={style.iconContainer}>
            <Icon style={style.icon} name={'chevron-right'} />
          </View>
        </TouchableOpacity>
      ))}
    </View>
  )
}

export default ListProofRequests
