import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  Image,
  TouchableOpacity,
} from "react-native";
import React, { useState, lazy, Suspense, useEffect } from "react";
import { TabView, TabBar } from "react-native-tab-view";
import { Ionicons } from "@expo/vector-icons";

import { COLORS } from "../constants/theme";
import { useFavouritesStore } from "../zustand/useFavouritesStore"; // ✅ Zustand import

const screenWidth = Dimensions.get("screen").width;

// Lazy loaded components
const TableComponent = lazy(() =>
  import("../components/BasketballComponents/BasketTableComponent")
);

const LeaguePlayerStatsPage = lazy(() =>
  import("../components//BasketballComponents/BasketLeaguePlayersStats")
);

const LeagueTeamsStatsPage = lazy(() =>
  import("../components/BasketballComponents/BasketLeagueTeamStats")
);

// Eagerly loaded component
import LeagueMatchesPage from "../components/footballComponents/LeagueComponents/LeagueMatchesComponent";

export default function BasketballLeagueScreen({ route, navigation }) {
  const { leagueId, seasonId, leagueName, leagueImage } = route.params;

  const sport = "football";
  const type = "leagues"; // ✅ Scoped type

  const { isFavourite, addFavourite, removeFavourite, loadFavourites } =
    useFavouritesStore();

  const leagueItem = {
    id: leagueId,
    name: leagueName,
    image: leagueImage,
    seasonId,
  };

  const fav = isFavourite(leagueId, sport, type);
  const [isFavorite, setIsFavorite] = useState(fav);

  useEffect(() => {
    loadFavourites(); // ✅ Load favourites on mount
  }, []);

  useEffect(() => {
    setIsFavorite(fav); // ✅ Sync UI on changes
  }, [fav]);

  const toggleFavorite = () => {
    if (isFavorite) {
      removeFavourite(leagueId, sport, type);
    } else {
      addFavourite(leagueItem, sport, type);
    }
  };

  const [routesVisited, setRoutesVisited] = useState({
    matches: true,
    playerStats: false,
    teamStats: false,
    table: false,
  });

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "matches", title: "Matches" },
    { key: "playerStats", title: "Player Stats" },
    { key: "teamStats", title: "Team Stats" },
    { key: "table", title: "Table" },
  ]);

  const handleIndexChange = (newIndex) => {
    setIndex(newIndex);
    const currentRouteKey = routes[newIndex].key;
    if (!routesVisited[currentRouteKey]) {
      setRoutesVisited((prev) => ({
        ...prev,
        [currentRouteKey]: true,
      }));
    }
  };

  const renderTabBar = (props) => (
    <TabBar
      {...props}
      indicatorStyle={styles.indicator}
      style={styles.tabBar}
      labelStyle={styles.tabLabel}
      activeColor={COLORS.text}
      inactiveColor="#999"
      pressColor="rgba(52, 152, 219, 0.1)"
    />
  );

  const renderScene = ({ route }) => {
    if (!routesVisited[route.key]) {
      return (
        <View style={styles.placeholderContent}>
          <Text style={styles.loadingText}>Swipe to load content...</Text>
        </View>
      );
    }

    switch (route.key) {
      case "matches":
        return <LeagueMatchesPage leagueId={leagueId} seasonId={seasonId} />;
      case "playerStats":
        return (
          <Suspense
            fallback={<Text style={styles.loadingText}>Loading Stats...</Text>}
          >
            <LeaguePlayerStatsPage leagueId={leagueId} seasonId={seasonId} />
          </Suspense>
        );
      case "teamStats":
        return (
          <Suspense
            fallback={<Text style={styles.loadingText}>Loading Stats...</Text>}
          >
            <LeagueTeamsStatsPage leagueId={leagueId} seasonId={seasonId} />
          </Suspense>
        );
      case "table":
        return (
          <Suspense
            fallback={<Text style={styles.loadingText}>Loading Table...</Text>}
          >
            <TableComponent leagueId={leagueId} seasonId={seasonId} />
          </Suspense>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            {leagueImage ? (
              <Image
                source={{ uri: leagueImage }}
                style={styles.leagueLogo}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.placeholderLogo}>
                <Text style={styles.placeholderText}>
                  {leagueName.charAt(0)}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.leagueTitle} numberOfLines={1}>
            {leagueName}
          </Text>
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={toggleFavorite}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isFavorite ? "star" : "star-outline"}
              size={24}
              color={isFavorite ? "#FFD700" : COLORS.text}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        renderTabBar={renderTabBar}
        onIndexChange={handleIndexChange}
        initialLayout={{ width: screenWidth }}
        lazy={false}
        swipeEnabled={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerContainer: {
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    overflow: "hidden",
  },
  leagueLogo: {
    width: 40,
    height: 40,
  },
  placeholderLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.text + "30",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  placeholderText: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "bold",
  },
  leagueTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
    flex: 1,
  },
  favoriteButton: {
    padding: 8,
    marginLeft: 8,
  },
  tabBar: {
    backgroundColor: COLORS.background,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  indicator: {
    backgroundColor: COLORS.text,
    height: 3,
  },
  tabLabel: {
    fontWeight: "500",
    textTransform: "none",
  },
  placeholderContent: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    textAlign: "center",
    fontSize: 16,
    color: "#888",
  },
});
