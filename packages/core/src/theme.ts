import { StyleSheet, ViewStyle } from 'react-native'
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
import {
  IChatTheme,
  IHomeTheme,
  IInputs,
  ISettingsTheme,
  ITabTheme,
  ITextTheme,
  IOnboardingTheme,
  IDialogTheme,
  ILoadingTheme,
  IPINInputTheme,
  IInlineInputMessage,
  IButtons,
  IListItems,
} from './theme.interface'

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

export interface IColorPalette {
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

export const ColorPalette: IColorPalette = {
  brand: BrandColors,
  semantic: SemanticColors,
  notification: NotificationColors,
  grayscale: GrayscaleColors,
}

/**
 * Creates a text theme based on the provided color pallet.
 *
 * @param {{ ColorPalette: IColorPalette }} theme - The theme object containing the color pallet
 * @returns {*} {ITextTheme} - The created text theme
 */
export function createTextTheme(theme: { ColorPalette: IColorPalette }): ITextTheme {
  return StyleSheet.create({
    headingOne: {
      fontSize: 38,
      fontWeight: 'bold',
      color: theme.ColorPalette.brand.text,
    },
    headingTwo: {
      fontSize: 32,
      fontWeight: 'bold',
      color: theme.ColorPalette.brand.text,
    },
    headingThree: {
      fontSize: 26,
      fontWeight: 'bold',
      color: theme.ColorPalette.brand.text,
    },
    headingFour: {
      fontSize: 21,
      fontWeight: 'bold',
      color: theme.ColorPalette.brand.text,
    },
    normal: {
      fontSize: 18,
      fontWeight: 'normal',
      color: theme.ColorPalette.brand.text,
    },
    bold: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.ColorPalette.brand.text,
    },
    label: {
      fontSize: 14,
      fontWeight: 'bold',
      color: theme.ColorPalette.brand.text,
    },
    labelTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.ColorPalette.brand.text,
    },
    labelSubtitle: {
      fontSize: 14,
      fontWeight: 'normal',
      color: theme.ColorPalette.brand.text,
    },
    labelText: {
      fontSize: 10,
      fontWeight: 'normal',
      fontStyle: 'italic',
      color: theme.ColorPalette.brand.text,
    },
    caption: {
      fontSize: 14,
      fontWeight: 'normal',
      color: theme.ColorPalette.brand.text,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.ColorPalette.brand.text,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.ColorPalette.brand.headerText,
    },
    modalNormal: {
      fontSize: 18,
      fontWeight: 'normal',
      color: theme.ColorPalette.grayscale.white,
    },
    modalTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.ColorPalette.grayscale.white,
    },
    modalHeadingOne: {
      fontSize: 38,
      color: theme.ColorPalette.grayscale.white,
      fontWeight: 'bold',
    },
    modalHeadingThree: {
      fontSize: 26,
      color: theme.ColorPalette.grayscale.white,
      fontWeight: 'bold',
    },
    popupModalText: {
      fontSize: 18,
      fontWeight: 'normal',
      color: theme.ColorPalette.grayscale.white,
    },
    settingsText: {
      fontSize: 21,
      fontWeight: 'normal',
      color: theme.ColorPalette.brand.text,
    },
    inlineErrorText: {
      fontSize: 16,
      fontWeight: 'normal',
      color: theme.ColorPalette.brand.inlineError,
    },
    inlineWarningText: {
      fontSize: 16,
      fontWeight: 'normal',
      color: theme.ColorPalette.brand.inlineWarning,
    },
  })
}
export const TextTheme = createTextTheme({ ColorPalette })

/**
 * Creates a theme for inputs based on the provided color pallet and text theme.
 *
 * @param {{ ColorPalette: IColorPalette; TextTheme: ITextTheme; borderRadius: number }} theme - The theme object containing the color pallet, text theme, and border radius
 * @returns {*} {IInputs} - The created inputs theme
 */
export function createInputsTheme(theme: {
  ColorPalette: IColorPalette
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
      backgroundColor: theme.ColorPalette.brand.primaryBackground,
      color: theme.ColorPalette.notification.infoText,
      borderWidth: 2,
      borderColor: theme.ColorPalette.brand.secondary,
    },
    singleSelectText: {
      ...theme.TextTheme.normal,
    },
    singleSelectIcon: {
      color: theme.ColorPalette.grayscale.white,
    },
    checkBoxColor: {
      color: theme.ColorPalette.brand.primary,
    },
    checkBoxText: {
      ...theme.TextTheme.normal,
    },
    inputSelected: {
      borderColor: theme.ColorPalette.brand.primary,
    },
    singleSelect: {
      padding: 12,
      borderRadius: theme.borderRadius * 2,
      backgroundColor: theme.ColorPalette.brand.secondaryBackground,
    },
  })
}
export const Inputs = createInputsTheme({ ColorPalette, TextTheme, borderRadius })

