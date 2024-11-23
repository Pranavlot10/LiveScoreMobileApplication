import { StyleSheet, View, Text } from "react-native";
import { useState } from "react";
import validator from "validator";
import InputComponent from "./InputComponent";

function FormComponent({ type }) {
  const [input, setInput] = useState({
    name: {
      value: "",
      isValidValue: true,
    },
    email: {
      value: "",
      isValidValue: true,
    },
    password: {
      value: "",
      isValidValue: true,
    },
    confirmPassword: {
      value: "",
      isValidValue: true,
    },
  });

  function validationHandler(type, text) {
    if (type === "name") {
      setInput((curInputs) => {
        return {
          ...curInputs,
          ["name"]: {
            value: text,
            isValidValue:
              validator.isAlphanumeric(text) &&
              validator.isLength(text, { min: 3, max: 15 }),
          },
        };
      });
    }
    if (type === "email") {
      setInput((curInputs) => {
        return {
          ...curInputs,
          ["email"]: { value: text, isValidValue: validator.isEmail(text) },
        };
      });
    }
    if (type === "password") {
      setInput((curInputs) => {
        return {
          ...curInputs,
          ["password"]: {
            value: text,
            isValidValue: validator.isStrongPassword(text),
          },
        };
      });
    }
    if (type === "confirmPassword") {
      setInput((curInputs) => {
        return {
          ...curInputs,
          ["confirmPassword"]: {
            value: text,
            isValidValue: validator.equals(text, input.password.value),
          },
        };
      });
    }
  }
  if (type === "login") {
    return (
      <View>
        <InputComponent
          title="Email"
          validationHandler={validationHandler.bind(this, "email")}
          isValid={input.email.isValidValue}
        />
        <InputComponent
          title="Password"
          textConfig={{ secureTextEntry: true }}
          validationHandler={validationHandler.bind(this, "password")}
          isValid={input.password.isValidValue}
        />
      </View>
    );
  }

  return (
    <View>
      <InputComponent
        title="Name"
        validationHandler={validationHandler.bind(this, "name")}
        isValid={input.name.isValidValue}
      />
      <InputComponent
        title="Email"
        validationHandler={validationHandler.bind(this, "email")}
        isValid={input.email.isValidValue}
      />
      <InputComponent
        title="Password"
        textConfig={{ secureTextEntry: true }}
        validationHandler={validationHandler.bind(this, "password")}
        isValid={input.password.isValidValue}
      />
      <InputComponent
        title="Confirm Password"
        textConfig={{ secureTextEntry: true }}
        validationHandler={validationHandler.bind(this, "confirmPassword")}
        isValid={input.confirmPassword.isValidValue}
      />
    </View>
  );
}

export default FormComponent;

const styles = StyleSheet.create({});
