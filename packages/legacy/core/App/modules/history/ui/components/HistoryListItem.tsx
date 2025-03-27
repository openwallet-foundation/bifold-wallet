import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

import { useTheme } from '../../../../contexts/theme'
import { CustomRecord, HistoryCardType } from '../../types'
import { ThemedText } from '../../../../components/texts/ThemedText'

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
  const { Assets, ColorPallet } = useTheme()
  //TODO: navigate to history details
  //   const navigation = useNavigation<StackNavigationProp<RootStackParams, 'HistoryDetails'>>()

  const renderCardSections = (item: CustomRecord) => {
    switch (item.content.type) {
      case HistoryCardType.CardAccepted: {
        return {
          icon: <Assets.svg.historyCardAcceptedIcon />,
          title: <ThemedText variant="headingThree">{t('History.CardTitle.CardAccepted')}</ThemedText>,
          description: <ThemedText>{item.content.correspondenceName}</ThemedText>,
        }
      }
      case HistoryCardType.CardDeclined: {
        return {
          icon: <Assets.svg.historyCardDeclinedIcon />,
          title: (
            <ThemedText variant="headerTitle" style={{ color: styles.historyCardRevoked.color }}>
              {t('History.CardTitle.CardDeclined')}
            </ThemedText>
          ),
          description: <ThemedText>{item.content.correspondenceName}</ThemedText>,
        }
      }
      case HistoryCardType.CardExpired: {
        return {
          icon: <Assets.svg.historyCardExpiredIcon />,
          title: <ThemedText variant="headerTitle">{t('History.CardTitle.CardExpired')}</ThemedText>,
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
              {t('History.CardTitle.CardRemoved')}
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
              {t('History.CardTitle.CardRevoked')}
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
          title: <ThemedText variant="headingThree">{t('History.CardTitle.CardUpdates')}</ThemedText>,
          description: <ThemedText>{item.content.correspondenceName}</ThemedText>,
        }
      }
      case HistoryCardType.PinChanged: {
        return {
          icon: <Assets.svg.historyPinUpdatedIcon />,
          title: (
            <ThemedText variant="headerTitle" style={{ color: styles.infoBox.color }}>
              {t('History.CardTitle.WalletPinUpdated')}
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
              {t('History.CardTitle.InformationSent')}
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
              {t('History.CardTitle.InformationNotSent')}
            </ThemedText>
          ),
          description: <ThemedText>{item.content.correspondenceName}</ThemedText>,
        }
      }
      case HistoryCardType.Connection: {
        return {
          icon: <Assets.svg.historyConnectionIcon />,
          title: <ThemedText variant="headingThree">{t('History.CardTitle.Connection')}</ThemedText>,
          description: <ThemedText>{item.content.correspondenceName}</ThemedText>,
        }
      }
      case HistoryCardType.ConnectionRemoved: {
        return {
          icon: <Assets.svg.historyConnectionRemovedIcon />,
          title: (
            <ThemedText variant="headingThree" style={{ color: styles.historyCardRevoked.color }}>
              {t('History.CardTitle.ConnectionRemoved')}
            </ThemedText>
          ),
          description: <ThemedText>{item.content.correspondenceName}</ThemedText>,
        }
      }
      case HistoryCardType.ActivateBiometry: {
        return {
          icon: <Assets.svg.historyActivateBiometryIcon />,
          title: <ThemedText variant="headingThree">{t('History.CardTitle.ActivateBiometry')}</ThemedText>,
          description: <ThemedText>{item.content.correspondenceName}</ThemedText>,
        }
      }
      case HistoryCardType.DeactivateBiometry: {
        return {
          icon: <Assets.svg.historyDeactivateBiometryIcon />,
          title: (
            <ThemedText variant="headingThree" style={{ color: styles.historyCardRevoked.color }}>
              {t('History.CardTitle.DeactivateBiometry')}
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
            <Assets.svg.iconChevronRight color={ColorPallet.brand.primary} />
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
    >
      {renderCard(item)}
    </TouchableOpacity>
  )
}

export default HistoryListItem
