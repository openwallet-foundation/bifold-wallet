import { useAgent } from '@aries-framework/react-hooks'
import {
  GroupedSharedProofData,
  GroupedSharedProofDataItem,
  getProofData,
  groupSharedProofDataByCredential,
} from '@hyperledger/aries-bifold-verifier'
import { BrandingOverlay } from '@hyperledger/aries-oca'
import { Attribute, CredentialOverlay, Field, Predicate } from '@hyperledger/aries-oca/build/legacy'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useWindowDimensions, Image, StyleSheet, Text, View } from 'react-native'

import { useAnimatedComponents } from '../../contexts/animated-components'
import { useConfiguration } from '../../contexts/configuration'
import { useTheme } from '../../contexts/theme'
import { toImageSource } from '../../utils/credential'
import { formatIfDate, pTypeToText } from '../../utils/helpers'
import { buildFieldsFromSharedAnonCredsProof } from '../../utils/oca'
import { testIdWithKey } from '../../utils/testable'
import { AttributeValue } from '../record/RecordField'

interface SharedProofDataProps {
  recordId: string
  onSharedProofDataLoad?: (sharedProofData: GroupedSharedProofDataItem[]) => void
}

const SharedDataCard: React.FC<{ sharedData: GroupedSharedProofDataItem }> = ({ sharedData }) => {
  const { ColorPallet, TextTheme } = useTheme()
  const { OCABundleResolver } = useConfiguration()
  const { i18n } = useTranslation()
  const { width } = useWindowDimensions()
  const logoHeight = width * 0.12
  const padding = width * 0.05
  const borderRadius = 10
  const styles = StyleSheet.create({
    container: {
      marginBottom: 20,
      backgroundColor: ColorPallet.grayscale.white,
      borderRadius: borderRadius,
    },
    cardContainer: {
      flexDirection: 'row',
      minHeight: 0.33 * width,
    },
    cardColorContainer: {
      width: logoHeight,
      borderTopLeftRadius: borderRadius,
      borderBottomLeftRadius: borderRadius,
    },
    logoContainer: {
      top: padding,
      left: -1 * logoHeight + padding,
      width: logoHeight,
      height: logoHeight,
      backgroundColor: ColorPallet.grayscale.white,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 5,
    },
    cardAttributes: {
      width: '65%',
      paddingTop: 20,
      paddingBottom: 10,
    },
    attributeContainer: {
      marginBottom: 10,
    },
    attributeName: {
      fontSize: 16,
      fontWeight: TextTheme.normal.fontWeight,
      color: ColorPallet.grayscale.black,
    },
    attributeValue: {
      fontSize: 18,
      fontWeight: TextTheme.bold.fontWeight,
      color: ColorPallet.grayscale.black,
    },
  })

  const [overlay, setOverlay] = useState<CredentialOverlay<BrandingOverlay> | undefined>(undefined)

  const attributeTypes = overlay?.bundle?.captureBase.attributes
  const attributeFormats: Record<string, string | undefined> = (overlay?.bundle as any)?.bundle.attributes
    .map((attr: any) => {
      return { name: attr.name, format: attr.format }
    })
    .reduce((prev: { [key: string]: string }, curr: { name: string; format?: string }) => {
      return { ...prev, [curr.name]: curr.format }
    }, {})

  useEffect(() => {
    const attributes = buildFieldsFromSharedAnonCredsProof(sharedData.data)
    const params = {
      identifiers: {
        credentialDefinitionId: sharedData.identifiers.cred_def_id,
        schemaId: sharedData.identifiers.schema_id,
      },
      language: i18n.language,
      attributes,
    }
    OCABundleResolver.resolveAllBundles(params).then((bundle) => {
      setOverlay(bundle as CredentialOverlay<BrandingOverlay>)
    })
  }, [sharedData])

  const CardField: React.FC<{ item: Field }> = ({ item }) => {
    const { t } = useTranslation()
    let parsedPredicate: Predicate | undefined = undefined
    if (item instanceof Predicate) {
      parsedPredicate = pTypeToText(item, t, attributeTypes) as Predicate
      parsedPredicate.pValue = formatIfDate(attributeFormats[item.name ?? ''], parsedPredicate.pValue)
    } else {
      ;(item as Attribute).value = formatIfDate(attributeFormats[item.name ?? ''], (item as Attribute).value)
    }

    return (
      <View key={item.name} style={[styles.attributeContainer]}>
        <Text style={styles.attributeName}>{item.label || item.name}</Text>
        {item instanceof Attribute && <AttributeValue style={styles.attributeValue} field={item} shown={true} />}
        {item instanceof Predicate && (
          <Text style={styles.attributeValue}>{`${parsedPredicate?.pType} ${parsedPredicate?.pValue}`}</Text>
        )}
      </View>
    )
  }

  const CardBody: React.FC<{ overlay: CredentialOverlay<BrandingOverlay> }> = ({ overlay }) => {
    return (
      <View style={styles.cardAttributes}>
        {overlay.presentationFields?.map((item) => (
          <CardField item={item} key={item.name || item.toString()} />
        ))}
      </View>
    )
  }

  const CardColor: React.FC<{ overlay: CredentialOverlay<BrandingOverlay> }> = ({ overlay }) => {
    return (
      <View
        testID={testIdWithKey('CardColor')}
        style={[{ backgroundColor: overlay.brandingOverlay?.primaryBackgroundColor }, styles.cardColorContainer]}
      />
    )
  }

  const CardLogo: React.FC<{ overlay: CredentialOverlay<BrandingOverlay> }> = ({ overlay }) => {
    return (
      <View style={styles.logoContainer}>
        {overlay.brandingOverlay?.logo ? (
          <Image
            source={toImageSource(overlay.brandingOverlay?.logo)}
            style={{
              resizeMode: 'cover',
              width: logoHeight,
              height: logoHeight,
              borderRadius: 8,
            }}
          />
        ) : (
          <Text
            style={[
              TextTheme.bold,
              {
                fontSize: 0.5 * logoHeight,
                alignSelf: 'center',
                color: ColorPallet.grayscale.black,
              },
            ]}
          >
            {(overlay.metaOverlay?.issuer ?? overlay.metaOverlay?.name ?? 'C')?.charAt(0).toUpperCase()}
          </Text>
        )}
      </View>
    )
  }

  return overlay ? (
    <View style={styles.container}>
      <View key={sharedData.identifiers.cred_def_id} style={styles.cardContainer}>
        <CardColor overlay={overlay} />
        <CardLogo overlay={overlay} />
        <CardBody overlay={overlay} />
      </View>
    </View>
  ) : null
}

