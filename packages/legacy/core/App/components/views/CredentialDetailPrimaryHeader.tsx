import { StyleSheet, useWindowDimensions, View } from 'react-native'
import { BrandingOverlay } from '@hyperledger/aries-oca'
import { CredentialOverlay } from '@hyperledger/aries-oca/build/legacy'
import CardWatermark from '../../components/misc/CardWatermark'
import { useTheme } from '../../contexts/theme'
import { credentialTextColor } from '../../utils/credential'
import { testIdWithKey } from '../../utils/testable'
import { ThemedText } from '../texts/ThemedText'

type CredentialDetailPrimaryHeaderProps = {
  overlay: CredentialOverlay<BrandingOverlay>
}

const paddingHorizontal = 24
const paddingVertical = 16
const logoHeight = 80

const CredentialDetailPrimaryHeader: React.FC<CredentialDetailPrimaryHeaderProps> = ({
  overlay,
}: CredentialDetailPrimaryHeaderProps) => {
  const { ColorPallet } = useTheme()
  const { width, height } = useWindowDimensions()
  const styles = StyleSheet.create({
    primaryHeaderContainer: {
      paddingHorizontal,
      paddingVertical,
    },
    textContainer: {
      color: credentialTextColor(ColorPallet, overlay.brandingOverlay?.primaryBackgroundColor),
    },
  })

  return (
    <View
      testID={testIdWithKey('CredentialDetailsPrimaryHeader')}
      style={[styles.primaryHeaderContainer, { zIndex: -1 }]}
    >
      <View>
        {overlay.metaOverlay?.watermark && (
          <CardWatermark width={width} height={height} watermark={overlay.metaOverlay?.watermark} />
        )}
        <ThemedText
          variant="label"
          testID={testIdWithKey('CredentialIssuer')}
          style={[
            styles.textContainer,
            {
              paddingLeft: logoHeight + paddingVertical,
              paddingBottom: paddingVertical,
              lineHeight: 19,
              opacity: 0.8,
            },
          ]}
          numberOfLines={1}
        >
          {overlay.metaOverlay?.issuer}
        </ThemedText>
        <ThemedText
          testID={testIdWithKey('CredentialName')}
          style={[
            styles.textContainer,
            {
              lineHeight: 24,
            },
          ]}
        >
          {overlay.metaOverlay?.name}
        </ThemedText>
      </View>
    </View>
  )
}

export default CredentialDetailPrimaryHeader
