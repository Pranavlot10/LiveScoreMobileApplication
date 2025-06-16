const formations = {
  "4-3-3": [
    // Goalkeeper
    { x: 0.5, y: 0.09 }, // GK

    // Defenders (4)
    { x: 0.13, y: 0.3 }, // LB
    { x: 0.37, y: 0.3 }, // CB
    { x: 0.63, y: 0.3 }, // CB
    { x: 0.87, y: 0.3 }, // RB

    // Midfielders (3)
    { x: 0.2, y: 0.57 }, // CM
    { x: 0.5, y: 0.57 }, // CDM
    { x: 0.8, y: 0.57 }, // CM

    // Forwards (3)
    { x: 0.2, y: 0.82 }, // LW
    { x: 0.5, y: 0.82 }, // ST
    { x: 0.8, y: 0.82 }, // RW
  ],

  "4-2-3-1": [
    // Goalkeeper
    { x: 0.5, y: 0.09 }, // GK

    // Defenders (4)
    { x: 0.13, y: 0.28 }, // LB
    { x: 0.37, y: 0.28 }, // CB
    { x: 0.63, y: 0.28 }, // CB
    { x: 0.87, y: 0.28 }, // RB

    // Defensive Midfielders (2)
    { x: 0.3, y: 0.47 }, // CDM
    { x: 0.7, y: 0.47 }, // CDM

    // Attacking Midfielders (3)
    { x: 0.2, y: 0.67 }, // LM
    { x: 0.5, y: 0.67 }, // CAM
    { x: 0.8, y: 0.67 }, // RM

    // Striker (1)
    { x: 0.5, y: 0.87 }, // ST
  ],

  "3-4-2-1": [
    { x: 0.5, y: 0.09 }, // Goalkeeper (GK)

    { x: 0.2, y: 0.28 }, // Left Center Back (LCB)
    { x: 0.5, y: 0.28 }, // Center Back (CB)
    { x: 0.8, y: 0.28 }, // Right Center Back (RCB)

    { x: 0.13, y: 0.47 }, // Left Wing Back (LWB)
    { x: 0.37, y: 0.47 }, // Center Midfielder (CM)
    { x: 0.63, y: 0.47 }, // Center Midfielder (CM)
    { x: 0.87, y: 0.47 }, // Right Wing Back (RWB)

    { x: 0.35, y: 0.67 }, // Left Attacking Midfielder (LAM)
    { x: 0.65, y: 0.67 }, // Right Attacking Midfielder (RAM)

    { x: 0.5, y: 0.87 }, // Striker (ST)
  ],

  "4-1-4-1": [
    { x: 0.5, y: 0.09 }, // Goalkeeper (GK)

    { x: 0.13, y: 0.3 }, // Left Back (LB)
    { x: 0.37, y: 0.3 }, // Left Center Back (LCB)
    { x: 0.63, y: 0.3 }, // Right Center Back (RCB)
    { x: 0.87, y: 0.3 }, // Right Back (RB)

    { x: 0.5, y: 0.47 }, // Striker (ST)

    { x: 0.13, y: 0.67 }, // Left Wing Back (LWB)
    { x: 0.37, y: 0.67 }, // Center Midfielder (CM)
    { x: 0.63, y: 0.67 }, // Center Midfielder (CM)
    { x: 0.87, y: 0.67 }, // Right Wing Back (RWB)

    { x: 0.5, y: 0.87 }, // Striker (ST)
  ],

  "5-3-2": [
    { x: 0.5, y: 0.09 }, // Goalkeeper

    { x: 0.1, y: 0.3 }, // Left Wing Back (LWB)
    { x: 0.3, y: 0.3 }, // Left Center Back (LCB)
    { x: 0.5, y: 0.3 }, // Center Back (CB)
    { x: 0.7, y: 0.3 }, // Right Center Back (RCB)
    { x: 0.9, y: 0.3 }, // Right Wing Back (RWB)

    { x: 0.2, y: 0.57 }, // Left Midfielder (CM)
    { x: 0.5, y: 0.57 }, // Central Midfielder (CM)
    { x: 0.8, y: 0.57 }, // Right Midfielder (CM)

    { x: 0.35, y: 0.82 }, // Left Striker (ST)
    { x: 0.65, y: 0.82 }, // Right Striker (ST)
  ],

  "4-4-2": [
    { x: 0.5, y: 0.08 }, // Goalkeeper

    { x: 0.13, y: 0.3 }, // Left Back (LB)
    { x: 0.37, y: 0.3 }, // Left Center Back (LCB)
    { x: 0.63, y: 0.3 }, // Right Center Back (RCB)
    { x: 0.87, y: 0.3 }, // Right Back (RB)

    { x: 0.13, y: 0.57 }, // Left Midfielder (LM)
    { x: 0.37, y: 0.57 }, // Left Central Midfielder (CM)
    { x: 0.63, y: 0.57 }, // Right Central Midfielder (CM)
    { x: 0.87, y: 0.57 }, // Right Midfielder (RM)

    { x: 0.35, y: 0.82 }, // Left Striker (ST)
    { x: 0.65, y: 0.82 }, // Right Striker (ST)
  ],

  "4-2-2-2": [
    { x: 0.5, y: 0.08 }, // Goalkeeper

    { x: 0.13, y: 0.3 }, // Left Back (LB)
    { x: 0.37, y: 0.3 }, // Left Center Back (LCB)
    { x: 0.63, y: 0.3 }, // Right Center Back (RCB)
    { x: 0.87, y: 0.3 }, // Right Back (RB)

    { x: 0.3, y: 0.47 }, // CDM
    { x: 0.7, y: 0.47 }, // CDM

    { x: 0.3, y: 0.67 }, // CDM
    { x: 0.7, y: 0.67 }, // CDM

    { x: 0.35, y: 0.87 }, // Left Striker (ST)
    { x: 0.65, y: 0.87 }, // Right Striker (ST)
  ],

  "4-4-1-1": [
    { x: 0.5, y: 0.08 }, // Goalkeeper

    { x: 0.13, y: 0.3 }, // Left Back (LB)
    { x: 0.37, y: 0.3 }, // Left Center Back (LCB)
    { x: 0.63, y: 0.3 }, // Right Center Back (RCB)
    { x: 0.87, y: 0.3 }, // Right Back (RB)

    { x: 0.13, y: 0.47 }, // Left Midfielder (LM)
    { x: 0.37, y: 0.47 }, // Left Central Midfielder (CM)
    { x: 0.63, y: 0.47 }, // Right Central Midfielder (CM)
    { x: 0.87, y: 0.47 }, // Right Midfielder (RM)

    { x: 0.5, y: 0.67 }, // Center Attacking Midfielder (CAM)

    { x: 0.5, y: 0.87 }, // Striker (ST)
  ],

  "3-4-3": [
    // Goalkeeper
    { x: 0.5, y: 0.09 }, // GK

    // Defenders (3)
    { x: 0.2, y: 0.3 }, // LCB
    { x: 0.5, y: 0.3 }, // CB
    { x: 0.8, y: 0.3 }, // RCB

    // Midfielders (4)
    { x: 0.13, y: 0.57 }, // LWB
    { x: 0.37, y: 0.57 }, // LCM
    { x: 0.63, y: 0.57 }, // RCM
    { x: 0.87, y: 0.57 }, // RWB

    // Forwards (3)
    { x: 0.2, y: 0.82 }, // LW
    { x: 0.5, y: 0.82 }, // ST
    { x: 0.8, y: 0.82 }, // RW
  ],

  "3-5-2": [
    // Goalkeeper
    { x: 0.5, y: 0.09 }, // GK

    // Defenders (3)
    { x: 0.2, y: 0.3 }, // LCB
    { x: 0.5, y: 0.3 }, // CB
    { x: 0.8, y: 0.3 }, // RCB

    // Midfielders (5)
    { x: 0.1, y: 0.57 }, // LWB
    { x: 0.3, y: 0.57 }, // LCM
    { x: 0.5, y: 0.57 }, // CM
    { x: 0.7, y: 0.57 }, // RCM
    { x: 0.9, y: 0.57 }, // RWB

    // Forwards (2)
    { x: 0.35, y: 0.82 }, // ST
    { x: 0.65, y: 0.82 }, // ST
  ],

  "4-5-1": [
    // Goalkeeper
    { x: 0.5, y: 0.09 }, // GK

    // Defenders (3)
    { x: 0.13, y: 0.3 }, // Left Back (LB)
    { x: 0.37, y: 0.3 }, // Left Center Back (LCB)
    { x: 0.63, y: 0.3 }, // Right Center Back (RCB)
    { x: 0.87, y: 0.3 }, // Right Back (RB)

    // Midfielders (5)
    { x: 0.1, y: 0.57 }, // LWB
    { x: 0.3, y: 0.57 }, // LCM
    { x: 0.5, y: 0.57 }, // CM
    { x: 0.7, y: 0.57 }, // RCM
    { x: 0.9, y: 0.57 }, // RWB

    // Forwards (2)
    { x: 0.5, y: 0.87 }, // Striker (ST)
  ],
};

export default formations;
