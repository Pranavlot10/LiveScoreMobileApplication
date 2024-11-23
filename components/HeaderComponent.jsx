import { StyleSheet, View, Text } from "react-native";
import IconComponent from "../components/PressableComponents/IconComponent";

function HeaderComponent() {
  return (
    <View style={styles.HeadingContainer}>
      <Text style={styles.heading}>Name</Text>
      <View style={styles.IconContainer}>
        <IconComponent name="search" packageName="Feather" />
        <IconComponent name="more-horizontal" packageName="Feather" />
      </View>
    </View>
  );
}

export default HeaderComponent;

const styles = StyleSheet.create({
  HeadingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    margin: 10,
    paddingHorizontal: 10,
  },
  IconContainer: {
    flex: 0.5,
    flexDirection: "row",
    justifyContent: "space-between",
    marginLeft: 20,
    alignItems: "center",
  },

  heading: {
    justifyContent: "center",
    alignItems: "center",
    fontSize: 32,
    fontWeight: "bold",
  },
});
