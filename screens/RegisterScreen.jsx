import { View, Text, StyleSheet, Pressable } from "react-native";
import ButtonComponent from "../components/PressableComponents/ButtonComponent";
import FormComponent from "../components/FormComponents/FormComponent";
import ImageButtonComponent from "../components/PressableComponents/imageButtonComponent";

function RegisterScreen({ navigation }) {
  function PressHandler() {
    navigation.navigate("LoginScreen");
  }
  function GoogleRegisterHandler() {
    console.log("Icon Pressed!!!");
  }
  function RegisterHandler() {
    console.log("Button Pressed!!!");
    navigation.navigate("HomeScreen");
  }

  return (
    <View style={styles.rootcontainer}>
      <Text style={styles.heading}>Register</Text>
      <FormComponent />
      <ImageButtonComponent
        onPress={GoogleRegisterHandler}
        iconSource={require("../assets/google.png")}
        alt="Google"
        iconStyle={styles.icon}
      />
      <View style={styles.buttonContainer}>
        <ButtonComponent
          title="Register"
          onPress={RegisterHandler}
          fontSize={{ fontSize: 24 }}
        />
      </View>
      <Pressable onPress={PressHandler}>
        <Text style={styles.clickableText}>Existing User ?</Text>
      </Pressable>
    </View>
  );
}

export default RegisterScreen;

const styles = StyleSheet.create({
  rootcontainer: {
    flex: 1,
    padding: 10,
    alignItems: "center",
  },
  heading: {
    fontSize: 36,
    fontWeight: "bold",
    marginHorizontal: 20,
    marginVertical: 60,
  },
  icon: {
    borderRadius: 16,
    borderWidth: 2,
  },
  buttonContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  clickableText: {
    fontSize: 20,
    fontWeight: "500",
    marginVertical: 20,
    textAlign: "center",
    textDecorationLine: "underline",
  },
});
