import { StyleSheet, Text, View } from "react-native";
import { useState, useEffect } from "react";
import axios from "axios";

import FixturesComponent from "../components/FixturesComponent";
import SportsComponent from "../components/SportsComponent";
import HeadingContainer from "../components/HeaderComponent";

function CricketHomeScreen() {
  const [cricketData, setCricketData] = useState(null);

  useEffect(() => {
    axios
      .get("http://192.168.0.106:3000/cricket/todays-matches")
      .then((response) => {
        console.log(JSON.stringify(response.data.data, null, 2));
        setCricketData(response.data.data);
      })

      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  return (
    <View style={styles.rootContainer}>
      <HeadingContainer />
      <SportsComponent />
      <FixturesComponent data={{ data: cricketData, type: "Cricket" }} />
    </View>
  );
}

export default CricketHomeScreen;

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
  },
});
