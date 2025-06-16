import { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import axios from "axios";

import HeadingContainer from "../components/HeaderComponent";
import SportsComponent from "../components/SportsComponent";
import BasketFixtures from "../components/BasketballComponents/BasketFixturesComponent";
import { COLORS } from "../constants/theme";

function BasketHomeScreen() {
  const [currentOffset, setCurrentOffset] = useState(0); // 0 is the current date's offset

  const onDateChange = (newOffset) => {
    setCurrentOffset(newOffset);
  };

  console.log("basket");
  return (
    <View style={styles.rootContainer}>
      <HeadingContainer />
      <SportsComponent />

      <BasketFixtures
        currentOffset={currentOffset}
        setCurrentOffset={onDateChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});

export default BasketHomeScreen;