/**
 * Creates a theme for buttons based on the provided color pallet and text theme.
 *
 * @param {{ ColorPalette: IColorPalette; TextTheme: ITextTheme }} theme - The theme object containing the color pallet and text theme
 * @returns {*} {IButtons} - The created buttons theme
 */
export function createButtonsTheme(theme: { ColorPalette: IColorPalette; TextTheme: ITextTheme }): IButtons {
  const textStyles = StyleSheet.create({
    criticalText: {
      ...theme.TextTheme.bold,
      color: theme.ColorPalette.brand.buttonText,
      textAlign: 'center',
    },
    criticalTextDisabled: {
      ...theme.TextTheme.bold,
      color: theme.ColorPalette.brand.buttonText,
      textAlign: 'center',
    },
    primaryText: {
      ...theme.TextTheme.bold,
      color: theme.ColorPalette.brand.buttonText,
      textAlign: 'center',
    },
    primaryTextDisabled: {
      ...theme.TextTheme.bold,
      textAlign: 'center',
    },
    secondaryText: {
      ...theme.TextTheme.bold,
      color: theme.ColorPalette.brand.primary,
      textAlign: 'center',
    },
    secondaryTextDisabled: {
      ...theme.TextTheme.bold,
      color: theme.ColorPalette.brand.secondaryDisabled,
      textAlign: 'center',
    },
    tertiaryText: {
      ...theme.TextTheme.bold,
      color: theme.ColorPalette.brand.primary,
      textAlign: 'center',
    },
    tertiaryTextDisabled: {
      ...theme.TextTheme.bold,
      color: theme.ColorPalette.brand.tertiaryDisabled,
      textAlign: 'center',
    },
    modalCriticalText: {
      ...theme.TextTheme.bold,
      color: theme.ColorPalette.brand.buttonText,
      textAlign: 'center',
    },
    modalCriticalTextDisabled: {
      ...theme.TextTheme.bold,
      color: theme.ColorPalette.brand.buttonText,
      textAlign: 'center',
    },
    modalPrimaryText: {
      ...theme.TextTheme.bold,
      color: theme.ColorPalette.brand.buttonText,
      textAlign: 'center',
    },
    modalPrimaryTextDisabled: {
      ...theme.TextTheme.bold,
      color: theme.ColorPalette.brand.buttonText,
      textAlign: 'center',
    },
    modalSecondaryText: {
      ...theme.TextTheme.bold,
      color: theme.ColorPalette.brand.modalPrimary,
      textAlign: 'center',
    },
    modalSecondaryTextDisabled: {
      ...theme.TextTheme.bold,
      color: theme.ColorPalette.brand.secondaryDisabled,
      textAlign: 'center',
    },
    modalTertiaryText: {
      ...theme.TextTheme.bold,
      color: theme.ColorPalette.brand.modalPrimary,
      textAlign: 'center',
    },
    modalTertiaryTextDisabled: {
      ...theme.TextTheme.bold,
      color: theme.ColorPalette.brand.tertiaryDisabled,
      textAlign: 'center',
    },
  })

  const viewStyles = StyleSheet.create({
    critical: {
      padding: 16,
      borderRadius: 4,
      backgroundColor: theme.ColorPalette.brand.primary,
    },
    criticalDisabled: {
      padding: 16,
      borderRadius: 4,
      backgroundColor: theme.ColorPalette.brand.primaryDisabled,
    },
    primary: {
      padding: 16,
      borderRadius: 4,
      backgroundColor: theme.ColorPalette.brand.primary,
    },
    primaryDisabled: {
      padding: 16,
      borderRadius: 4,
      backgroundColor: theme.ColorPalette.brand.primaryDisabled,
    },
    secondary: {
      padding: 16,
      borderRadius: 4,
      borderWidth: 2,
      borderColor: theme.ColorPalette.brand.primary,
    },
    secondaryDisabled: {
      padding: 16,
      borderRadius: 4,
      borderWidth: 2,
      borderColor: theme.ColorPalette.brand.secondaryDisabled,
    },
    tertiary: {
      padding: 16,
    },
    tertiaryDisabled: {
      padding: 16,
    },
    modalCritical: {
      padding: 16,
      borderRadius: 4,
      backgroundColor: theme.ColorPalette.brand.primary,
    },
    modalCriticalDisabled: {
      padding: 16,
      borderRadius: 4,
      backgroundColor: theme.ColorPalette.brand.primaryDisabled,
    },
    modalPrimary: {
      padding: 16,
      borderRadius: 4,
      backgroundColor: theme.ColorPalette.brand.modalPrimary,
    },
    modalPrimaryDisabled: {
      padding: 16,
      borderRadius: 4,
      backgroundColor: theme.ColorPalette.brand.primaryDisabled,
    },
    modalSecondary: {
      padding: 16,
      borderRadius: 4,
      borderWidth: 2,
      borderColor: theme.ColorPalette.brand.modalPrimary,
    },
    modalSecondaryDisabled: {
      padding: 16,
      borderRadius: 4,
      borderWidth: 2,
      borderColor: theme.ColorPalette.brand.secondaryDisabled,
    },
    modalTertiary: {
      padding: 16,
    },
    modalTertiaryDisabled: {
      padding: 16,
    },
  })

  return { ...textStyles, ...viewStyles }
}
export const Buttons = createButtonsTheme({ ColorPalette, TextTheme })

