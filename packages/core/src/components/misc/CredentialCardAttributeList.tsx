import React from 'react'
import { FlatList } from 'react-native'
import type { CardAttribute } from '../../wallet/ui-types'
import CredentialCardActionLink from './CredentialCardActionLink'
import { CredentialAttributeRow } from './AttributeRow'

type Props = {
  list: CardAttribute[]

  textColor: string
  showPiiWarning: boolean
  isNotInWallet?: boolean

  hasAltCredentials?: boolean
  onChangeAlt?: () => void
  helpActionUrl?: string

  // coming from your style hook
  styles: any
}

const CredentialCardAttributeList: React.FC<Props> = ({
  list,
  textColor,
  showPiiWarning,
  isNotInWallet,
  hasAltCredentials,
  onChangeAlt,
  helpActionUrl,
  styles,
}) => {
  return (
    <FlatList
      data={list}
      scrollEnabled={false}
      initialNumToRender={list.length}
      keyExtractor={(i) => i.key}
      renderItem={({ item }) => (
        <CredentialAttributeRow
          item={item}
          textColor={textColor}
          showPiiWarning={showPiiWarning}
          isNotInWallet={isNotInWallet}
          styles={styles}
        />
      )}
      ListFooterComponent={
        <CredentialCardActionLink
          hasAltCredentials={hasAltCredentials}
          onChangeAlt={onChangeAlt}
          helpActionUrl={helpActionUrl}
          textStyle={styles.textContainer}
        />
      }
    />
  )
}

export default CredentialCardAttributeList
