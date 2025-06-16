import { View, StyleSheet } from "react-native";
import HeadingContainer from "../components/HeaderComponent";
import SportsComponent from "../components/SportsComponent";
import FixturesComponent from "../components/CricketMatchDetailsComponents/FixturesComponent";
import { COLORS } from "../constants/theme";

function CricketHomeScreen() {
  return (
    <View style={styles.rootContainer}>
      <HeadingContainer />
      <SportsComponent />
      <FixturesComponent />
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});

export default CricketHomeScreen;
