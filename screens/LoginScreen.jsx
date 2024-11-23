import { View, Text, StyleSheet, Pressable } from "react-native";
import ButtonComponent from "../components/PressableComponents/ButtonComponent";
import FormComponent from "../components/FormComponents/FormComponent";
import ImageButtonComponent from "../components/PressableComponents/imageButtonComponent";

function LoginScreen({ navigation }) {
  function PressHandler() {
    navigation.navigate("RegisterScreen");
  }
  function GoogleLoginHandler() {
    console.log("Icon Pressed!!!");
  }
  function LoginHandler() {
    console.log("Button Pressed!!!");
    navigation.navigate("HomeScreen");
  }

  return (
    <View style={styles.rootcontainer}>
      <Text style={styles.heading}>Login</Text>
      <FormComponent type="login" />
      <ImageButtonComponent
        onPress={GoogleLoginHandler}
        iconSource={require("../assets/google.png")}
        alt="Google"
        iconStyle={styles.icon}
      />
      <View style={styles.buttonContainer}>
        <ButtonComponent
          title="Login"
          onPress={LoginHandler}
          fontSize={{ fontSize: 24 }}
        />
      </View>
      <Pressable onPress={PressHandler}>
        <Text style={styles.clickableText}>New User ?</Text>
      </Pressable>
    </View>
  );
}

export default LoginScreen;

const styles = StyleSheet.create({
  rootcontainer: {
    flex: 1,
    padding: 10,
    alignItems: "center",
  },
  heading: {
    fontSize: 36,
    fontWeight: "bold",
    padding: 20,
    marginVertical: 40,
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
