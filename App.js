import { StyleSheet } from "react-native";
import { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import "react-native-gesture-handler";
import "react-native-reanimated";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import useSportsStore from "./zustand/useSportsStore";
import useAuthStore from "./zustand/useAuthStore";
import RegisterScreen from "./screens/RegisterScreen";
import AuthLoadingScreen from "./screens/AuthLoadingScreen";
import LoginScreen from "./screens/LoginScreen";
import OptionsScreen from "./screens/OptionsScreen";
import FootballHomeScreen from "./screens/FootballHomeScreen";
import CricketHomeScreen from "./screens/CricketHomeScreen";
import CricketMatchDetailsScreen from "./screens/CricketMatchDetailsScreen";
import NewsScreen from "./screens/NewsScreen";
import NewsContentScreen from "./screens/NewsContentScreen";
import CricketSeriesScreen from "./screens/CricketSeriesScreen";
import FootballMatchDetailsScreen from "./screens/FootballMatchDetailsScreen";
import FootballLeagueScreen from "./screens/FootballLeagueScreen";
import BasketHomeScreen from "./screens/BasketHomeScreen";
import BasketMatchDetailsScreen from "./screens/BasketMatchDetailsScreen";
import WebViewScreen from "./components/WebViewScreen";
import TeamDetailsScreen from "./screens/TeamDetailsScreen";

import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from "react-native-reanimated";
import FavoritesScreen from "./screens/FavouritesScreen";
import BasketballLeagueScreen from "./screens/BasketLeagueScreen";

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const SportStack = createNativeStackNavigator();

// Sport Stack Navigator (defines the stack structure)
function SportStackNavigator() {
  const selectedSport = useSportsStore((state) => state.selectedSport);

  const sportScreens = {
    Football: [
      { name: "FootballHome", component: FootballHomeScreen },
      { name: "FootballMatchDetails", component: FootballMatchDetailsScreen },
      { name: "FootballLeagueScreen", component: FootballLeagueScreen },
    ],
    Cricket: [
      { name: "CricketHome", component: CricketHomeScreen },
      { name: "CricketMatchDetails", component: CricketMatchDetailsScreen },
      { name: "CricketSeriesScreen", component: CricketSeriesScreen },
    ],
    Basketball: [
      { name: "BasketballHome", component: BasketHomeScreen },
      { name: "BasketMatchDetails", component: BasketMatchDetailsScreen },
      { name: "BasketballLeagueScreen", component: BasketballLeagueScreen }, // Looks duplicated, fix if needed
    ],
  };

  const screens = sportScreens[selectedSport] || sportScreens.Football;
  const initialRoute = screens[0].name;

  return (
    <SportStack.Navigator
      key={selectedSport} // <-- Important: forces stack to reinitialize on sport change
      initialRouteName={initialRoute}
      screenOptions={{ headerShown: false }}
    >
      {screens.map((screen) => (
        <SportStack.Screen
          key={screen.name}
          name={screen.name}
          component={screen.component}
        />
      ))}
    </SportStack.Navigator>
  );
}

function TabNavigation() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 50,
          backgroundColor: "#666666", // Grayish color
        },
        tabBarShowLabel: false,
        tabBarActiveTintColor: "#ffffff", // White for active
        tabBarInactiveTintColor: "#ffffff", // White for inactive
      }}
    >
      <Tab.Screen
        name="SportHome"
        component={SportStackNavigator}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              color={color}
              size={30}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Favourites"
        component={FavoritesScreen}
        options={({ route }) => ({
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "star" : "star-outline"}
              color={color}
              size={30}
            />
          ),
        })}
      />
      <Tab.Screen
        name="News"
        component={NewsScreen}
        options={({ route }) => ({
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "newspaper" : "newspaper-outline"}
              color={color}
              size={30}
            />
          ),
        })}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const restoreToken = useAuthStore((state) => state.restoreToken);
  const initializeSport = useSportsStore((state) => state.initializeSport);

  useEffect(() => {
    const bootstrapAsync = async () => {
      await Promise.all([
        useAuthStore.getState().restoreToken(),
        useSportsStore.getState().initializeSport(),
      ]);
    };
    bootstrapAsync();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen
              name="AuthLoadingScreen"
              component={AuthLoadingScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="RegisterScreen"
              component={RegisterScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="LoginScreen"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="HomeScreen"
              component={TabNavigation}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="CricketNewsContent"
              component={NewsContentScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="OptionsScreen"
              component={OptionsScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="WebViewScreen"
              component={WebViewScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="TeamDetailsScreen"
              component={TeamDetailsScreen}
              options={{ headerShown: false }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