/**
 * Creates a theme for list items based on the provided color pallet and text theme.
 *
 * @param {{ ColorPalette: IColorPalette; TextTheme: ITextTheme }} theme - The theme object containing the color pallet and text theme
 * @returns {*} {IListItems} - The created list items theme
 */
export function createListItemsTheme(theme: { ColorPalette: IColorPalette; TextTheme: ITextTheme }): IListItems {
  const testStyles = StyleSheet.create({
    credentialTitle: {
      ...theme.TextTheme.headingFour,
    },
    credentialDetails: {
      ...theme.TextTheme.caption,
    },
    credentialOfferTitle: {
      ...theme.TextTheme.modalHeadingThree,
      fontWeight: 'normal',
    },
    credentialOfferDetails: {
      ...theme.TextTheme.normal,
    },
    credentialIconColor: {
      color: theme.ColorPalette.notification.infoText,
    },
    contactTitle: {
      color: theme.ColorPalette.brand.text,
    },
    contactDate: {
      color: theme.ColorPalette.brand.text,
      marginTop: 10,
    },
    contactIcon: {
      color: theme.ColorPalette.grayscale.white,
    },
    recordAttributeLabel: {
      ...theme.TextTheme.bold,
    },
    recordLink: {
      color: theme.ColorPalette.brand.link,
    },
    recordAttributeText: {
      ...theme.TextTheme.normal,
    },
    proofIcon: {
      ...theme.TextTheme.headingOne,
    },
    proofError: {
      color: theme.ColorPalette.semantic.error,
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
    requestTemplateIconColor: {
      color: theme.ColorPalette.notification.infoText,
    },
    requestTemplateTitle: {
      color: theme.ColorPalette.grayscale.black,
      fontWeight: 'bold',
      fontSize: 16,
    },
    requestTemplateDetails: {
      color: theme.ColorPalette.grayscale.black,
      fontWeight: 'normal',
      fontSize: 16,
    },
    requestTemplateZkpLabel: {
      color: theme.ColorPalette.grayscale.mediumGrey,
      fontSize: 12,
    },
    requestTemplateIcon: {
      color: theme.ColorPalette.grayscale.black,
      fontSize: 36,
    },
    requestTemplateDate: {
      color: theme.ColorPalette.grayscale.mediumGrey,
      fontSize: 10,
    },
  })

  const viewStyles = StyleSheet.create({
    credentialBackground: {
      backgroundColor: theme.ColorPalette.brand.secondaryBackground,
    },
    credentialOfferBackground: {
      backgroundColor: theme.ColorPalette.brand.modalPrimaryBackground,
    },
    revoked: {
      backgroundColor: theme.ColorPalette.notification.error,
      borderColor: theme.ColorPalette.notification.errorBorder,
    },
    contactBackground: {
      backgroundColor: theme.ColorPalette.brand.secondaryBackground,
    },
    contactIconBackground: {
      backgroundColor: theme.ColorPalette.brand.primary,
    },
    recordContainer: {
      backgroundColor: theme.ColorPalette.brand.secondaryBackground,
    },
    recordBorder: {
      borderBottomColor: theme.ColorPalette.brand.primaryBackground,
    },
    emptyList: {
      ...theme.TextTheme.normal,
    },
    requestTemplateBackground: {
      backgroundColor: theme.ColorPalette.grayscale.white,
    },
  })

  return { ...testStyles, ...viewStyles }
}
export const ListItems = createListItemsTheme({ ColorPalette, TextTheme })

/**
 * Creates a theme for tabs based on the provided color pallet and text theme.
 *
 * @param {{ ColorPalette: IColorPalette; TextTheme: ITextTheme }} theme - The theme object containing the color pallet and text theme
 * @returns {*} {ITabTheme} - The created tab theme
 */
export function createTabTheme(theme: { ColorPalette: IColorPalette; TextTheme: ITextTheme }): ITabTheme {
  const textStyles = StyleSheet.create({
    tabBarTextStyle: {
      ...theme.TextTheme.labelSubtitle,
      paddingBottom: 5,
    },
    tabBarButtonIconStyle: {
      color: theme.ColorPalette.brand.headerIcon,
    },
  })

  const viewStyles = StyleSheet.create({
    tabBarStyle: {
      height: 60,
      backgroundColor: theme.ColorPalette.brand.secondaryBackground,
      shadowOffset: { width: 0, height: -3 },
      shadowRadius: 6,
      shadowColor: theme.ColorPalette.grayscale.black,
      shadowOpacity: 0.1,
      borderTopWidth: 0,
      paddingBottom: 0,
    },
    tabBarContainerStyle: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    focusTabIconStyle: {
      height: 60,
      width: 60,
      backgroundColor: theme.ColorPalette.brand.primary,
      borderRadius: 60,
      justifyContent: 'center',
      alignItems: 'center',
    },
    focusTabActiveTintColor: {
      backgroundColor: theme.ColorPalette.brand.secondary,
    },
  })

  return {
    ...textStyles,
    ...viewStyles,
    tabBarActiveTintColor: theme.ColorPalette.brand.primary,
    tabBarInactiveTintColor: theme.ColorPalette.brand.tabBarInactive,
    tabBarSecondaryBackgroundColor: theme.ColorPalette.brand.secondaryBackground,
  }
}
export const TabTheme = createTabTheme({ ColorPalette, TextTheme })

/**
 * Creates a navigation theme based on the provided color pallet.
 *
 * @param {{ ColorPalette: IColorPalette }} theme - The theme object containing the color pallet
 * @returns {*} {INavigationTheme} - The created navigation theme
 */
export function createNavigationTheme(theme: { ColorPalette: IColorPalette }) {
  return {
    dark: true,
    colors: {
      primary: theme.ColorPalette.brand.primary,
      background: theme.ColorPalette.brand.primaryBackground,
      card: theme.ColorPalette.brand.primary,
      text: theme.ColorPalette.grayscale.white,
      border: theme.ColorPalette.grayscale.white,
      notification: theme.ColorPalette.grayscale.white,
    },
  }
}
export type INavigationTheme = ReturnType<typeof createNavigationTheme>
export const NavigationTheme = createNavigationTheme({ ColorPalette })

/**
 * Creates a home theme based on the provided color pallet and text theme.
 *
 * @param {{ ColorPalette: IColorPalette; TextTheme: ITextTheme }} theme - The theme object containing the color pallet and text theme
 * @returns {*} {IHomeTheme} - The created home theme
 */
export function createHomeTheme(theme: { ColorPalette: IColorPalette; TextTheme: ITextTheme }): IHomeTheme {
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
      color: theme.ColorPalette.notification.infoText,
    },
    link: {
      ...theme.TextTheme.normal,
      color: theme.ColorPalette.brand.link,
    },
  })
}
export const HomeTheme = createHomeTheme({ ColorPalette, TextTheme })

