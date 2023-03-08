import { useAgent } from '@aries-framework/react-hooks'
import React, { useCallback, useEffect, useState } from 'react'
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native'

import { getProofData, groupSharedProofDataByCredential, mergeAttributes } from '../../../verifier/utils/proof'
import { useConfiguration } from '../../contexts/configuration'
import { useTheme } from '../../contexts/theme'
import { CardLayoutOverlay11, CredentialOverlay, resolveBundle } from '../../types/oca'
import { toImageSource } from '../../utils/credential'
import { testIdWithKey } from '../../utils/testable'

interface SharedProofDataProps {
  recordId: string
}

const { width } = Dimensions.get('screen')
const logoHeight = width * 0.12
const padding = width * 0.05
const borderRadius = 10

const SharedProofData: React.FC<SharedProofDataProps> = ({ recordId }: SharedProofDataProps) => {
  const { ColorPallet, TextTheme } = useTheme()

  const styles = StyleSheet.create({
    container: {
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

  const { agent } = useAgent()
  const { OCABundleResolver } = useConfiguration()

  if (!agent) {
    throw new Error('Unable to fetch agent from AFJ')
  }

  const [overlay, setOverlay] = useState<Array<CredentialOverlay<CardLayoutOverlay11>>>([])

  const prepareData = useCallback(async () => {
    const data = await getProofData(agent, recordId)
    if (!data) return

    const items: Array<CredentialOverlay<CardLayoutOverlay11>> = []
    const groupedData = groupSharedProofDataByCredential(data)
    for (const sharedData of groupedData.values()) {
      const attributes = mergeAttributes(sharedData.data)
      const bundle = await resolveBundle(OCABundleResolver, undefined, undefined, attributes, sharedData.identifiers)
      items.push(bundle)
    }
    setOverlay(items)
  }, [agent, recordId])

  useEffect(() => {
    prepareData()
  }, [agent, recordId])

  const CardBody: React.FC<{ overlay: CredentialOverlay<CardLayoutOverlay11> }> = ({ overlay }) => {
    return (
      <>
        <View style={styles.cardAttributes}>
          {overlay.presentationFields?.map((field) => (
            <View key={field.name} style={styles.attributeContainer}>
              <Text style={styles.attributeName}>{field.label || field.name}</Text>
              <Text style={styles.attributeValue}>{field.value}</Text>
            </View>
          ))}
        </View>
      </>
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
      // @ts-ignore
      <View style={styles.logoContainer} elevation={5}>
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

  const SharedData: React.FC = () => {
    return (
      <>
        {overlay.map((overlay) => (
          <View key={overlay.metaOverlay?.name} style={[styles.container, styles.cardContainer]}>
            <CardColor overlay={overlay} />
            <CardLogo overlay={overlay} />
            <CardBody overlay={overlay} />
          </View>
        ))}
      </>
    )
  }

  return overlay.length ? <SharedData /> : null
}

export default SharedProofData
