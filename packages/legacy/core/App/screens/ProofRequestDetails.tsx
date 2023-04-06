import { useAgent } from '@aries-framework/react-hooks'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import {
  IndyProofRequestTemplatePayloadData,
  ProofRequestType,
  linkProofWithTemplate,
  sendProofRequest,
} from '../../verifier'
import Button, { ButtonType } from '../components/buttons/Button'
import AlertModal from '../components/modals/AlertModal'
import { useConfiguration } from '../contexts/configuration'
import { useTheme } from '../contexts/theme'
import { useTemplate } from '../hooks/proof-request-templates'
import { Screens, ProofRequestsStackParams } from '../types/navigators'
import { MetaOverlay, OverlayType } from '../types/oca'
import { Attribute, Field, Predicate } from '../types/record'
import { buildFieldsFromIndyProofRequestTemplate } from '../utils/oca'
import { parseSchemaFromId } from '../utils/schema'
import { testIdWithKey } from '../utils/testable'

type ProofRequestDetailsProps = StackScreenProps<ProofRequestsStackParams, Screens.ProofRequestDetails>

interface ProofRequestAttributesCardParams {
  data: IndyProofRequestTemplatePayloadData
  onChangeValue: (schema: string, label: string, name: string, value: string) => void
}

const AttributeItem: React.FC<{ item: Attribute }> = ({ item }) => {
  const { ListItems } = useTheme()

  const style = StyleSheet.create({
    attributeTitle: {
      ...ListItems.requestTemplateTitle,
      fontWeight: 'bold',
      fontSize: 18,
      paddingVertical: 8,
      marginRight: 8,
    },
  })

  return (
    <View style={{ flexDirection: 'row' }}>
      <Text style={style.attributeTitle}>{item.label || item.name}</Text>
      <Text style={style.attributeTitle}>{item.value}</Text>
    </View>
  )
}

const PredicateItem: React.FC<{
  item: Predicate
  onChangeValue: (name: string, value: string) => void
}> = ({ item, onChangeValue }) => {
  const { ListItems, ColorPallet } = useTheme()

  const style = StyleSheet.create({
    attributeTitle: {
      ...ListItems.requestTemplateTitle,
      fontWeight: 'bold',
      fontSize: 18,
      paddingVertical: 8,
      marginRight: 8,
    },
    input: {
      textAlign: 'center',
      borderBottomColor: ColorPallet.grayscale.black,
      borderBottomWidth: 1,
    },
  })

  return (
    <View style={{ flexDirection: 'row' }}>
      <Text style={style.attributeTitle}>{item.label || item.name}</Text>
      <Text style={style.attributeTitle}>{item.pType}</Text>
      {item.parameterizable && (
        <TextInput
          keyboardType="numeric"
          style={[style.attributeTitle, style.input]}
          onChangeText={(value) => onChangeValue(item.name || '', value)}
        >
          {item.pValue}
        </TextInput>
      )}
      {!item.parameterizable && <Text style={style.attributeTitle}>{item.pValue}</Text>}
    </View>
  )
}

const ProofRequestAttributesCard: React.FC<ProofRequestAttributesCardParams> = ({ data, onChangeValue }) => {
  const { ListItems, ColorPallet } = useTheme()
  const { i18n } = useTranslation()
  const { OCABundleResolver } = useConfiguration()

  const style = StyleSheet.create({
    credentialCard: {
      ...ListItems.requestTemplateBackground,
      padding: 16,
      borderRadius: 8,
      borderLeftWidth: 8,
      borderLeftColor: ColorPallet.brand.primary,
      marginBottom: 16,
    },
    schemaTitle: {
      ...ListItems.requestTemplateTitle,
      fontWeight: 'bold',
      fontSize: 20,
      paddingVertical: 8,
    },
    attributesList: {
      paddingLeft: 14,
    },
    attributesDelimiter: {
      width: '100%',
      height: 2,
      backgroundColor: ColorPallet.grayscale.lightGrey,
    },
  })

  const [meta, setMeta] = useState<MetaOverlay | undefined>(undefined)
  const [attributes, setAttributes] = useState<Field[] | undefined>(undefined)

  useEffect(() => {
    OCABundleResolver.resolve({ identifiers: { schemaId: data.schema }, language: i18n.language }).then((bundle) => {
      const metaOverlay = bundle?.metaOverlay || {
        captureBase: '',
        type: OverlayType.Meta10,
        name: parseSchemaFromId(data.schema).name,
        language: i18n.language,
      }
      setMeta(metaOverlay)
    })
  }, [data.schema])

  useEffect(() => {
    const attributes = buildFieldsFromIndyProofRequestTemplate(data)
    OCABundleResolver.presentationFields({
      identifiers: { schemaId: data.schema },
      attributes,
      language: i18n.language,
    }).then((fields) => {
      setAttributes(fields)
    })
  }, [data.schema])

  const countAttributes = attributes?.length

  const AttributeDelimiter: React.FC = () => <View style={style.attributesDelimiter} />

  return (
    <View style={[style.credentialCard]}>
      <Text style={style.schemaTitle}>{meta?.name}</Text>
      <FlatList
        style={style.attributesList}
        data={attributes}
        keyExtractor={(record, index) => record.name || index.toString()}
        renderItem={({ item, index }) => {
          return (
            <View>
              {item instanceof Attribute && <AttributeItem item={item as Attribute} />}
              {item instanceof Predicate && (
                <PredicateItem
                  item={item as Predicate}
                  onChangeValue={(name, value) => {
                    onChangeValue(data.schema, item.label || name, name, value)
                  }}
                />
              )}
              {index + 1 !== countAttributes && <AttributeDelimiter />}
            </View>
          )
        }}
      />
    </View>
  )
}

