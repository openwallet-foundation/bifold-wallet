import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { DispatchAction } from '../../contexts/reducers/store'
import { useStore } from '../../contexts/store'
import { useTheme } from '../../contexts/theme'
import { testIdWithKey } from '../../utils/testable'
import { ThemedText } from '../texts/ThemedText'

export interface BannerMessage {
  id: string
  title: string
  type: 'error' | 'warning' | 'info' | 'success'
  variant: 'summary' | 'detail'
  dismissible?: boolean
}

export interface BannerSectionProps extends BannerMessage {
  expanded?: boolean
  onDismiss?: () => void
  onToggle?: () => void
}

export const Banner: React.FC = () => {
  const { t } = useTranslation()
  const { ColorPallet } = useTheme()
  const [store, dispatch] = useStore()
  const [expanded, setExpanded] = useState(false)

  const bannerMessages = store.preferences.bannerMessages
  const alertMessage: BannerMessage = {
    id: 'alertMessage',
    title: t('Banner.AlertsLength', { alerts: bannerMessages.length }),
    type: 'error',
    variant: 'summary',
  }

  const dismissBanner = (key: string) => {
    dispatch({
      type: DispatchAction.REMOVE_BANNER_MESSAGE,
      payload: [key],
    })
  }

  if (!bannerMessages || bannerMessages.length == 0) {
    return null
  }

  if (bannerMessages.length === 1) {
    const message = bannerMessages[0]
    return (
      <BannerSection
        id={message.id}
        key={message.id}
        title={message.title}
        type={message.type}
        variant="detail"
        onDismiss={() => dismissBanner(message.id)}
        dismissible={message.dismissible}
      />
    )
  }

  return (
    <View>
      <BannerSection
        id={alertMessage.id}
        title={t('Banner.AlertsLength', { alerts: bannerMessages.length })}
        type={alertMessage.type}
        variant={alertMessage.variant}
        expanded={expanded}
        onToggle={() => setExpanded(!expanded)}
        dismissible={alertMessage.dismissible}
      />
      {expanded &&
        bannerMessages.map((message) => (
          <React.Fragment key={message.id}>
            {/* Render a divider between the banners when multiple banners exist */}
            <View style={{ height: 2, backgroundColor: ColorPallet.brand.primaryBackground }} />
            <BannerSection
              id={message.id}
              key={message.id}
              title={message.title}
              type={message.type}
              variant="detail"
              onDismiss={() => dismissBanner(message.id)}
              dismissible={message.dismissible}
            />
          </React.Fragment>
        ))}
    </View>
  )
}

export const BannerSection: React.FC<BannerSectionProps> = ({
  title,
  type,
  onDismiss,
  dismissible = true,
  variant,
  expanded,
  onToggle,
}) => {
  const { Spacing, ColorPallet } = useTheme()
  const styles = StyleSheet.create({
    container: {
      backgroundColor: ColorPallet.brand.primary,
      flexDirection: 'row',
      alignItems: 'center',
      padding: Spacing.md,
    },
    icon: {
      marginRight: Spacing.md,
    },
  })

  const iconName = (type: string): string => {
    switch (type) {
      case 'error':
        return 'alert-circle'
      case 'warning':
        return 'alert'
      case 'info':
        return 'information'
      case 'success':
        return 'check-circle'
      default:
        return 'information'
    }
  }

  const bannerColor = (type: string): string => {
    switch (type) {
      case 'error':
        return '#CE3E39'
      case 'warning':
        return '#F8BB47'
      case 'info':
        return '#2E5DD7'
      case 'success':
        return '#42814A'
      default:
        return '#2E5DD7'
    }
  }

  // If more details are needed we might need to push the banner down to accommodate the extra information
  return (
    <TouchableOpacity
      style={{ ...styles.container, backgroundColor: bannerColor(type) }}
      testID={testIdWithKey(`button-${type}`)}
      onPress={() => {
        if (variant === 'summary' && onToggle) {
          onToggle()
        } else if (dismissible && onDismiss) {
          onDismiss()
        }
      }}
    >
      <Icon
        name={iconName(type)}
        size={24}
        color={type === 'warning' ? ColorPallet.brand.secondaryBackground : ColorPallet.grayscale.white}
        style={styles.icon}
        testID={testIdWithKey(`icon-${type}`)}
      />
      <ThemedText
        variant={'bold'}
        style={{
          color: type === 'warning' ? ColorPallet.brand.secondaryBackground : ColorPallet.grayscale.white,
          flex: 1,
        }}
        testID={testIdWithKey(`text-${type}`)}
      >
        {title}
      </ThemedText>
      {variant === 'summary' && <Icon name={expanded ? 'chevron-up' : 'chevron-down'} size={24} color="white" />}
    </TouchableOpacity>
  )
}
