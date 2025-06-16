import { StyleSheet, View, Text, Dimensions, Pressable } from "react-native";
import React from "react";
import Svg, {
  Rect,
  Circle,
  Line,
  Text as SvgText,
  Image,
} from "react-native-svg";

const screenWidth = Dimensions.get("screen").width;
const PITCH_WIDTH = screenWidth * 0.95;
const PITCH_HEIGHT = PITCH_WIDTH * 2;

export default function SubstitutesComponent({ incidentsData, lineupData }) {
  if (!lineupData || (!lineupData.home && !lineupData.away)) {
    return null;
  }

  const { home, away } = lineupData;
  const homeSquad = home.players.map((player) => player.player.name);
  const awaySquad = away.players.map((player) => player.player.name);
  const homeTeam = home.players.filter((player) => player.substitute);
  const awayTeam = away.players.filter((player) => player.substitute);

  const homeMissingPlayers =
    home?.missingPlayers?.map((player) => ({
      player: player.player.name,
      reason: player.reason,
    })) || [];
  const awayMissingPlayers =
    away?.missingPlayers?.map((player) => ({
      player: player.player.name,
      reason: player.reason,
    })) || [];

  const PLAYER_RADIUS = 12; // Player circle size

  const yellowCardIncidents = incidentsData.incidents
    .map((incident) => {
      if (incident.incidentClass === "yellow") {
        return incident.playerName;
      }
    })
    .filter(Boolean);

  const redCardIncidents = incidentsData.incidents
    .map((incident) => {
      if (incident.incidentClass === "red") {
        return incident.playerName;
      }
    })
    .filter(Boolean);

  const goalScorers = incidentsData.incidents
    .map((incident) => {
      if (incident.incidentType === "goal") {
        return incident.player.name;
      }
    })
    .filter(Boolean);

  const subOutIncidents = incidentsData.incidents
    .map((incident) => {
      if (incident.incidentType === "substitution") {
        return incident.playerOut.name;
      }
    })
    .filter(Boolean);
  const subInIncidents = incidentsData.incidents
    .map((incident) => {
      if (incident.incidentType === "substitution") {
        return incident.playerIn.name;
      }
    })
    .filter(Boolean);

  // Improved rendering for player indicators
  const renderPlayerIndicators = (player, team, count) => {
    const cx = 15;
    const cy = 17;

    return (
      <React.Fragment>
        {/* Player Circle with improved shadow */}
        <Circle
          cx={cx}
          cy={cy}
          r={PLAYER_RADIUS + 1}
          fill="#2A2D3A"
          opacity={0.5}
        />
        <Circle
          cx={cx}
          cy={cy}
          r={PLAYER_RADIUS}
          fill={`#${team.playerColor.primary}`}
          stroke={`#${team.playerColor.fancyNumber}`}
          strokeWidth={2}
        />
        {/* Jersey Number */}
        <SvgText
          x={cx}
          y={cy + 4}
          fontSize={PLAYER_RADIUS}
          fill={`#${team.playerColor.number}`}
          fontWeight="bold"
          textAnchor="middle"
        >
          {player.jerseyNumber}
        </SvgText>

        {/* Yellow Card Indicator with improved styling */}
        {yellowCardIncidents.includes(player.player.name) && (
          <Rect
            x={cx + 5}
            y={cy - 20}
            width={8}
            rx={2}
            ry={2}
            height={15}
            fill="yellow"
            stroke="#333"
            strokeWidth={0.5}
          />
        )}

        {/* Red Card Indicator with improved styling */}
        {redCardIncidents.includes(player.player.name) && (
          <Rect
            x={cx + 5}
            y={cy - 20}
            width={8}
            rx={2}
            ry={2}
            height={15}
            fill="red"
            stroke="#333"
            strokeWidth={0.5}
          />
        )}

        {/* Substitution Indicator with improved design */}
        {subOutIncidents.includes(player.player.name) && (
          <>
            <Circle
              cx={cx + 8}
              cy={cy + 8}
              stroke={"black"}
              r={7}
              fill="#F0F0F0"
              strokeWidth={1.2}
            />
            <Image
              href={require("../../assets/footballIcons/down.png")}
              x={cx + 3.5}
              y={cy + 3.5}
              width={9}
              height={9}
            />
          </>
        )}

        {subInIncidents.includes(player.player.name) && (
          <>
            <Circle
              cx={cx + 9}
              cy={cy + 8.5}
              stroke={"black"}
              r={7}
              fill="#F0F0F0"
              strokeWidth={1.2}
            />
            <Image
              href={require("../../assets/footballIcons/up.png")}
              x={cx + 4.5}
              y={cy + 4}
              width={9}
              height={9}
            />
          </>
        )}

        {/* Goal indicators with counter */}
        {goalScorers.includes(player.player.name) && (
          <>
            <Circle
              cx={cx - 8}
              cy={cy - 9}
              r={8}
              fill="#2A2D3A"
              opacity={0.3}
            />
            <Circle
              cx={cx - 8}
              cy={cy - 9}
              r={7}
              fill="white"
              stroke="#333"
              strokeWidth={0.5}
            />
            <Image
              href={require("../../assets/footballIcons/goal.png")}
              x={cx - 14}
              y={cy - 15}
              width={12}
              height={12}
            />
            {count > 1 && (
              <>
                <Circle
                  cx={cx - 2}
                  cy={cy - 12}
                  r={6}
                  fill="#36383F"
                  stroke="#F0F0F0"
                  strokeWidth={1}
                />
                <SvgText
                  x={cx - 2}
                  y={cy - 10}
                  fontSize={8}
                  fill="#F0F0F0"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {count}
                </SvgText>
              </>
            )}
          </>
        )}
      </React.Fragment>
    );
  };

  // Improved rendering for missing players
  const renderMissingPlayerIndicator = (player) => {
    const cx = 15;
    const cy = 17;

    return (
      <React.Fragment>
        {/* Injury indicator */}
        {(player.reason === 1 || player.reason === 0) && (
          <>
            <Rect
              x={cx - 8}
              y={cy - 10}
              fill="#F0F0F0"
              height={20}
              width={20}
              rx={5}
              ry={5}
              stroke="#333"
              strokeWidth={0.5}
            />
            <Image
              href={require("../../assets/footballIcons/injury.png")}
              x={cx - 6}
              y={cy - 9}
              width={17}
              height={17}
            />
          </>
        )}

        {/* Ban indicator */}
        {player.reason === 3 && (
          <>
            <Rect
              x={cx - 8}
              y={cy - 10}
              fill="#F0F0F0"
              height={20}
              width={20}
              rx={5}
              ry={5}
              stroke="#333"
              strokeWidth={0.5}
            />
            <Image
              href={require("../../assets/footballIcons/ban.png")}
              x={cx - 6}
              y={cy - 9}
              width={17}
              height={17}
            />
          </>
        )}

        {/* Yellow card suspension */}
        {(player.reason === 11 || player.reason === 12) && (
          <>
            <Rect
              x={cx - 4}
              y={cy - 12}
              rx={3}
              ry={3}
              height={24}
              width={15}
              fill="yellow"
              stroke="#333"
              strokeWidth={0.5}
            />
          </>
        )}
      </React.Fragment>
    );
  };

  return (
    <View style={styles.rootContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.headerText}>Substitutes</Text>
      </View>

      <View style={styles.container}>
        <View style={styles.teamColumn}>
          {homeTeam.map((player, index) => {
            const count = goalScorers.filter(
              (scorer) => scorer === player.player.name
            ).length;

            return (
              <Pressable
                key={index}
                style={styles.playerContainer}
                onPress={() =>
                  console.log(
                    `ID: ${player.player.id}, Name: ${player.player.name}`
                  )
                }
              >
                <Svg width={35} height={35}>
                  {renderPlayerIndicators(player, home, count)}
                </Svg>
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={styles.playerText}
                >
                  {player.player.name}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.teamColumn}>
          {awayTeam.map((player, index) => {
            const count = goalScorers.filter(
              (scorer) => scorer === player.player.name
            ).length;
            return (
              <Pressable
                key={index}
                style={styles.playerContainer}
                onPress={() =>
                  console.log(
                    `ID: ${player.player.id}, Name: ${player.player.name}`
                  )
                }
              >
                <Svg width={35} height={35}>
                  {renderPlayerIndicators(player, away, count)}
                </Svg>
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={styles.playerText}
                >
                  {player.player.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {(homeMissingPlayers.length !== 0 || awayMissingPlayers.length !== 0) && (
        <View style={styles.sectionHeader}>
          <Text style={styles.headerText}>Missing Players</Text>
        </View>
      )}

      <View style={styles.container}>
        <View style={styles.teamColumn}>
          {homeMissingPlayers.map(
            (player, index) =>
              !homeSquad.includes(player.player) && (
                <Pressable
                  key={index}
                  style={styles.playerContainer}
                  onPress={() => console.log(` Name: ${player.player}`)}
                >
                  <Svg width={35} height={35}>
                    {renderMissingPlayerIndicator(player)}
                  </Svg>
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={styles.playerText}
                  >
                    {player.player}
                  </Text>
                </Pressable>
              )
          )}
        </View>

        <View style={styles.teamColumn}>
          {awayMissingPlayers.map(
            (player, index) =>
              !awaySquad.includes(player.player) && (
                <Pressable
                  key={index}
                  style={styles.playerContainer}
                  onPress={() => console.log(` Name: ${player.player}`)}
                >
                  <Svg width={35} height={35}>
                    {renderMissingPlayerIndicator(player)}
                  </Svg>
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={styles.playerText}
                  >
                    {player.player}
                  </Text>
                </Pressable>
              )
          )}
        </View>
      </View>

      {/* Legend for indicators */}
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <Svg width={20} height={20}>
            <Circle cx={10} cy={10} r={5} fill="#F0F0F0" />
            <Image
              href={require("../../assets/footballIcons/goal.png")}
              x={5}
              y={5}
              width={10}
              height={10}
            />
          </Svg>
          <Text style={styles.legendText}>Goal</Text>
        </View>

        <View style={styles.legendItem}>
          <Svg width={20} height={20}>
            <Rect x={5} y={3} width={8} height={14} rx={2} fill="yellow" />
          </Svg>
          <Text style={styles.legendText}>Yellow</Text>
        </View>

        <View style={styles.legendItem}>
          <Svg width={20} height={20}>
            <Rect x={5} y={3} width={8} height={14} rx={2} fill="red" />
          </Svg>
          <Text style={styles.legendText}>Red</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    width: screenWidth,
    padding: 15,
    backgroundColor: "#1E201E",
    borderRadius: 15,
    marginVertical: 10,
  },
  sectionHeader: {
    marginBottom: 15,
    borderRadius: 10,
    backgroundColor: "#2A2D3A",
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#E5E5E5",
    marginLeft: 5,
  },
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  teamColumn: {
    flex: 1,
    maxWidth: screenWidth / 2 - 20,
  },
  playerContainer: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginVertical: 4,
    flexDirection: "row",
    backgroundColor: "#2A2D3A",
    alignItems: "center",
    borderRadius: 10,
    maxWidth: screenWidth / 2 - 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  playerText: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
    color: "#E5E5E5",
    flex: 1,
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#2A2D3A",
    borderRadius: 10,
    paddingVertical: 10,
    marginTop: 5,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendText: {
    color: "#D8D8D8",
    fontSize: 12,
    marginLeft: 5,
  },
});
