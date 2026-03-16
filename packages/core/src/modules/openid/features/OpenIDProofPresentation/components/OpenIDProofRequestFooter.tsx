import { StyleSheet, View } from 'react-native'
import { MdocRecord, SdJwtVcRecord, W3cCredentialRecord } from '@credo-ts/core'
import { useTranslation } from 'react-i18next'

import { useTheme } from '../../../../../contexts/theme'
import Button, { ButtonType } from '../../../../../components/buttons/Button'
import { FormattedSubmission } from '../../../displayProof'
import { testIdWithKey } from '../../../../../utils/testable'
import { type SelectedCredentialsFormat } from '../../../types'
import { OpenId4VPRequestRecord } from '../../../types'

interface OpenIDProofPresentationFooterProps {
    buttonsVisible: boolean
    credential: W3cCredentialRecord | SdJwtVcRecord | MdocRecord | OpenId4VPRequestRecord | undefined
    onPressAccept: (...args: any[]) => void
    onPressDecline: (...args: any[]) => void
    onPressDismiss: (...args: any[]) => void
    selectedCredentialsSubmission?: SelectedCredentialsFormat
    submission?: FormattedSubmission
}

const OpenIDProofPresentationFooter: React.FC<OpenIDProofPresentationFooterProps> = ({
    buttonsVisible,
    credential,
    onPressAccept,
    onPressDecline,
    onPressDismiss,
    selectedCredentialsSubmission,
    submission
}) => {

    const { ColorPalette } = useTheme()
    const { t } = useTranslation()

    const styles = StyleSheet.create({
        footerButton: {
            paddingVertical: 10,
        },
        footerContainer: {
            paddingHorizontal: 25,
            paddingVertical: 16,
            paddingBottom: 26,
            backgroundColor: ColorPalette.brand.secondaryBackground,
        },
    })

    if (!credential) {
        return null
    }

    if (submission && !submission.areAllSatisfied) {
        return (
            <View style={styles.footerContainer}>
                <View style={styles.footerButton}>
                <Button
                    title={t('Global.Dismiss')}
                    accessibilityLabel={t('Global.Dismiss')}
                    testID={testIdWithKey('DismissCredentialOffer')}
                    buttonType={ButtonType.Primary}
                    onPress={onPressDismiss}
                    disabled={!buttonsVisible}
                />
                </View>
            </View>
        )
    } 
    
    return (
        <View style={styles.footerContainer}>
            {selectedCredentialsSubmission && Object.keys(selectedCredentialsSubmission).length > 0 ? (
                <>
                <Button
                    title={t('Global.Send')}
                    accessibilityLabel={t('Global.Send')}
                    testID={testIdWithKey('AcceptCredentialOffer')}
                    buttonType={ButtonType.Primary}
                    onPress={onPressAccept}
                    disabled={!buttonsVisible}
                />
                <Button
                    title={t('Global.Decline')}
                    accessibilityLabel={t('Global.Decline')}
                    testID={testIdWithKey('DeclineCredentialOffer')}
                    buttonType={ButtonType.Secondary}
                    onPress={onPressDecline}
                    disabled={!buttonsVisible}
                />
                </>
            ) : (
                <Button
                    title={t('Global.Dismiss')}
                    accessibilityLabel={t('Global.Dismiss')}
                    testID={testIdWithKey('DismissCredentialOffer')}
                    buttonType={ButtonType.Primary}
                    onPress={onPressDismiss}
                    disabled={!buttonsVisible}
                />
            )}
        </View>
    )
}

export default OpenIDProofPresentationFooter
