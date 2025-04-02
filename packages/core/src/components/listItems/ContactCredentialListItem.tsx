import { CredentialExchangeRecord } from '@credo-ts/core'
import { useTheme } from '../../contexts/theme'
import { TouchableOpacity, View, StyleSheet } from 'react-native'
import { useBranding } from '../../hooks/bundle-resolver'
import { useTranslation } from 'react-i18next'
import { getCredentialIdentifiers } from '../../utils/credential'
import { useCredentialConnectionLabel } from '../../utils/helpers'
import { CredentialOverlay } from '@hyperledger/aries-oca/build/legacy'
import { BaseOverlay, BrandingOverlay, LegacyBrandingOverlay } from '@hyperledger/aries-oca'
import { useMemo } from 'react'
import { ThemedText } from '../texts/ThemedText'

export type ContactCredentialListItemProps = {
  credential: CredentialExchangeRecord
  onPress: () => void
}

const ContactCredentialListItem = ({ credential, onPress }: ContactCredentialListItemProps) => {
  const { Assets, ColorPallet } = useTheme()
  const { t, i18n } = useTranslation()
  const credentialConnectionLabel = useCredentialConnectionLabel(credential)
  const params = useMemo(
    () => ({
      identifiers: getCredentialIdentifiers(credential),
      attributes: credential.credentialAttributes,
      meta: {
        credConnectionId: credential.connectionId,
        alias: credentialConnectionLabel,
      },
      language: i18n.language,
    }),
    [credential, credentialConnectionLabel, i18n.language]
  )
  const { overlay } = useBranding<CredentialOverlay<BrandingOverlay | BaseOverlay | LegacyBrandingOverlay>>(params)

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    credentialContainer: {
      flex: 9,
    },
    credentialName: {
      color: ColorPallet.brand.primary,
      fontWeight: '600',
    },
    iconContainer: {
      flex: 1,
      padding: 8,
    },
  })

  const icon = {
    color: ColorPallet.brand.primary,
    width: 48,
    height: 48,
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.container}
      accessibilityHint={t('ContactDetails.GoToCredentialDetail')}
      accessibilityLabel={`${t('ContactDetails.CredentialName')}: ${overlay?.metaOverlay?.name}`}
      accessibilityRole={'button'}
    >
      <View style={styles.credentialContainer}>
        <ThemedText style={styles.credentialName}>{overlay?.metaOverlay?.name}</ThemedText>
      </View>
      <View style={styles.iconContainer}>
        <Assets.svg.iconChevronRight {...icon} />
      </View>
    </TouchableOpacity>
  )
}

export default ContactCredentialListItem
