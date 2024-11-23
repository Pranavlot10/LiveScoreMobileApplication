import { StyleSheet, View } from "react-native";

import ImageButtonComponent from "../components/PressableComponents/imageButtonComponent";
import DatePickerWidget from "../components/PressableComponents/datepicker";

function SportsComponent() {
  return (
    <View>
      <View style={styles.sportsContainer}>
        <ImageButtonComponent iconSource={require("../assets/football.png")} />
        <ImageButtonComponent iconSource={require("../assets/cricket.png")} />
        <ImageButtonComponent
          iconSource={require("../assets/basketball.png")}
        />
        {/* <IconComponent name="chevron-down" /> */}
      </View>
      <View style={styles.sportsContainer}>
        <DatePickerWidget />
      </View>
    </View>
  );
}

export default SportsComponent;

const styles = StyleSheet.create({
  sportsContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    borderWidth: 2,
    borderRadius: 8,
    paddingVertical: 5,
    marginHorizontal: 10,
    marginBottom: 5,
  },
});
