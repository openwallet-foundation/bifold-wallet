import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, useWindowDimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useAgent } from '@credo-ts/react-hooks';
import {PrimaryHeader} from "../components/IcredyComponents";
import { SearchBar } from "../components/IcredyComponents";
import { RootStackParams, Screens, Stacks } from "../types/navigators";
import { StackNavigationProp } from "@react-navigation/stack";
import { ColorPallet, TextTheme } from '../theme'

interface ConnectionItem {
    name: string;
    id: string;
}

const EstablishedConnection = () => {
    const navigation = useNavigation<StackNavigationProp<RootStackParams>>()
    const { agent } = useAgent();
    const [activeTab, setActiveTab] = useState("Organization");
    const [organizations, setOrganizations] = useState<ConnectionItem[]>([]);
    const [individuals, setIndividuals] = useState<ConnectionItem[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const { width, height } = useWindowDimensions();

    useEffect(() => {
        const fetchConnections = async () => {
            try {
                if (agent?.connections) {
                    const allConnections = await agent.connections.getAll();
    
                    const orgs: ConnectionItem[] = [];
                    const indivs: ConnectionItem[] = [];
    
                    const organizationLabels = ["icredy"];
                    const excludeLabels = ["cloud mediator", "my mediator", "mediator"];
    
                    allConnections.forEach(connection => {
                        if (connection.theirLabel) {
                            const labelLower = connection.theirLabel.toLowerCase();
    
                            // Exclude connections with specific labels
                            if (excludeLabels.includes(labelLower)) {
                                return;
                            }
    
                            if (organizationLabels.includes(labelLower)) {
                                orgs.push({
                                    name: connection.theirLabel,
                                    id: connection.id
                                });
                            } else {
                                indivs.push({
                                    name: connection.theirLabel || "Unknown",
                                    id: connection.id
                                });
                            }
                        }
                    });
    
                    setOrganizations(orgs);
                    setIndividuals(indivs);
                }
            } catch (error) {
                console.error("Error fetching connections:", error);
            }
        };
    
        fetchConnections();
    }, [agent]);
    

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        setSearchQuery(""); 
    };

    // Filter connections based on search query
    const filteredConnections = () => {
        const currentList = activeTab === "Organization" ? organizations : individuals;
        if (!searchQuery) return currentList;

        return currentList.filter(item =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    };

    const handleChatNavigation = (connectionId: string, name: string) => {
        navigation.navigate(Stacks.ContactStack, {
          screen: Screens.Chat, 
          params: { connectionId }, 
        });
      };
    

    return (
        <SafeAreaView style={styles.safeContainer}>
            <PrimaryHeader/>
            <View style={styles.mainContainer}>
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === "Organization" && styles.activeTab]}
                        onPress={() => handleTabChange("Organization")}
                    >
                        <MaterialIcons
                            name="business"
                            size={20}
                            style={[styles.icon, activeTab === "Organization" && styles.activeIcon]}
                        />
                        <Text style={[styles.tabText, activeTab === "Organization" && styles.activeTabText]}>
                            Organisation
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === "Individual" && styles.activeTab]}
                        onPress={() => handleTabChange("Individual")}
                    >
                        <MaterialIcons
                            name="person"
                            size={20}
                            style={[styles.icon, activeTab === "Individual" && styles.activeIcon]}
                        />
                        <Text style={[styles.tabText, activeTab === "Individual" && styles.activeTabText]}>
                            Individual
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.searchContainer}>
                    <SearchBar
                        placeholder={`Search ${activeTab.toLowerCase()}s...`}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        width={width * 0.5}
                        height={height}
                    />
                </View>

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollViewContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.listContainer}>
                        {filteredConnections().map((item) => (
                            <View key={item.id} style={styles.listItemContainer}>
                                <Text style={styles.listItem}>{item.name}</Text>
                                 <TouchableOpacity onPress={() => handleChatNavigation(item.id, item.name)}>
                                    <MaterialIcons name="wechat" size={28} color="#154ABF" />
                                </TouchableOpacity>
                            </View>
                        ))}
                        {filteredConnections().length === 0 && (
                            <Text style={styles.noConnectionsText}>
                                {searchQuery
                                    ? `No connection found matching "${searchQuery}"`
                                    : `No connection found`
                                }
                            </Text>
                        )}
                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeContainer: {
        flex: 1,
        backgroundColor: ColorPallet.brand.primaryBackground,
    },
    mainContainer: {
        flex: 1,
        backgroundColor: ColorPallet.brand.primaryBackground,
    },
    scrollView: {
        flex: 1,
        backgroundColor: ColorPallet.brand.primaryBackground,
    },
    scrollViewContent: {
        flexGrow: 1,
        paddingBottom: 20,
    },
    tabContainer: {
        flexDirection: "row",
        backgroundColor: ColorPallet.brand.primaryBackground,
        borderRadius: 25,
        padding: 5,
        marginHorizontal: 0,
        width: "100%",
        justifyContent: "space-between",
        marginTop: 20,
        marginBottom: 15, 
    },
    searchContainer: {
        paddingHorizontal: 5,
        paddingBottom: 15, 
    },
    tab: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        justifyContent: "center",
        borderRadius: 25,
    },
    activeTab: {
        backgroundColor: ColorPallet.brand.primary,
    },
    tabText: {
        ...TextTheme.bold,
        color: ColorPallet.brand.text,
    },
    activeTabText: {
        color: ColorPallet.grayscale.white,
    },
    icon: {
        marginRight: 5,
        color: ColorPallet.grayscale.black,
    },
    activeIcon: {
        color: ColorPallet.grayscale.white,
    },
    listContainer: {
        alignItems: "center",
        width: "100%",
        paddingTop: 10,
    },
    listItemContainer: {
        width: "90%",
        backgroundColor: ColorPallet.brand.secondaryBackground,
        padding: 10,
        marginVertical: 5,
        borderRadius: 10,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    listItem: {
        ...TextTheme.normal,
        color: ColorPallet.brand.text,
    },
    noConnectionsText: {
        ...TextTheme.normal,
        color: ColorPallet.brand.text,
    },
    messageIconContainer: {
        padding: 5,
    },
});

export default EstablishedConnection;