/**
 * Creates a settings theme based on the provided color pallet and text theme.
 *
 * @param {{ ColorPalette: IColorPalette; TextTheme: ITextTheme }} theme - The theme object containing the color pallet and text theme
 * @returns {*} {ISettingsTheme} - The created settings theme
 */
export function createSettingsTheme(theme: { ColorPalette: IColorPalette; TextTheme: ITextTheme }): ISettingsTheme {
  const settingsTheme = StyleSheet.create({
    groupHeader: {
      ...theme.TextTheme.normal,
      marginBottom: 8,
    },
    text: {
      ...theme.TextTheme.caption,
      color: theme.ColorPalette.grayscale.white,
    },
  })

  return {
    ...settingsTheme,
    groupBackground: theme.ColorPalette.brand.secondaryBackground,
    iconColor: theme.ColorPalette.brand.text,
  }
}
export const SettingsTheme = createSettingsTheme({ ColorPalette, TextTheme })

/**
 * Creates a chat theme based on the provided color pallet and text theme.
 *
 * @param {{ ColorPalette: IColorPalette; TextTheme: ITextTheme }} theme - The theme object containing the color pallet and text theme
 * @returns {*} {IChatTheme} - The created chat theme
 */
export function createChatTheme(theme: { ColorPalette: IColorPalette; TextTheme: ITextTheme }): IChatTheme {
  const textStyles = StyleSheet.create({
    timeStyleLeft: {
      color: theme.ColorPalette.grayscale.lightGrey,
      fontSize: 12,
      marginTop: 8,
    },
    timeStyleRight: {
      color: theme.ColorPalette.grayscale.lightGrey,
      fontSize: 12,
      marginTop: 8,
    },
    leftText: {
      color: theme.ColorPalette.brand.secondary,
      fontSize: theme.TextTheme.normal.fontSize,
    },
    leftTextHighlighted: {
      ...theme.TextTheme.bold,
      color: theme.ColorPalette.brand.secondary,
    },
    rightText: {
      color: theme.ColorPalette.brand.secondary,
      fontSize: theme.TextTheme.normal.fontSize,
    },
    rightTextHighlighted: {
      ...theme.TextTheme.bold,
      color: theme.ColorPalette.brand.secondary,
    },
    inputText: {
      lineHeight: undefined,
      fontWeight: '500',
      fontSize: theme.TextTheme.normal.fontSize,
    },
    openButtonTextStyle: {
      fontSize: theme.TextTheme.normal.fontSize,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    documentIcon: {
      color: theme.ColorPalette.grayscale.white,
    },
  })

  const viewStyles = StyleSheet.create({
    containerStyle: {
      marginBottom: 16,
      marginLeft: 16,
      marginRight: 16,
      flexDirection: 'column',
      alignItems: 'flex-start',
      alignSelf: 'flex-end',
    },
    leftBubble: {
      backgroundColor: theme.ColorPalette.brand.secondaryBackground,
      borderRadius: 4,
      padding: 16,
      marginLeft: 16,
    },
    rightBubble: {
      backgroundColor: theme.ColorPalette.brand.primaryLight,
      borderRadius: 4,
      padding: 16,
      marginRight: 16,
    },
    sendContainer: {
      marginBottom: 4,
      paddingHorizontal: 4,
      justifyContent: 'center',
    },
    openButtonStyle: {
      borderRadius: 32,
      backgroundColor: theme.ColorPalette.brand.primary,
      paddingTop: 8,
      paddingBottom: 8,
      paddingLeft: 16,
      paddingRight: 16,
      marginTop: 16,
    },
    documentIconContainer: {
      backgroundColor: theme.ColorPalette.brand.primary,
      alignSelf: 'flex-start',
      borderRadius: 4,
      marginBottom: 16,
      justifyContent: 'center',
      alignItems: 'center',
      width: 50,
      height: 50,
    },
    inputToolbar: {
      backgroundColor: theme.ColorPalette.brand.secondary,
      shadowColor: theme.ColorPalette.brand.primaryDisabled,
      borderRadius: 10,
    },
  })

  return {
    ...textStyles,
    ...viewStyles,
    placeholderText: theme.ColorPalette.grayscale.lightGrey,
    sendEnabled: theme.ColorPalette.brand.primary,
    sendDisabled: theme.ColorPalette.brand.primaryDisabled,
    options: theme.ColorPalette.brand.primary,
    optionsText: theme.ColorPalette.grayscale.black,
  }
}
export const ChatTheme = createChatTheme({ ColorPalette, TextTheme })

/**
 * Creates an onboarding theme based on the provided color pallet and text theme.
 *
 * @param {{ ColorPalette: IColorPalette; TextTheme: ITextTheme }} theme - The theme object containing the color pallet and text theme
 * @returns {*} {IOnboardingTheme} - The created onboarding theme
 */
export function createOnboardingTheme(theme: { ColorPalette: IColorPalette; TextTheme: ITextTheme }): IOnboardingTheme {
  const textStyles = StyleSheet.create({
    pagerDot: {
      borderColor: theme.ColorPalette.brand.primary,
    },
    pagerDotActive: {
      color: theme.ColorPalette.brand.primary,
    },
    pagerDotInactive: {
      color: theme.ColorPalette.brand.secondary,
    },
    pagerNavigationButton: {
      color: theme.ColorPalette.brand.primary,
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

  const viewStyles = StyleSheet.create({
    container: {
      backgroundColor: theme.ColorPalette.brand.primaryBackground,
    },
    carouselContainer: {
      backgroundColor: theme.ColorPalette.brand.primaryBackground,
    },
  })

  return {
    ...textStyles,
    ...viewStyles,
    headerTintColor: ColorPalette.grayscale.white,
    imageDisplayOptions: {
      fill: ColorPalette.notification.infoText,
    },
  }
}
export const OnboardingTheme = createOnboardingTheme({ ColorPalette, TextTheme })

/**
 * Creates a dialog theme based on the provided color pallet.
 *
 * @param {{ ColorPalette: IColorPalette }} theme - The theme object containing the color pallet
 * @returns {*} {IDialogTheme} - The created dialog theme
 */
export function createDialogTheme(theme: { ColorPalette: IColorPalette }): IDialogTheme {
  return StyleSheet.create({
    modalView: {
      backgroundColor: theme.ColorPalette.brand.secondaryBackground,
    },
    titleText: {
      color: theme.ColorPalette.grayscale.white,
    },
    description: {
      color: theme.ColorPalette.grayscale.white,
    },
    closeButtonIcon: {
      color: theme.ColorPalette.grayscale.white,
    },
    carouselButtonText: {
      color: theme.ColorPalette.grayscale.white,
    },
  })
}
export const DialogTheme = createDialogTheme({ ColorPalette })

export function createLoadingTheme(theme: { ColorPalette: IColorPalette }): ILoadingTheme {
  return {
    backgroundColor: theme.ColorPalette.brand.modalPrimaryBackground,
  }
}
export const LoadingTheme = createLoadingTheme({ ColorPalette })

// NOTE: If ColorPalette or TextTheme is needed in this theme,
// we can convert this to a function like the others.
const PINEnterTheme = {
  image: {
    alignSelf: 'center',
    marginBottom: 20,
  },
}
export type IPINEnterTheme = typeof PINEnterTheme

/**
 * Creates a theme for PIN input based on the provided color pallet.
 *
 * @param {{ ColorPalette: IColorPalette }} theme - The theme object containing the color pallet
 * @returns {*} {IPINInputTheme} - The created PIN input theme
 */
export function createPINInputTheme(theme: { ColorPalette: IColorPalette }): IPINInputTheme {
  const textStyles = StyleSheet.create({
    cellText: {
      color: theme.ColorPalette.brand.text,
    },
    icon: {
      color: theme.ColorPalette.brand.headerIcon,
    },
  })

  const viewStyles = StyleSheet.create({
    cell: {
      backgroundColor: theme.ColorPalette.brand.secondaryBackground,
      borderColor: theme.ColorPalette.brand.secondary,
      borderWidth: 1,
    },
    focussedCell: {
      borderColor: theme.ColorPalette.brand.headerIcon,
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
      backgroundColor: theme.ColorPalette.brand.secondaryBackground,
      borderColor: theme.ColorPalette.brand.secondary,
      borderWidth: 1,
    },
  })

  return { ...textStyles, ...viewStyles }
}
export const PINInputTheme = createPINInputTheme({ ColorPalette })

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
  borderColor: ColorPalette.semantic.focus,
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

/**
 * Creates a theme for inline messages in inputs based on the provided text theme and assets.
 *
 * @param {{ TextTheme: ITextTheme; Assets: IAssets }} theme - The theme object containing the text theme and assets
 * @return {*} {IInlineInputMessage} - The created inline input message theme
 */
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
  ColorPalette: IColorPalette
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
  ColorPalette,
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

// Backwards compatible exports
export type {
  ITextTheme,
  IInlineInputMessage,
  IInputs,
  IButtons,
  IListItems,
  ITabTheme,
  IHomeTheme,
  ISettingsTheme,
  IChatTheme,
  IOnboardingTheme,
  IDialogTheme,
  ILoadingTheme,
  IPINInputTheme,
} from './theme.interface'
