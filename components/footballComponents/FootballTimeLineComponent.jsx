import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Svg, {
  Rect,
  Circle,
  Line,
  Text as SvgText,
  Image,
} from "react-native-svg";
import { ScrollView } from "react-native-gesture-handler";

const screenWidth = Dimensions.get("screen").width;

// Main Timeline Component
const MatchTimeline = ({ incidentsData }) => {
  const cx = 15;
  const cy = 15;

  // console.log(incidentsData);
  return (
    <View style={styles.container}>
      {incidentsData.map((item, index) =>
        item.incidentType === "period" ? (
          <View key={index} style={styles.eventRow}>
            <View style={styles.line} />
            <Text style={styles.boldText}>{item.text}</Text>
            <View style={styles.line} />
          </View>
        ) : item.incidentType === "injuryTime" ? null : (
          <View key={index} style={styles.eventRow}>
            <View style={styles.eventSide}>
              {item.isHome && (
                <>
                  <View style={styles.eventContent}>
                    {item.incidentType === "substitution" ? (
                      <View style={styles.homeEventContainer}>
                        <View
                          style={{ marginRight: 5, alignItems: "flex-end" }}
                        >
                          <Text style={styles.eventText}>
                            {item.playerIn?.shortName}
                          </Text>
                          <Text style={styles.assistText}>
                            {item.playerOut?.shortName}
                          </Text>
                        </View>
                        <Svg width={35} height={35}>
                          <React.Fragment>
                            <>
                              <Image
                                href={require("../../assets/footballIcons/sub.png")}
                                x={cx - 10} // Centering image
                                y={cy - 10}
                                width={25}
                                height={25}
                              />
                            </>
                          </React.Fragment>
                        </Svg>
                      </View>
                    ) : item.incidentType === "goal" ? (
                      <View style={styles.homeEventContainer}>
                        <View
                          style={{ marginRight: 5, alignItems: "flex-end" }}
                        >
                          <Text style={styles.eventText}>
                            {item.player?.name}
                          </Text>
                          {item.assist1 && (
                            <Text style={styles.assistText}>
                              {item.assist1.name}
                            </Text>
                          )}
                          {item.incidentClass === "penalty" && (
                            <Text style={styles.assistText}>Penalty</Text>
                          )}
                        </View>
                        <Svg width={25} height={25}>
                          <React.Fragment>
                            <>
                              <Circle
                                cx={cx - 5}
                                cy={cy - 4}
                                r={10}
                                fill="white"
                              />
                              <Image
                                href={require("../../assets/footballIcons/goal.png")}
                                x={cx - 15} // Centering image
                                y={cy - 14}
                                width={20}
                                height={20}
                              />
                            </>
                          </React.Fragment>
                        </Svg>
                      </View>
                    ) : item.incidentType === "card" ? (
                      item.incidentClass === "yellow" ? (
                        <View style={styles.homeEventContainer}>
                          <View
                            style={{ marginRight: 5, alignItems: "flex-end" }}
                          >
                            <Text style={styles.eventText}>
                              {item.player?.name}
                            </Text>
                            {item.reason && (
                              <Text style={styles.eventText}>
                                ({item.reason})
                              </Text>
                            )}
                          </View>
                          <Svg width={25} height={25}>
                            <React.Fragment>
                              <Rect
                                x={cx - 12} // Slightly to the right
                                y={cy - 14} // Above player circle
                                rx={2} // Rounded corners
                                ry={1}
                                height={20}
                                width={14}
                                fill="yellow"
                              />
                            </React.Fragment>
                          </Svg>
                        </View>
                      ) : (
                        <View style={styles.homeEventContainer}>
                          <View
                            style={{ marginRight: 5, alignItems: "flex-end" }}
                          >
                            <Text style={styles.eventText}>
                              {item.player?.name}
                            </Text>
                            {item.reason && (
                              <Text style={styles.eventText}>
                                ({item.reason})
                              </Text>
                            )}
                          </View>
                          <Svg width={25} height={25}>
                            <React.Fragment>
                              <Rect
                                x={cx - 12} // Slightly to the right
                                y={cy - 14} // Above player circle
                                rx={2} // Rounded corners
                                ry={1}
                                height={20}
                                width={14}
                                fill="red"
                              />
                            </React.Fragment>
                          </Svg>
                        </View>
                      )
                    ) : item.incidentType === "varDecision" ? (
                      item.confirmed ? (
                        <View style={styles.homeEventContainer}>
                          <View
                            style={{ marginRight: 5, alignItems: "flex-end" }}
                          >
                            <Text style={styles.eventText}>
                              {item.player.name}
                            </Text>
                            <Text style={styles.eventText}>
                              {item.incidentClass === "goalAwarded"
                                ? "Goal Stands"
                                : ""}
                            </Text>
                          </View>{" "}
                          <Svg width={25} height={25}>
                            <React.Fragment>
                              <Rect
                                x={cx - 12} // Slightly to the right
                                y={cy - 14} // Above player circle
                                rx={2} // Rounded corners
                                ry={1}
                                height={20}
                                width={14}
                                fill="red"
                              />
                            </React.Fragment>
                          </Svg>
                        </View>
                      ) : (
                        <View style={styles.homeEventContainer}>
                          <View
                            style={{ marginRight: 5, alignItems: "flex-end" }}
                          >
                            <Text style={styles.eventText}>
                              {item.player.name}
                            </Text>
                            <Text style={styles.assistText}>
                              {item.incidentClass === "goalAwarded"
                                ? "Goal Disallowed"
                                : item.incidentClass === "penaltyNotAwarded"
                                ? "Penalty Awarded"
                                : ""}
                            </Text>
                          </View>
                          <Svg width={35} height={35}>
                            <React.Fragment>
                              <Image
                                href={require("../../assets/footballIcons/var.png")}
                                x={cx - 14} // Centering image
                                y={cy - 9}
                                width={25}
                                height={25}
                                color={"white"}
                              />
                            </React.Fragment>
                          </Svg>
                        </View>
                      )
                    ) : item.incidentType === "penaltyShootout" ? (
                      <View style={styles.homeEventContainer}>
                        <View
                          style={{ marginRight: 5, alignItems: "flex-end" }}
                        >
                          <Text style={styles.eventText}>
                            {item.player?.name}
                          </Text>
                          <Text
                            style={styles.assistText}
                          >{`(${item.homeScore}-${item.awayScore})`}</Text>
                        </View>
                        <Svg width={25} height={25}>
                          <React.Fragment>
                            <>
                              <Circle
                                cx={cx - 5}
                                cy={cy - 4}
                                r={10}
                                fill="white"
                              />
                              {item.incidentClass === "scored" ? (
                                <Image
                                  href={require("../../assets/footballIcons/scored_pen.png")}
                                  x={cx - 15} // Centering image
                                  y={cy - 14}
                                  width={20}
                                  height={20}
                                />
                              ) : (
                                <Image
                                  href={require("../../assets/footballIcons/missed_pen.png")}
                                  x={cx - 15} // Centering image
                                  y={cy - 14}
                                  width={20}
                                  height={20}
                                />
                              )}
                            </>
                          </React.Fragment>
                        </Svg>
                      </View>
                    ) : (
                      ""
                    )}
                  </View>
                </>
              )}
            </View>

            {item.incidentType !== "penaltyShootout" && (
              <Text
                style={
                  item.incidentType === "goal"
                    ? styles.goalCircle
                    : styles.timeCircle
                }
              >
                {item.addedTime === 0 || !item.addedTime
                  ? `${item.time}'`
                  : `${item.time} + ${item.addedTime}'`}
              </Text>
            )}

            <View style={styles.eventSide}>
              {!item.isHome && (
                <>
                  <View style={styles.eventContent}>
                    {item.incidentType === "substitution" ? (
                      <View style={styles.eventContainer}>
                        <Svg width={35} height={35}>
                          <React.Fragment>
                            <>
                              <Image
                                href={require("../../assets/footballIcons/sub.png")}
                                x={cx - 10} // Centering image
                                y={cy - 10}
                                width={25}
                                height={25}
                              />
                            </>
                          </React.Fragment>
                        </Svg>
                        <View>
                          <Text style={styles.eventText}>
                            {item.playerIn?.shortName}
                          </Text>
                          <Text style={styles.assistText}>
                            {item.playerOut?.shortName}
                          </Text>
                        </View>
                      </View>
                    ) : item.incidentType === "goal" ? (
                      <View style={styles.eventContainer}>
                        <Svg width={25} height={25}>
                          <React.Fragment>
                            <>
                              <Circle
                                cx={cx - 5}
                                cy={cy - 4}
                                r={10}
                                fill="white"
                              />
                              <Image
                                href={require("../../assets/footballIcons/goal.png")}
                                x={cx - 15} // Centering image
                                y={cy - 14}
                                width={20}
                                height={20}
                              />
                            </>
                          </React.Fragment>
                        </Svg>
                        <View style={{ alignItems: "flex-start" }}>
                          <Text style={styles.eventText}>
                            {item.player?.name}
                          </Text>
                          {item.assist1 && (
                            <Text style={styles.assistText}>
                              {item.assist1.name}
                            </Text>
                          )}
                          {item.incidentClass === "penalty" && (
                            <Text style={styles.assistText}>Penalty</Text>
                          )}
                        </View>
                      </View>
                    ) : item.incidentType === "card" ? (
                      item.incidentClass === "yellow" ? (
                        <View style={styles.eventContainer}>
                          <Svg width={25} height={25}>
                            <React.Fragment>
                              <Rect
                                x={cx - 12} // Slightly to the right
                                y={cy - 14} // Above player circle
                                rx={2} // Rounded corners
                                ry={1}
                                height={20}
                                width={14}
                                fill="yellow"
                              />
                            </React.Fragment>
                          </Svg>
                          <View
                            style={{ marginLeft: 5, alignItems: "flex-start" }}
                          >
                            <Text style={styles.eventText}>
                              {item.player?.name}
                            </Text>
                            {item.reason && (
                              <Text style={styles.eventText}>
                                ({item.reason})
                              </Text>
                            )}
                          </View>
                        </View>
                      ) : (
                        <View style={styles.eventContainer}>
                          <Svg width={25} height={25}>
                            <React.Fragment>
                              <Rect
                                x={cx - 12} // Slightly to the right
                                y={cy - 14} // Above player circle
                                rx={2} // Rounded corners
                                ry={1}
                                height={20}
                                width={14}
                                fill="red"
                              />
                            </React.Fragment>
                          </Svg>
                          <View
                            style={{ marginLeft: 5, alignItems: "flex-start" }}
                          >
                            <Text style={styles.eventText}>
                              {item.player?.name}
                            </Text>
                            {item.reason && (
                              <Text style={styles.eventText}>
                                ({item.reason})
                              </Text>
                            )}
                          </View>
                        </View>
                      )
                    ) : item.incidentType === "varDecision" ? (
                      item.confirmed ? (
                        <View style={styles.eventContainer}>
                          <Svg width={25} height={25}>
                            <React.Fragment>
                              <Rect
                                x={cx - 12} // Slightly to the right
                                y={cy - 14} // Above player circle
                                rx={2} // Rounded corners
                                ry={1}
                                height={20}
                                width={14}
                                fill="red"
                              />
                            </React.Fragment>
                          </Svg>
                          <View
                            style={{ marginLeft: 5, alignItems: "flex-start" }}
                          >
                            <Text style={styles.eventText}>
                              {item.player.name}
                            </Text>
                            <Text style={styles.assistText}>
                              {item.incidentClass === "goalAwarded"
                                ? "Goal Disallowed"
                                : item.incidentClass === "penaltyNotAwarded"
                                ? "Penalty Awarded"
                                : ""}
                            </Text>
                          </View>
                        </View>
                      ) : (
                        <View style={styles.eventContainer}>
                          <Svg width={35} height={35}>
                            <React.Fragment>
                              <Image
                                href={require("../../assets/footballIcons/var.png")}
                                x={cx - 14} // Centering image
                                y={cy - 9}
                                width={25}
                                height={25}
                                color={"white"}
                              />
                            </React.Fragment>
                          </Svg>
                          <View style={{ alignItems: "flex-start" }}>
                            <Text style={styles.eventText}>
                              {item.player.name}
                            </Text>
                            <Text style={styles.assistText}>
                              {item.incidentClass === "goalAwarded"
                                ? "Goal Disallowed"
                                : ""}
                            </Text>
                          </View>
                        </View>
                      )
                    ) : item.incidentType === "penaltyShootout" ? (
                      <View style={styles.eventContainer}>
                        <Svg width={25} height={25}>
                          <React.Fragment>
                            <>
                              <Circle
                                cx={cx - 5}
                                cy={cy - 4}
                                r={10}
                                fill="white"
                              />
                              <Image
                                href={require("../../assets/footballIcons/goal.png")}
                                x={cx - 15} // Centering image
                                y={cy - 14}
                                width={20}
                                height={20}
                              />
                            </>
                          </React.Fragment>
                        </Svg>
                        <View style={{ alignItems: "flex-start" }}>
                          <Text style={styles.eventText}>
                            {item.player?.name}
                          </Text>
                          <Text
                            style={styles.assistText}
                          >{`(${item.homeScore}-${item.awayScore})`}</Text>
                        </View>
                      </View>
                    ) : (
                      ""
                    )}
                  </View>
                </>
              )}
            </View>
          </View>
        )
      )}
      <View style={styles.eventRow}>
        <View style={styles.line} />
        <Text style={styles.eventText}>KO</Text>
        <View style={styles.line} />
      </View>
    </View>
  );
};

export default MatchTimeline;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    backgroundColor: "#1A1A1A",
    borderRadius: 10,
    marginHorizontal: 16,
  },
  eventRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  line: {
    height: 1,
    backgroundColor: "#ccc", // Light grey
    alignSelf: "center", // Center it
    marginVertical: 10,
    width: screenWidth / 2.5,
  },
  timeCircle: {
    backgroundColor: "#333",
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
    borderRadius: 9,
    padding: 5,
    // marginHorizontal: 10,
  },
  goalCircle: {
    backgroundColor: "#fff",
    fontSize: 14,
    fontWeight: "700",

    borderRadius: 8,
    padding: 5,
    // marginHorizontal: 10,
  },
  eventContent: {
    marginLeft: 10,
    flex: 1,
  },
  eventText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  boldText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "900",
  },
  eventSide: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: screenWidth / 2.7,
  },
  eventContainer: {
    alignItems: "center",
    flexDirection: "row",
  },
  homeEventContainer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  assistText: {
    color: "#fff",
    fontSize: 12,
  },
});
