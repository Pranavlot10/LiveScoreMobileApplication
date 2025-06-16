import React, { useEffect } from "react";
import { View, Button, Text } from "react-native";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import useAuthStore from "../zustand/useAuthStore";
import { useNavigation } from "@react-navigation/native";

WebBrowser.maybeCompleteAuthSession();

export default function GoogleSignInScreen() {
  const navigation = useNavigation();
  const { setToken } = useAuthStore();

  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: "<YOUR_WEB_CLIENT_ID>",
    androidClientId: "<YOUR_ANDROID_CLIENT_ID>",
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { authentication } = response;
      const token = authentication?.accessToken;
      if (token) {
        handleGoogleLogin(token);
      }
    }
  }, [response]);

  const handleGoogleLogin = async (token) => {
    try {
      // Store the token like manual login
      await setToken(token);

      // Optionally, fetch user info
      const userInfoRes = await fetch(
        "https://www.googleapis.com/userinfo/v2/me",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const userInfo = await userInfoRes.json();
      console.log("Google User Info:", userInfo);

      // Navigate to home or wherever
      navigation.navigate("HomeScreen");
    } catch (err) {
      console.error("Google login error:", err);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 18, marginBottom: 20 }}>Login with Google</Text>
      <Button
        title="Sign in with Google"
        onPress={() => promptAsync()}
        disabled={!request}
      />
    </View>
  );
}
