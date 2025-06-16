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
  import("../components/footballComponents/TableComponent")
);

const TeamPlayerStatsPage = lazy(() => import("../components/TeamPlayerStats"));

const LeagueTeamsStatsPage = lazy(() =>
  import(
    "../components/footballComponents/LeagueComponents/LeagueTeamStatsPage"
  )
);

// Eagerly loaded component
import LeagueMatchesPage from "../components/footballComponents/LeagueComponents/LeagueMatchesComponent";
import TeamSquadPage from "../components/TeamSquadPage";
import TeamMatchesPage from "../components/TeamMatchesPage";
import TeamNewsPage from "../components/TeamNewsPage";

export default function TeamDetailsScreen({ route, navigation }) {
  const {
    sport,
    id,
    teamName,
    teamLogo,
    leagueId,
    seasonId,
    leagueName,
    leagueImage,
  } = route.params;

  console.log(sport);

  const type = "teams"; // ✅ Scoped type

  const { isFavourite, addFavourite, removeFavourite, loadFavourites } =
    useFavouritesStore();

  const teamItem = {
    sport: sport,
    id: id,
    name: teamName,
    image: teamLogo,
    leagueId: leagueId,
    seasonId: seasonId,
    leagueName: leagueName,
  };

  const fav = isFavourite(id, sport, type);
  const [isFavorite, setIsFavorite] = useState(fav);

  useEffect(() => {
    loadFavourites(); // ✅ Load favourites on mount
  }, []);

  useEffect(() => {
    setIsFavorite(fav); // ✅ Sync UI on changes
  }, [fav]);

  const toggleFavorite = () => {
    if (isFavorite) {
      removeFavourite(id, sport, type);
    } else {
      addFavourite(teamItem, sport, type);
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
    { key: "Squad", title: "Squad" },
    { key: "playerStats", title: "Player Stats" },
    { key: "table", title: "Table" },
    { key: "news", title: "News" },
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
        return <TeamMatchesPage sport={sport} teamId={id} />;
      case "Squad":
        return (
          <Suspense
            fallback={<Text style={styles.loadingText}>Loading Stats...</Text>}
          >
            <TeamSquadPage
              id={id}
              sport={sport}
              leagueId={leagueId}
              seasonId={seasonId}
              teamLogo={teamLogo}
              name={teamName}
            />
          </Suspense>
        );
      case "playerStats":
        return (
          <Suspense
            fallback={<Text style={styles.loadingText}>Loading Stats...</Text>}
          >
            <TeamPlayerStatsPage
              sport={sport}
              id={id}
              leagueId={leagueId}
              seasonId={seasonId}
              teamLogo={teamLogo}
              name={teamName}
            />
          </Suspense>
        );
      case "news":
        return (
          <Suspense
            fallback={<Text style={styles.loadingText}>Loading Stats...</Text>}
          >
            <TeamNewsPage teamName={teamName} />
          </Suspense>
        );
      case "table":
        return (
          <Suspense
            fallback={<Text style={styles.loadingText}>Loading Table...</Text>}
          >
            <TableComponent
              sport={sport}
              leagueId={leagueId}
              seasonId={seasonId}
            />
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
            {teamLogo ? (
              <Image
                source={{ uri: teamLogo }}
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
            {teamName}
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
