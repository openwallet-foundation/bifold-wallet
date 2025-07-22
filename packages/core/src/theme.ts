import { ColorValue, StyleSheet, TextStyle, ViewStyle } from 'react-native'
import { SvgProps } from 'react-native-svg'

import Arrow from './assets/icons/large-arrow.svg'
import IconDelete from './assets/icons/trash.svg'
import IconEdit from './assets/icons/pencil.svg'
import IconCode from './assets/icons/code.svg'
import ActivityIndicator from './assets/img/activity-indicator-circle.svg'
import AppLockout from './assets/img/app-lockout.svg'
import Biometrics from './assets/img/biometrics.svg'
import ContactBook from './assets/img/contact-book.svg'
import CredentialDeclined from './assets/img/credential-declined.svg'
import DeleteNotification from './assets/img/delete-notification.svg'
import EmptyWallet from './assets/img/empty-wallet.svg'
import IconCredentialOfferDark from './assets/img/icon-credential-offer-dark.svg'
import IconCredentialOfferLight from './assets/img/icon-credential-offer-light.svg'
import IconInfoRecievedDark from './assets/img/icon-info-recieved-dark.svg'
import IconInfoRecievedLight from './assets/img/icon-info-recieved-light.svg'
import IconInfoSentDark from './assets/img/icon-info-sent-dark.svg'
import IconInfoSentLight from './assets/img/icon-info-sent-light.svg'
import IconProofRequestDark from './assets/img/icon-proof-request-dark.svg'
import IconProofRequestLight from './assets/img/icon-proof-request-light.svg'
import Logo from './assets/img/logo.svg'
import NoInfoShared from './assets/img/no_information_shared.svg'
import Preface from './assets/img/preface.svg'
import UpdateAvailable from './assets/img/update-available.svg'
import ProofRequestDeclined from './assets/img/proof-declined.svg'
import VerifierRequestDeclined from './assets/img/verifier-request-declined.svg'
import Wallet from './assets/img/wallet.svg'
import CheckInCircle from './assets/img/check-in-circle.svg'
import CredentialCard from './assets/img/credential-card.svg'
import WalletBack from './assets/img/wallet-back.svg'
import WalletFront from './assets/img/wallet-front.svg'
import CredentialInHand from './assets/img/credential-in-hand.svg'
import CredentialList from './assets/img/credential-list.svg'
import ScanShare from './assets/img/scan-share.svg'
import SecureCheck from './assets/img/secure-check.svg'
import SecureImage from './assets/img/secure-image.svg'
import InformationReceived from './assets/img/information-received.svg'
import PushNotificationImg from './assets/img/push-notifications.svg'
import ChatLoading from './assets/img/chat-loading.svg'
import HistoryCardAcceptedIcon from './assets/img/HistoryCardAcceptedIcon.svg'
import HistoryCardExpiredIcon from './assets/img/HistoryCardExpiredIcon.svg'
import HistoryCardRevokedIcon from './assets/img/HistoryCardRevokedIcon.svg'
import HistoryInformationSentIcon from './assets/img/HistoryInformationSentIcon.svg'
import HistoryPinUpdatedIcon from './assets/img/HistoryPinUpdatedIcon.svg'
import IconChevronRight from './assets/img/IconChevronRight.svg'
import HomeCenterImg from './assets/img/home-center-img.svg'
import IconWarning from './assets/img/exclamation-mark.svg'
import IconError from './assets/img/error-filled.svg'
import TabOneFocusedIcon from './assets/img/message-text-icon.svg'
import TabOneIcon from './assets/img/message-text-icon-outline.svg'
import TabTwoIcon from './assets/img/qrcode-scan-icon.svg'
import TabThreeFocusedIcon from './assets/img/wallet-icon.svg'
import TabThreeIcon from './assets/img/wallet-icon-outline.svg'
import React from 'react'

export interface ISVGAssets {
  activityIndicator: React.FC<SvgProps>
  appLockout: React.FC<SvgProps>
  biometrics: React.FC<SvgProps>
  contactBook: React.FC<SvgProps>
  credentialDeclined: React.FC<SvgProps>
  deleteNotification: React.FC<SvgProps>
  emptyWallet: React.FC<SvgProps>
  logo: React.FC<SvgProps>
  proofRequestDeclined: React.FC<SvgProps>
  arrow: React.FC<SvgProps>
  iconCredentialOfferDark: React.FC<SvgProps>
  iconCredentialOfferLight: React.FC<SvgProps>
  iconInfoRecievedDark: React.FC<SvgProps>
  iconInfoRecievedLight: React.FC<SvgProps>
  iconInfoSentDark: React.FC<SvgProps>
  iconInfoSentLight: React.FC<SvgProps>
  iconProofRequestDark: React.FC<SvgProps>
  iconProofRequestLight: React.FC<SvgProps>
  preface: React.FC<SvgProps>
  updateAvailable: React.FC<SvgProps>
  verifierRequestDeclined: React.FC<SvgProps>
  noInfoShared: React.FC<SvgProps>
  wallet: React.FC<SvgProps>
  checkInCircle: React.FC<SvgProps>
  credentialCard: React.FC<SvgProps>
  walletBack: React.FC<SvgProps>
  walletFront: React.FC<SvgProps>
  credentialInHand: React.FC<SvgProps>
  credentialList: React.FC<SvgProps>
  scanShare: React.FC<SvgProps>
  secureCheck: React.FC<SvgProps>
  secureImage: React.FC<SvgProps>
  informationReceived: React.FC<SvgProps>
  pushNotificationImg: React.FC<SvgProps>
  chatLoading: React.FC<SvgProps>
  historyCardAcceptedIcon: React.FC<SvgProps>
  historyCardDeclinedIcon: React.FC<SvgProps>
  historyCardExpiredIcon: React.FC<SvgProps>
  historyCardRemovedIcon: React.FC<SvgProps>
  historyCardRevokedIcon: React.FC<SvgProps>
  historyCardUpdatesIcon: React.FC<SvgProps>
  historyPinUpdatedIcon: React.FC<SvgProps>
  historyInformationSentIcon: React.FC<SvgProps>
  historyInformationNotSentIcon: React.FC<SvgProps>
  historyConnectionIcon: React.FC<SvgProps>
  historyConnectionRemovedIcon: React.FC<SvgProps>
  historyActivateBiometryIcon: React.FC<SvgProps>
  historyDeactivateBiometryIcon: React.FC<SvgProps>
  iconChevronRight: React.FC<SvgProps>
  homeCenterImg: React.FC<SvgProps>
  iconDelete: React.FC<SvgProps>
  iconEdit: React.FC<SvgProps>
  iconWarning: React.FC<SvgProps>
  iconError: React.FC<SvgProps>
  iconCode: React.FC<SvgProps>
  tabOneIcon: React.FC<SvgProps>
  tabOneFocusedIcon: React.FC<SvgProps>
  tabTwoIcon: React.FC<SvgProps>
  tabThreeIcon: React.FC<SvgProps>
  tabThreeFocusedIcon: React.FC<SvgProps>
}

