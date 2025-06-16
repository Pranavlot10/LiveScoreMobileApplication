import React, { useState } from "react";
import { View, Dimensions } from "react-native";
import Svg, {
  Rect,
  Circle,
  Line,
  Text as SvgText,
  Image,
} from "react-native-svg";
import formations from "./formations";
import PlayerStatsModal from "./PlayerStatsModal"; // Import the new modal component

const { width } = Dimensions.get("window");
const PITCH_WIDTH = width * 0.95;
const PITCH_HEIGHT = PITCH_WIDTH * 2;
const PLAYER_RADIUS = 18;
const LINE_WIDTH = 3;

const GOAL_BOX_WIDTH = PITCH_WIDTH * 0.2;
const GOAL_BOX_HEIGHT = PITCH_HEIGHT * 0.03;
const PENALTY_BOX_WIDTH = PITCH_WIDTH * 0.5;
const PENALTY_BOX_HEIGHT = PITCH_HEIGHT * 0.14;
const CENTER_CIRCLE_RADIUS = PITCH_WIDTH * 0.12;

const LineupPitch = ({
  incidentsData,
  lineupData,
  matchId,
  homeTeamLogo,
  awayTeamLogo,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  console.log(matchId);

  const renderFallback = (message) => (
    <View style={{ alignItems: "center", paddingVertical: 20 }}>
      <Svg width={PITCH_WIDTH} height={PITCH_HEIGHT}>
        <SvgText
          x={PITCH_WIDTH / 2}
          y={PITCH_HEIGHT / 3}
          fontSize={20}
          fill="black"
          textAnchor="middle"
        >
          {message}
        </SvgText>
      </Svg>
    </View>
  );

  if (!lineupData || (!lineupData.home && !lineupData.away)) {
    return renderFallback("No lineups available yet");
  }

  const { home = {}, away = {} } = lineupData;
  const homePlayers = Array.isArray(home.players) ? home.players : [];
  const awayPlayers = Array.isArray(away.players) ? away.players : [];
  const incidents = Array.isArray(incidentsData?.incidents)
    ? incidentsData.incidents
    : [];

  const homeTeam = homePlayers.filter((player) => !player?.substitute) || [];
  const awayTeam = awayPlayers.filter((player) => !player?.substitute) || [];

  const yellowCardIncidents = incidents
    .filter((incident) => incident?.incidentClass === "yellow")
    .map((incident) => incident?.playerName)
    .filter(Boolean);

  const redCardIncidents = incidents
    .filter((incident) => incident?.incidentClass === "red")
    .map((incident) => incident?.playerName)
    .filter(Boolean);

  const goalScorers = incidents
    .filter(
      (incident) =>
        incident?.incidentType === "goal" &&
        incident?.incidentClass !== "ownGoal"
    )
    .map((incident) => incident?.player?.name)
    .filter(Boolean);

  const ownGoalScorers = incidents
    .filter(
      (incident) =>
        incident?.incidentType === "goal" &&
        incident?.incidentClass === "ownGoal"
    )
    .map((incident) => incident?.player?.name)
    .filter(Boolean);

  const subOutIncidents = incidents
    .filter((incident) => incident?.incidentType === "substitution")
    .map((incident) => incident?.playerOut?.name)
    .filter(Boolean);

  if (homeTeam.length === 0 && awayTeam.length === 0) {
    return renderFallback("No starting players available");
  }

  const handlePlayerPress = (player) => {
    setSelectedPlayer(player);
    setModalVisible(true);
  };

  return (
    <View
      style={{ alignItems: "center", paddingVertical: 20, overflow: "hidden" }}
    >
      <Svg
        width={PITCH_WIDTH}
        height={PITCH_HEIGHT}
        style={{ backgroundColor: "#4CAF50", overflow: "hidden" }}
      >
        {/* Pitch Layout (unchanged) */}
        <Rect
          x={10}
          y={10}
          width={PITCH_WIDTH - 20}
          height={PITCH_HEIGHT - 20}
          stroke="white"
          strokeWidth={LINE_WIDTH}
          fill="transparent"
        />
        <Line
          x1={10}
          y1={PITCH_HEIGHT / 2}
          x2={PITCH_WIDTH - 10}
          y2={PITCH_HEIGHT / 2}
          stroke="white"
          strokeWidth={LINE_WIDTH}
        />
        <Circle
          cx={PITCH_WIDTH / 2}
          cy={PITCH_HEIGHT / 2}
          r={CENTER_CIRCLE_RADIUS}
          stroke="white"
          strokeWidth={LINE_WIDTH}
          fill="transparent"
        />
        <Rect
          x={(PITCH_WIDTH - GOAL_BOX_WIDTH) / 2}
          y={10}
          width={GOAL_BOX_WIDTH}
          height={GOAL_BOX_HEIGHT}
          stroke="white"
          strokeWidth={LINE_WIDTH}
          fill="transparent"
        />
        <Rect
          x={(PITCH_WIDTH - PENALTY_BOX_WIDTH) / 2}
          y={10}
          width={PENALTY_BOX_WIDTH}
          height={PENALTY_BOX_HEIGHT}
          stroke="white"
          strokeWidth={LINE_WIDTH}
          fill="transparent"
        />
        <Rect
          x={(PITCH_WIDTH - GOAL_BOX_WIDTH) / 2}
          y={PITCH_HEIGHT - GOAL_BOX_HEIGHT - 10}
          width={GOAL_BOX_WIDTH}
          height={GOAL_BOX_HEIGHT}
          stroke="white"
          strokeWidth={LINE_WIDTH}
          fill="transparent"
        />
        <Rect
          x={(PITCH_WIDTH - PENALTY_BOX_WIDTH) / 2}
          y={PITCH_HEIGHT - PENALTY_BOX_HEIGHT - 10}
          width={PENALTY_BOX_WIDTH}
          height={PENALTY_BOX_HEIGHT}
          stroke="white"
          strokeWidth={LINE_WIDTH}
          fill="transparent"
        />
        {/* Formation Labels (unchanged) */}
        {home.formation && (
          <>
            <Rect
              x={PITCH_WIDTH * 0.13 - 36}
              y={PITCH_HEIGHT * 0.05 - 17}
              width={70}
              height={25}
              fill="#F3F8FF"
              rx={8}
              ry={8}
            />
            <SvgText
              x={PITCH_WIDTH * 0.13}
              y={PITCH_HEIGHT * 0.05}
              fontSize={16}
              fill="#4CAF50"
              fontWeight="bold"
              textAnchor="middle"
            >
              {home.formation}
            </SvgText>
          </>
        )}
        {home.formation && (
          <>
            <Image
              href={homeTeamLogo}
              x={PITCH_WIDTH - 60}
              y={PITCH_HEIGHT * 0.05 - 17}
              width={40}
              height={40}
            />
          </>
        )}
        {away.formation && (
          <>
            <Image
              href={awayTeamLogo}
              x={PITCH_WIDTH - 60}
              y={PITCH_HEIGHT * 0.97 - 37}
              width={40}
              height={40}
            />
          </>
        )}
        {away.formation && (
          <>
            <Rect
              x={PITCH_WIDTH * 0.13 - 36}
              y={PITCH_HEIGHT * 0.97 - 17}
              width={70}
              height={25}
              fill="#F3F8FF"
              rx={8}
              ry={8}
            />
            <SvgText
              x={PITCH_WIDTH * 0.13}
              y={PITCH_HEIGHT * 0.97}
              fontSize={16}
              fill="#4CAF50"
              fontWeight="bold"
              textAnchor="middle"
            >
              {away.formation}
            </SvgText>
          </>
        )}
        {/* Home Team Players */}
        {homeTeam.map((player, index) => {
          const position = formations[home?.formation]?.[index];
          if (!position || !player?.player) return null;

          const cx = position.x * PITCH_WIDTH;
          const cy = position.y * (PITCH_HEIGHT / 2);
          const playerName = player.player.name || "Unknown";
          const shortName = player.player.shortName || "N/A";
          const jerseyNumber = player.jerseyNumber || "?";
          const count = goalScorers.filter(
            (scorer) => scorer === playerName
          ).length;

          return (
            <React.Fragment key={`home-${player.player.id || index}`}>
              <Circle
                cx={cx}
                cy={cy}
                r={PLAYER_RADIUS}
                fill={`#${home.playerColor?.primary || "grey"}`}
                stroke={`#${home.playerColor?.fancyNumber || "black"}`}
                strokeWidth={2}
                onPress={() => handlePlayerPress(player)}
              />
              <SvgText
                x={cx}
                y={cy + 7}
                fontSize={PLAYER_RADIUS}
                fill={`#${home.playerColor?.number || "white"}`}
                fontWeight="bold"
                textAnchor="middle"
              >
                {jerseyNumber}
              </SvgText>
              <SvgText
                x={cx}
                y={cy + PLAYER_RADIUS + 15}
                fontSize={12}
                fontWeight="700"
                fill="white"
                textAnchor="middle"
              >
                {shortName}
              </SvgText>
              {yellowCardIncidents.includes(playerName) && (
                <Rect
                  x={cx + PLAYER_RADIUS - 7}
                  y={cy - PLAYER_RADIUS - 5}
                  width={10}
                  rx={2}
                  ry={1}
                  height={15}
                  fill="yellow"
                />
              )}
              {redCardIncidents.includes(playerName) && (
                <Rect
                  x={cx + PLAYER_RADIUS - 7}
                  y={cy - PLAYER_RADIUS - 5}
                  width={10}
                  rx={2}
                  ry={1}
                  height={15}
                  fill="red"
                />
              )}
              {subOutIncidents.includes(playerName) && (
                <>
                  <Circle
                    cx={cx + PLAYER_RADIUS - 5}
                    cy={cy + PLAYER_RADIUS - 5}
                    stroke="black"
                    r={8}
                    fill="white"
                  />
                  <Image
                    href={require("../../assets/footballIcons/down.png")}
                    x={cx + PLAYER_RADIUS - 11}
                    y={cy + PLAYER_RADIUS - 10}
                    width={12}
                    height={12}
                  />
                </>
              )}
              {goalScorers.includes(playerName) && (
                <>
                  <Circle
                    cx={cx + PLAYER_RADIUS - 32}
                    cy={cy + PLAYER_RADIUS - 32}
                    r={8}
                    fill="white"
                  />
                  <Image
                    href={require("../../assets/footballIcons/goal.png")}
                    x={cx + PLAYER_RADIUS - 39.5}
                    y={cy + PLAYER_RADIUS - 39.5}
                    width={15}
                    height={15}
                  />
                </>
              )}
              {ownGoalScorers.includes(playerName) && (
                <>
                  <Circle
                    cx={cx + PLAYER_RADIUS - 32}
                    cy={cy + PLAYER_RADIUS - 32}
                    r={8}
                    fill="white"
                  />
                  <Image
                    href={require("../../assets/footballIcons/owngoal.png")}
                    x={cx + PLAYER_RADIUS - 39.5}
                    y={cy + PLAYER_RADIUS - 39.5}
                    width={15}
                    height={15}
                  />
                </>
              )}
              {count > 1 && (
                <>
                  <Circle
                    cx={cx + PLAYER_RADIUS - 40}
                    cy={cy + PLAYER_RADIUS - 57}
                    r={8}
                    fill="white"
                  />
                  <Circle
                    cx={cx + PLAYER_RADIUS - 40}
                    cy={cy + PLAYER_RADIUS - 57}
                    r={6}
                    fill="white"
                    stroke="black"
                  />
                  <SvgText
                    x={cx + PLAYER_RADIUS - 40}
                    y={cy + PLAYER_RADIUS - 54}
                    fontSize={8}
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {count}
                  </SvgText>
                </>
              )}
            </React.Fragment>
          );
        })}
        {/* Away Team Players */}
        {awayTeam.map((player, index) => {
          const position = formations[away?.formation]?.[index];
          if (!position || !player?.player) return null;

          const cx = (1 - position.x) * PITCH_WIDTH;
          const cy = PITCH_HEIGHT - position.y * (PITCH_HEIGHT / 2);
          const playerName = player.player.name || "Unknown";
          const shortName = player.player.shortName || "N/A";
          const jerseyNumber = player.jerseyNumber || "?";
          const count = goalScorers.filter(
            (scorer) => scorer === playerName
          ).length;

          return (
            <React.Fragment key={`away-${player.player.id || index}`}>
              <Circle
                cx={cx}
                cy={cy - 20}
                r={PLAYER_RADIUS}
                fill={`#${away.playerColor?.primary || "grey"}`}
                stroke={`#${away.playerColor?.fancyNumber || "black"}`}
                strokeWidth={2}
                onPress={() => handlePlayerPress(player)}
              />
              <SvgText
                x={cx}
                y={cy - 14}
                fontSize={PLAYER_RADIUS}
                fill={`#${away.playerColor?.number || "white"}`}
                fontWeight="bold"
                textAnchor="middle"
              >
                {jerseyNumber}
              </SvgText>
              <SvgText
                x={cx}
                y={cy + PLAYER_RADIUS}
                fontSize={12}
                fontWeight="700"
                fill="white"
                textAnchor="middle"
              >
                {shortName}
              </SvgText>
              {yellowCardIncidents.includes(playerName) && (
                <Rect
                  x={cx + PLAYER_RADIUS - 7}
                  y={cy - PLAYER_RADIUS - 23}
                  width={10}
                  rx={2}
                  ry={1}
                  height={15}
                  fill="yellow"
                />
              )}
              {redCardIncidents.includes(playerName) && (
                <Rect
                  x={cx + PLAYER_RADIUS - 7}
                  y={cy - PLAYER_RADIUS - 5}
                  width={10}
                  rx={2}
                  ry={1}
                  height={15}
                  fill="red"
                />
              )}
              {subOutIncidents.includes(playerName) && (
                <>
                  <Circle
                    cx={cx + PLAYER_RADIUS - 5}
                    cy={cy + PLAYER_RADIUS - 23}
                    r={8}
                    stroke="black"
                    fill="white"
                  />
                  <Image
                    href={require("../../assets/footballIcons/down.png")}
                    x={cx + PLAYER_RADIUS - 11}
                    y={cy + PLAYER_RADIUS - 28}
                    width={12}
                    height={12}
                  />
                </>
              )}
              {goalScorers.includes(playerName) && (
                <>
                  <Circle
                    cx={cx + PLAYER_RADIUS - 32}
                    cy={cy + PLAYER_RADIUS - 52}
                    r={8}
                    fill="white"
                  />
                  <Image
                    href={require("../../assets/footballIcons/goal.png")}
                    x={cx + PLAYER_RADIUS - 39.5}
                    y={cy + PLAYER_RADIUS - 59.5}
                    width={15}
                    height={15}
                  />
                </>
              )}
              {ownGoalScorers.includes(playerName) && (
                <>
                  <Circle
                    cx={cx + PLAYER_RADIUS - 32}
                    cy={cy + PLAYER_RADIUS - 52}
                    r={8}
                    fill="white"
                  />
                  <Image
                    href={require("../../assets/footballIcons/owngoal.png")}
                    x={cx + PLAYER_RADIUS - 39.5}
                    y={cy + PLAYER_RADIUS - 59.5}
                    width={15}
                    height={15}
                  />
                </>
              )}
              {count > 1 && (
                <>
                  <Circle
                    cx={cx + PLAYER_RADIUS - 40}
                    cy={cy + PLAYER_RADIUS - 57}
                    r={8}
                    fill="white"
                  />
                  <Circle
                    cx={cx + PLAYER_RADIUS - 40}
                    cy={cy + PLAYER_RADIUS - 57}
                    r={6}
                    fill="white"
                    stroke="black"
                  />
                  <SvgText
                    x={cx + PLAYER_RADIUS - 40}
                    y={cy + PLAYER_RADIUS - 54}
                    fontSize={8}
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {count}
                  </SvgText>
                </>
              )}
            </React.Fragment>
          );
        })}
      </Svg>

      {/* Player Stats Modal */}
      <PlayerStatsModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        player={selectedPlayer}
        matchId={matchId}
        goalScorers={goalScorers}
        yellowCardIncidents={yellowCardIncidents}
        redCardIncidents={redCardIncidents}
        subOutIncidents={subOutIncidents}
      />
    </View>
  );
};

export default LineupPitch;
