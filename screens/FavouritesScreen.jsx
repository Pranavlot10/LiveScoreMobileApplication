import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  StatusBar,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useFavouritesStore } from "../zustand/useFavouritesStore";

export const COLORS = {
  primary: "#333",
  secondary: "#3a3a3a",
  background: "#222",
  text: "#FFF",
  card: "#444",
  border: "#666",
  accent: "#AAA",
};

export const FONTS = {
  regular: "System",
  bold: "System",
  size: {
    small: 12,
    medium: 16,
    large: 20,
    extraLarge: 28,
  },
};

const FavoritesScreen = () => {
  const [activeSection, setActiveSection] = useState("all");
  const filterTabs = ["all", "leagues", "teams", "matches"];
  const { favourites, loadFavourites } = useFavouritesStore();
  const navigation = useNavigation();

  useEffect(() => {
    loadFavourites();
  }, []);

  const favoriteLeagues = [
    ...favourites.football.leagues,
    ...favourites.cricket.leagues,
    ...favourites.basketball.leagues,
  ];

  const favoriteTeams = [
    ...favourites.football.teams,
    ...favourites.cricket.teams,
    ...favourites.basketball.teams,
  ];

  const favoriteMatches = [
    ...favourites.football.matches,
    ...favourites.cricket.matches,
    ...favourites.basketball.matches,
  ];

  const renderLeagueItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.leagueItem, { borderLeftColor: COLORS.accent }]}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: item.image || item.logo }}
        style={styles.leagueLogo}
        resizeMode="contain"
      />
      <Text style={styles.leagueName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderLeagueGridItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.leagueGridItem, { borderLeftColor: COLORS.accent }]}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: item.image || item.logo }}
        style={styles.leagueLogo}
        resizeMode="contain"
      />
      <Text style={styles.leagueName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderTeamGridItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.leagueGridItem, { borderLeftColor: COLORS.accent }]}
      onPress={() =>
        navigation.navigate("TeamDetailsScreen", {
          sport: item.sport,
          id: item.id,
          teamName: item.name,
          teamLogo: item.image,
          leagueId: item.leagueId,
          seasonid: item.seasonid,
          leagueName: item.leagueName,
        })
      }
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: item.image }}
        style={styles.leagueLogo}
        resizeMode="contain"
      />
      <Text style={styles.leagueName}>{item.name}</Text>
      <Text style={styles.teamLeague}>{item.leagueName || "Team"}</Text>
    </TouchableOpacity>
  );

  const renderTeamItem = ({ item }) => (
    console.log(item),
    (
      <TouchableOpacity
        style={[styles.teamHorizontalItem, { borderLeftColor: COLORS.accent }]}
        onPress={() =>
          navigation.navigate("TeamDetailsScreen", {
            sport: item.sport,
            id: item.id,
            teamName: item.name,
            teamLogo: item.image,
            leagueId: item.leagueId,
            seasonid: item.seasonid,
            leagueName: item.leagueName,
          })
        }
        activeOpacity={0.7}
      >
        <View justifyContent="center" alignItems="center">
          <Image
            source={{ uri: item.image }}
            style={styles.leagueLogo}
            resizeMode="contain"
          />
          <Text style={styles.leagueName}>{item.name}</Text>
          <Text style={styles.teamLeague}>{item.leagueName || "Team"}</Text>
        </View>
      </TouchableOpacity>
    )
  );

  const renderMatchItem = ({ item }) => (
    <TouchableOpacity style={styles.teamListItem} activeOpacity={0.7}>
      <Image source={{ uri: item.homeLogo }} style={styles.teamLogo} />
      <View style={styles.teamInfo}>
        <Text style={styles.teamName}>{item.name}</Text>
        <Text style={styles.teamLeague}>{item.matchStatus}</Text>
      </View>
      <Image source={{ uri: item.awayLogo }} style={styles.teamLogo} />
    </TouchableOpacity>
  );

  const renderContent = () => {
    switch (activeSection) {
      case "leagues":
        return (
          <View style={styles.section}>
            <FlatList
              key="leagues-grid-full"
              data={favoriteLeagues}
              renderItem={renderLeagueGridItem}
              keyExtractor={(item) => item.id.toString()}
              numColumns={2}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.leaguesGrid}
              columnWrapperStyle={styles.columnWrapper}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No favourite leagues yet.</Text>
              }
            />
          </View>
        );
      case "teams":
        return (
          <View style={styles.section}>
            <FlatList
              key="teams-grid-full"
              data={favoriteTeams}
              renderItem={renderTeamGridItem}
              keyExtractor={(item) => item.id.toString()}
              numColumns={2}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.leaguesGrid}
              columnWrapperStyle={styles.columnWrapper}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No favourite teams yet.</Text>
              }
            />
          </View>
        );
      case "matches":
        return (
          <View style={styles.section}>
            <FlatList
              key="matches-list-full"
              data={favoriteMatches}
              renderItem={renderMatchItem}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.teamsList}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No favourite matches yet.</Text>
              }
            />
          </View>
        );
      default:
        return (
          <>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Favorite Leagues</Text>
                <TouchableOpacity onPress={() => setActiveSection("leagues")}>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                key="leagues-horizontal"
                data={favoriteLeagues}
                renderItem={renderLeagueItem}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalList}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>No leagues added yet.</Text>
                }
              />
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Favorite Teams</Text>
                <TouchableOpacity onPress={() => setActiveSection("teams")}>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                key="teams-horizontal"
                data={favoriteTeams}
                renderItem={renderTeamItem}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalList}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>No teams added yet.</Text>
                }
              />
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Favorite Matches</Text>
                <TouchableOpacity onPress={() => setActiveSection("matches")}>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                key="matches-list-preview"
                data={favoriteMatches.slice(0, 2)}
                renderItem={renderMatchItem}
                keyExtractor={(item) => item.id.toString()}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.teamsList}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>No matches added yet.</Text>
                }
              />
            </View>
          </>
        );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.header}>Favorites</Text>
        </View>

        <View style={styles.tabContainer}>
          {filterTabs.map((key) => (
            <TouchableOpacity
              key={key}
              style={[styles.tab, activeSection === key && styles.activeTab]}
              onPress={() => setActiveSection(key)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeSection === key && styles.activeTabText,
                ]}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.contentScrollView}
          contentContainerStyle={styles.contentContainer}
        >
          {renderContent()}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  contentScrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  header: {
    fontSize: FONTS.size.extraLarge,
    fontWeight: "bold",
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    paddingVertical: 12,
    marginRight: 24,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.accent,
  },
  tabText: {
    fontSize: FONTS.size.medium,
    color: COLORS.border,
    fontWeight: "500",
    fontFamily: FONTS.regular,
  },
  activeTabText: {
    color: COLORS.text,
    fontWeight: "600",
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: FONTS.size.large,
    fontWeight: "600",
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  seeAllText: {
    color: COLORS.accent,
    fontSize: FONTS.size.small,
    fontWeight: "500",
    fontFamily: FONTS.regular,
  },
  leaguesGrid: {
    paddingTop: 8,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
  teamsList: {
    paddingTop: 8,
  },
  horizontalList: {
    paddingRight: 16,
  },
  leagueItem: {
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 12,
    marginRight: 14,
    width: 150,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
    borderLeftWidth: 3,
  },
  leagueGridItem: {
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 14,
    width: "48%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
    borderLeftWidth: 3,
  },
  teamHorizontalItem: {
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 12,
    marginRight: 14,
    width: 150,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
    borderLeftWidth: 3,
  },
  leagueLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 12,
    aspectRatio: 1,
    backgroundColor: "#fff",
  },
  leagueName: {
    fontSize: FONTS.size.medium,
    fontWeight: "600",
    fontFamily: FONTS.bold,
    color: COLORS.text,
    textAlign: "center",
  },
  teamListItem: {
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  teamLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.secondary,
  },
  teamInfo: {
    flex: 1,
    marginLeft: 14,
  },
  teamName: {
    fontSize: FONTS.size.medium,
    fontWeight: "600",
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: 4,
  },
  teamLeague: {
    fontSize: FONTS.size.small,
    fontFamily: FONTS.regular,
    color: COLORS.accent,
  },
  emptyText: {
    color: COLORS.accent,
    fontSize: FONTS.size.medium,
    textAlign: "center",
    marginTop: 16,
  },
});

export default FavoritesScreen;