export interface ISpacing {
  xs: number
  sm: number
  md: number
  lg: number
  xl: number
  xxl: number
}

export interface IFontAttributes {
  fontFamily?: string
  fontStyle?: 'normal' | 'italic'
  fontSize: number
  fontWeight?: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900'
  color: string
  lineHeight?: number
}

export interface IInputAttributes {
  padding?: number
  borderRadius?: number
  fontSize?: number
  backgroundColor?: string
  color?: string
  borderWidth?: number
  borderColor?: string
}

export interface ISemanticColors {
  error: string
  success: string
  focus: string
}

export interface INotificationColors {
  success: string
  successBorder: string
  successIcon: string
  successText: string
  info: string
  infoBorder: string
  infoIcon: string
  infoText: string
  warn: string
  warnBorder: string
  warnIcon: string
  warnText: string
  error: string
  errorBorder: string
  errorIcon: string
  errorText: string
  popupOverlay: string
}

export interface IGrayscaleColors {
  black: string
  darkGrey: string
  mediumGrey: string
  lightGrey: string
  veryLightGrey: string
  white: string
}

export interface IErrorColors {
  error: string
  warning: string
}

export interface IColorPallet {
  brand: IBrandColors
  semantic: ISemanticColors
  notification: INotificationColors
  grayscale: IGrayscaleColors
}

export interface IAssets {
  svg: ISVGAssets
  img: {
    logoPrimary: any
    logoSecondary: any
  }
}

export const borderRadius = 4
export const heavyOpacity = 0.7
export const mediumOpacity = 0.5
export const lightOpacity = 0.35
export const zeroOpacity = 0.0
export const borderWidth = 2
export const maxFontSizeMultiplier = 2

const Spacing: ISpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
}

const GrayscaleColors: IGrayscaleColors = {
  black: '#000000',
  darkGrey: '#313132',
  mediumGrey: '#606060',
  lightGrey: '#D3D3D3',
  veryLightGrey: '#F2F2F2',
  white: '#FFFFFF',
}

const InlineErrorMessageColors: IErrorColors = {
  error: '#ff0000',
  warning: '#ff9000',
}

const BrandColors = {
  primary: '#42803E',
  primaryDisabled: `rgba(53, 130, 63, ${lightOpacity})`,
  secondary: '#FFFFFFFF',
  secondaryDisabled: `rgba(53, 130, 63, ${heavyOpacity})`,
  tertiary: '#FFFFFFFF',
  tertiaryDisabled: `rgba(53, 130, 63, ${heavyOpacity})`,
  primaryLight: `rgba(53, 130, 63, ${lightOpacity})`,
  highlight: '#FCBA19',
  primaryBackground: '#000000',
  secondaryBackground: '#313132',
  tertiaryBackground: '#313132',
  modalPrimary: '#42803E',
  modalSecondary: '#FFFFFFFF',
  modalTertiary: '#FFFFFFFF',
  modalPrimaryBackground: '#000000',
  modalSecondaryBackground: '#313132',
  modalTertiaryBackground: '#313132',
  modalIcon: GrayscaleColors.white,
  unorderedList: GrayscaleColors.white,
  unorderedListModal: GrayscaleColors.white,
  link: '#42803E',
  text: GrayscaleColors.white,
  icon: GrayscaleColors.white,
  headerIcon: GrayscaleColors.white,
  headerText: GrayscaleColors.white,
  buttonText: GrayscaleColors.white,
  tabBarInactive: GrayscaleColors.white,
  inlineError: InlineErrorMessageColors.error,
  inlineWarning: InlineErrorMessageColors.warning,
}
export type IBrandColors = typeof BrandColors

const SemanticColors: ISemanticColors = {
  error: '#D8292F',
  success: '#2E8540',
  focus: '#3399FF',
}

const NotificationColors: INotificationColors = {
  success: '#313132',
  successBorder: '#2E8540',
  successIcon: '#2E8540',
  successText: '#FFFFFF',
  info: '#313132',
  infoBorder: '#0099FF',
  infoIcon: '#0099FF',
  infoText: '#FFFFFF',
  warn: '#313132',
  warnBorder: '#FCBA19',
  warnIcon: '#FCBA19',
  warnText: '#FFFFFF',
  error: '#313132',
  errorBorder: '#D8292F',
  errorIcon: '#D8292F',
  errorText: '#FFFFFF',
  popupOverlay: `rgba(0, 0, 0, ${mediumOpacity})`,
}

export const ColorPallet: IColorPallet = {
  brand: BrandColors,
  semantic: SemanticColors,
  notification: NotificationColors,
  grayscale: GrayscaleColors,
}

