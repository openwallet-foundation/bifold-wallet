import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const More = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>More</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
});

export default More;
