import React from 'react'
import { BrandingOverlay } from '@hyperledger/aries-oca'
import { CredentialOverlay } from '@hyperledger/aries-oca/build/legacy'
import { ImageBackground, StyleSheet, View } from 'react-native'
import { toImageSource } from '../../utils/credential'
import { testIdWithKey } from '../../utils/testable'

type CredentialDetailSecondaryHeaderProps = {
  overlay: CredentialOverlay<BrandingOverlay>
}

const logoHeight = 80

const CredentialDetailSecondaryHeader: React.FC<CredentialDetailSecondaryHeaderProps> = ({ overlay }: CredentialDetailSecondaryHeaderProps) => {
  const styles = StyleSheet.create({
    secondaryHeaderContainer: {
      height: 1.5 * logoHeight,
      backgroundColor:
        (overlay.brandingOverlay?.backgroundImage
          ? 'rgba(0, 0, 0, 0)'
          : overlay.brandingOverlay?.secondaryBackgroundColor) ?? 'rgba(0, 0, 0, 0.24)',
    },
  })

  return (
    <>
      {overlay.brandingOverlay?.backgroundImage ? (
        <ImageBackground
          source={toImageSource(overlay.brandingOverlay?.backgroundImage)}
          imageStyle={{
            resizeMode: 'cover',
          }}
        >
          <View testID={testIdWithKey('CredentialDetailsSecondaryHeader')} style={styles.secondaryHeaderContainer} />
        </ImageBackground>
      ) : (
        <View testID={testIdWithKey('CredentialDetailsSecondaryHeader')} style={styles.secondaryHeaderContainer} />
      )}
    </>
  )
}

export default CredentialDetailSecondaryHeader
