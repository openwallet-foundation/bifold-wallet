import { Locales } from "localization";
import { PINSecurityParams } from "./security";
import { SettingSection } from "./settings";
import { Agent } from "@credo-ts/core";
import { StackNavigationOptions } from "@react-navigation/stack";
interface PushNotificationConfiguration {
    // function to get the current push notification permission status
    status: () => Promise<'denied' | 'granted' | 'unknown'>
    // function to request permission for push notifications
    setup: () => Promise<'denied' | 'granted' | 'unknown'>
    //function to call when the user changes the push notification setting
    toggle: (state: boolean, agent: Agent<any>) => Promise<void>
}
export interface Config {
    PINSecurity: PINSecurityParams,
    proofTemplateBaseUrl?: string,
    settings: SettingSection[]
    supportedLanguages: Locales[]
    connectionTimerDelay?: number
    autoRedirectConnectionToHome?: boolean
    enableTours?: boolean
    enableImplicitInvitations?: boolean
    enableReuseConnections?: boolean
    showPreface?: boolean
    disableOnboardingSkip?: boolean
    enablePushNotifications?: PushNotificationConfiguration
    whereToUseWalletUrl?: string
    showScanHelp?: boolean
    showScanButton?: boolean
    globalScreenOptions?: StackNavigationOptions
    showDetailsInfo?: boolean
    contactHideList?: string[]
    credentialHideList?: string[]
}