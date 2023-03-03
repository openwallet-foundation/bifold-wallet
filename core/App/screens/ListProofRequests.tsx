import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { defaultProofRequestTemplates } from '../constants'
import { ColorPallet } from '../theme'
import { ProofRequestTemplate, ProofRequestType } from '../types/proof-reqeust-template'

interface ListProofRequestsProps {
  navigation: any
}

const style = StyleSheet.create({
  container: {
    margin: 24,
  },
  proofButton: {
    flexDirection: 'row',
    borderRadius: 5,
    padding: 10,
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
  icon: {
    color: ColorPallet.grayscale.black,
  },
})

const iconSize = 35
const iconName = 'chevron-right'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ListProofRequests: React.FC<ListProofRequestsProps> = ({ navigation }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const records = defaultProofRequestTemplates
  const hasPredicates = (record: ProofRequestTemplate): boolean => {
    const indyPayload = record.payload.type === ProofRequestType.Indy ? record.payload : null
    if (!indyPayload) return false
    return indyPayload.data.some((d) => d.requestedPredicates && d.requestedPredicates?.length > 0)
  }
  return (
    <View style={style.container}>
      {records.map((record) => (
        <TouchableOpacity style={style.proofButton}>
          <View style={style.textContainer}>
            <Text style={[style.proofText, style.proofTitle]}>{record.title}</Text>
            <Text style={style.proofText}>{record.details}</Text>
            {hasPredicates(record) && <Text style={[style.proofText, style.proofCaption]}>Zero-knowledge proof</Text>}
          </View>
          <View style={{ alignSelf: 'center' }}>
            <Icon style={style.icon} size={iconSize} name={iconName} />
          </View>
        </TouchableOpacity>
      ))}
    </View>
  )
}

export default ListProofRequests
