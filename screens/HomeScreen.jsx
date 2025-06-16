import { useState } from "react";
import { View, StyleSheet } from "react-native";

import useSportsStore from "../zustand/useSportsStore";

import SportsComponent from "../components/SportsComponent";
import HeadingContainer from "../components/HeaderComponent";
import DatePickerComponent from "../components/PressableComponents/datepicker";
import CricketHomeScreen from "./CricketHomeScreen";
import FootballHomeScreen from "./FootballHomeScreen";

function HomeScreen() {
  const { selectedSport, setSelectedSport } = useSportsStore(); // Use Zustand state
  const [currentOffset, setCurrentOffset] = useState(0);

  const onDateChange = (newOffset) => {
    setCurrentOffset(newOffset);
  };

  console.log("hs", currentOffset);

  return (
    <View style={styles.rootContainer}>
      <HeadingContainer />
      <SportsComponent />
      <View style={styles.dateContainer}>
        <DatePickerComponent
          currentOffset={currentOffset}
          setCurrentOffset={onDateChange}
        />
      </View>
      {selectedSport === "cricket" ? (
        <CricketHomeScreen
          currentOffset={currentOffset}
          setCurrentOffset={onDateChange}
        />
      ) : (
        <FootballHomeScreen
          currentOffset={currentOffset}
          setCurrentOffset={onDateChange}
        />
      )}
    </View>
  );
}

export default HomeScreen;

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
  },
});