export interface ITextTheme {
  headingOne: TextStyle
  headingTwo: TextStyle
  headingThree: TextStyle
  headingFour: TextStyle
  normal: TextStyle
  bold: TextStyle
  label: TextStyle
  labelTitle: TextStyle
  labelSubtitle: TextStyle
  labelText: TextStyle
  caption: TextStyle
  title: TextStyle
  headerTitle: TextStyle
  modalNormal: TextStyle
  modalTitle: TextStyle
  modalHeadingOne: TextStyle
  modalHeadingThree: TextStyle
  popupModalText: TextStyle
  settingsText: TextStyle
  inlineErrorText: TextStyle
  inlineWarningText: TextStyle
}

export function createTextTheme(theme: { ColorPallet: IColorPallet }): ITextTheme {
  return StyleSheet.create({
    headingOne: {
      fontSize: 38,
      fontWeight: 'bold',
      color: theme.ColorPallet.brand.text,
    },
    headingTwo: {
      fontSize: 32,
      fontWeight: 'bold',
      color: theme.ColorPallet.brand.text,
    },
    headingThree: {
      fontSize: 26,
      fontWeight: 'bold',
      color: theme.ColorPallet.brand.text,
    },
    headingFour: {
      fontSize: 21,
      fontWeight: 'bold',
      color: theme.ColorPallet.brand.text,
    },
    normal: {
      fontSize: 18,
      fontWeight: 'normal',
      color: theme.ColorPallet.brand.text,
    },
    bold: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.ColorPallet.brand.text,
    },
    label: {
      fontSize: 14,
      fontWeight: 'bold',
      color: theme.ColorPallet.brand.text,
    },
    labelTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.ColorPallet.brand.text,
    },
    labelSubtitle: {
      fontSize: 14,
      fontWeight: 'normal',
      color: theme.ColorPallet.brand.text,
    },
    labelText: {
      fontSize: 10,
      fontWeight: 'normal',
      fontStyle: 'italic',
      color: theme.ColorPallet.brand.text,
    },
    caption: {
      fontSize: 14,
      fontWeight: 'normal',
      color: theme.ColorPallet.brand.text,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.ColorPallet.brand.text,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.ColorPallet.brand.headerText,
    },
    modalNormal: {
      fontSize: 18,
      fontWeight: 'normal',
      color: theme.ColorPallet.grayscale.white,
    },
    modalTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.ColorPallet.grayscale.white,
    },
    modalHeadingOne: {
      fontSize: 38,
      fontWeight: 'bold',
      color: theme.ColorPallet.grayscale.white,
    },
    modalHeadingThree: {
      fontSize: 26,
      fontWeight: 'bold',
      color: theme.ColorPallet.grayscale.white,
    },
    popupModalText: {
      fontSize: 18,
      fontWeight: 'normal',
      color: theme.ColorPallet.grayscale.white,
    },
    settingsText: {
      fontSize: 21,
      fontWeight: 'normal',
      color: theme.ColorPallet.brand.text,
    },
    inlineErrorText: {
      fontSize: 16,
      fontWeight: 'normal',
      color: theme.ColorPallet.brand.inlineError,
    },
    inlineWarningText: {
      fontSize: 16,
      fontWeight: 'normal',
      color: theme.ColorPallet.brand.inlineWarning,
    },
  })
}
export const TextTheme = createTextTheme({ ColorPallet })

export interface IInputs {
  label: TextStyle
  textInput: TextStyle
  inputSelected: ViewStyle
  singleSelect: ViewStyle
  singleSelectText: TextStyle
  singleSelectIcon: TextStyle
  checkBoxColor: TextStyle
  checkBoxText: TextStyle
}

export function createInputsTheme(theme: {
  ColorPallet: IColorPallet
  TextTheme: ITextTheme
  borderRadius: number
}): IInputs {
  return StyleSheet.create({
    label: {
      ...theme.TextTheme.label,
    },
    textInput: {
      padding: 10,
      borderRadius,
      fontSize: 16,
      backgroundColor: theme.ColorPallet.brand.primaryBackground,
      color: theme.ColorPallet.notification.infoText,
      borderWidth: 2,
      borderColor: theme.ColorPallet.brand.secondary,
    },
    inputSelected: {
      borderColor: theme.ColorPallet.brand.primary,
    },
    singleSelect: {
      padding: 12,
      borderRadius: theme.borderRadius * 2,
      backgroundColor: theme.ColorPallet.brand.secondaryBackground,
    },
    singleSelectText: {
      ...theme.TextTheme.normal,
    },
    singleSelectIcon: {
      color: theme.ColorPallet.grayscale.white,
    },
    checkBoxColor: {
      color: theme.ColorPallet.brand.primary,
    },
    checkBoxText: {
      ...theme.TextTheme.normal,
    },
  })
}
export const Inputs = createInputsTheme({ ColorPallet, TextTheme, borderRadius })

export interface IButtons {
  critical: ViewStyle
  criticalDisabled: ViewStyle
  criticalText: TextStyle
  criticalTextDisabled: TextStyle
  primary: ViewStyle
  primaryDisabled: ViewStyle
  primaryText: TextStyle
  primaryTextDisabled: TextStyle
  secondary: ViewStyle
  secondaryDisabled: ViewStyle
  secondaryText: TextStyle
  secondaryTextDisabled: TextStyle
  tertiary: ViewStyle
  tertiaryDisabled: ViewStyle
  tertiaryText: TextStyle
  tertiaryTextDisabled: TextStyle
  modalCritical: ViewStyle
  modalCriticalDisabled: ViewStyle
  modalCriticalText: TextStyle
  modalCriticalTextDisabled: TextStyle
  modalPrimary: ViewStyle
  modalPrimaryDisabled: ViewStyle
  modalPrimaryText: TextStyle
  modalPrimaryTextDisabled: TextStyle
  modalSecondary: ViewStyle
  modalSecondaryDisabled: ViewStyle
  modalSecondaryText: TextStyle
  modalSecondaryTextDisabled: TextStyle
  modalTertiary: ViewStyle
  modalTertiaryDisabled: ViewStyle
  modalTertiaryText: TextStyle
  modalTertiaryTextDisabled: TextStyle
}

