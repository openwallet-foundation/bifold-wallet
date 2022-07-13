import { useNavigation } from '@react-navigation/core'
import { StackNavigationProp } from '@react-navigation/stack'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, StyleSheet, Text, View, Linking } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import Button, { ButtonType } from '../components/buttons/Button'
import CheckBoxRow from '../components/inputs/CheckBoxRow'
import HighlightTextBox from '../components/texts/HighlightTextBox'
import InfoTextBox from '../components/texts/InfoTextBox'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { AuthenticateStackParams, Screens } from '../types/navigators'
import { testIdWithKey } from '../utils/testable'

const Terms: React.FC = () => {
  const [, dispatch] = useStore()
  const [checked, setChecked] = useState(false)
  const { t } = useTranslation()
  const navigation = useNavigation<StackNavigationProp<AuthenticateStackParams>>()
  const { OnboardingTheme, ColorPallet, borderRadius } = useTheme()
  const onSubmitPressed = () => {
    dispatch({
      type: DispatchAction.DID_AGREE_TO_TERMS,
    })

    navigation.navigate(Screens.CreatePin)
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
    indented: {
      marginLeft: 15,
    }
  })
  const onBackPressed = () => {
    //TODO:(jl) goBack() does not unwind the navigation stack but rather goes
    //back to the splash screen. Needs fixing before the following code will
    //work as expected.

    // if (nav.canGoBack()) {
    //   nav.goBack()
    // }

    navigation.navigate(Screens.Privacy)
  }

  return (
    <SafeAreaView style={[style.container]}>
      <ScrollView style={{ backgroundColor: ColorPallet.grayscale.darkGrey, padding: 10, borderRadius }}>
        <Text style={[style.bodyText, style.bold]}>Last Updated: June 30, 2022</Text>
        <Text style={style.bodyText}>
        Please review these Terms of Use (“<Text style={style.bold}>Terms</Text>”) carefully, as they set forth the legally binding terms and conditions that govern your use and access to our mobile application, Holdr+ (the “<Text style={style.bold}>App</Text>”), including related trademarks, software code, and other intellectual property. These Terms expressly cover your rights and obligations, and our disclaimers and limitations of legal liability, relating to your use of, and access to, the App. 
        </Text>
        <Text style={style.bodyText}>
        The App is a copyrighted work belonging to Indicio, Inc. (“<Text style={style.bold}>Indicio</Text>,” “<Text style={style.bold}>Company</Text>,” “<Text style={style.bold}>us</Text>,” “<Text style={style.bold}>our</Text>,” and “<Text style={style.bold}>we</Text>”), a Delaware corporation. Your submission of information, including personally identifiable information or personal data (“<Text style={style.bold}>Personal Data</Text>”), through or in connection with the App is governed by the terms of our privacy policy as updated from time to time, available at <Text style={[style.bold, style.link]} onPress={() => Linking.openURL('mailto:support@indicio.tech')}>support@indicio.tech</Text> (“<Text style={style.bold}>Privacy Policy</Text>”). All such additional terms, guidelines, and rules, including our Privacy Policy, are incorporated by reference into these Terms.
        </Text>
        <Text style={[style.bold, style.header]}>*****</Text>
        <Text style={style.bodyText}>
        THESE TERMS SET FORTH THE LEGALLY BINDING TERMS AND CONDITIONS THAT GOVERN YOUR USE OF THE APP. BY CLICKING “I AGREE” TO THESE TERMS OR OTHERWISE ACCESSING OR USING THE APP, YOU ARE ACCEPTING THESE TERMS ON BEHALF OF YOURSELF, INCLUDING, WITHOUT LIMITATION, THE MANDATORY ARBITRATION PROVISION IN SECTION 15. IF YOU DO NOT AGREE WITH ALL OF THE PROVISIONS OF THESE TERMS, DO NOT ACCESS OR USE THE APP.
        </Text>
        <Text style={[style.bold, style.header]}>*****</Text>
        <Text style={style.bodyText}>
        Please carefully review the disclosures and disclaimers set forth in Section 13 in their entirety before using any software initially developed by Indicio. The information in Section 13 provides important details about the legal obligations associated with your use of the App. 
        </Text>
        <Text style={style.bold}>⦁ Description of the App</Text>
        <Text style={style.bodyText}>{' '} ⦁ 
        Holdr+ is a digital identity wallet (“<Text style={style.bold}>Wallet</Text>”) designed to collect and store identity credentials (the “<Text style={style.bold}>Credentials</Text>”) issued by third-party service providers or government agencies (the “<Text style={style.bold}>Issuers</Text>”). Credentials can be verified by any third-party service provider or government agency (the “<Text style={style.bold}>Verifiers</Text>”) who are interoperable with Holdr+ as a Verifier. After an Issuer issues a Credential to your Wallet, you will have the option to accept or deny such credential within your Wallet. Credentials are stored locally on your device and will not be uploaded online or backed up by Indicio. You may remove your Credentials from your Wallet at any time.
        </Text>
        <Text style={style.bodyText}>{' '} ⦁ 
        The App also allows Holdr+ users (“<Text style={style.bold}>Users</Text>”) to communicate and send private messages (“<Text style={style.bold}>Messages</Text>”) directly to other Users and Issuers they have connected with. The App encrypts your Messages before sending them and stores an encrypted copy on your mobile phone or desktop, which means that no one but you can see the message content stored on your device without your permission - not even us. 
        </Text>
        <Text style={style.bodyText}>{' '} ⦁ 
        Access to the App will, at all times, require an internet connection. In order to use the App, you must create a 6-digit PIN. All data, including your 6-digit PIN, messages, and Credentials, are stored locally on your device and not on any server held by the Company. You may be prompted by your device to accept or deny local data storage on such device. The App will ask for permission to use your device's camera for the sole purpose of scanning a QR code so that you can connect to an Issuer, Verifier, other Users. If you do not wish to grant access to your camera, you may not be able to use certain features of the App or download your Credentials. 
        </Text>
        <Text style={style.bodyText}>{' '} ⦁ 
        If your device is lost or destroyed, you forget your password, or you delete the App, you will no longer be able to access your Credentials. If you wish to reobtain such Credentials, you will need to go through the same process you went through to obtain the previous Credentials. Because the data is stored locally and is not backed up, we have no ability to facilitate recovery of your Credentials.  
        </Text>
        <Text style={style.bodyText}>{' '} ⦁ 
        You may sign out of the App at any time by closing the app.
        </Text>
        <Text style={style.bold}>⦁ Use of the App</Text>
        <Text style={style.bodyText}>{' '} ⦁ 
        As a condition to accessing or using the App, you represent and warrant to Indicio the following:
        </Text>
        <Text style={style.bodyText}>{' '} ⦁ 
        you are at least 18 years old or of legal age in the jurisdiction in which you reside and you have the legal capacity to enter into these Terms and be bound by them;
        </Text>
        <Text style={style.bodyText}>{' '} ⦁ 
        you will only download and store Credentials that belong to you and you will not attempt to download or store Credentials belonging to someone else; 
        </Text>
        <Text style={style.bodyText}>{' '} ⦁ 
        you are not a resident, national, or agent of Afghanistan, Balkans, Belarus, Burma, Cuba, Democratic Republic of Congo, Central African Republic, Ethiopia, Iran, Iraq, Lebanon, Libya, Mali, Nicaragua, North Korea, Somalia, Sudan, South Sudan, Syria, Crimea Region of Ukraine, Russia, Venezuela, Yemen or any other country to which the United States, the United Kingdom or the European Union embargoes goods or imposes similar sanctions (collectively, “<Text style={style.bold}>Restricted Territories</Text>”);
        </Text>
        <Text style={style.bodyText}>{' '} ⦁ 
        you have not been identified as a Specially Designated National or placed on any sanctions list by the U.S. Treasury Department's Office of Foreign Assets Control, the U.S. Commerce Department, or the U.S. Department of State (collectively, “<Text style={style.bold}>Sanctions Lists Persons</Text>”); and you will not use our App to conduct any illegal or illicit activity;
        </Text>
        <Text style={style.bodyText}>{' '} ⦁ 
        you do not, and will not, use VPN software or any other privacy or anonymization tools or techniques to circumvent, or attempt to circumvent, any restrictions that apply to the App; and
        </Text>
        <Text style={style.bodyText}>{' '} ⦁ 
        your access to the App is not (a) prohibited by and does not otherwise violate or assist you to violate any domestic or foreign law, rule, statute, regulation, by-law, order, protocol, code, decree, or another directive, requirement, or guideline, published or in force that applies to or is otherwise intended to govern or regulate any person, property, transaction, activity, event or other matter, including any rule, order, judgment, directive or other requirement or guideline issued by any domestic or foreign federal, provincial or state, municipal, local or other governmental, regulatory, judicial or administrative authority having jurisdiction over Indicio, you, the App, or as otherwise duly enacted, enforceable by law, the common law or equity (collectively, “<Text style={style.bold}>Applicable Laws</Text>”); or (b) contribute to or facilitate any illegal activity.
        </Text>
        <Text style={style.bold}>⦁ Fees and Price Estimates</Text>
        <Text style={style.bodyText}>{' '} ⦁ 
        We do not charge any fees for using the Holdr+ App. The Hyperledger Indy blockchain on which the App runs on requires no gas fees. Issuers and Verifiers are unaffiliated with Indicio and may separately charge their own fees outside of the App for issuing and/or verifying Credentials. 
        </Text>
        <Text style={style.bold}>⦁ Prohibited Activity</Text>
        <Text style={style.bodyText}>{' '} ⦁ 
        You may not use the App to engage in the categories of activity set forth below (“<Text style={style.bold}>Prohibited Uses</Text>”). The specific activities set forth below are representative, but not exhaustive, of Prohibited Uses. If you are uncertain as to whether or not your use of the App involves a Prohibited Use or have other questions about how these requirements apply to you, then please contact us at <Text style={[style.bold, style.link]} onPress={() => Linking.openURL('mailto:support@indicio.tech')}>support@indicio.tech</Text>. By using the App, you confirm that you will not use the App to do any of the following:
        </Text>
        <Text style={[style.bodyText, style.indented]}>{' '} ⦁ 
        use the App in any manner that could interfere with, disrupt, negatively affect, or inhibit other users from fully enjoying the App, or that could damage, disable, overburden, or impair the functioning of the App in any manner;
        </Text>
        <Text style={[style.bodyText, style.indented]}>{' '} ⦁ 
        circumvent any content-filtering techniques, security measures or access controls that Indicio employs on the App, including, without limitation, through the use of a VPN;
        </Text>
        <Text style={[style.bodyText, style.indented]}>{' '} ⦁ 
        use any robot, spider, crawler, scraper, or other automated means or interface not provided by us, to access the App or to extract data, or introduce any malware, virus, Trojan horse, worm, logic bomb, drop-dead device, backdoor, shutdown mechanism or other harmful material into the App;
        </Text>
        <Text style={[style.bodyText, style.indented]}>{' '} ⦁ 
        provide false, inaccurate, or misleading information while using the App or engage in activity that operates to defraud Indicio, Issuers, Verifiers, or other users of the App, or any other person;
        </Text>
        <Text style={[style.bodyText, style.indented]}>{' '} ⦁ 
        use or access the App to transmit or exchange plain text or Credentials that are directly or indirectly affiliated with any criminal or fraudulent activity, including, without limitation, terrorism or tax evasion;
        </Text>
        <Text style={[style.bodyText, style.indented]}>{' '} ⦁ 
        use the App in any way that is, in our sole discretion, libelous, defamatory, profane, obscene, pornographic, sexually explicit, indecent, lewd, vulgar, suggestive, harassing, stalking, hateful, threatening, offensive, discriminatory, bigoted, abusive, inflammatory, fraudulent, deceptive, or otherwise objectionable or likely or intended to incite, threaten, facilitate, promote, or encourage hate, racial intolerance, or violent acts against others;
        </Text>
        <Text style={[style.bodyText, style.indented]}>{' '} ⦁ 
        use the App from a jurisdiction that we have, in our sole discretion, determined is a jurisdiction where the use of the App is prohibited;
        </Text>
        <Text style={[style.bodyText, style.indented]}>{' '} ⦁ 
        harass, abuse, or harm of another person or entity, including Indicio's employees, Issuers, Verifiers, and service providers;
        </Text>
        <Text style={[style.bodyText, style.indented]}>{' '} ⦁ 
        impersonate another User of the App or otherwise misrepresent yourself; or
        </Text>
        <Text style={[style.bodyText, style.indented]}>{' '} ⦁ 
        encourage, induce or assist any third party, or yourself attempt, to engage in any of the activities prohibited under this Section 4 or any other provision of these Terms.
        </Text>
        <Text style={style.bold}>⦁ Proprietary Rights</Text>
        <Text style={style.bodyText}>{' '} ⦁ 
        Subject to these Terms, Indicio grants you a non-transferable, non-exclusive, revocable, limited license to use and access the App for your own personal and noncommercial use.
        </Text>
        <Text style={style.bodyText}>{' '} ⦁ 
        The rights granted to you in these Terms are subject to the following restrictions: (a) you shall not license, sell, rent, lease, transfer, assign, distribute, host, or otherwise commercially exploit the App, whether in whole or in part, or any content displayed on the App; (b) you shall not (directly or indirectly) modify, decipher, disassemble, reverse compile or reverse engineer or otherwise attempt to derive any source code or underlying ideas or algorithms of any part of the App; (c) you shall not access the App in order to build a similar or competitive app, product, or service; (d) translate, or otherwise create derivative works of any part of the App; (e) rent, lease, distribute, or otherwise transfer any of the rights that you receive hereunder; (f) frame or mirror any part of the App without Indicio's express prior written consent; (g) create a database by systematically downloading and storing App content; (h) use any robot, spider, search/retrieval application or other manual or automatic device to retrieve, harvest, index, “scrape,” “data mine” or in any way gather App or reproduce or circumvent the navigational structure or presentation of the App without Indicio's express prior written consent; and (i)  except as expressly stated herein, no part of the App may be copied, reproduced, distributed, republished, downloaded, displayed, posted or transmitted in any form or by any means. Unless otherwise indicated, any future release, update, or other addition to functionality of the App shall be subject to these Terms.
        </Text>
        <Text style={style.bodyText}>{' '} ⦁ 
        Indicio reserves the right, at any time, to modify, suspend, or discontinue the App (in whole or in part) with or without notice to you.  You agree that Indicio will not be liable to you or to any third party for any modification, suspension, or discontinuation of the App, or any part thereof.
        </Text>
        <Text style={style.bodyText}>{' '} ⦁ 
        You acknowledge and agree that Indicio will have no obligation to provide you with any support or maintenance in connection with the App.
        </Text>
        <Text style={style.bodyText}>{' '} ⦁ 
        You acknowledge that all the intellectual property rights, including copyrights, patents, trademarks, and trade secrets, in the App and its content are owned by Indicio.  Neither these Terms (nor your access to the App) transfers to you or any third party any rights, title or interest in or to such intellectual property rights, except for the limited access rights expressly set forth in these Terms. Indicio and its suppliers reserve all rights not granted in these Terms. There are no implied licenses granted under these Terms.
        </Text>
        <Text style={style.bold}>⦁ Apple Store Terms and Conditions</Text>
        <Text style={style.bodyText}>{' '} ⦁ 
        If you downloaded the App from the Apple App Store, the following terms also apply to you:
        </Text>
        <Text style={[style.bodyText, style.indented]}>{' '} ⦁ 
        <Text style={style.bold}>Acknowledgement:</Text> You acknowledge that these Terms are between you and Indicio only, and not with Apple; and Indicio, not Apple, is solely responsible for the App and the content thereof.
        </Text>
        <Text style={[style.bodyText, style.indented]}>{' '} ⦁ 
        <Text style={style.bold}>Scope of License:</Text> The license granted to you for the App is a limited, non-transferable license to use the App on a Mac product that you own or control and as permitted by the Usage Rules set forth in the terms of service applicable to the Mac App Store.
        </Text>
        <Text style={[style.bodyText, style.indented]}>{' '} ⦁ 
        <Text style={style.bold}>Maintenance and Support:</Text> Indicio, and not Apple is solely responsible for providing any maintenance and support services, for which additional fees may apply, with respect to the App. You acknowledge that Apple has no obligation whatsoever to furnish any maintenance and support services with respect to the App.
        </Text>
        <Text style={[style.bodyText, style.indented]}>{' '} ⦁ 
        <Text style={style.bold}>Warranty:</Text> Indicio is solely responsible for any product warranties, whether express or implied by law, to the extent not effectively disclaimed. In the event of any failure of the App to conform to any applicable warranty, you may notify Apple, and Apple will refund the purchase price for the software to you. To the maximum extent permitted by applicable law, Apple will have no other warranty obligation whatsoever with respect to the App, and any other claims, losses, liabilities, damages, costs or expenses attributable to any failure to conform to any warranty will be Indicio's sole responsibility.
        </Text>
        <Text style={[style.bodyText, style.indented]}>{' '} ⦁ 
        <Text style={style.bold}>Product Claims:</Text> Indicio, not Apple, is responsible for addressing any user or third-party claims relating to the App or the user's possession and/or use of the software, including, but not limited to: (i) product liability claims; (ii) any claim that the App fail to conform to any applicable legal or regulatory requirement; and (iii) claims arising under consumer protection or similar legislation.
        </Text>
        <Text style={[style.bodyText, style.indented]}>{' '} ⦁ 
        <Text style={style.bold}>Intellectual Property Rights:</Text> You acknowledge that, in the event of any third-party claim that the App or your possession and use of the App infringes that third party's intellectual property rights, Indicio, not Apple, will be solely responsible for the investigation, defense, settlement and discharge of any such intellectual property infringement claim.
        </Text>
        <Text style={[style.bodyText, style.indented]}>{' '} ⦁ 
        <Text style={style.bold}>Legal Compliance:</Text> You represent and warrant that (i) you are not located in a country that is subject to a U.S. Government embargo, or that has been designated by the U.S. Government as a terrorist-supporting country; and (ii) you are not listed on any U.S. Government list of prohibited or restricted parties.
        </Text>
        <Text style={[style.bodyText, style.indented]}>{' '} ⦁ 
        <Text style={style.bold}>Developer Contact Info:</Text> Direct any questions, complaints or claims to: Indicio, Inc. at <Text style={[style.bold, style.link]} onPress={() => Linking.openURL('mailto:support@indicio.tech')}>support@indicio.tech</Text>.
        </Text>
        <Text style={[style.bodyText, style.indented]}>{' '} ⦁ 
        <Text style={style.bold}>Third-Party Terms of Agreement:</Text> You must comply with any applicable third-party terms of agreement when using the App.
        </Text>
        <Text style={[style.bodyText, style.indented]}>{' '} ⦁ 
        <Text style={style.bold}>Third-Party Beneficiary:</Text> You acknowledge and agree that Apple and Apple's subsidiaries are third-party beneficiaries of these Terms, and that, upon your acceptance of these Terms, Apple will have the right (and will be deemed to have accepted the right) to enforce these Terms against you as a third-party beneficiary.
        </Text>
        <Text style={style.bold}>⦁ Third-Party Links</Text>
        <Text style={style.bodyText}>{' '} ⦁ 
        Indicio may provide links to other World Wide Web or accessible Apps, applications, or resources via the App, related websites, or social media posts. You acknowledge and agree that Indicio is not responsible for the availability of such external Apps, applications or resources, and does not endorse and is not responsible or liable for any content, advertising, products, or other materials on or available from such Apps or resources. You further acknowledge and agree that Indicio shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with use of or reliance on any such content, goods, or services available on or through any such App or resource, including other Issuers and Verifiers.
        </Text>
        <Text style={style.bold}>⦁ Modification, Suspension, and Termination</Text>
        <Text style={style.bodyText}>{' '} ⦁ 
        We may, at our sole discretion, from time to time and with or without prior notice to you, modify, suspend or disable (temporarily or permanently) the App, in whole or in part, for any reason whatsoever. 
        </Text>
        <Text style={style.bodyText}>{' '} ⦁ 
        You acknowledge and agree that Indicio will have no obligation to provide you with any support or maintenance in connection with the App.
        </Text>
        <Text style={style.bodyText}>{' '} ⦁ 
        Upon termination of your access, your right to use the App will immediately cease. We will not be liable for any losses suffered by you resulting from any modification to the App or from any modification, suspension, or termination, for any reason, of your access to all or any portion of the App. 
        </Text>
        <Text style={style.bodyText}>{' '} ⦁ 
        Subject to this Section, these Terms will remain in full force and effect while you use or access the App. We may suspend or terminate use of or access to the App for any User, at any time, and for any reason in our sole discretion, including for any use of the App in violation of these Terms. Upon termination of your rights under these Terms, your right to access and use the App will terminate immediately. The following sections of these Terms will survive any termination of your access to the App, regardless of the reasons for its expiration or termination, in addition to any other provision which by law or by its nature should survive: Sections 6 through 17.
        </Text>
        <Text style={style.bold}>⦁ Accuracy of Information</Text>
        <Text style={style.bodyText}>{' '} ⦁ 
        We attempt to ensure that the information that we provide on the App is complete, accurate and current. Despite our efforts, the information on the App may occasionally be inaccurate, incomplete or out of date. We make no representation as to the completeness, accuracy or correctness of any information on the App. 
        </Text>
        <Text style={style.bold}>⦁ Risks</Text>
        <Text style={style.bodyText}>{' '} ⦁ 
        All messages and Credentials are stored locally on your device. As a result, all messages and Credentials may be permanently lost if your device is lost or destroyed, if you delete the App, or if you forget your 6-digit PIN. Messages may remain on the device of the counterparty or recipient of your messages. Indicio does not collect or store backups of messages or Credentials.
        </Text>
        <Text style={style.bodyText}>{' '} ⦁ 
        Blockchain networks and verifiable Credentials use public/private key cryptography. You alone are responsible for securing your private key(s). We do not have access to your private key(s). Losing control of your private key(s) will permanently and irreversibly deny you access to your Credentials stored in your wallet. Neither Indicio nor any other person or entity will be able to retrieve or protect your Credentials. If, for example, you lose your phone, then you will not be able to realize any value or utility from the Credentials that you may hold.
        </Text>
        <Text style={style.bodyText}>{' '} ⦁ 
        The Indicio Network is operated on the Hyperledger Indy based blockchain and remains under development, which creates technological and security risks when using the App in addition to uncertainty relating to your use of the App. 
        </Text>
        <Text style={style.bodyText}>{' '} ⦁ 
        The App remains under development, which creates technological and other risks when using or accessing the App. You acknowledge and understand that the App is subject to flaws and that you are solely responsible for evaluating any code provided by the App. These risks include, among others, an incorrect display of information on the App in the case of server errors. You acknowledge that these risks may have a material impact on your transactions using the App. This warning and others Indicio provides in these Terms in no way evidence or represent an on-going duty to alert you to all of the potential risks of using or accessing the App. You acknowledge and agree that you will access and use the App at your own risk. 
        </Text>
        <Text style={style.bodyText}>{' '} ⦁ 
        Although we intend to provide accurate and timely information on the App, the App and other information available when using the App may not always be entirely accurate, complete, or current and may also include technical inaccuracies or typographical errors. To continue to provide you with as complete and accurate information as possible, information may be changed or updated from time to time without notice, including, without limitation, information regarding our policies. Accordingly, you should verify all information before relying on it, and all decisions based on information contained on the App are your sole responsibility. 
        </Text>
        <Text style={style.bodyText}>{' '} ⦁ 
        We must comply with Applicable Law, which may require us to, upon request by government agencies, take certain actions or provide information, which may not be in your best interests. The App and your Credentials could be impacted by one or more regulatory inquiries or regulatory actions, which could impede or limit the ability of Indicio to continue to make available any portion(s) of the App which rely on any Indicio proprietary software and, thus, could impede or limit your ability to access or use the App.
        </Text>
        <Text style={style.bodyText}>{' '} ⦁ 
        You hereby acknowledge and agree that Indicio will have no responsibility or liability for, the risks set forth in this Section 10. You hereby irrevocably waive, release and discharge all claims, whether known or unknown to you, against Indicio, its affiliates, and their respective shareholders, members, directors, officers, employees, agents, and representatives, suppliers, and contractors related to any of the risks set forth in this Section 10.
        </Text>
        <Text style={style.bold}>⦁ Personal Data</Text>
        <Text style={style.bodyText}>{' '} ⦁ 
        Indicio does not collect any personally identifiable information, as further defined in our Privacy Policy. Please see our Privacy Policy, which is incorporated herein by reference and available here at indicio.tech/holdr-privacy-policy for further information about any data that is collected from you and the rights you have in respect of this.
        </Text>
        <Text style={style.bold}>⦁ Indemnification</Text>
        <Text style={style.bodyText}>{' '} ⦁ 
        You will defend, indemnify, and hold harmless Indicio, its affiliates, and its and its affiliates' respective stockholders, members, directors, officers, managers, employees, attorneys, agents, representatives, suppliers, and contractors (collectively, “<Text style={style.bold}>Indemnified Parties</Text>”) from any claim, demand, lawsuit, action, proceeding, investigation, liability, damage, loss, cost or expense, including without limitation reasonable attorneys' fees, arising out of or relating to (a) your use of, or conduct in connection with, the App; (b) your violation of these Terms; or (c) your infringement or misappropriation of the rights of any other person or entity. If you are obligated to indemnify any Indemnified Party, Indicio (or, at its discretion, the applicable Indemnified Party) will have the right, in its sole discretion, to control any action or proceeding and to determine whether Indicio wishes to settle, and if so, on what terms, and you agree to cooperate with Indicio in the defense.
        </Text>
        <Text style={style.bold}>⦁ Disclosures; Disclaimers</Text>
        <Text style={style.bodyText}>{' '} ⦁ 
        Indicio shall not be responsible in any way for any transactions you enter into with other users. You agree that Indicio will not be liable for any loss or damages of any sort incurred as the result of any interactions between you, Issuers, Verifiers, and other Users.
        </Text>
        <Text style={style.bodyText}>{' '} ⦁ 
        You acknowledge that your data on the App may become irretrievably lost or corrupted or temporarily unavailable due to a variety of causes, and agree that, to the maximum extent permitted under Applicable Law, we will not be liable for any loss or damage caused by denial-of-service attacks, software failures, viruses or other technologically harmful materials (including those which may infect your computer equipment), protocol changes by third-party providers, internet outages, force majeure events or other disasters, scheduled or unscheduled maintenance, or other causes either within or outside our control.
        </Text>
        <Text style={style.bodyText}>{' '} ⦁ 
        The disclaimer of implied warranties contained herein may not apply if and to the extent such warranties cannot be excluded or limited under the Applicable Law of the jurisdiction in which you reside.
        </Text>
        <Text style={style.bodyText}>{' '} ⦁ 
        THE APP IS PROVIDED ON AN “AS-IS” AND “AS AVAILABLE” BASIS, AND INDICIO (AND OUR SUPPLIERS) EXPRESSLY DISCLAIM ANY AND ALL WARRANTIES AND CONDITIONS OF ANY KIND, WHETHER EXPRESS, IMPLIED, OR STATUTORY, INCLUDING ALL WARRANTIES OR CONDITIONS OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, QUIET ENJOYMENT, ACCURACY, OR NON-INFRINGEMENT.  WE (AND OUR SUPPLIERS) MAKE NO WARRANTY THAT THE APP WILL MEET YOUR REQUIREMENTS, WILL BE AVAILABLE ON AN UNINTERRUPTED, TIMELY, SECURE, OR ERROR-FREE BASIS, OR WILL BE ACCURATE, RELIABLE, FREE OF VIRUSES OR OTHER HARMFUL CODE, COMPLETE, LEGAL, OR SAFE.  IF APPLICABLE LAW REQUIRES ANY WARRANTIES WITH RESPECT TO THE APP, ALL SUCH WARRANTIES ARE LIMITED IN DURATION TO NINETY (90) DAYS FROM THE DATE OF FIRST USE.
        </Text>
        <Text style={style.bodyText}>{' '}
        INDICIO DOES NOT ENDORSE ANY OTHER THIRD PARTY AND SHALL NOT BE RESPONSIBLE IN ANY WAY FOR ANY TRANSACTIONS YOU ENTER INTO WITH OTHER USERS. YOU AGREE THAT INDICIO WILL NOT BE LIABLE FOR ANY LOSS OR DAMAGES OF ANY SORT INCURRED AS THE RESULT OF ANY INTERACTIONS BETWEEN YOU AND OTHER USERS.
        </Text>
        <Text style={style.bodyText}>{' '}
        SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OF IMPLIED WARRANTIES, SO THE ABOVE EXCLUSION MAY NOT APPLY TO YOU.  SOME JURISDICTIONS DO NOT ALLOW LIMITATIONS ON HOW LONG AN IMPLIED WARRANTY LASTS, SO THE ABOVE LIMITATION MAY NOT APPLY TO YOU.  
        </Text>
        <Text style={style.bold}>⦁ Limitation of Liability</Text>
        <Text style={style.bodyText}>{' '} ⦁ 
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL INDICIO BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY LOST PROFITS, LOST DATA, OR ANY INDIRECT, CONSEQUENTIAL, EXEMPLARY, INCIDENTAL, SPECIAL OR PUNITIVE DAMAGES ARISING FROM OR RELATING TO THESE TERMS OR YOUR USE OF, OR INABILITY TO USE, THE APP, EVEN IF INDICIO HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.  ACCESS TO, AND USE OF, THE APP IS AT YOUR OWN DISCRETION AND RISK, AND YOU WILL BE SOLELY RESPONSIBLE FOR ANY DAMAGE TO YOUR DEVICE OR COMPUTER SYSTEM, OR LOSS OF DATA RESULTING THEREFROM.  
        </Text>
        <Text style={style.bodyText}>{' '} ⦁ 
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, NOTWITHSTANDING ANYTHING TO THE CONTRARY CONTAINED HEREIN, OUR LIABILITY TO YOU FOR ANY DAMAGES ARISING FROM OR RELATED TO THIS AGREEMENT (FOR ANY CAUSE WHATSOEVER AND REGARDLESS OF THE FORM OF THE ACTION), WILL AT ALL TIMES BE LIMITED TO A MAXIMUM OF FIFTY US DOLLARS (U.S. $50). THE EXISTENCE OF MORE THAN ONE CLAIM WILL NOT ENLARGE THIS LIMIT.
        </Text>
        <Text style={style.bodyText}>{' '} ⦁ 
        SOME JURISDICTIONS DO NOT ALLOW THE LIMITATION OR EXCLUSION OF LIABILITY FOR INCIDENTAL OR CONSEQUENTIAL DAMAGES, SO THE ABOVE LIMITATION OR EXCLUSION MAY NOT APPLY TO YOU.
        </Text>
        <Text style={style.bold}>⦁ Dispute Resolution & Arbitration</Text>
        <Text style={style.bodyText}>{' '} ⦁ 
        Please read this Arbitration Agreement carefully.  It is part of your contract with Indicio and affects your rights.  It contains procedures for mandatory binding arbitration and a class action waiver.
        </Text>
        <Text style={[style.bodyText, style.indented]}>{' '} ⦁ 
        <Text style={style.bold}>Applicability of Arbitration Agreement.</Text>  All claims and disputes (excluding claims for injunctive or other equitable relief as set forth below) between Indicio and any user that cannot be resolved informally or in small claims court shall be resolved by binding arbitration on an individual basis under the terms of this Arbitration Agreement.  Unless otherwise agreed to, all arbitration proceedings shall be held in English.  This Arbitration Agreement applies to you and Indicio, and to any subsidiaries, affiliates, agents, employees, predecessors in interest, successors, and assigns, as well as all authorized or unauthorized users or beneficiaries of services or goods provided under the Terms.
        </Text>
        <Text style={[style.bodyText, style.indented]}>{' '} ⦁ 
        <Text style={style.bold}>Notice Requirement and Informal Dispute Resolution.</Text>  Before either party may seek arbitration, the party must first send to the other party a written Notice of Dispute (“<Text style={style.bold}>Notice</Text>”) describing the nature and basis of the claim or dispute, and the requested relief.  Each party hereby irrevocably and unconditionally consents to service of process through personal service at their corporate headquarters, registered address, or primary address (for individuals or sole proprietors). Nothing in these Terms will affect the right of any party to serve process in any other manner permitted by Law. After the Notice is received, you and Indicio may attempt to resolve the claim or dispute informally.  If you and Indicio do not resolve the claim or dispute within thirty (30) days after the Notice is received, either party may begin an arbitration proceeding.  The amount of any settlement offer made by any party may not be disclosed to the arbitrator until after the arbitrator has determined the amount of the award, if any, to which either party is entitled.
        </Text>
        <Text style={[style.bodyText, style.indented]}>{' '} ⦁ 
        <Text style={style.bold}>Arbitration Rules.</Text>  Arbitration shall be initiated through the American Arbitration Association (“<Text style={style.bold}>AAA</Text>”), an established alternative dispute resolution provider (“ADR Provider”) that offers arbitration as set forth in this section.  If AAA is not available to arbitrate, the parties shall agree to select an alternative ADR Provider.  The rules of the ADR Provider shall govern all aspects of the arbitration, including but not limited to the method of initiating and/or demanding arbitration, except to the extent such rules are in conflict with the Terms.  The AAA Consumer Arbitration Rules (“<Text style={style.bold}>Arbitration Rules</Text>”) governing the arbitration are available online at <Text style={[style.bold, style.link]} onPress={() => Linking.openURL('www.adr.org')}>www.adr.org</Text> or by calling the AAA at 1-800-778-7879.  The arbitration shall be conducted by a single, neutral arbitrator.  Any claims or disputes where the total amount of the award sought is less than Ten Thousand U.S. Dollars (US $10,000.00) may be resolved through binding non-appearance-based arbitration, at the option of the party seeking relief.  For claims or disputes where the total amount of the award sought is Ten Thousand U.S. Dollars (US $10,000.00) or more, the right to a hearing will be determined by the Arbitration Rules.  Any hearing will be held in a location within 100 miles of your residence, unless you reside outside of the United States, and unless the parties agree otherwise.  If you reside outside of the U.S., the arbitrator shall give the parties reasonable notice of the date, time and place of any oral hearings. Any judgment on the award rendered by the arbitrator may be entered in any court of competent jurisdiction.  If the arbitrator grants you an award that is greater than the last settlement offer that Indicio made to you prior to the initiation of arbitration, Indicio will pay you the greater of the award or $2,500.00.  Each party shall bear its own costs (including attorney's fees) and disbursements arising out of the arbitration and shall pay an equal share of the fees and costs of the ADR Provider.
        </Text>
        <Text style={[style.bodyText, style.indented]}>{' '} ⦁ 
        <Text style={style.bold}>Additional Rules for Non-Appearance Based Arbitration.</Text>  If non-appearance based arbitration is elected, the arbitration shall be conducted by telephone, online and/or based solely on written submissions; the specific manner shall be chosen by the party initiating the arbitration.  The arbitration shall not involve any personal appearance by the parties or witnesses unless otherwise agreed by the parties.
        </Text>
        <Text style={[style.bodyText, style.indented]}>{' '} ⦁ 
        <Text style={style.bold}>Time Limits.</Text>  If you or Indicio pursue arbitration, the arbitration action must be initiated and/or demanded within the statute of limitations (i.e., the legal deadline for filing a claim) and within any deadline imposed under the AAA Rules for the pertinent claim.
        </Text>
        <Text style={[style.bodyText, style.indented]}>{' '} ⦁ 
        <Text style={style.bold}>Authority of Arbitrator.</Text>  If arbitration is initiated, the arbitrator will decide the rights and liabilities, if any, of you and Indicio, and the dispute will not be consolidated with any other matters or joined with any other cases or parties.  The arbitrator shall have the authority to grant motions dispositive of all or part of any claim.  The arbitrator shall have the authority to award monetary damages, and to grant any non-monetary remedy or relief available to an individual under applicable law, the AAA Rules, and the Terms.  The arbitrator shall issue a written award and statement of decision describing the essential findings and conclusions on which the award is based, including the calculation of any damages awarded.  The arbitrator has the same authority to award relief on an individual basis that a judge in a court of law would have.  The award of the arbitrator is final and binding upon you and Indicio.
        </Text>
        <Text style={[style.bodyText, style.indented]}>{' '} ⦁ 
        <Text style={style.bold}>Waiver of Jury Trial.</Text>  THE PARTIES HEREBY WAIVE THEIR CONSTITUTIONAL AND STATUTORY RIGHTS TO GO TO COURT AND HAVE A TRIAL IN FRONT OF A JUDGE OR A JURY, INSTEAD ELECTING THAT ALL CLAIMS AND DISPUTES SHALL BE RESOLVED BY ARBITRATION UNDER THIS ARBITRATION AGREEMENT.  ARBITRATION PROCEDURES ARE TYPICALLY MORE LIMITED, MORE EFFICIENT AND LESS COSTLY THAN RULES APPLICABLE IN A COURT AND ARE SUBJECT TO VERY LIMITED REVIEW BY A COURT.  IN THE EVENT ANY LITIGATION SHOULD ARISE BETWEEN YOU AND INDICIO IN ANY STATE OR FEDERAL COURT IN A SUIT TO VACATE OR ENFORCE AN ARBITRATION AWARD OR OTHERWISE, YOU WAIVE ALL RIGHTS TO A JURY TRIAL, INSTEAD ELECTING THAT THE DISPUTE BE RESOLVED BY A JUDGE.
        </Text>
        <Text style={[style.bodyText, style.indented]}>{' '} ⦁ 
        <Text style={style.bold}>Waiver of Class or Consolidated Actions.</Text>  ALL CLAIMS AND DISPUTES WITHIN THE SCOPE OF THIS ARBITRATION AGREEMENT MUST BE ARBITRATED OR LITIGATED ON AN INDIVIDUAL BASIS AND NOT ON A CLASS BASIS, AND CLAIMS OF MORE THAN ONE USER CANNOT BE ARBITRATED OR LITIGATED JOINTLY OR CONSOLIDATED WITH THOSE OF ANY OTHER USER.  
        </Text>
        <Text style={[style.bodyText, style.indented]}>{' '} ⦁ 
        <Text style={style.bold}>Confidentiality.</Text>  All aspects of the arbitration proceeding, including but not limited to the award of the arbitrator and compliance therewith, shall be strictly confidential.  The parties agree to maintain confidentiality unless otherwise required by law.  This paragraph shall not prevent a party from submitting to a court of law any information necessary to enforce this Agreement, to enforce an arbitration award, or to seek injunctive or equitable relief.
        </Text>
        <Text style={[style.bodyText, style.indented]}>{' '} ⦁ 
        <Text style={style.bold}>Severability.</Text>  If any part or parts of this Arbitration Agreement are found under the law to be invalid or unenforceable by a court of competent jurisdiction, then such specific part or parts shall be of no force and effect and shall be severed and the remainder of the Agreement shall continue in full force and effect.
        </Text>
        <Text style={[style.bodyText, style.indented]}>{' '} ⦁ 
        <Text style={style.bold}>Right to Waive.</Text>  Any or all of the rights and limitations set forth in this Arbitration Agreement may be waived by the party against whom the claim is asserted.  Such waiver shall not waive or affect any other portion of this Arbitration Agreement.
        </Text>
        <Text style={[style.bodyText, style.indented]}>{' '} ⦁ 
        <Text style={style.bold}>Survival of Agreement.</Text>  This Arbitration Agreement will survive the termination of your relationship with Indicio. 
        </Text>
        <Text style={[style.bodyText, style.indented]}>{' '} ⦁ 
        <Text style={style.bold}>Small Claims Court.</Text>  Notwithstanding the foregoing, either you or Indicio may bring an individual action in small claims court.
        </Text>
        <Text style={[style.bodyText, style.indented]}>{' '} ⦁ 
        <Text style={style.bold}>Emergency Equitable Relief.</Text>  Notwithstanding the foregoing, either party may seek emergency equitable relief before a state or federal court in order to maintain the status Indicio pending arbitration.  A request for interim measures shall not be deemed a waiver of any other rights or obligations under this Arbitration Agreement.
        </Text>
        <Text style={[style.bodyText, style.indented]}>{' '} ⦁ 
        <Text style={style.bold}>Claims Not Subject to Arbitration.</Text>  Notwithstanding the foregoing, claims of defamation, violation of the Computer Fraud and Abuse Act, and infringement or misappropriation of the other party's patent, copyright, trademark or trade secrets shall not be subject to this Arbitration Agreement.
        </Text>
        <Text style={[style.bodyText, style.indented]}>{' '} ⦁ 
        <Text style={style.bold}>Courts.</Text>  In any circumstances where the foregoing Arbitration Agreement permits the parties to litigate in court, the parties hereby agree to submit to the personal jurisdiction of the courts located within London, England (U.K.), for such purpose.
        </Text>
        <Text style={style.bold}>⦁ Governing Law</Text>
        <Text style={style.bodyText}>{' '} ⦁ 
        The interpretation and enforcement of these Terms, and any dispute related to these Terms or the App, will be governed by and construed and enforced under the laws of the State of Delaware, as applicable, without regard to conflict of law rules or principles (whether of the State of Delaware or any other jurisdiction) that would cause the application of the laws of any other jurisdiction. You agree that we may initiate a proceeding related to the enforcement or validity of our intellectual property rights in any court having jurisdiction. For any other proceeding that is not subject to arbitration under these Terms, the state and federal courts located in Delaware will have exclusive jurisdiction. You waive any objection to venue in any such courts.
        </Text>
        <Text style={style.bold}>⦁ General Information</Text>
        <Text style={style.bodyText}>{' '} ⦁ 
        These Terms are subject to occasional revision, and if we make any substantial changes, we may notify you by sending you an e-mail to the last e-mail address you provided to us (if any), and/or by prominently posting notice of the changes on our App. You are responsible for providing us with your most current e-mail address. In the event that the last e-mail address that you have provided us is not valid, or for any reason is not capable of delivering to you the notice described above, our dispatch of the e-mail containing such notice will nonetheless constitute effective notice of the changes described in the notice.  Any changes to these Terms will be effective one (1) day following the earlier of our dispatch of an e-mail notice to you (if applicable) or one (1) day following our posting of notice of the changes on our App. These changes will be effective immediately for new users of our App. Continued use of our App following notice of such changes shall indicate your acknowledgement of such changes and agreement to be bound by the terms and conditions of such changes.
        </Text>
        <Text style={style.bodyText}>{' '} ⦁ 
        You consent to receive all communications, agreements, documents, receipts, notices, and disclosures electronically (collectively, our “<Text style={style.bold}>Communications</Text>”) that we provide in connection with these Terms or the use of the App. You agree that we may provide our Communications to you by posting them on the App or by emailing them to you at the email address you provide in connection with using the App, if any. You should maintain copies of our Communications by printing a paper copy or saving an electronic copy. You may also contact us with questions, complaints, or claims concerning the App at <Text style={[style.bold, style.link]} onPress={() => Linking.openURL('mailto:support@indicio.tech')}>support@indicio.tech</Text>
        </Text>
        <Text style={style.bodyText}>{' '} ⦁ 
        Any right or remedy of Indicio set forth in these Terms is in addition to, and not in lieu of, any other right or remedy whether described in these Terms, under Applicable Law, at law, or in equity. The failure or delay of Indicio in exercising any right, power, or privilege under these Terms shall not operate as a waiver thereof.
        </Text>
        <Text style={style.bodyText}>{' '} ⦁ 
        The invalidity or unenforceability of any of these Terms shall not affect the validity or enforceability of any other of these Terms, all of which shall remain in full force and effect.
        </Text>
        <Text style={style.bodyText}>{' '} ⦁ 
        We will have no responsibility or liability for any failure or delay in performance of the App, or any loss or damage that you may incur, due to any circumstance or event beyond our control, including without limitation any flood, extraordinary weather conditions, earthquake, or other act of God, fire, war, insurrection, riot, labor dispute, accident, action of government, communications, power failure, or equipment or software malfunction.
        </Text>
        <Text style={style.bodyText}>{' '} ⦁ 
        You may not assign or transfer any right to use the App, or any of your rights or obligations under these Terms, without our express prior written consent, including by operation of law or in connection with any change of control. We may assign or transfer any or all of our rights or obligations under these Terms, in whole or in part, without notice or obtaining your consent or approval.
        </Text>
        <Text style={style.bodyText}>{' '} ⦁ 
        Headings of sections are for convenience only and shall not be used to limit or construe such sections.
        </Text>
        <Text style={style.bodyText}>{' '} ⦁ 
        These Terms contain the entire agreement between you and Indicio, and supersede all prior and contemporaneous understandings between the parties regarding the App.
        </Text>
        <Text style={style.bodyText}>{' '} ⦁ 
        In the event of any conflict between these Terms and any other agreement you may have with us, these Terms will control unless the other agreement specifically identifies these Terms and declares that the other agreement supersedes these Terms.
        </Text>
        <Text style={style.bodyText}>{' '} ⦁ 
        You agree that, except as otherwise expressly provided in this Agreement, there shall be no third-party beneficiaries to the Agreement other than the Indemnified Parties.
        </Text>
        <Text style={style.bodyText}>{' '} ⦁ 
        A waiver by Indicio of any right or remedy under these Terms shall only be effective if it is in writing, executed by a duly authorized representative of Indicio and shall apply only to the circumstances for which it is given. Our failure to exercise or enforce any right or remedy under these Terms shall not operate as a waiver of such right or remedy, nor shall it prevent any future exercise or enforcement of such right or remedy.  No single or partial exercise of any right or remedy shall preclude or restrict the further exercise of any such right or remedy or other rights or remedies.
        </Text>
        <Text style={style.bodyText}>{' '} ⦁ 
        Copyright © 2022 Indicio, Inc. All rights reserved.  All trademarks, logos and service marks (“<Text style={style.bold}>Marks</Text>”) displayed on the App are our property or the property of other third parties. You are not permitted to use these Marks without our prior written consent or the consent of such third party which may own the Marks.
        </Text>
        <Text style={style.bodyText}>{' '} ⦁ 
        For any questions, comments, or feedback, you may contact us at any of the following channels:
        </Text>
        <Text style={style.bodyText}>{' '} ⦁ 
        Email: <Text style={[style.bold, style.link]} onPress={() => Linking.openURL('mailto:support@indicio.tech')}>support@indicio.tech</Text>
        </Text>
        <Text style={style.bodyText}>{' '} ⦁ 
        Discord: <Text style={[style.bold, style.link]} onPress={() => Linking.openURL('https://discord.gg/pq7v6Fj3tk')}>https://discord.gg/pq7v6Fj3tk</Text>
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

export default Terms
