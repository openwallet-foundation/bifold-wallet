import React from 'react'
import { BrandingOverlay } from '@bifold/oca'
import { BrandingOverlayType, CredentialOverlay } from '@bifold/oca/build/legacy'
import { ImageBackground, StyleSheet, View } from 'react-native'
import { toImageSource } from '../../utils/credential'
import { testIdWithKey } from '../../utils/testable'

type CredentialDetailSecondaryHeaderProps = {
  overlay: CredentialOverlay<BrandingOverlay>
  brandingOverlayType?: BrandingOverlayType
}

const logoHeight = 80

const CredentialDetailSecondaryHeader: React.FC<CredentialDetailSecondaryHeaderProps> = ({
  overlay,
  brandingOverlayType = BrandingOverlayType.Branding10,
}: CredentialDetailSecondaryHeaderProps) => {
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
        <View testID={testIdWithKey('CredentialDetailsSecondaryHeader')} style={styles.secondaryHeaderContainer}>
          {brandingOverlayType === BrandingOverlayType.Branding11 && (
            <View
              style={[
                {
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'rgba(0,0,0,0.24)',
                },
              ]}
            />
          )}
        </View>
      )}
    </>
  )
}

export default CredentialDetailSecondaryHeader
