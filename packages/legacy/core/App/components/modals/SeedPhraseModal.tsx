import React from 'react';
import { Modal, View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { theme as globalTheme } from '../../theme';

interface ShowLightningSeedPhraseModalProps {
    showModal: boolean;
    setShowModal: (show: boolean) => void;
    seedPhrase: string | undefined;
}

const ShowLightningSeedPhraseModal: React.FC<ShowLightningSeedPhraseModalProps> = ({
    showModal, setShowModal, seedPhrase
}) => {

    const seedWords = seedPhrase ? seedPhrase.split(' ') : [];

    const renderItem = ({ item, index }: { item: string, index: number }) => (
        <View style={styles.gridItem}>
            <Text style={styles.gridText}>{index + 1}. {item}</Text>
        </View >
    );

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={showModal}
            onRequestClose={() => setShowModal(false)}
        >

            <View style={globalTheme.ChatTheme.paymentModals.modalView}>
                {/* Title */}
                <Text style={{ ...globalTheme.TextTheme.headerTitle, marginTop: 20 }}>Seed Phrase</Text>

                <Text style={{ ...globalTheme.TextTheme.headingFour, padding: 30 }} >
                    Please write down your secret seed phrase and store it in a safe location to recover your wallet.
                </Text>

                {seedPhrase ? (
                    <FlatList
                        data={seedWords}
                        renderItem={renderItem}
                        keyExtractor={index => index.toString()}
                        numColumns={3}
                        contentContainerStyle={styles.grid}
                    />
                ) : (
                    <Text style={{ ...globalTheme.TextTheme.modalNormal, marginTop: 50, padding: 10, color: 'white' }}>
                        No seed phrase found
                    </Text>
                )}

                {/* Close button at bottom of modal */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={globalTheme.ChatTheme.paymentModals.mainButton}
                        onPress={() => setShowModal(false)}
                    >
                        <Text style={globalTheme.TextTheme.modalNormal}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>

        </Modal>
    );
};

const styles = StyleSheet.create({
    grid: {
        marginTop: 50,
        alignItems: 'center',
    },
    gridItem: {
        margin: 5,
        padding: 10,
        borderRadius: 5,
        fontSize: 16,
        color: 'white', // Adjust based on your theme
    },
    gridText: {
        color: 'white', // Adjust based on your theme
        minWidth: 110,
        fontSize: 20,
    },
    buttonContainer: {
        marginTop: 20,
        marginBottom: 40,
        alignItems: 'center',
    },
});

export default ShowLightningSeedPhraseModal;