const SharedProofData: React.FC<SharedProofDataProps> = ({ recordId, onSharedProofDataLoad }: SharedProofDataProps) => {
  const { agent } = useAgent()
  const { LoadingIndicator } = useAnimatedComponents()
  const styles = StyleSheet.create({
    container: {
      flexGrow: 1,
    },
    loaderContainer: {
      height: 200,
      marginTop: 80,
    },
  })

  if (!agent) {
    throw new Error('Unable to fetch agent from AFJ')
  }

  const [loading, setLoading] = useState<boolean>(true)
  const [sharedData, setSharedData] = useState<GroupedSharedProofData | undefined>(undefined)

  useEffect(() => {
    getProofData(agent, recordId)
      .then((data) => {
        if (data) {
          const groupedSharedProofData = groupSharedProofDataByCredential(data)
          setSharedData(groupedSharedProofData)
          if (!onSharedProofDataLoad) return
          onSharedProofDataLoad(Array.from(groupedSharedProofData.values()))
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }, [recordId])

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loaderContainer}>
          <LoadingIndicator />
        </View>
      )}
      {!loading &&
        sharedData?.size &&
        Array.from(sharedData.values()).map((item) => (
          <SharedDataCard sharedData={item} key={item.identifiers.cred_def_id} />
        ))}
    </View>
  )
}

export default SharedProofData
