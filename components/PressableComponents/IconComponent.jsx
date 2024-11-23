import { Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import Feather from "@expo/vector-icons/Feather";

function IconComponent({ onPress, name, color, style, iconSize, packageName }) {
  if (packageName === "Feather") {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => (pressed ? [styles.pressed, style] : style)}
      >
        <Feather name={name} color={color} size={iconSize ? iconSize : 34} />
      </Pressable>
    );
  }
  if (packageName === "Ionicon") {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => (pressed ? [styles.pressed, style] : style)}
      >
        <Ionicons name={name} color={color} size={iconSize ? iconSize : 34} />
      </Pressable>
    );
  }
}

export default IconComponent;

const styles = StyleSheet.create({
  pressed: {
    color: "#7ef240",
  },
});