export function createButtonsTheme(theme: { ColorPallet: IColorPallet; TextTheme: ITextTheme }): IButtons {
  return StyleSheet.create({
    critical: {
      padding: 16,
      borderRadius: 4,
      backgroundColor: theme.ColorPallet.brand.primary,
    },
    criticalDisabled: {
      padding: 16,
      borderRadius: 4,
      backgroundColor: theme.ColorPallet.brand.primaryDisabled,
    },
    criticalText: {
      ...theme.TextTheme.bold,
      color: theme.ColorPallet.brand.buttonText,
      textAlign: 'center',
    },
    criticalTextDisabled: {
      ...theme.TextTheme.bold,
      color: theme.ColorPallet.brand.buttonText,
      textAlign: 'center',
    },
    primary: {
      padding: 16,
      borderRadius: 4,
      backgroundColor: theme.ColorPallet.brand.primary,
    },
    primaryDisabled: {
      padding: 16,
      borderRadius: 4,
      backgroundColor: theme.ColorPallet.brand.primaryDisabled,
    },
    primaryText: {
      ...theme.TextTheme.bold,
      color: theme.ColorPallet.brand.buttonText,
      textAlign: 'center',
    },
    primaryTextDisabled: {
      ...theme.TextTheme.bold,
      textAlign: 'center',
    },
    secondary: {
      padding: 16,
      borderRadius: 4,
      borderWidth: 2,
      borderColor: theme.ColorPallet.brand.primary,
    },
    secondaryDisabled: {
      padding: 16,
      borderRadius: 4,
      borderWidth: 2,
      borderColor: theme.ColorPallet.brand.secondaryDisabled,
    },
    secondaryText: {
      ...theme.TextTheme.bold,
      color: theme.ColorPallet.brand.primary,
      textAlign: 'center',
    },
    secondaryTextDisabled: {
      ...theme.TextTheme.bold,
      color: theme.ColorPallet.brand.secondaryDisabled,
      textAlign: 'center',
    },
    tertiary: {
      padding: 16,
    },
    tertiaryDisabled: {
      padding: 16,
    },
    tertiaryText: {
      ...theme.TextTheme.bold,
      color: theme.ColorPallet.brand.primary,
      textAlign: 'center',
    },
    tertiaryTextDisabled: {
      ...theme.TextTheme.bold,
      color: theme.ColorPallet.brand.tertiaryDisabled,
      textAlign: 'center',
    },
    modalCritical: {
      padding: 16,
      borderRadius: 4,
      backgroundColor: theme.ColorPallet.brand.primary,
    },
    modalCriticalDisabled: {
      padding: 16,
      borderRadius: 4,
      backgroundColor: theme.ColorPallet.brand.primaryDisabled,
    },
    modalCriticalText: {
      ...theme.TextTheme.bold,
      color: theme.ColorPallet.brand.buttonText,
      textAlign: 'center',
    },
    modalCriticalTextDisabled: {
      ...theme.TextTheme.bold,
      color: theme.ColorPallet.brand.buttonText,
      textAlign: 'center',
    },
    modalPrimary: {
      padding: 16,
      borderRadius: 4,
      backgroundColor: theme.ColorPallet.brand.modalPrimary,
    },
    modalPrimaryDisabled: {
      padding: 16,
      borderRadius: 4,
      backgroundColor: theme.ColorPallet.brand.primaryDisabled,
    },
    modalPrimaryText: {
      ...theme.TextTheme.bold,
      color: theme.ColorPallet.brand.buttonText,
      textAlign: 'center',
    },
    modalPrimaryTextDisabled: {
      ...theme.TextTheme.bold,
      color: theme.ColorPallet.brand.buttonText,
      textAlign: 'center',
    },
    modalSecondary: {
      padding: 16,
      borderRadius: 4,
      borderWidth: 2,
      borderColor: theme.ColorPallet.brand.modalPrimary,
    },
    modalSecondaryDisabled: {
      padding: 16,
      borderRadius: 4,
      borderWidth: 2,
      borderColor: theme.ColorPallet.brand.secondaryDisabled,
    },
    modalSecondaryText: {
      ...theme.TextTheme.bold,
      color: theme.ColorPallet.brand.modalPrimary,
      textAlign: 'center',
    },
    modalSecondaryTextDisabled: {
      ...theme.TextTheme.bold,
      color: theme.ColorPallet.brand.secondaryDisabled,
      textAlign: 'center',
    },
    modalTertiary: {
      padding: 16,
    },
    modalTertiaryDisabled: {
      padding: 16,
    },
    modalTertiaryText: {
      ...theme.TextTheme.bold,
      color: theme.ColorPallet.brand.modalPrimary,
      textAlign: 'center',
    },
    modalTertiaryTextDisabled: {
      ...theme.TextTheme.bold,
      color: theme.ColorPallet.brand.tertiaryDisabled,
      textAlign: 'center',
    },
  })
}
export const Buttons = createButtonsTheme({ ColorPallet, TextTheme })

