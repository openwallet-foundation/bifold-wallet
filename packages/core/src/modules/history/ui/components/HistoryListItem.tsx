import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

import { useTheme } from '../../../../contexts/theme'
import { testIdWithKey } from '../../../../utils/testable'
import { CustomRecord, HistoryCardType } from '../../types'
import { ThemedText } from '../../../../components/texts/ThemedText'

const cardTitleKeys: Record<HistoryCardType, string> = {
  [HistoryCardType.CardAccepted]: 'History.CardTitle.CardAccepted',
  [HistoryCardType.CardDeclined]: 'History.CardTitle.CardDeclined',
  [HistoryCardType.CardExpired]: 'History.CardTitle.CardExpired',
  [HistoryCardType.CardRemoved]: 'History.CardTitle.CardRemoved',
  [HistoryCardType.CardRevoked]: 'History.CardTitle.CardRevoked',
  [HistoryCardType.CardUpdates]: 'History.CardTitle.CardUpdates',
  [HistoryCardType.PinChanged]: 'History.CardTitle.WalletPinUpdated',
  [HistoryCardType.InformationSent]: 'History.CardTitle.InformationSent',
  [HistoryCardType.InformationNotSent]: 'History.CardTitle.InformationNotSent',
  [HistoryCardType.Connection]: 'History.CardTitle.Connection',
  [HistoryCardType.ConnectionRemoved]: 'History.CardTitle.ConnectionRemoved',
  [HistoryCardType.ActivateBiometry]: 'History.CardTitle.ActivateBiometry',
  [HistoryCardType.DeactivateBiometry]: 'History.CardTitle.DeactivateBiometry',
}

interface Props {
  item: CustomRecord
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    flexDirection: 'row',
  },
  cardContent: {
    flexDirection: 'column',
    marginHorizontal: 12,
    maxWidth: 200,
  },
  cardDescriptionContent: {
    marginTop: 5,
    marginBottom: 10,
  },
  cardDate: {
    color: '#666666',
  },
  arrowContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  cardBottomBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#A0A4AB',
  },
  historyCardRevoked: {
    color: '#D81A21',
  },
  successColor: {
    color: '#118847',
  },
  infoBox: {
    color: '#1080A6',
  },
})