const ProofRequestDetails: React.FC<ProofRequestDetailsProps> = ({ route, navigation }) => {
  const { ColorPallet, TextTheme } = useTheme()
  const { t } = useTranslation()
  const { i18n } = useTranslation()
  const { OCABundleResolver } = useConfiguration()

  const { agent } = useAgent()
  if (!agent) {
    throw new Error('Unable to fetch agent from AFJ')
  }

  const style = StyleSheet.create({
    container: {
      flexGrow: 1,
      backgroundColor: ColorPallet.brand.primaryBackground,
      padding: 16,
    },
    header: {
      marginTop: 12,
      marginBottom: 36,
    },
    title: {
      color: TextTheme.title.color,
      fontSize: 28,
      fontWeight: 'bold',
    },
    description: {
      marginTop: 10,
      color: TextTheme.title.color,
      fontSize: 20,
    },
    footerButton: {
      marginTop: 'auto',
      marginBottom: 10,
    },
  })

  const { templateId, connectionId } = route?.params

  const [meta, setMeta] = useState<MetaOverlay | undefined>(undefined)
  const [attributes, setAttributes] = useState<Array<IndyProofRequestTemplatePayloadData> | undefined>(undefined)
  const [customPredicateValues, setCustomPredicateValues] = useState<Record<string, Record<string, number>>>({})
  const [invalidPredicate, setInvalidPredicate] = useState<
    { visible: boolean; predicate: string | undefined } | undefined
  >(undefined)

  const template = useTemplate(templateId)
  if (!template) {
    throw new Error('Unable to find proof request template')
  }

  useEffect(() => {
    const attributes = template.payload.type === ProofRequestType.Indy ? template.payload.data : []

    OCABundleResolver.resolve({ identifiers: { templateId }, language: i18n.language }).then((bundle) => {
      const metaOverlay = bundle?.metaOverlay || {
        captureBase: '',
        type: OverlayType.Meta10,
        name: template.name,
        description: template.description,
        language: i18n.language,
      }
      setMeta(metaOverlay)
      setAttributes(attributes)
    })
  }, [templateId])

  const onlyNumberRegex = /^\d+$/

  const onChangeValue = useCallback(
    (schema: string, label: string, name: string, value: string) => {
      if (!onlyNumberRegex.test(value)) {
        setInvalidPredicate({ visible: true, predicate: label })
        return
      }
      setInvalidPredicate(undefined)
      setCustomPredicateValues((prev) => ({
        ...prev,
        [schema]: {
          ...(prev[schema] || {}),
          [name]: parseInt(value),
        },
      }))
    },
    [setCustomPredicateValues, setInvalidPredicate]
  )

  const useProofRequest = useCallback(async () => {
    if (invalidPredicate) {
      setInvalidPredicate({ visible: true, predicate: invalidPredicate.predicate })
      return
    }

    if (connectionId) {
      // Send to specific contact and redirect to the chat with him
      sendProofRequest(agent, template, connectionId, customPredicateValues).then((result) => {
        if (result?.proofRecord) {
          linkProofWithTemplate(agent, result.proofRecord, templateId)
        }
      })

      navigation.getParent()?.navigate(Screens.Chat, { connectionId })
    } else {
      // Else redirect to the screen with connectionless request
      navigation.navigate(Screens.ProofRequesting, { templateId, predicateValues: customPredicateValues })
    }
  }, [agent, templateId, connectionId, customPredicateValues, invalidPredicate])

  const showTemplateUsageHistory = useCallback(async () => {
    navigation.navigate(Screens.ProofRequestUsageHistory, { templateId })
  }, [navigation, templateId])

  const Header: React.FC = () => {
    return (
      <View style={style.header}>
        <Text style={style.title}>{meta?.name}</Text>
        <Text style={style.description}>{meta?.description}</Text>
      </View>
    )
  }

  const Footer: React.FC = () => {
    return (
      <View>
        <View style={style.footerButton}>
          <Button
            title={connectionId ? t('Verifier.SendThisProofRequest') : t('Verifier.UseProofRequest')}
            accessibilityLabel={connectionId ? t('Verifier.SendThisProofRequest') : t('Verifier.UseProofRequest')}
            testID={connectionId ? testIdWithKey('SendThisProofRequest') : testIdWithKey('UseProofRequest')}
            buttonType={ButtonType.Primary}
            onPress={() => useProofRequest()}
          />
        </View>
        <View style={style.footerButton}>
          <Button
            title={t('Verifier.ShowTemplateUsageHistory')}
            accessibilityLabel={t('Verifier.ShowTemplateUsageHistory')}
            testID={testIdWithKey('ShowTemplateUsageHistory')}
            buttonType={ButtonType.Secondary}
            onPress={() => showTemplateUsageHistory()}
          />
        </View>
      </View>
    )
  }

  return (
    <SafeAreaView style={style.container} edges={['left', 'right']}>
      {invalidPredicate?.visible && (
        <AlertModal
          title={t('Verifier.InvalidPredicateValueTitle', { predicate: invalidPredicate.predicate })}
          message={t('Verifier.InvalidPredicateValueDetails')}
          submit={() => setInvalidPredicate({ visible: false, predicate: invalidPredicate.predicate })}
        />
      )}
      <FlatList
        ListHeaderComponent={Header}
        ListFooterComponent={Footer}
        style={{ backgroundColor: ColorPallet.brand.primaryBackground }}
        data={attributes}
        keyExtractor={(records) => records.schema}
        renderItem={({ item }) => <ProofRequestAttributesCard data={item} onChangeValue={onChangeValue} />}
        ListFooterComponentStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}
        contentContainerStyle={{ flexGrow: 1 }}
      />
    </SafeAreaView>
  )
}

export default ProofRequestDetails