export interface IListItems {
  credentialBackground: ViewStyle
  credentialTitle: TextStyle
  credentialDetails: TextStyle
  credentialOfferBackground: ViewStyle
  credentialOfferTitle: TextStyle
  credentialOfferDetails: TextStyle
  revoked: ViewStyle
  contactBackground: ViewStyle
  credentialIconColor: TextStyle
  contactTitle: TextStyle
  contactDate: TextStyle
  contactIconBackground: ViewStyle
  contactIcon: TextStyle
  recordAttributeLabel: TextStyle
  recordContainer: ViewStyle
  recordBorder: ViewStyle
  recordLink: TextStyle
  recordAttributeText: TextStyle
  proofIcon: TextStyle
  proofError: TextStyle
  avatarText: TextStyle
  avatarCircle: ViewStyle
  emptyList: TextStyle
  requestTemplateBackground: ViewStyle
  requestTemplateIconColor: TextStyle
  requestTemplateTitle: TextStyle
  requestTemplateDetails: TextStyle
  requestTemplateZkpLabel: TextStyle
  requestTemplateIcon: TextStyle
  requestTemplateDate: TextStyle
}

export function createListItemsTheme(theme: { ColorPallet: IColorPallet; TextTheme: ITextTheme }): IListItems {
  return StyleSheet.create({
    credentialBackground: {
      backgroundColor: theme.ColorPallet.brand.secondaryBackground,
    },
    credentialTitle: {
      ...theme.TextTheme.headingFour,
    },
    credentialDetails: {
      ...theme.TextTheme.caption,
    },
    credentialOfferBackground: {
      backgroundColor: theme.ColorPallet.brand.modalPrimaryBackground,
    },
    credentialOfferTitle: {
      ...theme.TextTheme.modalHeadingThree,
      fontWeight: 'normal',
    },
    credentialOfferDetails: {
      ...theme.TextTheme.normal,
    },
    revoked: {
      backgroundColor: theme.ColorPallet.notification.error,
      borderColor: theme.ColorPallet.notification.errorBorder,
    },
    contactBackground: {
      backgroundColor: theme.ColorPallet.brand.secondaryBackground,
    },
    credentialIconColor: {
      color: theme.ColorPallet.notification.infoText,
    },
    contactTitle: {
      color: theme.ColorPallet.brand.text,
    },
    contactDate: {
      color: theme.ColorPallet.brand.text,
      marginTop: 10,
    },
    contactIconBackground: {
      backgroundColor: theme.ColorPallet.brand.primary,
    },
    contactIcon: {
      color: theme.ColorPallet.grayscale.white,
    },
    recordAttributeLabel: {
      ...theme.TextTheme.bold,
    },
    recordContainer: {
      backgroundColor: theme.ColorPallet.brand.secondaryBackground,
    },
    recordBorder: {
      borderBottomColor: theme.ColorPallet.brand.primaryBackground,
    },
    recordLink: {
      color: theme.ColorPallet.brand.link,
    },
    recordAttributeText: {
      ...theme.TextTheme.normal,
    },
    proofIcon: {
      ...theme.TextTheme.headingOne,
    },
    proofError: {
      color: theme.ColorPallet.semantic.error,
    },
    avatarText: {
      ...theme.TextTheme.headingTwo,
      fontWeight: 'normal',
    },
    avatarCircle: {
      borderRadius: theme.TextTheme.headingTwo.fontSize,
      borderColor: theme.TextTheme.headingTwo.color,
      width: (theme.TextTheme.headingTwo.fontSize ?? 32) * 2,
      height: (theme.TextTheme.headingTwo.fontSize ?? 32) * 2,
    },
    emptyList: {
      ...theme.TextTheme.normal,
    },
    requestTemplateBackground: {
      backgroundColor: theme.ColorPallet.grayscale.white,
    },
    requestTemplateIconColor: {
      color: theme.ColorPallet.notification.infoText,
    },
    requestTemplateTitle: {
      color: theme.ColorPallet.grayscale.black,
      fontWeight: 'bold',
      fontSize: 16,
    },
    requestTemplateDetails: {
      color: theme.ColorPallet.grayscale.black,
      fontWeight: 'normal',
      fontSize: 16,
    },
    requestTemplateZkpLabel: {
      color: theme.ColorPallet.grayscale.mediumGrey,
      fontSize: 12,
    },
    requestTemplateIcon: {
      color: theme.ColorPallet.grayscale.black,
      fontSize: 36,
    },
    requestTemplateDate: {
      color: theme.ColorPallet.grayscale.mediumGrey,
      fontSize: 10,
    },
  })
}
export const ListItems = createListItemsTheme({ ColorPallet, TextTheme })

export interface ITabTheme {
  tabBarActiveTintColor: string
  tabBarInactiveTintColor: string
  tabBarSecondaryBackgroundColor: string
  tabBarStyle: ViewStyle
  tabBarContainerStyle: ViewStyle
  tabBarTextStyle: TextStyle
  tabBarButtonIconStyle: TextStyle
  focusTabIconStyle: ViewStyle
  focusTabActiveTintColor: ViewStyle
}

export function createTabTheme(theme: { ColorPallet: IColorPallet; TextTheme: ITextTheme }): ITabTheme {
  const tabTheme = StyleSheet.create({
    tabBarStyle: {
      height: 60,
      backgroundColor: theme.ColorPallet.brand.secondaryBackground,
      shadowOffset: { width: 0, height: -3 },
      shadowRadius: 6,
      shadowColor: theme.ColorPallet.grayscale.black,
      shadowOpacity: 0.1,
      borderTopWidth: 0,
      paddingBottom: 0,
    },
    tabBarContainerStyle: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    tabBarTextStyle: {
      ...theme.TextTheme.labelSubtitle,
      paddingBottom: 5,
    },
    tabBarButtonIconStyle: {
      color: theme.ColorPallet.brand.headerIcon,
    },
    focusTabIconStyle: {
      height: 60,
      width: 60,
      backgroundColor: theme.ColorPallet.brand.primary,
      borderRadius: 60,
      justifyContent: 'center',
      alignItems: 'center',
    },
    focusTabActiveTintColor: {
      backgroundColor: theme.ColorPallet.brand.secondary,
    },
  })

  return {
    ...tabTheme,
    tabBarActiveTintColor: theme.ColorPallet.brand.primary,
    tabBarInactiveTintColor: theme.ColorPallet.brand.tabBarInactive,
    tabBarSecondaryBackgroundColor: theme.ColorPallet.brand.secondaryBackground,
  }
}
export const TabTheme = createTabTheme({ ColorPallet, TextTheme })

