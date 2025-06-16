import { View, Text, TextInput, StyleSheet } from "react-native";

function InputComponent({
  title,
  placeholder,
  validationHandler,
  isValid,
  textConfig,
  inputStyle,
  invalidInputStyle,
  validInputStyle,
}) {
  return (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{title}</Text>
      <TextInput
        style={[
          styles.input,
          inputStyle,
          isValid === false && invalidInputStyle,
          isValid === true && validInputStyle,
        ]}
        placeholder={placeholder}
        placeholderTextColor="#B0BEC5"
        onChangeText={validationHandler}
        {...textConfig}
      />
    </View>
  );
}

export default InputComponent;

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: 10,
  },
  label: {
    color: "#E0E0E0",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 6,
  },
  input: {
    // Base styles (overridden by inputStyle prop)
  },
});
