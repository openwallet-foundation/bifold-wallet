import { Image, StyleSheet, View } from 'react-native'
import { BrandingOverlay } from '@hyperledger/aries-oca'
import { CredentialOverlay } from '@hyperledger/aries-oca/build/legacy'
import { toImageSource } from '../../utils/credential'
import { ThemedText } from '../texts/ThemedText'

type Props = {
  overlay: CredentialOverlay<BrandingOverlay>
}

const logoHeight = 80
const paddingHorizontal = 24

const CredentialCardLogo: React.FC<Props> = ({ overlay }: Props) => {
  const styles = StyleSheet.create({
    logoContainer: {
      top: -0.5 * logoHeight,
      left: paddingHorizontal,
      marginBottom: -1 * logoHeight,
      width: logoHeight,
      height: logoHeight,
      backgroundColor: '#ffffff',
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 1,
        height: 1,
      },
      shadowOpacity: 0.3,
    },
  })

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
        <ThemedText variant="title" style={{ fontSize: 0.5 * logoHeight, color: '#000' }}>
          {(overlay.metaOverlay?.name ?? overlay.metaOverlay?.issuer ?? 'C')?.charAt(0).toUpperCase()}
        </ThemedText>
      )}
    </View>
  )
}

export default CredentialCardLogo
