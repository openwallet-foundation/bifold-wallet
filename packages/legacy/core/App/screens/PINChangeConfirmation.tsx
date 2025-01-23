import { View, StyleSheet } from "react-native"
import { useNavigation } from "@react-navigation/core"
import { useTranslation } from 'react-i18next'
import { testIdWithKey } from "../utils/testable"
import Button, { ButtonType } from '../components/buttons/Button'
import { useTheme } from '../contexts/theme'
import InfoBox, { InfoBoxType } from "../components/misc/InfoBox"
import KeyboardView from "../components/views/KeyboardView"
import { Screens, TabStacks } from "../types/navigators"

const PINChangeConfirmation: React.FC = () => {
    const { t } = useTranslation()
    const { ColorPallet } = useTheme()
    const navigation = useNavigation()

    const style = StyleSheet.create({
        buttonContainer: {
            width: '100%',
        },
        screenContainer: {
            height: '100%',
            backgroundColor: ColorPallet.brand.primaryBackground,
            padding: 20,
            paddingTop: 40,
            justifyContent: 'space-between',
          },
    })
    
    return (
        <KeyboardView>
            <View style={style.screenContainer}>
                <InfoBox 
                    notificationType={InfoBoxType.Success}
                    description={t('PINChangeConfirmation.AlertSubText')}
                    title={t('PINChangeConfirmation.AlertTitle')}
                />
                <View style={[style.buttonContainer, { marginTop: 10 }]}>
                    <Button
                        title={t('PINChangeConfirmation.PrimaryCta')}
                        buttonType={ButtonType.Primary}
                        testID={testIdWithKey('PINChangeConfirmation.PrimaryCta')}
                        accessibilityLabel={t('PINChangeConfirmation.PrimaryCta')}
                        onPress={() => {
                            navigation.getParent()?.navigate(TabStacks.HomeStack, { screen: Screens.Home })
                        }}       
                    />
                </View>
            </View>
        </KeyboardView>
    )
}



export default PINChangeConfirmation