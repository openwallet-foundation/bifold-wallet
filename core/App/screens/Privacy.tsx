import { useNavigation } from '@react-navigation/core'
import { StackNavigationProp } from '@react-navigation/stack'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, StyleSheet, Text, View, Linking } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import Button, { ButtonType } from '../components/buttons/Button'
import CheckBoxRow from '../components/inputs/CheckBoxRow'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { AuthenticateStackParams, Screens } from '../types/navigators'
import { testIdWithKey } from '../utils/testable'

const Privacy: React.FC = () => {
  const [, dispatch] = useStore()
  const [checked, setChecked] = useState(false)
  const { t } = useTranslation()
  const navigation = useNavigation<StackNavigationProp<AuthenticateStackParams>>()
  const { OnboardingTheme, ColorPallet, borderRadius } = useTheme()
  const onSubmitPressed = () => {
    dispatch({
      type: DispatchAction.DID_AGREE_TO_PRIVACY,
    })

    navigation.navigate(Screens.Terms)
  }
  const style = StyleSheet.create({
    container: {
      ...OnboardingTheme.container,
      margin: 10,
      flex: 1,
    },
    bodyText: {
      ...OnboardingTheme.bodyText,
      marginVertical: 5,
    },
    controls: {
      marginVertical: 15,
    },
    bold: {
      ...OnboardingTheme.bodyText,
      fontWeight: 'bold',
      marginVertical: 5,
    },
    header: {
      marginVertical: 10,
    },
    link: {
      color: ColorPallet.brand.highlight,
    },
  })
  const onBackPressed = () => {
    //TODO:(jl) goBack() does not unwind the navigation stack but rather goes
    //back to the splash screen. Needs fixing before the following code will
    //work as expected.

    // if (nav.canGoBack()) {
    //   nav.goBack()
    // }

    navigation.navigate(Screens.Onboarding)
  }

  return (
    <SafeAreaView style={[style.container]}>
      <ScrollView style={{ backgroundColor: ColorPallet.grayscale.darkGrey, padding: 10, borderRadius }}>
        <Text style={[style.bodyText, style.bold]}>Last Updated: July 1, 2022</Text>
        <Text style={style.bodyText}>
          If you download or use the Indicio, Inc. Holdr+ mobile app (“<Text style={style.bold}>App</Text>”), Indicio ("
          <Text style={style.bold}>Indicio</Text>," “<Text style={style.bold}>Company</Text>,” "
          <Text style={style.bold}>we</Text>," "<Text style={style.bold}>us</Text>," "
          <Text style={style.bold}>our</Text>") will ask to collect and store personal information about you (your “
          <Text style={style.bold}>Personal Data</Text>”) on your personal cell phone or device (“
          <Text style={style.bold}>Device</Text>”). We would not be able to offer the App to you without the ability to
          store your Personal Data in your Device. We also want to make very clear that Indicio will never collect,
          access, or store your Personal Data.
        </Text>
        <Text style={style.bodyText}>
          This document (our “<Text style={style.bold}>Privacy Policy</Text>”) explains how your Personal Data will be
          collected, stored and used. This Privacy Policy is subject to the Holdr Terms of Service (“
          <Text style={style.bold}>Terms</Text>”) available at{' '}
          <Text style={[style.bold, style.link]} onPress={() => Linking.openURL('http://google.com')}>
            [LINK]
          </Text>{' '}
          which is incorporated by reference into this Privacy Policy, and all capitalized terms (unless defined in this
          document) are defined in our Terms. If you have questions about this Privacy Policy, or have suggestions for
          how we can improve it, please contact us at [email].
        </Text>
        <Text style={style.bodyText}>
          If you do not want your Personal Data to be stored on your Device, you should not use the App.
        </Text>
        <Text style={style.bold}>⦁ Collection of Data</Text>
        <Text style={style.bodyText}>
          Indicio does not collect or store any Personal Data. All data including your Credentials, Messages, and
          Personal Data created or uploaded via the App is stored locally on your Device. As a result, we do not have
          any access to your Credentials, Messages, or Personal Data. Any Messages that you send via the messaging
          feature will also be stored locally on the recipient's Device and are end-to-end encrypted. We use a [mediator
          server] for relaying the Messages between Users. Information about your contacts is also stored locally on
          your Device. Indicio can never access, collect, or store your Credentials, Messages, Personal Data, or
          contacts.
        </Text>
        <Text style={style.bold}>⦁ Sharing of Data</Text>
        <Text style={style.bodyText}>
          Issuers and Verifiers may request Personal Data from you to provide the requested Credentials or verification
          services. Any transfer of Personal Data to an Issuer or Verifier is governed by the Issuer or Verifier's
          respective privacy policy (see Section 7: Third-Party Links), and Indicio will never have access to such
          information. You may also choose to send Messages or share Personal Data or Credentials with other third
          parties or Users via the App. Indicio does not have access to information shared with third parties and will
          never collect or store your Personal Data. As such, we will never share your Personal Data with anyone.
        </Text>
        <Text style={style.bold}>⦁ Deletion of Data</Text>
        <Text style={style.bodyText}>
          You may delete your Personal Data from your Device at anytime by [instructions].
        </Text>
        <Text style={style.bold}>⦁ No Sale or Disclosure of Personal Information</Text>
        <Text style={style.bodyText}>
          We do not sell or disclose any personal information of any consumers, as those terms are defined under the
          California Consumer Privacy Act.
        </Text>
        <Text style={style.bold}>⦁ No Discrimination</Text>
        <Text style={style.bodyText}>
          We will not discriminate against any consumer for exercising their rights under the California Consumer
          Privacy Act.
        </Text>
        <Text style={style.bold}>⦁ Cookies and Trackers</Text>
        <Text style={style.bodyText}>
          We do not use cookies or any other activity tracking tools on our App. We do not currently respond to “Do Not
          Track” or DNT browser signals or any other mechanism that automatically communicates your choice not to be
          tracked online.
        </Text>
        <Text style={style.bold}>⦁ Third-Party Links</Text>
        <Text style={style.bodyText}>
          The App may contain links to other websites or apps. Your access to and use of such linked sites is not
          governed by this Privacy Policy but, instead, is governed by the privacy policies of those third-party
          websites. We are not responsible for the Personal Data practices of such third-party websites. Please review
          the privacy policies of such sites before you disclose your Personal Data to them.
        </Text>
        <Text style={style.bold}>⦁ Children's Privacy</Text>
        <Text style={style.bodyText}>
          The App is not intended for children. We do not knowingly collect, use, sell, or share any Personal Data from
          anyone under the age of 18. If we become aware that a child under the age 18 has provide Personal Data to us,
          we will delete it.
        </Text>
        <Text style={style.bold}>⦁ Security</Text>
        <Text style={style.bodyText}>
          We are committed to protecting the privacy and confidentiality of your Personal Data. This why we do not
          collect or store any of your Personal Data.
        </Text>
        <Text style={style.bold}>⦁ Mobile Push Notifications/Alerts</Text>
        <Text style={style.bodyText}>
          With your consent, you may receive non-promotional push notifications or alerts to your Device. You can
          deactivate these messages at any time by changing the notification settings on your Device.
        </Text>
        <Text style={style.bold}>⦁ Changes to this Privacy Policy</Text>
        <Text style={style.bodyText}>
          We may change this Privacy Policy from time to time to reflect changes in our practices concerning the
          collection, use, and sharing of your Personal Data. The revised Privacy Policy will be effective immediately
          upon notification through the App. If you continue to use the the App after we make changes then you will be
          deemed to have agreed to the changes, so please check this Privacy Policy periodically for updates.
        </Text>
        <Text style={style.bold}>⦁ Contact Us</Text>
        <Text style={style.bodyText}>
          If you have any questions about this Privacy Policy, please contact us at: [insert mailing address, email
          address, phone number and/or fax number].
        </Text>
        <View style={[style.controls]}>
          <CheckBoxRow
            title={t('Terms.Attestation')}
            accessibilityLabel={t('Terms.IAgree')}
            testID={testIdWithKey('IAgree')}
            checked={checked}
            onPress={() => setChecked(!checked)}
          />
        </View>
      </ScrollView>
      <View style={[{ paddingTop: 10 }]}>
        <Button
          title={t('Global.Continue')}
          accessibilityLabel={t('Global.Continue')}
          testID={testIdWithKey('Continue')}
          disabled={!checked}
          onPress={onSubmitPressed}
          buttonType={ButtonType.Primary}
        />
      </View>
      <View style={[{ paddingTop: 10 }]}>
        <Button
          title={t('Global.Back')}
          accessibilityLabel={t('Global.Back')}
          testID={testIdWithKey('Back')}
          onPress={onBackPressed}
          buttonType={ButtonType.Secondary}
        />
      </View>
    </SafeAreaView>
  )
}

export default Privacy
