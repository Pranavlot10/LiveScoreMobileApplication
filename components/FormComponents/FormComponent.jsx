import { StyleSheet, View, Pressable, Text } from "react-native";
import { useState, useEffect } from "react";
import validator from "validator";
import InputComponent from "./InputComponent";

function FormComponent({ type, onInputChange }) {
  const [input, setInput] = useState({
    name: { value: "", isValidValue: false },
    emailOrUsername: { value: "", isValidValue: false },
    password: { value: "", isValidValue: false },
    confirmPassword: { value: "", isValidValue: false },
  });

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const payload = {
      name: input.name.value,
      emailOrUsername: input.emailOrUsername.value,
      password: input.password.value,
      confirmPassword: input.confirmPassword.value,
      isFormValid:
        input.emailOrUsername.isValidValue &&
        input.password.isValidValue &&
        (type === "login" ||
          (input.name.isValidValue && input.confirmPassword.isValidValue)),
    };
    onInputChange(payload);
  }, [input]);

  function validationHandler(fieldType, text) {
    setInput((prev) => {
      const updatedField = {
        value: text,
        isValidValue: validateField(fieldType, text, prev),
      };
      return { ...prev, [fieldType]: updatedField };
    });
  }

  function validateField(field, text, state) {
    switch (field) {
      case "name":
        return (
          validator.isAlphanumeric(text) &&
          validator.isLength(text, { min: 3, max: 15 })
        );
      case "emailOrUsername":
        return (
          validator.isEmail(text) ||
          (validator.isAlphanumeric(text) &&
            validator.isLength(text, { min: 3, max: 15 }))
        );
      case "password":
        return validator.isStrongPassword(text);
      case "confirmPassword":
        return validator.equals(text, state.password.value);
      default:
        return false;
    }
  }

  return (
    <View style={styles.formContainer}>
      {type !== "login" && (
        <InputComponent
          title="Name"
          placeholder="Enter your name"
          validationHandler={(text) => validationHandler("name", text)}
          isValid={input.name.isValidValue}
          inputStyle={styles.input}
          invalidInputStyle={styles.invalidInput}
          validInputStyle={styles.validInput}
        />
      )}

      <InputComponent
        title="Email or Username"
        placeholder="Enter your email or username"
        validationHandler={(text) => validationHandler("emailOrUsername", text)}
        isValid={input.emailOrUsername.isValidValue}
        inputStyle={styles.input}
        invalidInputStyle={styles.invalidInput}
        validInputStyle={styles.validInput}
      />

      <InputComponent
        title="Password"
        placeholder="Enter your password"
        textConfig={{ secureTextEntry: !showPassword }}
        validationHandler={(text) => validationHandler("password", text)}
        isValid={input.password.isValidValue}
        inputStyle={styles.input}
        invalidInputStyle={styles.invalidInput}
        validInputStyle={styles.validInput}
      />

      <Pressable onPress={() => setShowPassword((prev) => !prev)}>
        <Text style={styles.showPasswordText}>
          {showPassword ? "Hide Password" : "Show Password"}
        </Text>
      </Pressable>

      {type !== "login" && (
        <InputComponent
          title="Confirm Password"
          placeholder="Confirm your password"
          textConfig={{ secureTextEntry: !showPassword }}
          validationHandler={(text) =>
            validationHandler("confirmPassword", text)
          }
          isValid={input.confirmPassword.isValidValue}
          inputStyle={styles.input}
          invalidInputStyle={styles.invalidInput}
          validInputStyle={styles.validInput}
        />
      )}
    </View>
  );
}

export default FormComponent;

const styles = StyleSheet.create({
  formContainer: {
    width: "100%",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#1E2A3C", // Darker input background
    color: "#E0E0E0", // Light text
    borderWidth: 1,
    borderColor: "#E0E0E0", // Light border
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3, // Shadow for Android
  },
  invalidInput: {
    borderColor: "#EF5350", // Red border for invalid input
  },
  validInput: {
    borderColor: "#4CAF50", // Green border for valid input
  },
  showPasswordText: {
    color: "#42A5F5", // Professional blue
    textAlign: "right",
    fontSize: 14,
    fontWeight: "500",
    marginVertical: 6,
  },
});
