import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { useEffect } from "react";

WebBrowser.maybeCompleteAuthSession();

export default function useGoogleAuth(onLoginSuccess) {
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId:
      "339263160763-ndd5uq14dbm1h38rdn3rrfg71ib00u06.apps.googleusercontent.com",
    scopes: ["profile", "email"],
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { authentication } = response;
      onLoginSuccess(authentication);
    }
  }, [response]);

  return {
    request,
    promptAsync,
  };
}
