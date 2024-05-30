import { ConnectionRecord, CredentialExchangeRecord, ProofExchangeRecord } from '@credo-ts/core'
import { useConnectionById, useCredentialById, useProofById } from '@credo-ts/react-hooks'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Image, StyleSheet, Text, View } from 'react-native'

import CredentialCard from '../../../components/misc/CredentialCard'
import Link from '../../../components/texts/Link'
import KeyboardView from '../../../components/views/KeyboardView'
import { TOKENS, useContainer } from '../../../container-api'
import { useTheme } from '../../../contexts/theme'
import { HistoryStackParams } from '../../../types/navigators'
import { CustomRecord, HistoryCardType } from '../types'

type HistoryDetailsPageProps = StackScreenProps<HistoryStackParams>

const HistoryDetailsPage: React.FC<HistoryDetailsPageProps> = ({ route }) => {
  if (!route?.params) {
    throw new Error('HistoryDetailsPage route prams were not set properly')
  }

  //   const updatePin = (route.params as any)?.updatePin
  const { historyRecord } = route.params
  const { t } = useTranslation()
  const [credential, setCredential] = useState<CredentialExchangeRecord>()
  const [proof, setProof] = useState<ProofExchangeRecord>()

  const { ColorPallet, TextTheme } = useTheme()

  const historyCardType = historyRecord.content.type
  const container = useContainer()
  const Button = container.resolve(TOKENS.COMP_BUTTON)

  //State

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
      backgroundColor: '#D9D9D9',
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
  /** Get credential using item's corresponse id */
  const getCredential = (credentialId: string | undefined) => {
    if (!credentialId) {
      throw new Error()
    }
    const credentialRecord = useCredentialById(credentialId)
    setCredential(credentialRecord)
    // return credentialRecord
  }

  /** Get proof using item's corresponse id */
  const getProof = (proofId: string | undefined) => {
    if (!proofId) {
      throw new Error()
    }
    const proof = useProofById(proofId)
    setProof(proof)
  }

  const renderCredentialDetails = () => {
    ;<CredentialCard
      credential={credential}
      onPress={() => {
        // console.log('Nav to credential details screen')
      }}
    />
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
    let connectionId: string | undefined
    let connectionRecord: ConnectionRecord | undefined
    let connectionName: string | undefined
    let connectionLogo: string | undefined
    if (credential) {
      connectionId = credential?.connectionId
      connectionRecord = connectionId ? useConnectionById(connectionId) : undefined
      connectionName = connectionRecord ? connectionRecord.theirLabel : t('Global.organization')
      connectionLogo = connectionRecord ? connectionRecord.imageUrl : undefined
    } else if (proof) {
      connectionId = proof?.connectionId
      connectionRecord = connectionId ? useConnectionById(connectionId) : undefined
      connectionName = connectionRecord ? connectionRecord.theirLabel : t('Global.organization')
      connectionLogo = connectionRecord ? connectionRecord.imageUrl : undefined
    }

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

  /*
  const renderDateDetails = (item: CustomRecord) => {
    //TODO:
    const createdAt = item.content.createdAt
    let displayDateTime

    if (createdAt) {
      const createdAtDate = DateTime.fromJSDate(createdAt)
      const createdAtTime = parseTime(getCurrentTime(createdAt))
      const createdAtDateTime = createdAtDate.toFormat('LLLL d, yyyy') + ' ' + createdAtTime
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
  */

  const renderBar = () => {
    return <View style={style.dividerLine} />
  }

  const renderDetails = () => {
    if (
      historyCardType === HistoryCardType.CardAccepted ||
      historyCardType === HistoryCardType.CardExpired ||
      historyCardType === HistoryCardType.CardRevoked
    ) {
      return (
        <>
          {renderCredentialDetails()}
          {renderBar()}
          {renderConnectionDetails()}
          {renderBar()}
          {/* {renderDateDetails(item)} */}
          {renderBar()}
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
  useEffect(() => {
    if (
      historyCardType === HistoryCardType.CardAccepted ||
      historyCardType === HistoryCardType.CardExpired ||
      historyCardType === HistoryCardType.CardRevoked
    ) {
      getCredential(historyRecord.content.correspondenceId)
    } else if (historyCardType === HistoryCardType.InformationSent) {
      getProof(historyRecord.content.correspondenceId)
    }
  }, [])

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
