import { StyleSheet, TextInput } from "react-native";

function InputComponent({ title, textConfig, isValid, validationHandler }) {
  const inputStyles = [styles.input];

  if (!isValid) {
    inputStyles.push(styles.invalidStyles);
  }
  return (
    <TextInput
      style={inputStyles}
      placeholder={title}
      onChangeText={validationHandler}
      {...textConfig}
    />
  );
}

export default InputComponent;

const styles = StyleSheet.create({
  input: {
    fontSize: 24,
    borderColor: "black",
    borderWidth: 2,
    borderRadius: 8,
    marginVertical: 15,
    height: 50,
    width: 350,
    paddingHorizontal: 10,
  },
  invalidStyles: {
    borderColor: "red",
  },
});