export interface INavigationTheme {
  dark: boolean
  colors: {
    primary: string
    background: string
    card: string
    text: string
    border: string
    notification: string
  }
}

export function createNavigationTheme(theme: { ColorPallet: IColorPallet }): INavigationTheme {
  return {
    dark: true,
    colors: {
      primary: theme.ColorPallet.brand.primary,
      background: theme.ColorPallet.brand.primaryBackground,
      card: theme.ColorPallet.brand.primary,
      text: theme.ColorPallet.grayscale.white,
      border: theme.ColorPallet.grayscale.white,
      notification: theme.ColorPallet.grayscale.white,
    },
  }
}
export const NavigationTheme = createNavigationTheme({ ColorPallet })

export interface IHomeTheme {
  welcomeHeader: TextStyle
  credentialMsg: TextStyle
  notificationsHeader: TextStyle
  noNewUpdatesText: TextStyle
  link: TextStyle
}

export function createHomeTheme(theme: { ColorPallet: IColorPallet; TextTheme: ITextTheme }): IHomeTheme {
  return StyleSheet.create({
    welcomeHeader: {
      ...theme.TextTheme.headingOne,
    },
    credentialMsg: {
      ...theme.TextTheme.normal,
    },
    notificationsHeader: {
      ...theme.TextTheme.headingThree,
    },
    noNewUpdatesText: {
      ...theme.TextTheme.normal,
      color: theme.ColorPallet.notification.infoText,
    },
    link: {
      ...theme.TextTheme.normal,
      color: theme.ColorPallet.brand.link,
    },
  })
}
export const HomeTheme = createHomeTheme({ ColorPallet, TextTheme })

export interface ISettingsTheme {
  groupHeader: TextStyle
  text: TextStyle
  groupBackground: ColorValue
  iconColor: ColorValue | undefined
}

export function createSettingsTheme(theme: { ColorPallet: IColorPallet; TextTheme: ITextTheme }): ISettingsTheme {
  const settingsTheme = StyleSheet.create({
    groupHeader: {
      ...theme.TextTheme.normal,
      marginBottom: 8,
    },
    text: {
      ...theme.TextTheme.caption,
      color: theme.ColorPallet.grayscale.white,
    },
  })

  return {
    ...settingsTheme,
    groupBackground: theme.ColorPallet.brand.secondaryBackground,
    iconColor: theme.TextTheme.normal.color,
  }
}
export const SettingsTheme = createSettingsTheme({ ColorPallet, TextTheme })

export interface IChatTheme {
  containerStyle: ViewStyle
  leftBubble: ViewStyle
  rightBubble: ViewStyle
  timeStyleLeft: TextStyle
  timeStyleRight: TextStyle
  leftText: TextStyle
  leftTextHighlighted: TextStyle
  rightText: TextStyle
  rightTextHighlighted: TextStyle
  inputToolbar: ViewStyle
  inputText: TextStyle
  sendContainer: ViewStyle
  openButtonStyle: ViewStyle
  openButtonTextStyle: TextStyle
  documentIconContainer: ViewStyle
  documentIcon: TextStyle
  placeholderText: ColorValue
  sendEnabled: ColorValue
  sendDisabled: ColorValue
  options: ColorValue
  optionsText: ColorValue
}

