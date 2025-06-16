import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Linking,
} from "react-native";
import { Dimensions } from "react-native";
import { FlatList, ScrollView } from "react-native-gesture-handler";

const screenWidth = Dimensions.get("screen").width;

const TwitterFeed = ({ team1, team2, tweets }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  console.log(tweets[0]);

  return (
    <ScrollView style={styles.container}>
      <FlatList
        data={tweets}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => Linking.openURL(item.url)}
            activeOpacity={0.8}
          >
            <View style={styles.tweetCard}>
              <View style={styles.userInfo}>
                <Image
                  source={{ uri: item.profilePic }}
                  style={styles.profileImage}
                  resizeMode="contain"
                />
                <Text style={styles.user}>{item.user}</Text>
              </View>
              <Text style={styles.tweetText}>{item.text}</Text>

              {/* Show Images if present */}
              {item.images && item.images.length > 0 && (
                <View style={styles.imageWrapper}>
                  <FlatList
                    data={item.images.filter((img) => !img.endsWith(".svg"))}
                    keyExtractor={(img, idx) => idx.toString()}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    pagingEnabled
                    onScroll={(e) => {
                      const index = Math.round(
                        e.nativeEvent.contentOffset.x /
                          e.nativeEvent.layoutMeasurement.width
                      );
                      setCurrentImageIndex(index);
                    }}
                    renderItem={({ item: img }) => (
                      <Image
                        source={{ uri: img }}
                        style={styles.tweetImage}
                        resizeMode="contain"
                      />
                    )}
                  />
                  <View style={styles.imageCounter}>
                    <Text style={styles.imageCounterText}>
                      {currentImageIndex + 1}/{item.images.length}
                    </Text>
                  </View>
                </View>
              )}

              {/* Show video thumbnail if available */}
              {item.videoThumbnail && (
                <Image
                  source={{ uri: item.videoThumbnail }}
                  style={styles.videoThumbnail}
                  resizeMode="contain"
                />
              )}

              {/* Timestamp */}
              {item.timestamp && (
                <Text style={styles.timestamp}>
                  {new Date(item.timestamp).toLocaleString()}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        )}
        scrollEnabled={false}
        ListEmptyComponent={
          <Text style={styles.noDataText}>No tweets found.</Text>
        }
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    // backgroundColor: "#333",
  },
  tweetCard: {
    padding: 12,
    backgroundColor: "#333",
    marginVertical: 6,
    marginHorizontal: 10,
    borderRadius: 10,
    elevation: 2,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  profileImage: {
    width: 35,
    height: 35,
    borderRadius: 20,
    marginRight: 10,
  },
  user: {
    fontWeight: "bold",
    fontSize: 15,
    color: "#DDD",
    marginBottom: 6,
  },
  tweetText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#DDD",
  },
  imageContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    gap: 8,
  },
  tweetImage: {
    width: screenWidth - 45,
    height: 400,
    backgroundColor: "#333",
    borderRadius: 8,
  },
  videoThumbnail: {
    width: "100%",
    height: 180,
    borderRadius: 10,
    marginTop: 8,
  },
  timestamp: {
    marginTop: 10,
    fontSize: 12,
    color: "#DDD",
  },
  imageWrapper: {
    marginTop: 8,
    position: "relative",
  },
  imageCounter: {
    position: "absolute",
    top: 8,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  imageCounterText: {
    color: "#fff",
    fontSize: 12,
  },
  noDataText: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
    textAlign: "center",
    marginVertical: 10,
  },
});

export default TwitterFeed;
