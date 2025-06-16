import { StyleSheet, View, Text, Dimensions, Image } from "react-native";
import { FlatList, ScrollView } from "react-native-gesture-handler";
import { useEffect } from "react";
import { COLORS } from "../../constants/theme";

const screenWidth = Dimensions.get("screen").width;

export default function PointsTableComponent({ seriesData, seriesName }) {
  if (!seriesData) {
    return (
      <View>
        <Text>No Stats Data Available</Text>
      </View>
    );
  }

  function recentForm(results) {
    const maxResults = 5;
    const placeholdersNeeded = maxResults - results.length; // Calculate missing slots

    // Trim to last 5 results if there are more
    const trimmedResults = results.slice(-maxResults);

    // Fill placeholders **on the right side**
    const finalResults = [
      ...trimmedResults,
      ...Array(Math.max(placeholdersNeeded, 0)).fill(" "),
    ];

    const formStyles = {
      W: styles.formWin,
      L: styles.formLoss,
      D: styles.formDraw,
      N: styles.formDraw, // Treat 'N' as a draw
    };

    return (
      <View style={styles.formContainer}>
        {finalResults.map((result, index) => (
          <View key={index} style={formStyles[result] || styles.formUnknown}>
            <Text style={styles.formText}>{result}</Text>
          </View>
        ))}
      </View>
    );
  }

  // console.log(JSON.stringify(seriesData?.pointsTable, null, 2));

  return (
    <View style={styles.rootContainer}>
      <Text style={styles.title}>{`${seriesName} Table`}</Text>
      <View style={styles.table}>
        <View style={{ width: screenWidth * 0.45 }}>
          <View style={[styles.tableHeader]}>
            <Text style={[styles.headerText, { flex: 4 }]}></Text>
            <Text style={[styles.headerText, { flex: 6 }]}>Team</Text>
          </View>
          <FlatList
            data={seriesData?.pointsTable[0].pointsTableInfo}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => (
              <View style={styles.tableRow}>
                <Text style={[styles.rowText, { flex: 4 }]}>{index + 1}</Text>
                <Image
                  style={styles.image}
                  source={{
                    uri:
                      seriesData?.teamImages?.find(
                        (team) => team.id === item.teamImageId
                      )?.url || "",
                  }}
                />
                <Text style={[styles.rowText, { flex: 6, marginRight: 5 }]}>
                  {item.teamQualifyStatus
                    ? `${item.teamName}(${item.teamQualifyStatus})`
                    : `${item.teamName}`}
                </Text>
              </View>
            )}
          />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flex: 8 }}>
            <View style={styles.tableHeader}>
              <Text style={[styles.headerText, { flex: 4, width: 30 }]}>M</Text>
              <Text style={[styles.headerText, { flex: 4, width: 30 }]}>W</Text>
              <Text style={[styles.headerText, { flex: 4, width: 30 }]}>L</Text>
              <Text style={[styles.headerText, { flex: 6, width: 60 }]}>
                NRR
              </Text>
              <Text style={[styles.headerText, { flex: 6, width: 40 }]}>
                Pts
              </Text>
              <Text style={[styles.headerText, { flex: 8, width: 130 }]}>
                Last 5
              </Text>
            </View>
            <FlatList
              data={seriesData?.pointsTable[0].pointsTableInfo}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View style={styles.tableRow}>
                  <Text style={[styles.rowText, { flex: 4, width: 25 }]}>
                    {item.matchesPlayed || 0}
                  </Text>
                  <Text style={[styles.rowText, { flex: 4, width: 25 }]}>
                    {item.matchesWon || 0}
                  </Text>
                  <Text style={[styles.rowText, { flex: 4, width: 25 }]}>
                    {item.matchesLost || 0}
                  </Text>
                  <Text style={[styles.rowText, { flex: 6, width: 60 }]}>
                    {item.nrr}
                  </Text>
                  <Text style={[styles.rowText, { flex: 6, width: 20 }]}>
                    {item.points || 0}
                  </Text>
                  <Text style={[styles.rowText, { flex: 8 }]}>
                    {recentForm(item.form)}
                  </Text>
                </View>
              )}
            />
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: COLORS.primary,
    padding: 16,
  },
  table: {
    width: screenWidth - 32,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: COLORS.text,
  },
  tableHeader: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.accent,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.accent,
  },
  image: {
    height: 25,
    width: 25,
    borderRadius: 25,
    borderWidth: 1,
  },
  headerText: {
    color: COLORS.text,
    flex: 1,
    fontSize: 14,
    fontWeight: "bold",
    marginRight: 10,
    textAlign: "center",
    textAlign: "center",
  },
  rowText: {
    flex: 1,
    color: COLORS.text,
    fontSize: 14,
    textAlign: "center",
    marginRight: 15,
    lineHeight: 26,
    textAlign: "center",
  },
  formWin: {
    backgroundColor: "#06D001",
    borderRadius: 15,
    height: 25,
    width: 25,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 5,
    borderWidth: 1,
  },
  formLoss: {
    backgroundColor: "#FF2929",
    borderRadius: 15,
    height: 25,
    width: 25,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 5,
    borderWidth: 1,
  },
  formDraw: {
    backgroundColor: "#A6AEBF",
    borderRadius: 15,
    height: 25,
    width: 25,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 5,
    borderWidth: 1,
  },
  formUnknown: {
    backgroundColor: "#A6BEBF",
    borderRadius: 15,
    height: 25,
    width: 25,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 5,
    borderWidth: 1,
    // borderColor: "#A6BEBF",
  },
  formText: {
    color: "#fff",
    fontWeight: "bold",
  },
  formContainer: {
    flexDirection: "row",
  },
});
