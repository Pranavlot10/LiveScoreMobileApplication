import { StyleSheet, FlatList, View } from "react-native";
import FootballMatchComponent from "./FootballMatchComponent";
import CricketMatchOverviewComponent from "./CricketMatchOverviewComponent";

function FixturesComponent({ data: { data, type } }) {
  function MatchComponentSelector(item) {
    if (type === "Football") {
      return (
        <FootballMatchComponent
          time={item.time}
          hTeam={item["team_a_short"]}
          aTeam={item["team_b_short"]}
          hScore={item.hScore}
          aScore={item.aScore}
        />
      );
    }
    if (type === "Cricket") {
      const scoresAndOvers = {
        type: item["match_type"],
        hScore:
          item["match_status"] === "Live"
            ? item["team_a_scores_over"][0]?.score || "0-0"
            : item["team_a_scores"],
        aScore:
          item["match_status"] === "Live"
            ? item["team_b_scores_over"][0]?.score || "0-0"
            : item["team_b_scores"],
        hOvers:
          item["match_type"] === "Test"
            ? ""
            : item["match_status"] === "Live"
            ? item["team_a_scores_over"][0]?.over || "0-0"
            : item["team_a_over"],
        aOvers:
          item["match_type"] === "Test"
            ? ""
            : item["match_status"] === "Live"
            ? item["team_b_scores_over"][0]?.over || "0-0"
            : item["team_b_over"],
      };
      const matchDetails = {
        matchId: item["match_id"],
        matchType: item["series"],
        matchStatus: item["day_stumps"]
          ? item["day_stumps"]
          : item["match_status"],
        date: item["match_date"],
        time: item["match_time"],
        toss: item["toss"],
        result: item["trail_lead"] ? item["trail_lead"] : item["result"],
        chase: item["need_run_ball"],
      };

      return (
        <CricketMatchOverviewComponent
          matchDetails={matchDetails}
          hTeam={item["team_a"]}
          aTeam={item["team_b"]}
          score={scoresAndOvers}
        />
      );
    }
  }
  return (
    <View style={styles.rootContainer}>
      <FlatList
        data={data}
        renderItem={({ item }) => MatchComponentSelector(item)}
        keyExtractor={(item) => item.match_id}
      ></FlatList>
    </View>
  );
}

export default FixturesComponent;

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 8,
    marginHorizontal: 10,
    padding: 10,
  },
});
