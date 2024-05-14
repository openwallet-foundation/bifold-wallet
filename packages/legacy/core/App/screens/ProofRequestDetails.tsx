import { useAgent } from '@credo-ts/react-hooks'
import {
  AnonCredsProofRequestTemplatePayloadData,
  ProofRequestType,
  linkProofWithTemplate,
  sendProofRequest,
} from '@hyperledger/aries-bifold-verifier'
import { MetaOverlay } from '@hyperledger/aries-oca'
import { Field } from '@hyperledger/aries-oca/build/legacy'
import { OverlayType } from '@hyperledger/aries-oca/build/types/TypeEnums'
import { StackScreenProps } from '@react-navigation/stack'
import React, { memo, useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import Button, { ButtonType } from '../components/buttons/Button'
import VerifierCredentialCard from '../components/misc/VerifierCredentialCard'
import AlertModal from '../components/modals/AlertModal'
import { TOKENS, useContainer } from '../container-api'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { useTemplate } from '../hooks/proof-request-templates'
import { ProofRequestsStackParams, Screens } from '../types/navigators'
import { buildFieldsFromAnonCredsProofRequestTemplate } from '../utils/oca'
import { testIdWithKey } from '../utils/testable'

type ProofRequestDetailsProps = StackScreenProps<ProofRequestsStackParams, Screens.ProofRequestDetails>

interface ProofRequestAttributesCardProps {
  data: AnonCredsProofRequestTemplatePayloadData
  onChangeValue: (schema: string, label: string, name: string, value: string) => void
}

const ProofRequestAttributesCard: React.FC<ProofRequestAttributesCardProps> = ({ data, onChangeValue }) => {
  const { ColorPallet } = useTheme()
  const { i18n } = useTranslation()
  const bundleResolver = useContainer().resolve(TOKENS.UTIL_OCA_RESOLVER)
  const [attributes, setAttributes] = useState<Field[] | undefined>(undefined)
  const [credDefId, setCredDefId] = useState<string | undefined>(undefined)

  useEffect(() => {
    const attributes = buildFieldsFromAnonCredsProofRequestTemplate(data)
    bundleResolver
      .presentationFields({
        identifiers: { schemaId: data.schema },
        attributes,
        language: i18n.language,
      })
      .then((fields) => {
        setAttributes(fields)
      })
  }, [data.schema])

  useEffect(() => {
    const credDefId = (data.requestedAttributes ?? data.requestedPredicates)
      ?.flatMap((reqItem) => reqItem.restrictions?.map((restrictionItem) => restrictionItem.cred_def_id))
      .find((item) => item !== undefined)
    setCredDefId(credDefId)
  }, [data.requestedAttributes, data.requestedPredicates])

  return (
    <View style={{ marginBottom: 15 }}>
      <VerifierCredentialCard
        onChangeValue={onChangeValue}
        displayItems={attributes}
        style={{ backgroundColor: ColorPallet.brand.secondaryBackground }}
        credDefId={credDefId}
        schemaId={data.schema}
        preview
        elevated
      />
    </View>
  )
}

interface ProofRequestCardsProps {
  attributes?: AnonCredsProofRequestTemplatePayloadData[]
  onChangeValue: (schema: string, label: string, name: string, value: string) => void
}

// memo'd to prevent rerendering when onChangeValue is called from child and updates parent
const ProofRequestCards: React.FC<ProofRequestCardsProps> = memo(({ attributes = [], onChangeValue }) => {
  return attributes.map((item) => (
    <ProofRequestAttributesCard key={item.schema} data={item} onChangeValue={onChangeValue} />
  ))
})

const ProofRequestDetails: React.FC<ProofRequestDetailsProps> = ({ route, navigation }) => {
  const { ColorPallet, TextTheme } = useTheme()
  const [store] = useStore()
  const { t } = useTranslation()
  const { i18n } = useTranslation()
  const bundleResolver = useContainer().resolve(TOKENS.UTIL_OCA_RESOLVER)

  const { agent } = useAgent()
  if (!agent) {
    throw new Error('Unable to fetch agent from Credo')
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
      fontWeight: TextTheme.bold.fontWeight,
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
  const [attributes, setAttributes] = useState<Array<AnonCredsProofRequestTemplatePayloadData> | undefined>(undefined)
  const [customPredicateValues, setCustomPredicateValues] = useState<Record<string, Record<string, number>>>({})
  const [invalidPredicate, setInvalidPredicate] = useState<
    { visible: boolean; predicate: string | undefined } | undefined
  >(undefined)

  const template = useTemplate(templateId)

  useEffect(() => {
    if (!template) {
      return
    }
    const attributes = template.payload.type === ProofRequestType.AnonCreds ? template.payload.data : []

    bundleResolver.resolve({ identifiers: { templateId }, language: i18n.language }).then((bundle) => {
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
      setAttributes(attributes)
    })
  }, [templateId, template])

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
    if (!template) {
      return
    }

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
  }, [agent, template, templateId, connectionId, customPredicateValues, invalidPredicate])

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
        {store.preferences.useDataRetention && (
          <View style={style.footerButton}>
            <Button
              title={t('Verifier.ShowTemplateUsageHistory')}
              accessibilityLabel={t('Verifier.ShowTemplateUsageHistory')}
              testID={testIdWithKey('ShowTemplateUsageHistory')}
              buttonType={ButtonType.Secondary}
              onPress={() => showTemplateUsageHistory()}
            />
          </View>
        )}
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
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Header />
        <ProofRequestCards attributes={attributes} onChangeValue={onChangeValue} />
        <Footer />
      </ScrollView>
    </SafeAreaView>
  )
}

export default ProofRequestDetails
