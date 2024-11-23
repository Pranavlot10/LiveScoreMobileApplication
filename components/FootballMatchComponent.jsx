import { StyleSheet, View, Text, Pressable } from "react-native";
import IconComponent from "./PressableComponents/IconComponent";

function FootballMatchComponent({ time, hTeam, aTeam, hScore, aScore }) {
  return (
    <Pressable
      style={styles.rootContainer}
      onPress={() => {
        console.log("Match Component Pressed");
      }}
      android_ripple={{ color: "#7ef240" }}
    >
      <View style={styles.innerContainer}>
        <Text style={styles.text}>{time}</Text>
        <View style={styles.scoreContainer}>
          <Text style={styles.text}>{hTeam}</Text>
          <Text style={styles.text}>{aTeam}</Text>
        </View>
        <Text style={styles.text}>:</Text>
        <View style={styles.scoreContainer}>
          <Text style={styles.text}>{hScore}</Text>
          <Text style={styles.text}>{aScore}</Text>
        </View>
        <View>
          <IconComponent
            name="star-outline"
            color="black"
            packageName="Ionicon"
            style={styles.favButton}
            iconSize={20}
          />
        </View>
      </View>
    </Pressable>
  );
}

export default FootballMatchComponent;

const styles = StyleSheet.create({
  rootContainer: {
    borderWidth: 2,
    padding: 10,
    borderRadius: 8,
    marginBottom: 5,
  },
  innerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 5,
  },
  text: {
    fontSize: 18,
    fontWeight: "bold",
  },
  scoreContainer: {
    flexDirection: "column",
    justifyContent: "space-between",
  },
  favButton: {
    justifyContent: "center",
  },
});
