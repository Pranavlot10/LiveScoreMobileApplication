import { StyleSheet, View, Text, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";

import IconComponent from "./PressableComponents/IconComponent";

function CricketMatchOverviewComponent({ matchDetails, hTeam, aTeam, score }) {
  const navigation = useNavigation();
  function onPressHandler() {
    console.log("Match Component Pressed");
    navigation.navigate("CricketMatchDetailsComponent");
  }
  return (
    <Pressable
      style={styles.rootContainer}
      onPress={onPressHandler}
      android_ripple={{ color: "#7ef240" }}
    >
      <View style={styles.innerContainer}>
        <View style={styles.dataContainer}>
          <View style={styles.matchDetailsContainer}>
            <View>
              <Text style={styles.text}>{matchDetails.matchType}</Text>
              <Text style={styles.text}>{matchDetails.matchStatus}</Text>
            </View>
            <View>
              <Text style={styles.text}>{matchDetails.date}</Text>
            </View>
          </View>
          <View style={styles.matchDataContainer}>
            <View style={styles.nameContainer}>
              <Text style={styles.boldText}>{hTeam}</Text>
              <Text style={styles.boldText}>{aTeam}</Text>
            </View>
            <View style={styles.scoreContainer}>
              <Text style={styles.boldText}>
                {score.type === "Test"
                  ? score.hScore
                  : `${score.hScore}(${score.hOvers})`}
              </Text>
              <Text style={styles.boldText}>
                {score.type === "Test"
                  ? score.aScore
                  : `${score.aScore}(${score.aOvers})`}
              </Text>
            </View>
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.text}>
              {matchDetails.chase
                ? matchDetails.chase
                : matchDetails.result === ""
                ? matchDetails.toss
                  ? matchDetails.toss
                  : `The match will start at ${matchDetails.time}`
                : matchDetails.result}
            </Text>
          </View>
        </View>
        <View>
          <IconComponent
            name="star-outline"
            color="black"
            packageName="Ionicon"
            iconSize={20}
            style={styles.favButton}
          />
        </View>
      </View>
    </Pressable>
  );
}

export default CricketMatchOverviewComponent;

const styles = StyleSheet.create({
  rootContainer: {
    borderWidth: 2,
    padding: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 5,
  },
  innerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dataContainer: {
    flex: 1,
  },
  text: {
    fontSize: 10,
    fontWeight: "500",
    paddingBottom: 3,
  },
  boldText: {
    fontSize: 16,
    fontWeight: "500",
    paddingBottom: 3,
  },
  nameContainer: {
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  scoreContainer: {
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  favButton: {
    justifyContent: "center",
    marginLeft: 20,
    marginRight: 5,
  },
  matchDataContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  matchDetailsContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoContainer: {
    paddingTop: 3,
  },
});
