import React, { useState, useMemo } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { FlatList } from "react-native-gesture-handler";

const StatCategoryCard = ({ title, headers, values, statKey }) => {
  // console.log(Array.isArray(values));
  // console.log(title);
  // console.log(headers);
  // console.log(values[0].playerName, values[0][statKey]);

  const [showFullList, setShowFullList] = useState(false);

  // Process values: Sort and assign dynamic ranks
  const rankedValues = useMemo(() => {
    if (!statKey) return values;

    // Sort in descending order based on the statKey (e.g., "Runs", "Wickets")
    const sortedValues = [...values].sort((a, b) => b[statKey] - a[statKey]);

    let rank = 1;
    let prevValue = null;
    return sortedValues.map((item, index) => {
      if (index === 0 || item[statKey] !== prevValue) {
        rank = index + 1; // Only increment rank when value changes
      }
      prevValue = item[statKey];
      return { ...item, rank };
    });
  }, [values, statKey]);

  const toggleList = () => {
    setShowFullList(!showFullList);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.headerRow}>
        {headers.map((header, index) => {
          if (header === "Player") {
            return (
              <Text key={index} style={[styles.headerText, { flex: 3.4 }]}>
                {header}
              </Text>
            );
          }
          return (
            <Text key={index} style={styles.headerText}>
              {header}
            </Text>
          );
        })}
      </View>
      <FlatList
        data={showFullList ? rankedValues : rankedValues.slice(0, 5)}
        keyExtractor={(item, index) => index}
        renderItem={({ item, index }) => (
          <View style={styles.row}>
            <Text style={styles.rank}>{item.rank}</Text>
            <Image source={{ uri: item.imageURL }} style={styles.image} />
            <View style={[styles.playerInfo]}>
              <Text style={styles.name}>{item.playerName}</Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                {/* <Image
                  source={{ uri: item.teamImageUrl }}
                  style={styles.teamImage}
                /> */}
                <Text style={styles.team}>{item.teamName}</Text>
              </View>
            </View>
            {headers.slice(1).map((header, index) => (
              <Text key={index} style={styles.stat}>
                {item[header]}
              </Text>
            ))}
          </View>
        )}
      />

      {values.length > 5 && (
        <TouchableOpacity onPress={toggleList} style={styles.button}>
          <Text style={styles.buttonText}>
            {showFullList ? "Show Less" : "Show More"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1E1E1E",
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    // marginBottom: 5,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
  },
  headerText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#AAAAAA",
    flex: 1,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
  },
  rank: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "bold",
    width: 30,
    textAlign: "center",
  },
  image: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  teamImage: {
    width: 15,
    height: 15,
    borderRadius: 20,
    marginRight: 5,
  },
  playerInfo: {
    flex: 2,
  },
  name: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  team: {
    fontSize: 12,
    color: "#AAAAAA",
  },
  stat: {
    fontSize: 14,
    color: "#FFFFFF",
    flex: 1,
    textAlign: "center",
  },
  button: {
    marginTop: 10,
    paddingVertical: 8,
    backgroundColor: "#444",
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});

export default StatCategoryCard;
