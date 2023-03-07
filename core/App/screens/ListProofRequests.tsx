import { StackNavigationProp } from '@react-navigation/stack'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { defaultProofRequestTemplates } from '../../verifier/constants'
import { hasPredicates } from '../../verifier/utils/proof-request'
import { ColorPallet } from '../theme'
import { ProofRequestsStackParams, Screens } from '../types/navigators'

interface ListProofRequestsProps {
  navigation: StackNavigationProp<ProofRequestsStackParams>
}

const style = StyleSheet.create({
  container: {
    margin: 24,
  },
  proofButton: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  textContainer: {
    flex: 1,
  },
  proofTitle: {
    fontWeight: 'bold',
    marginBottom: 6,
  },
  proofCaption: {
    color: ColorPallet.grayscale.mediumGrey,
    fontSize: 11,
  },
  proofText: {
    color: ColorPallet.grayscale.black,
  },
  proofDetails: {
    marginBottom: 4,
  },
  iconContainer: {
    alignSelf: 'center',
  },
  icon: {
    color: ColorPallet.grayscale.black,
  },
})

const iconSize = 35
const iconName = 'chevron-right'

const ListProofRequests: React.FC<ListProofRequestsProps> = ({ navigation }) => {
  const { t } = useTranslation()
  const records = defaultProofRequestTemplates

  return (
    <View style={style.container}>
      {records.map((record) => (
        <TouchableOpacity
          style={style.proofButton}
          onPress={() => navigation.navigate(Screens.ProofRequesting, { templateId: record.id })}
        >
          <View style={style.textContainer}>
            <Text style={[style.proofText, style.proofTitle]} numberOfLines={1}>
              {record.title}
            </Text>
            <Text style={[style.proofText, style.proofDetails]} numberOfLines={2}>
              {record.details}
            </Text>
            {hasPredicates(record) && (
              <Text style={[style.proofText, style.proofCaption]}>{t('Verifier.ZeroKnowledgeProof')}</Text>
            )}
          </View>
          <View style={style.iconContainer}>
            <Icon style={style.icon} size={iconSize} name={iconName} />
          </View>
        </TouchableOpacity>
      ))}
    </View>
  )
}

export default ListProofRequests
