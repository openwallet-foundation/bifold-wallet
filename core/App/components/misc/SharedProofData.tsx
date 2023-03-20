import { useAgent } from '@aries-framework/react-hooks'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Dimensions, FlatList, Image, StyleSheet, Text, View } from 'react-native'

import { GroupedSharedProofData, GroupedSharedProofDataItem } from '../../../verifier/types/proof'
import { getProofData, groupSharedProofDataByCredential } from '../../../verifier/utils/proof'
import { useConfiguration } from '../../contexts/configuration'
import { useTheme } from '../../contexts/theme'
import { CardLayoutOverlay11, CredentialOverlay } from '../../types/oca'
import { Attribute, Field, Predicate } from '../../types/record'
import { toImageSource } from '../../utils/credential'
import { buildFieldsFromSharedIndyProof } from '../../utils/oca'
import { testIdWithKey } from '../../utils/testable'
import LoadingIndicator from '../animated/LoadingIndicator'
import { AttributeValue } from '../record/RecordField'

interface SharedProofDataProps {
  recordId: string
}

const { width } = Dimensions.get('screen')
const logoHeight = width * 0.12
const padding = width * 0.05
const borderRadius = 10

const SharedDataCard: React.FC<{ sharedData: GroupedSharedProofDataItem }> = ({ sharedData }) => {
  const { ColorPallet, TextTheme } = useTheme()
  const { OCABundleResolver } = useConfiguration()
  const { i18n } = useTranslation()

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
      paddingTop: 20,
      paddingBottom: 10,
    },
    attributeContainer: {
      marginBottom: 10,
    },
    attributeName: {
      fontSize: 16,
      fontWeight: 'normal',
      color: ColorPallet.grayscale.black,
    },
    attributeValue: {
      fontSize: 18,
      fontWeight: 'bold',
      color: ColorPallet.grayscale.black,
    },
  })

  const [overlay, setOverlay] = useState<CredentialOverlay<CardLayoutOverlay11> | undefined>(undefined)

  useEffect(() => {
    const attributes = buildFieldsFromSharedIndyProof(sharedData.data)
    const params = {
      identifiers: sharedData.identifiers,
      language: i18n.language,
      attributes,
    }
    OCABundleResolver.resolveAllBundles(params).then((bundle) => {
      setOverlay(bundle)
    })
  }, [sharedData])

  const CardField: React.FC<{ item: Field }> = ({ item }) => {
    return (
      <View key={item.name} style={styles.attributeContainer}>
        <Text style={styles.attributeName}>{item.label || item.name}</Text>
        {item instanceof Attribute && <AttributeValue style={styles.attributeValue} field={item} shown={true} />}
        {item instanceof Predicate && (
          <Text style={styles.attributeValue}>
            {item.pType} {item.pValue}
          </Text>
        )}
      </View>
    )
  }

  const CardBody: React.FC<{ overlay: CredentialOverlay<CardLayoutOverlay11> }> = ({ overlay }) => {
    return (
      <View style={styles.cardAttributes}>
        <FlatList
          data={overlay.presentationFields}
          keyExtractor={(records, index) => records.name || index.toString()}
          renderItem={({ item }) => <CardField item={item} />}
        />
      </View>
    )
  }

  const CardColor: React.FC<{ overlay: CredentialOverlay<CardLayoutOverlay11> }> = ({ overlay }) => {
    return (
      <View
        testID={testIdWithKey('CardColor')}
        style={[{ backgroundColor: overlay.cardLayoutOverlay?.primaryBackgroundColor }, styles.cardColorContainer]}
      />
    )
  }

  const CardLogo: React.FC<{ overlay: CredentialOverlay<CardLayoutOverlay11> }> = ({ overlay }) => {
    return (
      <View style={styles.logoContainer}>
        {overlay.cardLayoutOverlay?.logo?.src ? (
          <Image
            source={toImageSource(overlay.cardLayoutOverlay?.logo.src)}
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
              TextTheme.normal,
              {
                fontSize: 0.5 * logoHeight,
                fontWeight: 'bold',
                alignSelf: 'center',
                color: ColorPallet.grayscale.black,
              },
            ]}
          >
            {(overlay.metaOverlay?.issuerName ?? overlay.metaOverlay?.name ?? 'C')?.charAt(0).toUpperCase()}
          </Text>
        )}
      </View>
    )
  }

  return overlay ? (
    <View style={styles.container}>
      <View key={sharedData.identifiers.credentialDefinitionId} style={styles.cardContainer}>
        <CardColor overlay={overlay} />
        <CardLogo overlay={overlay} />
        <CardBody overlay={overlay} />
      </View>
    </View>
  ) : null
}

const SharedProofData: React.FC<SharedProofDataProps> = ({ recordId }: SharedProofDataProps) => {
  const { agent } = useAgent()

  const styles = StyleSheet.create({
    container: {
      flexGrow: 1,
    },
    loaderContainer: {
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
          setSharedData(groupSharedProofDataByCredential(data))
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }, [agent, recordId])

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loaderContainer}>
          <LoadingIndicator />
        </View>
      )}
      {!loading && sharedData?.size && (
        <FlatList
          data={Array.from(sharedData.values())}
          keyExtractor={(record) => record.identifiers.credentialDefinitionId}
          renderItem={({ item }) => <SharedDataCard sharedData={item} />}
        />
      )}
    </View>
  )
}

export default SharedProofData
