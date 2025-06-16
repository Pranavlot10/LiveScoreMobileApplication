import { StyleSheet, View, Text } from "react-native";
import { useEffect, useState } from "react";
import axios from "axios";
import { ScrollView } from "react-native-gesture-handler";

import LineupPitch from "./LineupPitchComponent";
import SubstitutesComponent from "./FootballSubstitutesComponent";

export default function FootballLineupsComponent({
  incidentsData,
  lineupsData,
  matchId,
  homeTeamLogo,
  awayTeamLogo,
}) {
  console.log("matchId", matchId);
  console.log(lineupsData?.home?.formation);
  console.log(lineupsData?.away?.formation);
  return (
    <ScrollView style={styles.rootContainer}>
      <LineupPitch
        incidentsData={incidentsData}
        lineupData={lineupsData}
        matchId={matchId}
        homeTeamLogo={homeTeamLogo}
        awayTeamLogo={awayTeamLogo}
      />
      <SubstitutesComponent
        incidentsData={incidentsData}
        lineupData={lineupsData}
        matchId={matchId}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    // backgroundColor: "#111",
  },
});
