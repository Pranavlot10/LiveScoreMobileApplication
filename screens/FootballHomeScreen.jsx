import { StyleSheet, View } from "react-native";
import { useState, useEffect } from "react";
import axios from "axios";

import FixturesComponent from "../components/FixturesComponent";
import SportsComponent from "../components/SportsComponent";
import HeaderComponent from "../components/HeaderComponent";

function FootballHomeScreen() {
  const [footballData, setFootballData] = useState(null);

  useEffect(() => {
    axios
      .get("http://192.168.0.106:3000/cricket/todays-matches")
      .then((response) => {
        console.log(JSON.stringify(response.data.data, null, 2));
        setFootballData(response.data.data); // Set the data from the server response
      })

      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  return (
    <View style={styles.rootContainer}>
      <HeaderComponent />
      <SportsComponent />
      {/* <Text> {data} </Text> */}
      <FixturesComponent data={{ data: footballData, type: "Football" }} />
    </View>
  );
}

export default FootballHomeScreen;

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
  },
});
