import React, { useEffect, useState } from "react";
import { SafeAreaView, Text } from "react-native";

const BioAuthScreen = () => {
  return (
    <SafeAreaView
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "40%",
      }}
    >
      <Text style={{ fontSize: 24, fontWeight: "700" }}>
        Aries Bifold Locked
      </Text>
    </SafeAreaView>
  );
};

export default BioAuthScreen;
