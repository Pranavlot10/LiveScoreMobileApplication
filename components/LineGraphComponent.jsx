import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import Svg, { Rect, Line, Text as SvgText, Polyline } from "react-native-svg";
import { PanGestureHandler } from "react-native-gesture-handler";

const { width: initialWidth, height: initialHeight } = Dimensions.get("window");
const CHART_HEIGHT = initialHeight - 550;
const CHART_WIDTH = initialWidth - 40;
const CHART_PADDING = { top: 20, right: 40, bottom: 40, left: 50 };
const standardGameTime = 4 * 12 * 60;

const InteractiveBasketballScoringChart = ({ gameData, matchInfoData }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragX, setDragX] = useState(null);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [processedData, setProcessedData] = useState([]);
  const chartViewRef = useRef(null);
  const homeTeamName = matchInfoData.homeTeam.nameCode;
  const awayTeamName = matchInfoData.awayTeam.nameCode;

  // Process game data
  useEffect(() => {
    // console.log("Processing game data:", gameData);
    if (!gameData || gameData.length === 0) {
      setProcessedData([]);
      // console.log("No game data provided or empty.");
      return;
    }
    const sortedData = [...gameData].sort(
      (a, b) => a.timeSeconds - b.timeSeconds
    );
    const aggregatedData = [];
    let lastTime = -Infinity;
    sortedData.forEach((incident) => {
      if (
        incident.incidentType === "goal" &&
        incident.timeSeconds >= lastTime + 15 &&
        (!aggregatedData.length ||
          incident.timeSeconds !==
            aggregatedData[aggregatedData.length - 1].timeSeconds)
      ) {
        aggregatedData.push(incident);
        lastTime = incident.timeSeconds;
      }
    });
    const processedPoints = aggregatedData.map((incident, index) => {
      // Improved period determination
      let period;
      if (incident.period === "overtime") {
        period = "OT";
      } else if (incident.period && typeof incident.period === "string") {
        const periodMatch = incident.period.match(/^\d+/); // Extract number from period string (e.g., "1" from "1st")
        const periodNum = periodMatch ? parseInt(periodMatch[0], 10) : NaN;
        if (!isNaN(periodNum) && periodNum >= 1 && periodNum <= 4) {
          period = `Q${periodNum}`;
        } else {
          // Fallback: Calculate period based on time if period data is unreliable
          const quarterLength = standardGameTime / 4; // 12 minutes in seconds
          const periodCalc =
            Math.floor(incident.timeSeconds / quarterLength) + 1;
          period =
            incident.timeSeconds >= standardGameTime
              ? "OT"
              : `Q${Math.min(periodCalc, 4)}`;
        }
      } else {
        // Fallback for missing or invalid period data
        const quarterLength = standardGameTime / 4;
        const periodCalc = Math.floor(incident.timeSeconds / quarterLength) + 1;
        period =
          incident.timeSeconds >= standardGameTime
            ? "OT"
            : `Q${Math.min(periodCalc, 4)}`;
      }

      const minutes = Math.floor(incident.reversedPeriodTimeSeconds / 60);
      const seconds = incident.reversedPeriodTimeSeconds % 60;
      const gameTime = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

      return {
        id: `${index}-${incident.timeSeconds}`,
        period, // Use the calculated period
        time: incident.timeSeconds,
        homeScore: incident.homeScore || 0,
        awayScore: incident.awayScore || 0,
        gameTime,
        isHome: incident.isHome,
      };
    });
    setProcessedData(processedPoints);
    // console.log("Processed Data:", processedPoints);
  }, [gameData]);

  // Calculate max values
  const maxScore =
    processedData.length > 0
      ? Math.max(
          ...processedData.map((d) => Math.max(d.homeScore, d.awayScore))
        ) + 10
      : 100;
  const maxTime =
    processedData.length > 0
      ? Math.max(...processedData.map((d) => d.time)) || 48 * 60
      : 48 * 60;
  // console.log("Max Score:", maxScore, "Max Time:", maxTime);

  // Scaling functions
  const scaleX = (time) =>
    CHART_PADDING.left +
    (time / maxTime) * (CHART_WIDTH - CHART_PADDING.left - CHART_PADDING.right);
  const scaleY = (score) =>
    CHART_PADDING.top +
    (1 - score / maxScore) *
      (CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom);

  const getTimeFromX = (x) => {
    const chartX = Math.max(
      CHART_PADDING.left,
      Math.min(x, CHART_WIDTH - CHART_PADDING.right)
    );
    const chartWidthAdjusted =
      CHART_WIDTH - CHART_PADDING.left - CHART_PADDING.right;
    return chartWidthAdjusted > 0 && maxTime
      ? ((chartX - CHART_PADDING.left) / chartWidthAdjusted) * maxTime
      : 0;
  };

  const findClosestPoint = (time) => {
    if (!processedData.length) return null;
    return processedData.reduce((prev, curr) =>
      Math.abs(curr.time - time) < Math.abs(prev.time - time) ? curr : prev
    );
  };

  // Generate polyline points for home and away scores
  const homePoints = processedData
    .map((point, index) => {
      const x = scaleX(point.time);
      const y = scaleY(point.homeScore);
      if (index === 0) return `${x},${y}`;
      const prevPoint = processedData[index - 1];
      const prevY = scaleY(prevPoint.homeScore);
      if (point.homeScore !== prevPoint.homeScore) {
        return `${x},${prevY} ${x},${y}`;
      }
      return null;
    })
    .filter(Boolean)
    .join(" ");

  const awayPoints = processedData
    .map((point, index) => {
      const x = scaleX(point.time);
      const y = scaleY(point.awayScore);
      if (index === 0) return `${x},${y}`;
      const prevPoint = processedData[index - 1];
      const prevY = scaleY(prevPoint.awayScore);
      if (point.awayScore !== prevPoint.awayScore) {
        return `${x},${prevY} ${x},${y}`;
      }
      return null;
    })
    .filter(Boolean)
    .join(" ");

  const onGestureEvent = ({ nativeEvent }) => {
    const { x } = nativeEvent;
    // console.log("Gesture Event: x:", x);
    setDragX(x);
    setIsDragging(true);
  };

  const onGestureEnd = ({ nativeEvent }) => {
    const { x } = nativeEvent;
    // console.log("Gesture End: x:", x);
    setIsDragging(false);
    const timeValue = getTimeFromX(x);
    const closest = findClosestPoint(timeValue);
    setSelectedPoint(closest);
    // console.log("Released at:", x, "Closest Point:", closest);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scoring trend</Text>
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View
            style={[
              styles.legendColor,
              { backgroundColor: matchInfoData.homeTeam.teamColors.primary },
            ]}
          />
          <Text style={styles.legendText}>{homeTeamName}</Text>
        </View>
        <View style={styles.legendItem}>
          <View
            style={[
              styles.legendColor,
              { backgroundColor: matchInfoData.awayTeam.teamColors.primary },
            ]}
          />
          <Text style={styles.legendText}>{awayTeamName}</Text>
        </View>
      </View>
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onGestureEnd}
      >
        <View ref={chartViewRef} style={styles.chartContainer}>
          <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
            {/* Background */}
            <Rect
              x={0}
              y={0}
              width={CHART_WIDTH}
              height={CHART_HEIGHT}
              fill="#222"
            />

            {/* Grid lines */}
            {Array.from({ length: Math.ceil(maxScore / 40) + 1 }).map(
              (_, index) => {
                const score = index * 40;
                const y = scaleY(score);
                return (
                  <React.Fragment key={score}>
                    <Line
                      x1={CHART_PADDING.left}
                      y1={y}
                      x2={CHART_WIDTH - CHART_PADDING.right}
                      y2={y}
                      stroke="rgba(255, 255, 255, 0.1)"
                      strokeWidth={1}
                    />
                    <SvgText
                      x={CHART_PADDING.left - 10}
                      y={y + 4}
                      fill="white"
                      fontSize="12"
                      textAnchor="end"
                    >
                      {score}
                    </SvgText>
                  </React.Fragment>
                );
              }
            )}

            {/* Quarter markers */}
            {Array.from({ length: 4 }).map((_, index) => {
              const i = index + 1;
              const quarterTime = i * (maxTime / 4);
              const x = scaleX(quarterTime);
              const labelX = scaleX((i - 0.5) * (maxTime / 4));
              return (
                <React.Fragment key={i}>
                  {i < 4 && (
                    <Line
                      x1={x}
                      y1={CHART_HEIGHT - CHART_PADDING.bottom - 5}
                      x2={x}
                      y2={CHART_HEIGHT - CHART_PADDING.bottom + 5}
                      stroke="rgba(255, 255, 255, 0.5)"
                      strokeWidth={2}
                    />
                  )}
                  <SvgText
                    x={labelX}
                    y={CHART_HEIGHT - CHART_PADDING.bottom + 20}
                    fill="white"
                    fontSize="12"
                    textAnchor="middle"
                  >
                    Q{i}
                  </SvgText>
                </React.Fragment>
              );
            })}
            {maxTime > standardGameTime && (
              <>
                <Line
                  x1={scaleX(standardGameTime)}
                  y1={CHART_HEIGHT - CHART_PADDING.bottom - 5}
                  x2={scaleX(standardGameTime)}
                  y2={CHART_HEIGHT - CHART_PADDING.bottom + 5}
                  stroke="rgba(255, 255, 255, 0.5)"
                  strokeWidth={2}
                />
                <SvgText
                  x={scaleX(
                    standardGameTime + (maxTime - standardGameTime) / 2
                  )}
                  y={CHART_HEIGHT - CHART_PADDING.bottom + 20}
                  fill="white"
                  fontSize="12"
                  textAnchor="middle"
                >
                  OT
                </SvgText>
              </>
            )}

            {/* Home score line */}
            {homePoints && (
              <Polyline
                points={homePoints}
                fill="none"
                stroke={matchInfoData.homeTeam.teamColors.primary}
                strokeWidth={2}
              />
            )}

            {/* Away score line */}
            {awayPoints && (
              <Polyline
                points={awayPoints}
                fill="none"
                stroke={matchInfoData.awayTeam.teamColors.primary}
                strokeWidth={2}
              />
            )}

            {/* Dragging indicator */}
            {isDragging && dragX !== null && (
              <Line
                x1={dragX}
                y1={CHART_PADDING.top}
                x2={dragX}
                y2={CHART_HEIGHT - CHART_PADDING.bottom}
                stroke="rgba(255, 255, 255, 0.4)"
                strokeWidth={1}
              />
            )}

            {/* Selected point overlay with legend-style team names */}
            {selectedPoint && !isDragging && (
              <>
                <Line
                  x1={scaleX(selectedPoint.time)}
                  y1={CHART_PADDING.top}
                  x2={scaleX(selectedPoint.time)}
                  y2={CHART_HEIGHT - CHART_PADDING.bottom}
                  stroke="rgba(255, 255, 255, 0.4)"
                  strokeWidth={1}
                  strokeDasharray="3,3"
                />
                {/* Home Team */}
                <Rect
                  x={CHART_WIDTH - CHART_PADDING.right - 130}
                  y={CHART_PADDING.top - 20}
                  width={12}
                  height={12}
                  fill={matchInfoData.homeTeam.teamColors.primary}
                />
                <SvgText
                  x={CHART_WIDTH - CHART_PADDING.right - 110}
                  y={CHART_PADDING.top - 10}
                  fill="white"
                  fontSize="12"
                  textAnchor="start"
                >
                  {`${homeTeamName} ${selectedPoint.homeScore}`}
                </SvgText>
                {/* Away Team */}
                <Rect
                  x={CHART_WIDTH - CHART_PADDING.right - 130}
                  y={CHART_PADDING.top}
                  width={12}
                  height={12}
                  fill={matchInfoData.awayTeam.teamColors.primary}
                />
                <SvgText
                  x={CHART_WIDTH - CHART_PADDING.right - 110}
                  y={CHART_PADDING.top + 10}
                  fill="white"
                  fontSize="12"
                  textAnchor="start"
                >
                  {`${awayTeamName} ${selectedPoint.awayScore}`}
                </SvgText>
                {/* Period and Game Time */}
                <SvgText
                  x={CHART_WIDTH - CHART_PADDING.right - 10}
                  y={CHART_PADDING.top + 10}
                  fill="white"
                  fontSize="12"
                  textAnchor="end"
                >
                  {`${selectedPoint.period} • ${selectedPoint.gameTime}`}
                </SvgText>
              </>
            )}
          </Svg>
        </View>
      </PanGestureHandler>
      <Text style={styles.instructionText}>
        Tap or drag anywhere on the chart to see details
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#222",
    padding: 20,
  },
  title: {
    fontSize: 24,
    color: "white",
    fontWeight: "bold",
    marginBottom: 10,
  },
  legendContainer: {
    flexDirection: "row",
    marginBottom: 10,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 5,
  },
  legendText: {
    color: "white",
    fontSize: 16,
  },
  chartContainer: {
    width: CHART_WIDTH,
    height: CHART_HEIGHT,
    overflow: "hidden",
  },
  instructionText: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 14,
    textAlign: "center",
    marginTop: 10,
  },
});

export default InteractiveBasketballScoringChart;
