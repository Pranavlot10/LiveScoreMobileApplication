import {
  View,
  Text,
  StyleSheet,
  Alert,
  Pressable,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from "react-native";
import { useState } from "react";
import { serverIP } from "@env";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";

import ButtonComponent from "../components/PressableComponents/ButtonComponent";
import FormComponent from "../components/FormComponents/FormComponent";
import ImageButtonComponent from "../components/PressableComponents/imageButtonComponent";

function RegisterScreen({ navigation }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    isFormValid: false,
  });

  const [isLoading, setIsLoading] = useState(false);

  function onFormUpdate(data) {
    console.log("Form data update:", data);
    setFormData(data);
  }

  async function RegisterHandler() {
    if (!formData.isFormValid) {
      Alert.alert("Invalid Input", "Please check all the fields.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post(`http://${serverIP}/register`, {
        name: formData.name,
        email: formData.email, // Fixed to use email instead of emailOrUsername
        password: formData.password,
      });

      const { token } = res.data;
      await AsyncStorage.setItem("token", token);
      console.log("Registered & Token saved!");

      navigation.navigate("HomeScreen");
    } catch (err) {
      console.error("Registration error:", err.response?.data || err.message);
      Alert.alert("Registration Failed", "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={["#2C2C2C", "#1E1E1E"]}
        style={styles.gradientBackground}
      >
        <ScrollView
          contentContainerStyle={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoContainer}>
            {/* <Image
              source={require("../assets/splash.png")}
              style={styles.logo}
              resizeMode="contain"
            /> */}
            <Text style={styles.appName}>PulseScore</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.heading}>Create Account</Text>
            <Text style={styles.subheading}>Sign up to get started</Text>

            <FormComponent type="register" onInputChange={onFormUpdate} />

            <View style={styles.buttonContainer}>
              <ButtonComponent
                title={isLoading ? "Registering..." : "Sign Up"}
                onPress={RegisterHandler}
                fontSize={{ fontSize: 18 }}
                disabled={!formData.isFormValid || isLoading}
                gradientColors={["#757575", "#515151"]}
              />
            </View>

            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.divider} />
            </View>

            <View style={styles.socialButtonsContainer}>
              <ImageButtonComponent
                onPress={() => console.log("Google Register Pressed")}
                iconSource={require("../assets/google.png")}
                alt="Google"
                iconStyle={styles.socialIcon}
                containerStyle={styles.socialButtonContainer}
              />
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Pressable onPress={() => navigation.navigate("LoginScreen")}>
              <Text style={styles.loginText}>Sign In</Text>
            </Pressable>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: "space-between",
    padding: 24,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
  },
  appName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#E0E0E0",
    marginTop: 8,
  },
  formContainer: {
    backgroundColor: "rgba(60, 60, 60, 0.4)",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    marginVertical: 20,
    borderWidth: 1,
    borderColor: "rgba(80, 80, 80, 0.5)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  heading: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#E0E0E0",
    marginBottom: 8,
  },
  subheading: {
    fontSize: 16,
    color: "#AFAFAF",
    marginBottom: 30,
  },
  buttonContainer: {
    marginTop: 16,
    width: "100%",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(200, 200, 200, 0.15)",
  },
  dividerText: {
    color: "#AFAFAF",
    paddingHorizontal: 16,
    fontSize: 14,
  },
  socialButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 8,
  },
  socialButtonContainer: {
    marginHorizontal: 12,
  },
  socialIcon: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(200, 200, 200, 0.25)",
    backgroundColor: "rgba(80, 80, 80, 0.5)",
    padding: 12,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 24,
  },
  footerText: {
    color: "#AFAFAF",
    fontSize: 16,
  },
  loginText: {
    color: "#B0B0B0",
    fontWeight: "600",
    fontSize: 16,
  },
});
