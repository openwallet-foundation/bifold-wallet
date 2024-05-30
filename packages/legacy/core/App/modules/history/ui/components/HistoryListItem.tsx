import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import { useTheme } from '../../../../contexts/theme'
import { CustomRecord, HistoryCardType } from '../../types'
import HistoryCardAcceptedIcon from '../assets/img/HistoryCardAcceptedIcon.svg'
import HistoryCardExpiredIcon from '../assets/img/HistoryCardExpiredIcon.svg'
import HistoryCardRevokedIcon from '../assets/img/HistoryCardRevokedIcon.svg'
import HistoryInformationSentIcon from '../assets/img/HistoryInformationSentIcon.svg'
import HistoryPinUpdatedIcon from '../assets/img/HistoryPinUpdatedIcon.svg'
import IconChevronRight from '../assets/img/IconChevronRight.svg'

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
  const { TextTheme } = useTheme()
  //TODO: navigate to history details
  //   const navigation = useNavigation<StackNavigationProp<RootStackParams, 'HistoryDetails'>>()

  //TODO: render icon
  const renderCardIcon = (item: CustomRecord) => {
    switch (item.content.type) {
      case HistoryCardType.CardAccepted: {
        return <HistoryCardAcceptedIcon />
      }
      case HistoryCardType.CardDeclined: {
        //TODO: return different icon
        return <HistoryCardRevokedIcon />
      }
      case HistoryCardType.CardExpired: {
        return <HistoryCardExpiredIcon />
      }
      case HistoryCardType.CardRevoked: {
        return <HistoryCardRevokedIcon />
      }
      case HistoryCardType.InformationSent: {
        return <HistoryInformationSentIcon />
      }
      case HistoryCardType.PinChanged: {
        return <HistoryPinUpdatedIcon />
      }
      default:
        return null
    }
  }

  const renderCardTitle = (item: CustomRecord) => {
    switch (item.content.type) {
      case HistoryCardType.CardAccepted: {
        return <Text style={TextTheme.headingThree}>{t('History.CardTitle.CardAccepted')}</Text>
      }
      case HistoryCardType.CardDeclined: {
        return (
          <Text style={[TextTheme.headerTitle, { color: styles.historyCardRevoked.color }]}>
            {t('History.CardTitle.CardDeclined')}
          </Text>
        )
      }
      case HistoryCardType.CardExpired: {
        return <Text style={TextTheme.headerTitle}>{t('History.CardTitle.CardExpired')}</Text>
      }
      case HistoryCardType.CardRevoked: {
        return (
          <Text style={[TextTheme.headerTitle, { color: styles.historyCardRevoked.color }]}>
            {t('History.CardTitle.CardRevoked')}
          </Text>
        )
      }
      case HistoryCardType.InformationSent: {
        return (
          <Text style={[TextTheme.headerTitle, { color: styles.successColor.color }]}>
            {t('History.CardTitle.InformationSent')}
          </Text>
        )
      }
      case HistoryCardType.PinChanged: {
        return (
          <Text style={[TextTheme.headerTitle, { color: styles.infoBox.color }]}>
            {t('History.CardTitle.WalletPinUpdated')}
          </Text>
        )
      }
      default:
        return null
    }
  }

  const renderCardDescription = (item: CustomRecord) => {
    switch (item.content.type) {
      case HistoryCardType.CardAccepted: {
        return <Text style={TextTheme.normal}>{item.content.correspondenceName}</Text>
      }
      case HistoryCardType.CardDeclined: {
        return <Text style={TextTheme.normal}>{item.content.correspondenceName}</Text>
      }
      case HistoryCardType.CardExpired: {
        return (
          <Text style={TextTheme.normal}>
            {t('History.CardDescription.CardExpired', { cardName: item.content.correspondenceName })}
          </Text>
        )
      }
      case HistoryCardType.CardRevoked: {
        return (
          <Text style={TextTheme.normal}>
            {t('History.CardDescription.CardRevoked', { cardName: item.content.correspondenceName })}
          </Text>
        )
      }
      case HistoryCardType.InformationSent: {
        return <Text style={TextTheme.normal}>{item.content.correspondenceName}</Text>
      }
      case HistoryCardType.PinChanged: {
        return <Text style={TextTheme.normal}>{t('History.CardDescription.WalletPinUpdated')}</Text>
      }
      default:
        return null
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
    return (
      <View>
        <View style={styles.card}>
          {renderCardIcon(item)}
          <View style={styles.cardContent}>
            {renderCardTitle(item)}
            <View style={styles.cardDescriptionContent}>{renderCardDescription(item)}</View>
            {renderCardDate(item.content.createdAt)}
          </View>
          <View style={styles.arrowContainer}>
            <IconChevronRight />
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
