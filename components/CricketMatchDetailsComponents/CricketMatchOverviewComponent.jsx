import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Image,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import IconComponent from "../PressableComponents/IconComponent";

const screenWidth = Dimensions.get("screen").width;

function CricketMatchOverviewComponent({
  matchDetails,
  hTeam,
  aTeam,
  score,
  matchStatus,
  matchInfo,
}) {
  const navigation = useNavigation();
  const placeholderLogo = "../../assets/placeholder-team.png";

  function onPressHandler() {
    navigation.navigate("CricketMatchDetails", {
      matchId: matchDetails?.matchId,
      matchStatus: matchStatus,
      seriesId: matchDetails?.seriesId,
      hTeam: hTeam,
      aTeam: aTeam,
      matchInfo: matchInfo,
    });
  }

  const getStatusColor = (status) => {
    if (typeof status === "object" && status instanceof Date) {
      return "#f2c940"; // upcoming match
    }
    if (status?.toLowerCase().includes("live")) return "#7ef240";
    if (status?.toLowerCase().includes("complete")) return "#999";
    return "#f2c940";
  };

  return (
    <Pressable
      style={styles.rootContainer}
      onPress={onPressHandler}
      android_ripple={{ color: "#444" }}
    >
      <View style={styles.innerContainer}>
        <View style={styles.matchStatusContainer}>
          <Text
            style={[styles.statusText, { color: getStatusColor(matchStatus) }]}
          >
            {typeof matchStatus === "object" && matchStatus instanceof Date
              ? matchStatus.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : matchStatus}
          </Text>
        </View>

        <View style={styles.teamsContainer}>
          <View style={styles.teamRow}>
            <Image
              style={styles.logo}
              source={{ uri: hTeam.teamLogo || placeholderLogo }}
              defaultSource={require("../../assets/placeholder-team.png")}
            />
            <Text style={styles.teamText} numberOfLines={1}>
              {hTeam.teamName}
            </Text>
            <Text style={styles.scoreText}>
              {score?.hScore !== ""
                ? matchDetails.seriesType === "TEST"
                  ? score?.hScore.inngs2
                    ? `${score?.hScore.inngs1.runs}/${
                        score?.hScore.inngs1?.wickets || 0
                      } & ${score?.hScore.inngs2.runs}/${
                        score?.hScore.inngs2?.wickets || 0
                      }`
                    : `${score?.hScore.inngs1.runs}/${
                        score?.hScore.inngs1?.wickets || 0
                      }`
                  : `${score?.hScore.inngs1.runs}/${
                      score?.hScore.inngs1?.wickets || 0
                    }`
                : matchStatus === "In Progress"
                ? "Yet to bat"
                : ""}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.teamRow}>
            <Image
              style={styles.logo}
              source={{ uri: aTeam.teamLogo || placeholderLogo }}
              defaultSource={require("../../assets/placeholder-team.png")}
            />
            <Text style={styles.teamText} numberOfLines={1}>
              {aTeam.teamName}
            </Text>
            <Text style={styles.scoreText}>
              {score?.aScore !== ""
                ? matchDetails.seriesType === "TEST"
                  ? score?.aScore.inngs2
                    ? `${score?.aScore.inngs1.runs}/${
                        score?.aScore.inngs1?.wickets || 0
                      } & ${score?.aScore.inngs2.runs}/${
                        score?.aScore.inngs2?.wickets || 0
                      }`
                    : `${score?.aScore.inngs1.runs}/${
                        score?.aScore.inngs1?.wickets || 0
                      }`
                  : `${score?.aScore.inngs1.runs}/${
                      score?.aScore.inngs1?.wickets || 0
                    }`
                : matchStatus === "In Progress"
                ? "Yet to bat"
                : ""}
            </Text>
          </View>
        </View>

        <IconComponent
          name="star-outline"
          color="#AAA"
          packageName="Ionicon"
          iconSize={22}
          style={styles.favButton}
        />
      </View>
    </Pressable>
  );
}

export default CricketMatchOverviewComponent;

const styles = StyleSheet.create({
  rootContainer: {
    padding: 12,
    marginBottom: 1,
    backgroundColor: "#292929",
    borderBottomWidth: 1,
    borderBottomColor: "#383838",
  },
  innerContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  matchStatusContainer: {
    width: screenWidth / 8,
    paddingRight: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  teamsContainer: {
    flex: 1,
    paddingHorizontal: 8,
  },
  teamRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 7,
  },
  divider: {
    height: 1,
    backgroundColor: "#383838",
    marginVertical: 3,
  },
  logo: {
    height: 24,
    width: 24,
    marginRight: 12,
    borderRadius: 12,
  },
  teamText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: "#EEEEEE",
    marginRight: 8,
    letterSpacing: 0.3,
  },
  scoreText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#FFFFFF",
    width: 90,
    textAlign: "right",
  },
  favButton: {
    padding: 8,
    marginLeft: 4,
  },
});
