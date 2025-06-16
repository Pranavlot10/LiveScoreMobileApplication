import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import { serverIP } from "@env";
import { useNavigation } from "@react-navigation/native";

// Format the date/time
const formatDate = (dateString) => {
  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// News Item Component
const NewsItem = ({ item, onPress }) => {
  return (
    <TouchableOpacity style={styles.newsItem} onPress={() => onPress(item)}>
      <Image source={{ uri: item.thumbnail }} style={styles.newsImage} />
      <View style={styles.newsContent}>
        <Text style={styles.newsTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={styles.newsDetails}>
          <Text style={styles.newsAuthor}>{item?.source?.name}</Text>
          <Text style={styles.newsTime}>{formatDate(item.date)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Main Component
const TeamNewsPage = ({ teamName }) => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  // Fetch news function (simulated)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const response = await axios.get(
          `http://${serverIP}/football/team/news/${teamName}`
        );

        // Update all states at once to reduce re-renders
        setNews(response?.data);
        // console.log(h2hData[0]);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
        // You might want to show an error message to the user here
      }
    };

    fetchData();
  }, [teamName]);

  // Handle news item press
  const handleNewsPress = (item) => {
    navigation.navigate("WebViewScreen", {
      url: item.url,
      title: item.title,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A1A1A" />

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#5F85DB" />
          <Text style={styles.loadingText}>Loading news...</Text>
        </View>
      ) : (
        <FlatList
          data={news}
          renderItem={({ item }) => (
            <NewsItem item={item} onPress={handleNewsPress} />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.newsList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No news articles found.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1E1E", // Dark grey background
  },
  newsList: {
    padding: 12,
  },
  newsItem: {
    backgroundColor: "#262626", // Dark card background
    borderRadius: 10,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  newsImage: {
    width: "100%",
    height: 250,
    resizeMode: "contain",
  },
  newsContent: {
    padding: 14,
  },
  newsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 10,
  },
  newsDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  newsAuthor: {
    fontSize: 14,
    color: "#BBBBBB", // Light grey text
  },
  newsTime: {
    fontSize: 12,
    color: "#888888", // Medium grey text
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#BBBBBB",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#BBBBBB",
    textAlign: "center",
  },
});

export default TeamNewsPage;
