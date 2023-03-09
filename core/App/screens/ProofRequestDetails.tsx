import { useAgent } from '@aries-framework/react-hooks'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'

import { IndyProofRequestTemplatePayloadData, ProofRequestType } from '../../verifier/types/proof-reqeust-template'
import {
  getProofRequestTemplate,
  mapRequestAttributesToCredentialPreview,
  sendProofRequest,
} from '../../verifier/utils/proof-request'
import Button, { ButtonType } from '../components/buttons/Button'
import { useConfiguration } from '../contexts/configuration'
import { useTheme } from '../contexts/theme'
import { Screens, ProofRequestsStackParams } from '../types/navigators'
import { MetaOverlay, OverlayType } from '../types/oca'
import { Attribute, Field } from '../types/record'
import { parseSchema } from '../utils/schema'
import { testIdWithKey } from '../utils/testable'

type ProofRequestDetailsProps = StackScreenProps<ProofRequestsStackParams, Screens.ProofRequestDetails>

interface ProofRequestAttributesCardParams {
  data: IndyProofRequestTemplatePayloadData
}

const ProofRequestAttributesCard: React.FC<ProofRequestAttributesCardParams> = ({ data }) => {
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
    list: {
      paddingLeft: 14,
    },
    schemaTitle: {
      ...ListItems.requestTemplateTitle,
      fontWeight: 'bold',
      fontSize: 20,
      paddingVertical: 8,
    },
    attributeTitle: {
      ...ListItems.requestTemplateTitle,
      fontWeight: 'bold',
      fontSize: 16,
      paddingVertical: 8,
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
    OCABundleResolver.resolve(undefined, i18n.language, { schemaId: data.schema }).then((bundle) => {
      const metaOverlay = bundle?.metaOverlay || {
        captureBase: '',
        type: OverlayType.Meta10,
        name: parseSchema(data.schema).name,
        language: i18n.language,
      }
      setMeta(metaOverlay)
    })
  }, [data.schema])

  useEffect(() => {
    const attributes = mapRequestAttributesToCredentialPreview(data)
    OCABundleResolver.presentationFields(undefined, i18n.language, attributes, { schemaId: data.schema }).then(
      (fields) => {
        setAttributes(fields)
      }
    )
  }, [data.schema])

  const countAttributes = attributes?.length

  const AttributeDelimiter: React.FC = () => <View style={style.attributesDelimiter} />

  return (
    <View style={[style.credentialCard]}>
      <Text style={style.schemaTitle}>{meta?.name}</Text>
      <View style={style.list}>
        {attributes?.map((attr, attrIndex) => (
          <>
            <Text style={style.attributeTitle}>{`${attr.label || attr.name} ${(attr as Attribute).value}`}</Text>
            {attrIndex + 1 !== countAttributes && <AttributeDelimiter />}
          </>
        ))}
      </View>
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
      marginVertical: 12,
      marginBottom: 24,
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

  useEffect(() => {
    const template = getProofRequestTemplate(templateId)
    if (!template) return

    const attributes = template.payload.type === ProofRequestType.Indy ? template.payload.data : []

    OCABundleResolver.resolve(undefined, i18n.language, { templateId }).then((bundle) => {
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

  const useProofRequest = useCallback(async () => {
    if (connectionId) {
      sendProofRequest(agent, templateId, connectionId)
      navigation.getParent()?.navigate(Screens.Chat, { connectionId })
    } else {
      navigation.navigate(Screens.ProofRequesting, { templateId })
    }
  }, [agent, templateId, connectionId])

  return (
    <View style={style.container}>
      <View style={style.header}>
        <Text style={style.title}>{meta?.name}</Text>
        <Text style={style.description}>{meta?.description}</Text>
      </View>
      {attributes?.map((item) => (
        <ProofRequestAttributesCard data={item} />
      ))}
      <View style={style.footerButton}>
        <Button
          title={connectionId ? t('Verifier.SendThisProofRequest') : t('Verifier.UseProofRequest')}
          accessibilityLabel={connectionId ? t('Verifier.SendThisProofRequest') : t('Verifier.UseProofRequest')}
          testID={connectionId ? testIdWithKey('SendThisProofRequest') : testIdWithKey('UseProofRequest')}
          buttonType={ButtonType.Primary}
          onPress={() => useProofRequest()}
        />
      </View>
    </View>
  )
}

export default ProofRequestDetails
