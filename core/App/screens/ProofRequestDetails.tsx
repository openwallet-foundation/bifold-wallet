import { RouteProp, useRoute } from '@react-navigation/core'
import React, { useMemo } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { defaultProofRequestTemplates } from '../../verifier/constants'
import { ProofRequestType } from '../../verifier/types/proof-reqeust-template'
import Button, { ButtonType } from '../components/buttons/Button'
import { ColorPallet } from '../theme'
import { ProofRequestsStackParams, Screens } from '../types/navigators'

const style = StyleSheet.create({
  container: {
    backgroundColor: ColorPallet.brand.primaryBackground,
    padding: 16,
  },
  title: {
    fontWeight: 'bold',
  },
  text: {
    color: ColorPallet.grayscale.white,
  },
  header: {
    marginBottom: 24,
  },
  box: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderLeftWidth: 8,
    borderLeftColor: ColorPallet.brand.primary,
  },
  boxTitle: {
    fontWeight: 'bold',
  },
  list: {
    paddingLeft: 8,
  },
  listItemText: {
    fontWeight: 'bold',
    paddingVertical: 8,
  },
})

const ListItemDivider = () => (
  <View style={{ width: '100%', height: 2, backgroundColor: ColorPallet.grayscale.lightGrey }} />
)

const ProofRequestDetails: React.FC = () => {
  const route = useRoute<RouteProp<ProofRequestsStackParams, Screens.ProofRequestDetails>>()
  const currentTemplate = defaultProofRequestTemplates.find((template) => template.id === route.params.templateId)
  if (!currentTemplate) return <View>Template not found</View>

  const list = useMemo(() => {
    const indyData = currentTemplate.payload.type === ProofRequestType.Indy ? currentTemplate.payload.data : []
    const difData = currentTemplate.payload.type === ProofRequestType.DIF ? currentTemplate.payload.data : []
    return indyData.map((item) => ({
      schema: item.schema,
      requestedAttributes: item.requestedAttributes,
      requestedPredicates: item.requestedPredicates,
    }))
  }, [currentTemplate])
  return (
    <View style={style.container}>
      <View style={style.header}>
        <Text style={[style.text, style.title]} numberOfLines={1}>
          {currentTemplate.name}
        </Text>
        <Text style={style.text} numberOfLines={3}>
          {currentTemplate.description}
        </Text>
      </View>
      <View style={{ marginBottom: 16 }}>
        {list.map((item) => (
          <View style={[style.box, { marginBottom: 16 }]}>
            <View>
              <Text style={style.listItemText}>{item.schema}</Text>
              <View style={style.list}>
                {item.requestedAttributes?.map((attr, attrIndex, attributes) => (
                  <View>
                    <View>
                      {attr.name && (
                        <View>
                          <Text style={style.listItemText}>{attr.name}</Text>
                          {attrIndex + 1 !== attributes.length && <ListItemDivider />}
                        </View>
                      )}
                      {attr.names &&
                        attr.names.map((name, nameIndex, names) => (
                          <View>
                            <Text style={style.listItemText}>{name}</Text>
                            {nameIndex + 1 !== names.length && <ListItemDivider />}
                          </View>
                        ))}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        ))}
      </View>
      <View>
        <Button title={'Use this proof request'} buttonType={ButtonType.Primary} />
      </View>
    </View>
  )
}

export default ProofRequestDetails