export function createChatTheme(theme: { ColorPallet: IColorPallet; TextTheme: ITextTheme }): IChatTheme {
  const chatTheme = StyleSheet.create({
    containerStyle: {
      marginBottom: 16,
      marginLeft: 16,
      marginRight: 16,
      flexDirection: 'column',
      alignItems: 'flex-start',
      alignSelf: 'flex-end',
    },
    leftBubble: {
      backgroundColor: theme.ColorPallet.brand.secondaryBackground,
      borderRadius: 4,
      padding: 16,
      marginLeft: 16,
    },
    rightBubble: {
      backgroundColor: theme.ColorPallet.brand.primaryLight,
      borderRadius: 4,
      padding: 16,
      marginRight: 16,
    },
    timeStyleLeft: {
      color: theme.ColorPallet.grayscale.lightGrey,
      fontSize: 12,
      marginTop: 8,
    },
    timeStyleRight: {
      color: theme.ColorPallet.grayscale.lightGrey,
      fontSize: 12,
      marginTop: 8,
    },
    leftText: {
      color: theme.ColorPallet.brand.secondary,
      fontSize: TextTheme.normal.fontSize,
    },
    leftTextHighlighted: {
      ...theme.TextTheme.bold,
      color: theme.ColorPallet.brand.secondary,
    },
    rightText: {
      color: theme.ColorPallet.brand.secondary,
      fontSize: theme.TextTheme.normal.fontSize,
    },
    rightTextHighlighted: {
      ...theme.TextTheme.bold,
      color: theme.ColorPallet.brand.secondary,
    },
    inputToolbar: {
      backgroundColor: theme.ColorPallet.brand.secondary,
      shadowColor: theme.ColorPallet.brand.primaryDisabled,
      borderRadius: 10,
    },
    inputText: {
      lineHeight: undefined,
      fontWeight: '500',
      fontSize: theme.TextTheme.normal.fontSize,
    },
    sendContainer: {
      marginBottom: 4,
      paddingHorizontal: 4,
      justifyContent: 'center',
    },
    openButtonStyle: {
      borderRadius: 32,
      backgroundColor: theme.ColorPallet.brand.primary,
      paddingTop: 8,
      paddingBottom: 8,
      paddingLeft: 16,
      paddingRight: 16,
      marginTop: 16,
    },
    openButtonTextStyle: {
      fontSize: theme.TextTheme.normal.fontSize,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    documentIconContainer: {
      backgroundColor: theme.ColorPallet.brand.primary,
      alignSelf: 'flex-start',
      borderRadius: 4,
      marginBottom: 16,
      justifyContent: 'center',
      alignItems: 'center',
      width: 50,
      height: 50,
    },
    documentIcon: {
      color: theme.ColorPallet.grayscale.white,
    },
  })

  return {
    ...chatTheme,
    // TODO: Invesitigate if these are still needed.
    // Note: They are not currently used in bifold
    // extending to allow backwards compatibility.
    placeholderText: theme.ColorPallet.grayscale.lightGrey,
    sendEnabled: theme.ColorPallet.brand.primary,
    sendDisabled: theme.ColorPallet.brand.primaryDisabled,
    options: theme.ColorPallet.brand.primary,
    optionsText: theme.ColorPallet.grayscale.black,
  }
}
export const ChatTheme = createChatTheme({ ColorPallet, TextTheme })

export interface IOnboardingTheme {
  container: ViewStyle
  carouselContainer: ViewStyle
  pagerDot: ViewStyle
  pagerDotActive: TextStyle
  pagerDotInactive: TextStyle
  pagerNavigationButton: TextStyle
  headerText: TextStyle
  bodyText: TextStyle
  headerTintColor: string
  imageDisplayOptions: {
    fill: string
  }
}

export function createOnboardingTheme(theme: { ColorPallet: IColorPallet; TextTheme: ITextTheme }): IOnboardingTheme {
  const onboardingTheme = StyleSheet.create({
    container: {
      backgroundColor: theme.ColorPallet.brand.primaryBackground,
    },
    carouselContainer: {
      backgroundColor: theme.ColorPallet.brand.primaryBackground,
    },
    pagerDot: {
      borderColor: theme.ColorPallet.brand.primary,
    },
    pagerDotActive: {
      color: theme.ColorPallet.brand.primary,
    },
    pagerDotInactive: {
      color: theme.ColorPallet.brand.secondary,
    },
    pagerNavigationButton: {
      color: theme.ColorPallet.brand.primary,
      fontWeight: 'bold',
      fontSize: 18,
    },
    headerText: {
      ...theme.TextTheme.bold,
    },
    bodyText: {
      ...theme.TextTheme.normal,
    },
  })

  return {
    ...onboardingTheme,
    headerTintColor: ColorPallet.grayscale.white,
    imageDisplayOptions: {
      fill: ColorPallet.notification.infoText,
    },
  }
}
export const OnboardingTheme = createOnboardingTheme({ ColorPallet, TextTheme })

interface IDialogTheme {
  modalView: ViewStyle
  titleText: TextStyle
  description: TextStyle
  closeButtonIcon: TextStyle
  carouselButtonText: TextStyle
}

export function createDialogTheme(theme: { ColorPallet: IColorPallet }): IDialogTheme {
  return StyleSheet.create({
    modalView: {
      backgroundColor: theme.ColorPallet.brand.secondaryBackground,
    },
    titleText: {
      color: theme.ColorPallet.grayscale.white,
    },
    description: {
      color: theme.ColorPallet.grayscale.white,
    },
    closeButtonIcon: {
      color: theme.ColorPallet.grayscale.white,
    },
    carouselButtonText: {
      color: theme.ColorPallet.grayscale.white,
    },
  })
}
export const DialogTheme = createDialogTheme({ ColorPallet })

export interface ILoadingTheme {
  backgroundColor: string
}

export function createLoadingTheme(theme: { ColorPallet: IColorPallet }): ILoadingTheme {
  return {
    backgroundColor: theme.ColorPallet.brand.modalPrimaryBackground,
  }
}
export const LoadingTheme = createLoadingTheme({ ColorPallet })

// NOTE: If ColorPallet or TextTheme is needed in this theme,
// we can convert this to a function like the others.
const PINEnterTheme = {
  image: {
    alignSelf: 'center',
    marginBottom: 20,
  },
}
export type IPINEnterTheme = typeof PINEnterTheme

export interface IPINInputTheme {
  cell: ViewStyle
  focussedCell: ViewStyle
  cellText: TextStyle
  icon: TextStyle
  codeFieldRoot: ViewStyle
  labelAndFieldContainer: ViewStyle
}

export function createPINInputTheme(theme: { ColorPallet: IColorPallet }): IPINInputTheme {
  return StyleSheet.create({
    cell: {
      backgroundColor: theme.ColorPallet.brand.secondaryBackground,
      borderColor: theme.ColorPallet.brand.secondary,
      borderWidth: 1,
    },
    focussedCell: {
      borderColor: theme.ColorPallet.brand.headerIcon,
    },
    cellText: {
      color: theme.ColorPallet.brand.text,
    },
    icon: {
      color: theme.ColorPallet.brand.headerIcon,
    },
    codeFieldRoot: {
      justifyContent: 'flex-start',
      alignItems: 'center',
    },
    labelAndFieldContainer: {
      flexDirection: 'row',
      borderRadius: 5,
      paddingHorizontal: 12,
      paddingVertical: 4,
      alignItems: 'center',
      backgroundColor: theme.ColorPallet.brand.secondaryBackground,
      borderColor: theme.ColorPallet.brand.secondary,
      borderWidth: 1,
    },
  })
}
export const PINInputTheme = createPINInputTheme({ ColorPallet })

const CredentialCardShadowTheme = {
  shadowColor: '#000',
  shadowOffset: {
    width: 1,
    height: 1,
  },
  shadowOpacity: 0.3,
} satisfies ViewStyle

const SelectedCredTheme = {
  borderWidth: 5,
  borderRadius: 15,
  borderColor: ColorPallet.semantic.focus,
} satisfies ViewStyle

export const Assets = {
  svg: {
    activityIndicator: ActivityIndicator,
    appLockout: AppLockout,
    biometrics: Biometrics,
    credentialDeclined: CredentialDeclined,
    deleteNotification: DeleteNotification,
    emptyWallet: EmptyWallet,
    contactBook: ContactBook,
    logo: Logo,
    proofRequestDeclined: ProofRequestDeclined,
    arrow: Arrow,
    iconCredentialOfferDark: IconCredentialOfferDark,
    iconCredentialOfferLight: IconCredentialOfferLight,
    iconInfoRecievedDark: IconInfoRecievedDark,
    iconInfoRecievedLight: IconInfoRecievedLight,
    iconInfoSentDark: IconInfoSentDark,
    iconInfoSentLight: IconInfoSentLight,
    iconProofRequestDark: IconProofRequestDark,
    iconProofRequestLight: IconProofRequestLight,
    preface: Preface,
    updateAvailable: UpdateAvailable,
    verifierRequestDeclined: VerifierRequestDeclined,
    noInfoShared: NoInfoShared,
    wallet: Wallet,
    checkInCircle: CheckInCircle,
    credentialCard: CredentialCard,
    walletBack: WalletBack,
    walletFront: WalletFront,
    credentialInHand: CredentialInHand,
    credentialList: CredentialList,
    scanShare: ScanShare,
    secureCheck: SecureCheck,
    secureImage: SecureImage,
    informationReceived: InformationReceived,
    pushNotificationImg: PushNotificationImg,
    chatLoading: ChatLoading,
    historyCardAcceptedIcon: HistoryCardAcceptedIcon,
    historyCardDeclinedIcon: HistoryCardRevokedIcon,
    historyCardExpiredIcon: HistoryCardExpiredIcon,
    historyCardRemovedIcon: HistoryCardRevokedIcon,
    historyCardRevokedIcon: HistoryCardRevokedIcon,
    historyCardUpdatesIcon: HistoryCardAcceptedIcon,
    historyPinUpdatedIcon: HistoryPinUpdatedIcon,
    historyInformationSentIcon: HistoryInformationSentIcon,
    historyInformationNotSentIcon: HistoryCardRevokedIcon,
    historyConnectionIcon: HistoryCardAcceptedIcon,
    historyConnectionRemovedIcon: HistoryCardRevokedIcon,
    historyActivateBiometryIcon: HistoryCardAcceptedIcon,
    historyDeactivateBiometryIcon: HistoryCardRevokedIcon,
    iconChevronRight: IconChevronRight,
    homeCenterImg: HomeCenterImg,
    iconDelete: IconDelete,
    iconEdit: IconEdit,
    iconCode: IconCode,
    iconError: IconError,
    iconWarning: IconWarning,
    tabOneIcon: TabOneIcon,
    tabOneFocusedIcon: TabOneFocusedIcon,
    tabTwoIcon: TabTwoIcon,
    tabThreeIcon: TabThreeIcon,
    tabThreeFocusedIcon: TabThreeFocusedIcon,
  },
  img: {
    logoPrimary: {
      src: require('./assets/img/logo-large.png'),
      aspectRatio: 1,
      height: '33%',
      width: '33%',
      resizeMode: 'contain',
    },
    logoSecondary: {
      src: require('./assets/img/logo-large.png'),
      aspectRatio: 1,
      height: 120,
      width: 120,
      resizeMode: 'contain',
    },
  },
}

export interface IInlineInputMessage {
  inlineErrorText: TextStyle
  InlineErrorIcon: typeof Assets.svg.iconError
  inlineWarningText: TextStyle
  InlineWarningIcon: typeof Assets.svg.iconWarning
}

export function createInputInlineMessageTheme(theme: { TextTheme: ITextTheme; Assets: IAssets }): IInlineInputMessage {
  return {
    inlineErrorText: { ...theme.TextTheme.inlineErrorText },
    InlineErrorIcon: theme.Assets.svg.iconError,
    inlineWarningText: { ...theme.TextTheme.inlineWarningText },
    InlineWarningIcon: theme.Assets.svg.iconWarning,
  }
}
export const InputInlineMessage = createInputInlineMessageTheme({ TextTheme, Assets })

export interface ITheme {
  themeName: string
  Spacing: ISpacing
  ColorPallet: IColorPallet
  TextTheme: ITextTheme
  InputInlineMessage: IInlineInputMessage
  Inputs: IInputs
  Buttons: IButtons
  ListItems: IListItems
  TabTheme: ITabTheme
  NavigationTheme: INavigationTheme
  HomeTheme: IHomeTheme
  SettingsTheme: ISettingsTheme
  ChatTheme: IChatTheme
  OnboardingTheme: IOnboardingTheme
  DialogTheme: IDialogTheme
  LoadingTheme: ILoadingTheme
  PINEnterTheme: IPINEnterTheme
  PINInputTheme: IPINInputTheme
  CredentialCardShadowTheme: ViewStyle
  SelectedCredTheme: ViewStyle
  heavyOpacity: typeof heavyOpacity
  borderRadius: typeof borderRadius
  borderWidth: typeof borderWidth
  maxFontSizeMultiplier: number
  Assets: IAssets
}

export const bifoldTheme: ITheme = {
  themeName: 'bifold',
  Spacing,
  ColorPallet,
  TextTheme,
  InputInlineMessage,
  Inputs,
  Buttons,
  ListItems,
  TabTheme,
  NavigationTheme,
  HomeTheme,
  SettingsTheme,
  ChatTheme,
  OnboardingTheme,
  DialogTheme,
  LoadingTheme,
  PINEnterTheme,
  PINInputTheme,
  CredentialCardShadowTheme,
  SelectedCredTheme,
  heavyOpacity,
  borderRadius,
  borderWidth,
  maxFontSizeMultiplier,
  Assets,
}

export const themes: ITheme[] = [bifoldTheme]
