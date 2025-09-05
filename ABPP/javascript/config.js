const gvizURL =
  "https://docs.google.com/spreadsheets/d/1esBnw68ShO40EucMVDxfZCclx6mMnxOjtXcYuV2p39g/gviz/tq?tqx=out:json&gid=698619125";

const systemGroups = {
  equipments: [],
  cs: ["Cooling Water System", "Engine"],
  es: ["Exhaust System", "Steam"],
  fos1: ["Fuel Oil System 1",],
  fos2: ["Fuel Oil System 2"],
  fos3: ["Fuel Oil System 3"],
  los: ["Lube Oil System"],
};

const positionMaps = {
  cs: {
    "Radiator Assembly 1": { x: 875, y: 265 },
    "Radiator Assembly 2": { x: 875, y: 640 },
    "HT Water Preheater 1": { x: 550, y: 195 },
    "HT Water Preheater 2": { x: 550, y: 565 },
    "Nozzle Cooling Water Pump 1": { x: 392, y: 170 },
    "Nozzle Cooling Water Pump 2": { x: 392, y: 545 },
    "MAN 1": { x: 217, y: 195 },
    "MAN 2": { x: 217, y: 575 },
  },
  es: {
    "Exhaust Gas Boiler 1": { x: 533, y: 125 },
    "Exhaust Gas Boiler 2": { x: 533, y: 465 },
  },
  fos1: {
    "LFO Supplying Pump": { x: 385, y: 550 },
    "LFO Unloading Pump Module": { x: 410, y: 280 },
    "LFO Day Tank": { x: 730, y: 500 },
    "LFO Storage Tank": { x: 875, y: 280 },
  },
  fos2: {
    "HFO Supplying Pump": { x: 305, y: 420 },
    "HFO Separator": { x: 315, y: 647 },
    "HFO Day Tank": { x: 620, y: 510 },
    "HFO Buffer Tank": { x: 792, y: 510 },
    "HFO Storage Tank": { x: 410, y: 167 },
    "HFO Unloading Pump": { x: 180, y: 162 },
    "HFO Transfer Pump": { x: 530, y: 162 },

  },
  fos3: {
    "Booster Pump 1": { x: 632, y: 190 },
    "Booster Pump 2": { x: 632, y: 490 },
    "Fuel Oil Leakage Transfer Pump": { x: 180, y: 427 }
  },
  los: {
    "Oil Mist Separator 1": { x: 235, y: 115 },
    "Oil Mist Separator 2": { x: 693, y: 115 },
    "Lube Oil Maintenance Tank": { x: 90, y: 360 },
    "Used Lube Oil Tank": { x: 90, y: 575 },
    "Fuel Oil Purifier 1": { x: 490, y: 600 },
    "Fuel Oil Purifier 2": { x: 895, y: 600 },
    "Lube Oil Service Tank 1": { x: 280, y: 437 },
    "Lube Oil Service Tank 2": { x: 740, y: 437 },
  },
};