// Create or restore Lightning wallet

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { useTheme } from '../../contexts/theme'
import { theme } from '../../theme';
import { breezInitHandler, getMnemonic } from '../../utils/lightningHelpers'

interface CreateLightningWalletProps {
    setMnemonic: (mnemonic: string) => void;
}

const eventHandler = (breezEvent: any) => {
    console.log("event", JSON.stringify(breezEvent))
}

export const CreateLightningWallet: React.FC<CreateLightningWalletProps> = ({ setMnemonic }) => {
    const { TextTheme, Buttons, ColorPallet } = useTheme()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [tmpMnemonic, setTmpMnemonic] = useState('')

    const handleCreateWallet = () => {
        setLoading(true)
        breezInitHandler(eventHandler).then(() => {
            getMnemonic().then((mnemonic) => {
                if (mnemonic) {
                    setMnemonic(mnemonic)
                    setLoading(false)
                }
            })
        })
    }

    const handleRestoreWallet = () => {
        setLoading(true)
        const wordCount = tmpMnemonic.trim().split(/\s+/).length;
        if (wordCount !== 12 && wordCount !== 24) {
            setError('Seed phrase must be 12 or 24 words')
            setLoading(false)
            return
        }
        setError('')
        breezInitHandler(eventHandler, tmpMnemonic).then(() => {
            getMnemonic().then((mnemonic) => {
                if (mnemonic) {
                    setMnemonic(mnemonic)
                    setLoading(false)
                }
            })
        })
    }

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={TextTheme.headerTitle}>Create or Restore Lightning wallet</Text>
            <TouchableOpacity
                style={{ ...theme.Buttons.primary, margin: 10, minWidth: 200 }}
                onPress={handleCreateWallet}
            >
                <Text style={Buttons.buttonText}>Create New Wallet         </Text>
            </TouchableOpacity>

            <Text style={TextTheme.modalNormal}>OR</Text>

            <TextInput
                style={{ ...theme.Inputs.textInput, minWidth: '95%', margin: 10 }}
                placeholder="Enter Existing Seed Phrase"
                placeholderTextColor={ColorPallet.grayscale.white}
                value={tmpMnemonic}
                onChangeText={setTmpMnemonic}
            />

            <TouchableOpacity
                style={{ ...theme.Buttons.primary, minWidth: 200 }}
                onPress={handleRestoreWallet}
            >
                <Text style={Buttons.buttonText}>Restore Existing Wallet</Text>
            </TouchableOpacity>

            {loading && <ActivityIndicator size="large" style={{ margin: 10 }} color={ColorPallet.grayscale.white} />}
            {
                error && <Text style={{
                    color: ColorPallet.notification.errorBorder, margin: 10, textAlign: 'center'
                }}>{error}</Text>
            }
        </View >
    )
}

export default CreateLightningWallet;