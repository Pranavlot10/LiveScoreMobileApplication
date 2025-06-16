// Enhanced HeaderComponent
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { COLORS, FONTS } from "../constants/theme";

function HeaderComponent() {
  const navigation = useNavigation();

  return (
    <View style={styles.headerContainer}>
      <Text style={styles.heading}>PulseScore</Text>
      <View style={styles.iconContainer}>
        <TouchableOpacity
          onPress={() => navigation.navigate("OptionsScreen")}
          style={styles.iconButton}
        >
          <Feather name="more-horizontal" size={28} color={COLORS.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default HeaderComponent;

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 12,
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  iconContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  heading: {
    fontSize: FONTS.size.extraLarge,
    fontWeight: "bold",
    color: COLORS.text,
    letterSpacing: 0.5,
  },
});
