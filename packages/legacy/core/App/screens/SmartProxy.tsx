import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme';
import { ScrollView } from 'react-native-gesture-handler';

const SmartProxy = () => {
    //make a state varialbe to store the balance

    const [logs, setLogs] = useState<string[]>([]);


    useEffect(() => {
        try {
            console.log("Smart proxy screen launched")
        } catch (err: any) {
            console.error(err)
        }
    }, []);



    const addLog = (message: any) => {
        const time = `${new Date().toISOString()}: `;
        // Prepend new error messages to keep the newest at the top
        setLogs([time + JSON.stringify(message), ...logs]);
    };

    return (
        <ScrollView>
            <View style={styles.textPadding}>
                <Text style={theme.TextTheme.headerTitle}>Smart Proxy Tests</Text>

            </View>

        </ScrollView >
    );
};

const styles = StyleSheet.create({
    buttonPadding: {
        // Adjust the padding as needed
        padding: 10,
    },
    textPadding: {
        // Adjust the padding as needed
        paddingLeft: 15,
    },
    center: {

        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default SmartProxy;
