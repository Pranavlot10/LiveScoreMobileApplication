import { Pressable, Text, StyleSheet } from "react-native";

function ButtonComponent({ title, onPress, fontSize }) {
  return (
    <Pressable style={styles.container} onPress={onPress}>
      <Text style={[styles.text, fontSize]}>{title}</Text>
    </Pressable>
  );
}

export default ButtonComponent;

const styles = StyleSheet.create({
  container: {
    borderWidth: 2,
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#7ef240",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 18,
    fontWeight: "500",
  },
});
