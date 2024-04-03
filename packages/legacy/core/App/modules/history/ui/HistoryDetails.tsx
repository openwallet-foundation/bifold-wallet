import { ConnectionRecord, CredentialExchangeRecord } from '@aries-framework/core'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Image, StyleSheet, Text, View } from 'react-native'

import CredentialCard from '../../../components/misc/CredentialCard'
import Link from '../../../components/texts/Link'
import KeyboardView from '../../../components/views/KeyboardView'
import { useCommons } from '../../../contexts/commons'
import { useTheme } from '../../../contexts/theme'
import { HistoryStackParams } from '../../../types/navigators'
import { formatTime } from '../../../utils/helpers'
import { HistoryCardType } from '../types'

type HistoryDetailsPageProps = StackScreenProps<HistoryStackParams>

const HistoryDetailsPage: React.FC<HistoryDetailsPageProps> = ({ route }) => {
  if (!route?.params) {
    throw new Error('HistoryDetailsPage route prams were not set properly')
  }

  //   const updatePin = (route.params as any)?.updatePin
  const { historyRecord } = route.params
  const { t } = useTranslation()

  //State
  const [credential, setCredential] = useState<CredentialExchangeRecord>()
  // const [proof, setProof] = useState<ProofExchangeRecord>()
  const [connection, setConnection] = useState<ConnectionRecord>()

  const { ColorPallet, TextTheme } = useTheme()

  const historyCardType = historyRecord.content.type
  const { getCredentialById, getConnectionById } = useCommons()

  //Style
  const style = StyleSheet.create({
    screenContainer: {
      height: '100%',
      backgroundColor: ColorPallet.brand.primaryBackground,
      padding: 20,
      justifyContent: 'space-between',
    },
    gap: {
      marginTop: 10,
      marginBottom: 10,
    },
    // below used as helpful labels for views, no properties needed atp
    contentContainer: {},
    controlsContainer: {},
    dividerLine: {
      width: '100%',
      height: 1,
      backgroundColor: '#212121',
      marginTop: 20,
      marginBottom: 20,
    },
    connectionDetailSection: {
      alignSelf: 'flex-start',
      marginTop: 16,
      marginBottom: 10,
    },
    imageView: {
      alignContent: 'center',
      alignItems: 'center',
    },
    logoImage: {
      minWidth: 180,
      minHeight: 50,
      resizeMode: 'contain',
      marginTop: 10,
    },
    sectionBody: {
      marginTop: 10,
    },
    dateSection: {
      alignSelf: 'flex-start',
      marginTop: 16,
      marginBottom: 10,
    },
  })

  const renderDivider = () => {
    return <View style={style.dividerLine} />
  }

  const renderCredentialDetails = () => {
    return (
      <CredentialCard
        credential={credential}
        onPress={() => {
          // console.log('Nav to credential details screen')
        }}
      />
    )
  }

  const renderConnectionHeader = () => {
    if (historyCardType === HistoryCardType.CardAccepted || historyCardType === HistoryCardType.CardExpired) {
      return t('Global.Issuer')
    } else if (historyCardType === HistoryCardType.CardRevoked) {
      return t('Global.RevokedByIssuer')
    } else if (historyCardType === HistoryCardType.InformationSent) {
      return t('Global.Verifier')
    }
  }
  const renderDateHeader = () => {
    switch (historyCardType) {
      case HistoryCardType.CardAccepted: {
        return t('Global.Issued')
      }
      case HistoryCardType.CardExpired: {
        return t('Global.Expired')
      }
      case HistoryCardType.CardRevoked: {
        return t('Global.Revoked')
      }
      case HistoryCardType.InformationSent: {
        return t('Global.Requested')
      }
      case HistoryCardType.PinChanged: {
        return t('Global.Updated')
      }
    }
  }

  const renderConnectionDetails = () => {
    if (!connection) {
      return <></>
    }
    const connectionName: string | undefined = connection.theirLabel
    const connectionLogo: string | undefined = connection.imageUrl
    const connectionId: string | undefined = connection.id

    return (
      <View style={style.connectionDetailSection}>
        <Text style={[TextTheme.headerTitle]}>{renderConnectionHeader()}:</Text>
        {connectionLogo ? (
          <View style={style.imageView}>
            <Image
              style={style.logoImage}
              source={{
                uri: connectionLogo,
              }}
            />
          </View>
        ) : null}
        {connectionId ? (
          <Link
            style={style.sectionBody}
            onPress={() => {
              // console.log('Navigate to connection details')
            }}
            linkText={connectionName ? connectionName : ''}
          />
        ) : null}
      </View>
    )
  }

  const renderDateDetails = () => {
    //TODO:
    const createdAt = historyRecord.content.createdAt
    let displayDateTime

    if (createdAt) {
      const createdAtDate = new Date(createdAt)
      const createdAtDateTime = formatTime(createdAtDate, { shortMonth: true })
      if (historyCardType === HistoryCardType.CardExpired || historyCardType === HistoryCardType.CardRevoked) {
        displayDateTime = '--'
        //TODO: impliment revocation/expiry
        // displayDateTime = expiredOrRevokedDisplayDate
      } else {
        displayDateTime = createdAtDateTime
      }
    }

    return displayDateTime ? (
      <View style={style.dateSection}>
        <Text style={[TextTheme.headerTitle]}>{renderDateHeader()}:</Text>
        <Text style={[TextTheme.normal]}>{displayDateTime}</Text>
      </View>
    ) : null
  }

  const renderDetails = () => {
    if (!credential) {
      return <></>
    }
    if (
      historyCardType === HistoryCardType.CardAccepted ||
      historyCardType === HistoryCardType.CardExpired ||
      historyCardType === HistoryCardType.CardRevoked ||
      historyCardType === HistoryCardType.CardDeclined
    ) {
      return (
        <>
          {renderCredentialDetails()}
          {renderDivider()}
          {renderConnectionDetails()}
          {renderDivider()}
          {renderDateDetails()}
        </>
      )
    } else if (historyCardType === HistoryCardType.InformationSent) {
      return (
        <>
          {/* {
            //TODO
          }
          {renderConnectionDetails()}
          {renderBar()}
          {renderProofDetails()}
          {renderBar()}
          {renderDateDetails(item)}
          {renderBar()} */}
        </>
      )
    } else if (historyCardType === HistoryCardType.PinChanged) {
      return (
        <>
          {/* {renderDateDetails(item)}
          {renderBar()}
          <Text style={[globalStyle.body, styles.pinChangedSection]}>
            <Trans
              i18nKey="HistoryDetails.PinUpdatedDescription"
              components={{
                l: <Link onPress={() => navigation.navigate('Settings')} />,
              }}
              t={t}
            />
          </Text> */}
        </>
      )
    }
  }

  /** Get cards expiry or revoked date */
  /* TODO: impliment expiry/revok UI
  const isCredentialExpiredOrRevoked = useCallback(async () => {
    if (!credential) {
      return
    }
    const expiredDate = await credentialExpired(credential)
    const revokedDate = await isCredentialRevoked(credential)

    if (expiredDate !== null) {
      setExpiredOrRevokedDisplayDate(expiredDate)
    }

    if (revokedDate !== null) {
      setExpiredOrRevokedDisplayDate(revokedDate)
    }
  }, [credential])
  */
  async function getCredential(id: string) {
    try {
      const credentialRecord = await getCredentialById(id)
      setCredential(credentialRecord)
    } catch {
      //TODO: Display error to user
    }
  }
  async function getConnection(id: string) {
    try {
      const connectionRecord = await getConnectionById(id)
      setConnection(connectionRecord)
    } catch {
      //TODO: Display error to user
    }
  }

  useEffect(() => {
    if (
      (historyCardType === HistoryCardType.CardAccepted ||
        historyCardType === HistoryCardType.CardExpired ||
        historyCardType === HistoryCardType.CardRevoked) &&
      historyRecord.content.correspondenceId != undefined
    ) {
      getCredential(historyRecord.content.correspondenceId)
    }
    // else if (
    //   historyCardType === HistoryCardType.InformationSent &&
    //   historyRecord.content.correspondenceId != undefined
    // ) {
    //   const proof = useProofById(historyRecord.content.correspondenceId)
    //   setProof(proof)
    // }
  }, [])

  useEffect(() => {
    if (!credential) {
      return
    }
    if (!credential.connectionId) {
      return
    }
    getConnection(credential.connectionId)
  }, [credential])

  return (
    <KeyboardView>
      <View style={style.screenContainer}>
        <View style={style.contentContainer}>
          <View>{renderDetails()}</View>
        </View>
      </View>
    </KeyboardView>
  )
}

export default HistoryDetailsPage
