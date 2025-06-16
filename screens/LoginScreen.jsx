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

import useAuthStore from "../zustand/useAuthStore";

import ButtonComponent from "../components/PressableComponents/ButtonComponent";
import FormComponent from "../components/FormComponents/FormComponent";
import ImageButtonComponent from "../components/PressableComponents/imageButtonComponent";

function LoginScreen({ navigation }) {
  const [formData, setFormData] = useState({
    emailOrUsername: "",
    password: "",
    isFormValid: false,
  });

  const [isLoading, setIsLoading] = useState(false);

  const setToken = useAuthStore((state) => state.setToken);

  function onFormUpdate(data) {
    console.log("Form data update:", data);
    setFormData(data);
  }

  async function loginHandler() {
    if (!formData.isFormValid) {
      Alert.alert(
        "Invalid Input",
        "Please enter a valid email/username and password."
      );
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post(`http://${serverIP}/login`, {
        email: formData.emailOrUsername,
        password: formData.password,
      });

      const { token } = res.data;
      await AsyncStorage.setItem("token", token);
      console.log("Login successful & token saved!");

      setToken(token);
      navigation.navigate("HomeScreen");
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      Alert.alert("Login Failed", "Incorrect credentials or server error.");
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
              source={require("../assets/splash.png")} // Replace with your actual logo
              style={styles.logo}
              resizeMode="contain"
            /> */}
            <Text style={styles.appName}>PulseScore</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.heading}>Welcome Back</Text>
            <Text style={styles.subheading}>Sign in to continue</Text>

            <FormComponent type="login" onInputChange={onFormUpdate} />

            <View style={styles.forgotPasswordContainer}>
              <Pressable
                onPress={() => navigation.navigate("ForgotPasswordScreen")}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </Pressable>
            </View>

            <View style={styles.buttonContainer}>
              <ButtonComponent
                title={isLoading ? "Logging in..." : "Sign In"}
                onPress={loginHandler}
                fontSize={{ fontSize: 18 }}
                disabled={!formData.isFormValid || isLoading}
                gradientColors={["#757575", "#515151"]} // Gray gradient
              />
            </View>

            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.divider} />
            </View>

            <View style={styles.socialButtonsContainer}>
              <ImageButtonComponent
                onPress={() => console.log("Google Login Pressed")}
                iconSource={require("../assets/google.png")}
                alt="Google"
                iconStyle={styles.socialIcon}
                containerStyle={styles.socialButtonContainer}
              />
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <Pressable onPress={() => navigation.navigate("RegisterScreen")}>
              <Text style={styles.registerText}>Register</Text>
            </Pressable>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

export default LoginScreen;

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
    marginTop: 60, // Increased from 40 for better spacing without the logo
    marginBottom: 30, // Increased from 20 for better balance
  },
  logo: {
    width: 80,
    height: 80,
  },
  appName: {
    fontSize: 32, // Increased from 24 for more prominence
    fontWeight: "bold",
    color: "#FFFFFF", // Brighter white for better visibility
    letterSpacing: 1.2, // Adds slight letter spacing for stylish look
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3, // Subtle text shadow for depth
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
  forgotPasswordContainer: {
    alignItems: "flex-end",
    marginVertical: 16,
  },
  forgotPasswordText: {
    color: "#9E9E9E",
    fontSize: 14,
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
  registerText: {
    color: "#B0B0B0",
    fontWeight: "600",
    fontSize: 16,
  },
});
