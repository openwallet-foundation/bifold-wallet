import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import { useTheme } from '../../../../contexts/theme'
import { CustomRecord, HistoryCardType } from '../../types'

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
  const { TextTheme, Assets, ColorPallet } = useTheme()
  //TODO: navigate to history details
  //   const navigation = useNavigation<StackNavigationProp<RootStackParams, 'HistoryDetails'>>()

  const renderCardSections = (item: CustomRecord) => {
    switch (item.content.type) {
      case HistoryCardType.CardAccepted: {
        return { 
          icon: <Assets.svg.historyCardAcceptedIcon />,
          title: <Text style={TextTheme.headingThree}>{t('History.CardTitle.CardAccepted')}</Text>,
          description: <Text style={TextTheme.normal}>{item.content.correspondenceName}</Text>
        }
      }
      case HistoryCardType.CardDeclined: {
        return {
          icon: <Assets.svg.historyCardDeclinedIcon />,
          title:
            <Text style={[TextTheme.headerTitle, { color: styles.historyCardRevoked.color }]}>
              {t('History.CardTitle.CardDeclined')}
            </Text>,
          description: <Text style={TextTheme.normal}>{item.content.correspondenceName}</Text>
        }
      }
      case HistoryCardType.CardExpired: {
        return {
          icon: <Assets.svg.historyCardExpiredIcon />,
          title: <Text style={TextTheme.headerTitle}>{t('History.CardTitle.CardExpired')}</Text>,
          description: 
            <Text style={TextTheme.normal}>
              {t('History.CardDescription.CardExpired', { cardName: item.content.correspondenceName })}
            </Text>
        }
      }
      case HistoryCardType.CardRemoved: {
        return {
          icon: <Assets.svg.historyCardRemovedIcon />,
          title: 
            <Text style={[TextTheme.headerTitle, { color: styles.historyCardRevoked.color }]}>
              {t('History.CardTitle.CardRemoved')}
            </Text>,
          description: <Text style={TextTheme.normal}>{item.content.correspondenceName}</Text>
        }
      }
      case HistoryCardType.CardRevoked: {
        return {
          icon: <Assets.svg.historyCardRevokedIcon />,
          title: 
            <Text style={[TextTheme.headerTitle, { color: styles.historyCardRevoked.color }]}>
              {t('History.CardTitle.CardRevoked')}
            </Text>,
          description: 
            <Text style={TextTheme.normal}>
              {t('History.CardDescription.CardRevoked', { cardName: item.content.correspondenceName })}
            </Text>
        }
      }
      case HistoryCardType.CardUpdates: {
        return {
          icon: <Assets.svg.historyCardUpdatesIcon />,
          title: <Text style={TextTheme.headingThree}>{t('History.CardTitle.CardUpdates')}</Text>,
          description: <Text style={TextTheme.normal}>{item.content.correspondenceName}</Text>
        }
      }
      case HistoryCardType.PinChanged: {
        return {
          icon: <Assets.svg.historyPinUpdatedIcon />,
          title:
            <Text style={[TextTheme.headerTitle, { color: styles.infoBox.color }]}>
              {t('History.CardTitle.WalletPinUpdated')}
            </Text>,
          description: <Text style={TextTheme.normal}>{t('History.CardDescription.WalletPinUpdated')}</Text>
        }
      }
      case HistoryCardType.InformationSent: {
        return {
          icon: <Assets.svg.historyInformationSentIcon />,
          title: <Text style={[TextTheme.headingThree, { color: styles.successColor.color }]}>{t('History.CardTitle.InformationSent')}</Text>,
          description: <Text style={TextTheme.normal}>{item.content.correspondenceName}</Text>
        }
      }
      case HistoryCardType.InformationNotSent: {
        return {
          icon: <Assets.svg.historyInformationNotSentIcon />,
          title: 
            <Text style={[TextTheme.headerTitle, { color: styles.historyCardRevoked.color }]}>
              {t('History.CardTitle.InformationNotSent')}
            </Text>,
          description: <Text style={TextTheme.normal}>{item.content.correspondenceName}</Text>
        }
      }
      case HistoryCardType.Connection: {
        return {
          icon: <Assets.svg.historyConnectionIcon />,
          title: <Text style={TextTheme.headingThree}>{t('History.CardTitle.Connection')}</Text>,
          description: <Text style={TextTheme.normal}>{item.content.correspondenceName}</Text>
        }
      }
      case HistoryCardType.ConnectionRemoved: {
        return {
          icon: <Assets.svg.historyConnectionRemovedIcon />,
          title: <Text style={[TextTheme.headingThree, { color: styles.historyCardRevoked.color }]}>{t('History.CardTitle.ConnectionRemoved')}</Text>,
          description: <Text style={TextTheme.normal}>{item.content.correspondenceName}</Text>
        }
      }
      case HistoryCardType.ActivateBiometry: {
        return {
          icon: <Assets.svg.historyActivateBiometryIcon />,
          title: <Text style={TextTheme.headingThree}>{t('History.CardTitle.ActivateBiometry')}</Text>,
          description: <Text style={TextTheme.normal}>{item.content.correspondenceName}</Text>
        }
      }
      case HistoryCardType.DeactivateBiometry: {
        return {
          icon: <Assets.svg.historyDeactivateBiometryIcon />,
          title: <Text style={[TextTheme.headingThree, { color: styles.historyCardRevoked.color }]}>{t('History.CardTitle.DeactivateBiometry')}</Text>,
          description: <Text style={TextTheme.normal}>{item.content.correspondenceName}</Text>
        }
      }
      default:
        return {
          icon: null,
          title: null,
          description: null
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
      <Text style={[TextTheme.normal, styles.cardDate]}>
        {isDateToday ? t('History.Today') : date.toLocaleDateString('en-US', options)}
      </Text>
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
