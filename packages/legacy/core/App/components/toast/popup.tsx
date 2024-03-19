import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Dimensions } from 'react-native';
import { theme } from '../../theme';

const windowHeight = Dimensions.get('window').height;

const BottomPopup = ({ message, isVisible, onClose }: any) => {
    const [showPopup, setShowPopup] = useState(isVisible);
    const positionValue = useRef(new Animated.Value(windowHeight)).current;

    useEffect(() => {
        if (isVisible) {
            setShowPopup(true);
            Animated.timing(positionValue, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();

            setTimeout(() => {
                Animated.timing(positionValue, {
                    toValue: windowHeight - 200,
                    duration: 300,
                    useNativeDriver: true,
                }).start(() => {
                    setShowPopup(false);
                    if (onClose) onClose();
                });
            }, 5000); // Display the popup for 3 seconds
        }
    }, [isVisible, positionValue, onClose]);

    if (!showPopup) return null;

    return (
        <Animated.View
            style={[
                styles.popupContainer,
                { transform: [{ translateY: positionValue }] },
            ]}
        >
            <Text style={styles.popupText}>{message}</Text>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    popupContainer: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        padding: 20,
        backgroundColor: theme.ColorPallet.brand.modalPrimary,
        justifyContent: 'center',
        alignItems: 'center',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    popupText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.ColorPallet.grayscale.white
    },
});

export default BottomPopup;