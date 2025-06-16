import { useState } from "react";
import { View, StyleSheet } from "react-native";
import { COLORS } from "../constants/theme";

import HeadingContainer from "../components/HeaderComponent";
import SportsComponent from "../components/SportsComponent";
import MatchesList from "../components/footballComponents/FootballFixturesComponent";

function FootballHomeScreen() {
  const [currentOffset, setCurrentOffset] = useState(0);

  const onDateChange = (newOffset) => {
    setCurrentOffset(newOffset);
  };

  return (
    <View style={styles.rootContainer}>
      <HeadingContainer />
      <SportsComponent />
      <MatchesList
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

export default FootballHomeScreen;
