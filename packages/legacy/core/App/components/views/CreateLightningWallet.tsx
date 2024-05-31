// Create or restore Lightning wallet

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { useTheme } from '../../contexts/theme'
import { theme } from '../../theme';
import { breezInitHandler, getMnemonic } from '../../utils/lightningHelpers'

interface CreateLightningWalletProps {
    setMnemonic: (mnemonic: string) => void;
    setShowSeedPhraseModal: (show: boolean) => void;
}

const eventHandler = (breezEvent: any) => {
    console.log("event", JSON.stringify(breezEvent))
}

export const CreateLightningWallet: React.FC<CreateLightningWalletProps> = ({ setMnemonic, setShowSeedPhraseModal }) => {
    const { TextTheme, Buttons, ColorPallet } = useTheme()
    const [loadingRestore, setLoadingRestore] = useState(false)
    const [loadingCreate, setLoadingCreate] = useState(false)
    const [error, setError] = useState('')
    const [tmpMnemonic, setTmpMnemonic] = useState('')

    const handleCreateWallet = () => {
        if (loadingCreate) return
        setLoadingCreate(true)
        breezInitHandler(eventHandler).then((res) => {
            if (typeof res === 'string') {
                setLoadingCreate(false)
                setError(res)
                return
            } else {
                getMnemonic().then((mnemonic) => {
                    if (mnemonic) {
                        setMnemonic(mnemonic)
                        setLoadingCreate(false)
                        setShowSeedPhraseModal(true)
                    }
                })
            }
        })
    }

    const handleRestoreWallet = () => {
        if (loadingRestore) return
        setLoadingRestore(true)
        const wordCount = tmpMnemonic.trim().split(/\s+/).length;
        if (wordCount !== 12 && wordCount !== 24) {
            setError('Seed phrase must be 12 or 24 words')
            setLoadingRestore(false)
            return
        }
        setError('')
        breezInitHandler(eventHandler, tmpMnemonic).then((res) => {
            if (typeof res === 'string') {
                setError(res)
                setLoadingRestore(false)
                return
            } else {
                getMnemonic().then((mnemonic) => {
                    if (mnemonic) {
                        setMnemonic(mnemonic)
                        setLoadingRestore(false)
                    }
                })
            }
        })
    }

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={TextTheme.headerTitle}>Create or Restore Lightning wallet</Text>
            <TouchableOpacity
                style={{ ...theme.Buttons.primary, margin: 30, minWidth: 200 }}
                onPress={handleCreateWallet}
            >
                {loadingCreate ? <ActivityIndicator size="small" color={ColorPallet.grayscale.white} />
                    : <Text style={{ ...theme.TextTheme.normal }}>Create New Wallet</Text>}
            </TouchableOpacity>

            <Text style={TextTheme.modalNormal}>OR</Text>

            <TextInput
                style={{ ...theme.Inputs.textInput, minWidth: '90%', margin: 30 }}
                placeholder="Enter Existing Seed Phrase"
                placeholderTextColor={ColorPallet.grayscale.white}
                value={tmpMnemonic}
                onChangeText={setTmpMnemonic}
            />

            <TouchableOpacity
                style={{ ...theme.Buttons.primary, minWidth: 200 }}
                onPress={handleRestoreWallet}
            >
                {loadingRestore ? <ActivityIndicator size="small" color={ColorPallet.grayscale.white} />
                    : <Text style={{ ...theme.TextTheme.normal }}>Restore Existing Wallet</Text>}
            </TouchableOpacity>

            {
                error && <Text style={{
                    color: ColorPallet.notification.errorBorder, margin: 10, textAlign: 'center'
                }}>{error}</Text>
            }
        </View >
    )
}

export default CreateLightningWallet;