const HistoryListItem: React.FC<Props> = ({ item }) => {
  const { t } = useTranslation()
  const { Assets, ColorPalette } = useTheme()
  //TODO: navigate to history details
  //   const navigation = useNavigation<StackNavigationProp<RootStackParams, 'HistoryDetails'>>()

  const renderCardSections = (item: CustomRecord) => {
    switch (item.content.type) {
      case HistoryCardType.CardAccepted: {
        return {
          icon: <Assets.svg.historyCardAcceptedIcon />,
          title: <ThemedText variant="headingThree">{t(cardTitleKeys[HistoryCardType.CardAccepted])}</ThemedText>,
          description: <ThemedText>{item.content.correspondenceName}</ThemedText>,
        }
      }
      case HistoryCardType.CardDeclined: {
        return {
          icon: <Assets.svg.historyCardDeclinedIcon />,
          title: (
            <ThemedText variant="headerTitle" style={{ color: styles.historyCardRevoked.color }}>
              {t(cardTitleKeys[HistoryCardType.CardDeclined])}
            </ThemedText>
          ),
          description: <ThemedText>{item.content.correspondenceName}</ThemedText>,
        }
      }
      case HistoryCardType.CardExpired: {
        return {
          icon: <Assets.svg.historyCardExpiredIcon />,
          title: <ThemedText variant="headerTitle">{t(cardTitleKeys[HistoryCardType.CardExpired])}</ThemedText>,
          description: (
            <ThemedText>
              {t('History.CardDescription.CardExpired', { cardName: item.content.correspondenceName })}
            </ThemedText>
          ),
        }
      }
      case HistoryCardType.CardRemoved: {
        return {
          icon: <Assets.svg.historyCardRemovedIcon />,
          title: (
            <ThemedText variant="headerTitle" style={{ color: styles.historyCardRevoked.color }}>
              {t(cardTitleKeys[HistoryCardType.CardRemoved])}
            </ThemedText>
          ),
          description: <ThemedText>{item.content.correspondenceName}</ThemedText>,
        }
      }
      case HistoryCardType.CardRevoked: {
        return {
          icon: <Assets.svg.historyCardRevokedIcon />,
          title: (
            <ThemedText variant="headerTitle" style={{ color: styles.historyCardRevoked.color }}>
              {t(cardTitleKeys[HistoryCardType.CardRevoked])}
            </ThemedText>
          ),
          description: (
            <ThemedText>
              {t('History.CardDescription.CardRevoked', { cardName: item.content.correspondenceName })}
            </ThemedText>
          ),
        }
      }
      case HistoryCardType.CardUpdates: {
        return {
          icon: <Assets.svg.historyCardUpdatesIcon />,
          title: <ThemedText variant="headingThree">{t(cardTitleKeys[HistoryCardType.CardUpdates])}</ThemedText>,
          description: <ThemedText>{item.content.correspondenceName}</ThemedText>,
        }
      }
      case HistoryCardType.PinChanged: {
        return {
          icon: <Assets.svg.historyPinUpdatedIcon />,
          title: (
            <ThemedText variant="headerTitle" style={{ color: styles.infoBox.color }}>
              {t(cardTitleKeys[HistoryCardType.PinChanged])}
            </ThemedText>
          ),
          description: <ThemedText>{t('History.CardDescription.WalletPinUpdated')}</ThemedText>,
        }
      }
      case HistoryCardType.InformationSent: {
        return {
          icon: <Assets.svg.historyInformationSentIcon />,
          title: (
            <ThemedText variant="headingThree" style={{ color: styles.successColor.color }}>
              {t(cardTitleKeys[HistoryCardType.InformationSent])}
            </ThemedText>
          ),
          description: <ThemedText>{item.content.correspondenceName}</ThemedText>,
        }
      }
      case HistoryCardType.InformationNotSent: {
        return {
          icon: <Assets.svg.historyInformationNotSentIcon />,
          title: (
            <ThemedText variant="headerTitle" style={{ color: styles.historyCardRevoked.color }}>
              {t(cardTitleKeys[HistoryCardType.InformationNotSent])}
            </ThemedText>
          ),
          description: <ThemedText>{item.content.correspondenceName}</ThemedText>,
        }
      }
      case HistoryCardType.Connection: {
        return {
          icon: <Assets.svg.historyConnectionIcon />,
          title: <ThemedText variant="headingThree">{t(cardTitleKeys[HistoryCardType.Connection])}</ThemedText>,
          description: <ThemedText>{item.content.correspondenceName}</ThemedText>,
        }
      }
      case HistoryCardType.ConnectionRemoved: {
        return {
          icon: <Assets.svg.historyConnectionRemovedIcon />,
          title: (
            <ThemedText variant="headingThree" style={{ color: styles.historyCardRevoked.color }}>
              {t(cardTitleKeys[HistoryCardType.ConnectionRemoved])}
            </ThemedText>
          ),
          description: <ThemedText>{item.content.correspondenceName}</ThemedText>,
        }
      }
      case HistoryCardType.ActivateBiometry: {
        return {
          icon: <Assets.svg.historyActivateBiometryIcon />,
          title: <ThemedText variant="headingThree">{t(cardTitleKeys[HistoryCardType.ActivateBiometry])}</ThemedText>,
          description: <ThemedText>{item.content.correspondenceName}</ThemedText>,
        }
      }
      case HistoryCardType.DeactivateBiometry: {
        return {
          icon: <Assets.svg.historyDeactivateBiometryIcon />,
          title: (
            <ThemedText variant="headingThree" style={{ color: styles.historyCardRevoked.color }}>
              {t(cardTitleKeys[HistoryCardType.DeactivateBiometry])}
            </ThemedText>
          ),
          description: <ThemedText>{item.content.correspondenceName}</ThemedText>,
        }
      }
      default:
        return {
          icon: null,
          title: null,
          description: null,
        }
    }
  }

  //TODO: move to helpers
  function isToday(date: Date): boolean {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const renderCardDate = (date?: Date) => {
    if (!date) return null

    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' }
    const isDateToday = isToday(date)
    return (
      <ThemedText style={styles.cardDate}>
        {isDateToday ? t('History.Today') : date.toLocaleDateString('en-US', options)}
      </ThemedText>
    )
  }

  const renderCard = (item: CustomRecord) => {
    const { icon, title, description } = renderCardSections(item)
    return (
      <View>
        <View style={styles.card}>
          {icon}
          <View style={styles.cardContent}>
            {title}
            <View style={styles.cardDescriptionContent}>{description}</View>
            {renderCardDate(item.content.createdAt)}
          </View>
          <View style={styles.arrowContainer}>
            <Assets.svg.iconChevronRight color={ColorPalette.brand.primary} />
          </View>
        </View>
        <View style={styles.cardBottomBorder} />
      </View>
    )
  }

  return (
    <TouchableOpacity
      onPress={() => {
        //TODO: navigate to history details
      }}
      accessibilityLabel={`${item.content.type && item.content.type in cardTitleKeys ? t(cardTitleKeys[item.content.type as HistoryCardType]) : ''} ${'correspondenceName' in item.content ? (item.content.correspondenceName ?? '') : ''}`.trim()}
      accessibilityRole="button"
      testID={testIdWithKey('HistoryItem')}
    >
      {renderCard(item)}
    </TouchableOpacity>
  )
}

export default HistoryListItem
